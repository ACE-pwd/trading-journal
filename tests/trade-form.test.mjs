import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTradeForm } from '../src/lib/trade-form.ts';
const base = { pair: ' eur/usd ', direction: 'Buy', entry_price: '100', stop_loss: '95', take_profit: '110', lot_size: '0.1', result: 'Win', session: 'London', strategy: ' Breakout ', emotion: 'Calm', pnl: '10', notes: '', trade_date: '2026-09-20' };
test('normalizes valid values and preserves optional nulls', () => {
  const row = parseTradeForm(base);
  assert.equal(row.pair, 'EUR/USD'); assert.equal(row.strategy, 'Breakout');
  assert.equal(row.entry_price, 100); assert.equal(row.notes, null);
  assert.equal(parseTradeForm({...base, stop_loss: '', lot_size: ''}).stop_loss, null);
});
test('rejects invalid and nonfinite prices before saving', () => {
  for (const value of ['', 'abc', 'Infinity', '-1', '0']) assert.throws(() => parseTradeForm({...base, entry_price: value}));
});
test('validates buy and sell risk levels', () => {
  assert.throws(() => parseTradeForm({...base, stop_loss: '101'}));
  assert.throws(() => parseTradeForm({...base, take_profit: '99'}));
  assert.doesNotThrow(() => parseTradeForm({...base, direction: 'Sell', stop_loss: '105', take_profit: '90'}));
});
test('rejects invalid dates and mismatched results', () => {
  assert.throws(() => parseTradeForm({...base, trade_date: '2026-02-30'}));
  assert.throws(() => parseTradeForm({...base, result: 'Loss'}));
  assert.throws(() => parseTradeForm({...base, result: 'Breakeven'}));
  assert.throws(() => parseTradeForm({...base, pair: ' '}));
});
