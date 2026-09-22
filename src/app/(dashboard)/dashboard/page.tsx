'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, RefreshCw } from 'lucide-react';
import { useTrades } from '@/hooks/useTrades';
import { dashboardMetrics, performanceBreakdown, type Breakdown } from '@/lib/dashboard';
import { calculateAnalytics, formatCurrency, cn } from '@/lib/utils';
import EquityCurve from '@/components/dashboard/EquityCurve';
import Card from '@/components/ui/Card';
import MetricInfo from '@/components/ui/MetricInfo';
import Button from '@/components/ui/Button';
import { ChartSkeleton } from '@/components/ui/Skeleton';

const number = (value: number | null, suffix = '') => value === null ? '—' : value === Infinity ? '∞' : `${value.toFixed(2)}${suffix}`;
const money = (value: number | null) => value === null ? '—' : formatCurrency(value);
const dimensions: { key: Breakdown; label: string }[] = [
  { key: 'pair', label: 'Pair' }, { key: 'session', label: 'Session' }, { key: 'direction', label: 'Long vs short' }, { key: 'weekday', label: 'Day of week' }, { key: 'setup', label: 'Setup' },
];
function Metric({ title, value, hint, positive }: { title: string; value: string; hint: string; positive?: boolean }) {
  return <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 min-w-0">
    <div className="flex items-center justify-between gap-2"><p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{title}</p><MetricInfo term={title} /></div>
    <p className={cn('mt-3 text-2xl lg:text-3xl font-semibold tracking-tight break-words', positive === undefined ? 'text-zinc-900 dark:text-white' : positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>{value}</p>
    <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{hint}</p>
  </div>;
}
export default function DashboardPage() {
  const { trades, loading, error, refetch } = useTrades();
  const [dimension, setDimension] = useState<Breakdown>('pair');
  const [balance, setBalance] = useState('');
  const stats = dashboardMetrics(trades, balance.trim() ? Number(balance) : null);
  const highlights = calculateAnalytics(trades);
  const rows = performanceBreakdown(trades, dimension);
  const scale = Math.max(...rows.map(r => Math.abs(r.pnl)), 1);
  const firstDate = stats.equity[0]?.date;
  const lastDate = stats.equity.at(-1)?.date;

  return <div className="max-w-7xl mx-auto space-y-6">
    <div className="flex flex-wrap gap-4 items-center justify-between">
      <div><p className="text-xs uppercase tracking-widest text-indigo-500 font-semibold mb-2">YOUR WORKSPACE</p><h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">Dashboard</h1><p className="text-sm text-zinc-500 mt-2">Every trade tells a story. Here’s yours.</p></div>
      <Link href="/add-trade"><Button><Plus className="w-4 h-4" /> Add Trade</Button></Link>
    </div>

    <div className="flex items-center gap-7 border-b border-zinc-200 pb-3 text-sm"><a href="#overview" className="font-semibold text-violet-600">Overview</a><a href="#analytics" className="text-slate-500 hover:text-violet-600">Analytics</a><span className="ml-auto text-xs text-slate-400">All-time results</span></div>

    <div className="flex flex-wrap justify-between gap-2 text-xs text-zinc-500"><span>All recorded trades · USD · Realized results</span><span>{trades.length} trades{firstDate ? ` · ${firstDate} — ${lastDate}` : ''}</span></div>
    {error ? <Card role="alert"><p className="text-red-600">Could not load your trades. {error}</p><Button variant="outline" onClick={refetch} className="mt-3"><RefreshCw className="w-4 h-4" /> Retry</Button></Card> : loading ? <ChartSkeleton /> : <section id="dashboard-content" aria-label="Trading dashboard" className="space-y-5">
      {!trades.length && <div className="rounded-xl border border-dashed border-indigo-300 dark:border-indigo-900 p-4 text-sm text-zinc-500">Your dashboard is ready. <Link href="/add-trade" className="text-indigo-500 underline">Add your first trade</Link> to populate these metrics.</div>}
      <div id="overview" className="scroll-mt-6 space-y-5">
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
          <Metric title="P&L" value={money(stats.pnl)} hint="Total realized profit and loss" positive={stats.pnl >= 0} />
          <Metric title="Win rate" value={number(stats.winRate, '%')} hint={`${stats.wins} wins / ${stats.count} trades · breakevens included`} />
          <Metric title="Expectancy" value={money(stats.expectancy)} hint="Average realized P&L per trade" positive={stats.expectancy == null ? undefined : stats.expectancy >= 0} />
          <Metric title="Profit factor" value={number(stats.profitFactor)} hint={stats.profitFactor === Infinity ? 'Profits recorded; no losing trades yet' : 'Gross profit ÷ absolute gross loss'} />
          <Metric title="Average R:R" value={number(stats.averageRR, ':1')} hint={`Planned reward ÷ risk · ${stats.rrCount} valid setups`} />
          <Metric title="Max drawdown" value={stats.maxDrawdown === null ? '—' : `$${stats.maxDrawdown.toFixed(2)}`} hint="Largest end-of-day peak-to-trough P&L decline" />
        </div>
        <div className="grid lg:grid-cols-2 gap-5">
          <Card className="border-violet-200 bg-gradient-to-br from-violet-50/70 to-white relative"><div className="flex items-center justify-between"><h2 className="font-semibold text-zinc-900">Sharpe ratio <span className="text-[10px] rounded-full bg-violet-100 text-violet-700 px-2 py-1 ml-2">ESTIMATE</span></h2><MetricInfo term="Sharpe ratio" /></div><p className="text-3xl font-semibold text-zinc-900 dark:text-white my-4">{number(stats.sharpe)}</p><p className="text-xs text-zinc-500 mb-4">{stats.sharpeReason}</p><label htmlFor="starting-balance" className="text-xs text-zinc-500 block mb-2">Starting balance before your first trade (USD)</label><input id="starting-balance" type="number" min="0.01" step="any" value={balance} onChange={e => setBalance(e.target.value)} placeholder="Enter starting balance" className="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-sm bg-transparent text-zinc-900 dark:text-white" /><details className="text-xs leading-relaxed text-zinc-500 mt-3"><summary className="text-violet-600">Calculation assumptions</summary><p className="mt-2">Uses realized returns on recorded trading days, a 0% risk-free rate and sample standard deviation. Not annualized. Assumes no deposits or withdrawals; excludes open-position returns. Balance is used for this view only.</p></details></Card>
          <Card className="border-violet-200 bg-gradient-to-br from-violet-50/70 to-white"><div className="flex justify-between items-center"><h2 className="font-semibold text-zinc-900">Risk consistency</h2><MetricInfo term="Risk consistency" /></div><div className="grid grid-cols-2 gap-4 my-4"><div><p className="text-2xl font-semibold text-zinc-900 dark:text-white">{number(stats.riskVariation, '%')}</p><p className="text-xs text-zinc-500 mt-2">Loss-size variation <MetricInfo term="Loss-size variation" /></p></div><div><p className="text-2xl font-semibold text-zinc-900 dark:text-white">{number(stats.stopCoverage, '%')}</p><p className="text-xs text-zinc-500 mt-2">Stop-loss coverage <MetricInfo term="Stop-loss coverage" /></p></div></div><p className="text-xs leading-relaxed text-zinc-500">{stats.lossCount < 2 ? 'Log at least two losing trades to measure loss-size variation. ' : `Based on ${stats.lossCount} losing trades. `}Variation is the standard deviation of realized loss sizes divided by their average. Lower means more uniform losses.</p><div className="mt-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 p-3 text-xs leading-relaxed text-zinc-500">These are risk proxies. Planned capital-at-risk consistency needs a cash-risk amount for each trade; it cannot be inferred reliably from lot size alone.</div></Card>
        </div>
        <EquityCurve data={stats.equity} />
        <p className="text-xs text-zinc-500">The curve shows cumulative realized P&L, starting from zero. It excludes deposits, withdrawals and open positions.</p>
      </div>
      <div id="analytics" className="scroll-mt-6 space-y-5">
        <div><h2 className="text-xl font-semibold tracking-tight">Analytics</h2><p className="text-sm text-slate-500 mt-1">Your patterns, strengths and opportunities in one place.</p></div>
        <Card>
          <div className="flex flex-wrap gap-3 justify-between items-start"><div><h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Where your performance comes from</h2><p className="text-xs text-zinc-500 mt-1">Compare results, sample size and average outcome.</p></div></div>
          <div className="flex flex-wrap gap-2 my-5" aria-label="Performance breakdown">{dimensions.map(d => <button key={d.key} onClick={() => setDimension(d.key)} aria-pressed={dimension === d.key} className={cn('px-3 py-2 text-xs rounded-lg border cursor-pointer', dimension === d.key ? 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-300' : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-indigo-400')}>{d.label}</button>)}</div>
          {!rows.length ? <p className="text-sm text-zinc-500 py-8">No trades to compare yet.</p> : <div className="overflow-x-auto"><table className="w-full text-sm min-w-[540px]"><caption className="sr-only">Performance by {dimensions.find(d => d.key === dimension)?.label}</caption><thead><tr className="text-xs text-zinc-500 border-b border-zinc-100 dark:border-zinc-800"><th className="text-left py-3 font-medium">{dimensions.find(d => d.key === dimension)?.label}</th><th className="text-left font-medium">P&L</th><th className="text-right font-medium">Trades</th><th className="text-right font-medium">Win rate</th><th className="text-right font-medium">Expectancy</th></tr></thead><tbody>{rows.map(row => <tr key={row.label} className="border-b last:border-0 border-zinc-100 dark:border-zinc-800"><th scope="row" className="text-left py-4 pr-4 font-medium text-zinc-800 dark:text-zinc-200 max-w-48 break-words">{row.label}</th><td className="py-4 pr-5 w-1/3"><span className={row.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}>{money(row.pnl)}</span><div className="mt-2 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800"><div className={cn('h-full rounded-full', row.pnl >= 0 ? 'bg-emerald-500' : 'bg-red-400')} style={{ width: `${Math.abs(row.pnl) / scale * 100}%` }} /></div></td><td className="text-right text-zinc-500">{row.count}</td><td className="text-right text-zinc-500">{number(row.winRate, '%')}</td><td className="text-right text-zinc-500">{money(row.expectancy)}</td></tr>)}</tbody></table></div>}
        </Card>
        <Card>
          <h3 className="font-semibold text-slate-900">Trading summary</h3>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-5">
            <Metric title="Top pair" value={highlights.mostProfitablePair?.pair ?? '—'} hint={highlights.mostProfitablePair ? money(highlights.mostProfitablePair.pnl) : 'No trades yet'} />
            <Metric title="Top session" value={highlights.mostProfitableSession?.session ?? '—'} hint={highlights.mostProfitableSession ? money(highlights.mostProfitableSession.pnl) : 'No session tags yet'} />
            <Metric title="Outcomes" value={`${highlights.totalWins}W / ${highlights.totalLosses}L / ${highlights.totalBreakeven}BE`} hint="Wins / losses / breakevens" />
            <Metric title="Longest streaks" value={`${highlights.longestWinStreak}W / ${highlights.longestLossStreak}L`} hint="Consecutive wins / consecutive losses · ordered by trade date" />
            <Metric title="Best trade" value={trades.length ? money(highlights.bestTrade) : '—'} hint="Highest recorded trade P&L" />
            <Metric title="Worst trade" value={trades.length ? money(highlights.worstTrade) : '—'} hint="Lowest recorded trade P&L" />
          </div>
        </Card>

      </div>
    </section>}
  </div>;
}
