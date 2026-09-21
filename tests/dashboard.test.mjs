import test from 'node:test';
import assert from 'node:assert/strict';
import { dashboardMetrics, performanceBreakdown } from '../src/lib/dashboard.ts';
const trade = (pnl, date = '2026-09-14', extra = {}) => ({ id: `${date}-${pnl}`, user_id: 'test', pair: 'EUR/USD', direction: 'Buy', entry_price: 100, stop_loss: 95, take_profit: 110, lot_size: 1, result: pnl > 0 ? 'Win' : pnl < 0 ? 'Loss' : 'Breakeven', session: 'London', strategy: 'Breakout', emotion: 'Calm', pnl, notes: null, screenshot_url: null, trade_date: date, created_at: `${date}T10:00:00Z`, ...extra });
test('empty history distinguishes missing metrics from zero P&L', () => {
 const s=dashboardMetrics([]); assert.equal(s.pnl,0); assert.equal(s.winRate,null); assert.equal(s.profitFactor,null); assert.equal(s.maxDrawdown,null); assert.deepEqual(s.equity,[]);
});
test('expectancy includes losses and breakevens, PF uses absolute losses', () => {
 const s=dashboardMetrics([trade(200),trade(-100),trade(0)]); assert.equal(s.pnl,100); assert.equal(s.expectancy,100/3); assert.ok(Math.abs(s.winRate - 100/3) < 1e-10); assert.equal(s.profitFactor,2); assert.equal(s.averageRR,2);
});
test('drawdown uses daily realized P&L and includes loss from initial zero', () => {
 const s=dashboardMetrics([trade(-50,'2026-09-16'),trade(-30,'2026-09-14'),trade(100,'2026-09-15'),trade(-20,'2026-09-16')]);
 assert.equal(s.maxDrawdown,70); assert.deepEqual(s.equity.map(p=>p.equity),[-30,70,0]);
 assert.equal(dashboardMetrics([trade(-80)]).maxDrawdown,80);
});
test('undefined profit factor and zero variance remain explicit', () => {
 assert.equal(dashboardMetrics([trade(100)]).profitFactor,Infinity);
 assert.equal(dashboardMetrics([trade(0)]).profitFactor,null);
 assert.equal(dashboardMetrics([trade(-100)]).profitFactor,0);
 assert.equal(dashboardMetrics([trade(100,'2026-09-14'),trade(110,'2026-09-15')],1000).sharpe,null);
});
test('Sharpe uses daily return ratios and sample deviation', () => {
 const s=dashboardMetrics([trade(100,'2026-09-14'),trade(-55,'2026-09-15')],1000);
 assert.ok(Math.abs(s.sharpe - (0.025/Math.sqrt(0.01125))) < 1e-10);
 assert.equal(dashboardMetrics([trade(100)],1000).sharpe,null);
 assert.equal(dashboardMetrics([trade(-1000),trade(10,'2026-09-15')],1000).sharpe,null);
});
test('risk proxies require adequate samples and valid stops', () => {
 assert.equal(dashboardMetrics([trade(-100)]).riskVariation,null);
 const s=dashboardMetrics([trade(-100),trade(-100,'2026-09-15',{stop_loss:null})]);
 assert.equal(s.riskVariation,0); assert.equal(s.stopCoverage,50);
 assert.equal(dashboardMetrics([trade(20,undefined,{stop_loss:105})]).averageRR,null);
});
test('all breakdowns preserve totals and include untagged trades', () => {
 const trades=[trade(100),trade(-50,'2026-09-15',{session:null,strategy:null,direction:'Sell'})];
 for(const dimension of ['pair','session','direction','weekday','setup']) {
 const groups=performanceBreakdown(trades,dimension); assert.equal(groups.reduce((s,r)=>s+r.pnl,0),50); assert.equal(groups.reduce((s,r)=>s+r.count,0),2);
 }
 assert.deepEqual(performanceBreakdown(trades,'weekday').map(r=>r.label),['Monday','Tuesday']);
 assert.ok(performanceBreakdown(trades,'setup').some(r=>r.label==='Untagged'));
});
