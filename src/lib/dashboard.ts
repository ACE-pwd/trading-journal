import type { Trade } from './types';

export type Breakdown = 'pair' | 'session' | 'direction' | 'weekday' | 'setup';
export const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const mean = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length;
const deviation = (values: number[]) => values.length < 2 ? null : Math.sqrt(values.reduce((sum, n) => sum + (n - mean(values)) ** 2, 0) / (values.length - 1));

export function dashboardMetrics(trades: Trade[], initialBalance: number | null = null) {
  const sorted = [...trades].sort((a, b) => a.trade_date.localeCompare(b.trade_date) || a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id));
  const pnl = trades.reduce((sum, t) => sum + Number(t.pnl ?? 0), 0);
  const gains = trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + Number(t.pnl), 0);
  const losses = trades.filter(t => t.pnl < 0).map(t => Math.abs(Number(t.pnl)));
  const lossTotal = losses.reduce((a, b) => a + b, 0);
  const ratios = trades.flatMap(t => {
    if (t.stop_loss == null || t.take_profit == null) return [];
    const risk = t.direction === 'Buy' ? t.entry_price - t.stop_loss : t.stop_loss - t.entry_price;
    const reward = t.direction === 'Buy' ? t.take_profit - t.entry_price : t.entry_price - t.take_profit;
    return risk > 0 && reward > 0 ? [reward / risk] : [];
  });
  let cumulative = 0, peak = 0, maxDrawdown = 0;
  const daily = new Map<string, number>();
  for (const t of sorted) daily.set(t.trade_date, (daily.get(t.trade_date) ?? 0) + Number(t.pnl ?? 0));
  // End-of-recorded-day series avoids inventing intraday execution order.
  const equity = Array.from(daily, ([date, amount]) => {
    cumulative += amount;
    peak = Math.max(peak, cumulative);
    maxDrawdown = Math.max(maxDrawdown, peak - cumulative);
    return { date, equity: cumulative };
  });
  let sharpe: number | null = null;
  let sharpeReason = 'Enter your balance before the first recorded trade.';
  if (initialBalance !== null && Number.isFinite(initialBalance) && initialBalance > 0) {
    let balance = initialBalance;
    const returns: number[] = [];
    let valid = true;
    for (const amount of daily.values()) {
      if (balance <= 0) { valid = false; break; }
      returns.push(amount / balance);
      balance += amount;
      if (balance <= 0) valid = false;
    }
    const sd = deviation(returns);
    if (!valid) sharpeReason = 'Balance reaches zero or below; returns are not meaningful.';
    else if (returns.length < 2) sharpeReason = 'Needs at least two recorded trading days.';
    else if (sd === null || sd < 1e-12) sharpeReason = 'Daily returns have no measurable variation.';
    else { sharpe = mean(returns) / sd; sharpeReason = `${returns.length} recorded days · not annualized`; }
  }
  const lossDeviation = deviation(losses);
  const riskVariation = lossDeviation === null ? null : lossDeviation / mean(losses) * 100;
  return { pnl, count: trades.length, wins: trades.filter(t => t.result === 'Win').length,
    winRate: trades.length ? trades.filter(t => t.result === 'Win').length / trades.length * 100 : null,
    expectancy: trades.length ? pnl / trades.length : null,
    profitFactor: lossTotal > 0 ? gains / lossTotal : gains > 0 ? Infinity : null,
    averageRR: ratios.length ? mean(ratios) : null, rrCount: ratios.length,
    maxDrawdown: trades.length ? maxDrawdown : null, equity, sharpe, sharpeReason,
    riskVariation, lossCount: losses.length,
    stopCoverage: trades.length ? trades.filter(t => t.stop_loss != null && (t.direction === 'Buy' ? t.stop_loss < t.entry_price : t.stop_loss > t.entry_price) && t.stop_loss > 0).length / trades.length * 100 : null };
}

export function performanceBreakdown(trades: Trade[], dimension: Breakdown) {
  const groups = new Map<string, Trade[]>();
  for (const t of trades) {
    const label = dimension === 'pair' ? t.pair.trim().toUpperCase() : dimension === 'session' ? t.session || 'Untagged' : dimension === 'direction' ? t.direction === 'Buy' ? 'Long' : 'Short' : dimension === 'setup' ? t.strategy?.trim() || 'Untagged' : weekdays[(new Date(`${t.trade_date}T12:00:00Z`).getUTCDay() + 6) % 7];
    groups.set(label, [...(groups.get(label) ?? []), t]);
  }
  return Array.from(groups, ([label, rows]) => {
    const pnl = rows.reduce((sum, t) => sum + Number(t.pnl ?? 0), 0);
    return { label, pnl, count: rows.length, winRate: rows.filter(t => t.result === 'Win').length / rows.length * 100, expectancy: pnl / rows.length };
  }).sort((a, b) => dimension === 'weekday' ? weekdays.indexOf(a.label) - weekdays.indexOf(b.label) : b.pnl - a.pnl);
}
