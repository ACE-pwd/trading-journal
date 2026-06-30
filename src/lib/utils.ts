import { Trade, DashboardStats, EquityPoint, PairPnl, AnalyticsData, CalendarDay } from './types';

/**
 * Merge CSS class names, filtering out falsy values.
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Format a number as currency (USD).
 */
export function formatCurrency(value: number): string {
  const prefix = value >= 0 ? '+$' : '-$';
  return `${prefix}${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format a number as a percentage string.
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Calculate risk-reward ratio for a single trade.
 */
export function calculateRRR(trade: Trade): number {
  if (!trade.stop_loss || !trade.take_profit) return 0;
  const risk = Math.abs(trade.entry_price - trade.stop_loss);
  const reward = Math.abs(trade.take_profit - trade.entry_price);
  if (risk === 0) return 0;
  return Number((reward / risk).toFixed(2));
}

/**
 * Compute dashboard KPI statistics.
 */
export function calculateDashboardStats(trades: Trade[]): DashboardStats {
  if (trades.length === 0) {
    return { totalPnl: 0, winRate: 0, totalTrades: 0, avgRRR: 0 };
  }

  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const wins = trades.filter(t => t.result === 'Win').length;
  const winRate = (wins / trades.length) * 100;

  const rrrs = trades.map(calculateRRR).filter(r => r > 0);
  const avgRRR = rrrs.length > 0
    ? rrrs.reduce((sum, r) => sum + r, 0) / rrrs.length
    : 0;

  return {
    totalPnl: Number(totalPnl.toFixed(2)),
    winRate: Number(winRate.toFixed(1)),
    totalTrades: trades.length,
    avgRRR: Number(avgRRR.toFixed(2)),
  };
}

/**
 * Generate equity curve data points sorted by trade date.
 */
export function generateEquityCurve(trades: Trade[]): EquityPoint[] {
  const sorted = [...trades].sort(
    (a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
  );

  let cumulative = 0;
  return sorted.map(trade => {
    cumulative += trade.pnl || 0;
    return {
      date: trade.trade_date,
      equity: Number(cumulative.toFixed(2)),
    };
  });
}

/**
 * Aggregate PnL by trading pair for the bar chart.
 */
export function aggregatePnlByPair(trades: Trade[]): PairPnl[] {
  const map = new Map<string, number>();
  trades.forEach(t => {
    const pair = t.pair.toUpperCase();
    const current = map.get(pair) || 0;
    map.set(pair, current + (t.pnl || 0));
  });

  return Array.from(map.entries())
    .map(([pair, pnl]) => ({ pair, pnl: Number(pnl.toFixed(2)) }))
    .sort((a, b) => b.pnl - a.pnl);
}

/**
 * Calculate win/loss/breakeven counts.
 */
export function calculateWinLossBreakeven(trades: Trade[]) {
  return {
    wins: trades.filter(t => t.result === 'Win').length,
    losses: trades.filter(t => t.result === 'Loss').length,
    breakeven: trades.filter(t => t.result === 'Breakeven').length,
  };
}

/**
 * Calculate advanced analytics statistics.
 */
export function calculateAnalytics(trades: Trade[]): AnalyticsData {
  if (trades.length === 0) {
    return {
      mostProfitablePair: null,
      mostProfitableSession: null,
      avgRRR: 0,
      longestWinStreak: 0,
      longestLossStreak: 0,
      totalWins: 0,
      totalLosses: 0,
      totalBreakeven: 0,
      profitFactor: 0,
      bestTrade: 0,
      worstTrade: 0,
    };
  }

  const pairPnls = aggregatePnlByPair(trades);
  const mostProfitablePair = pairPnls.length > 0 ? pairPnls[0] : null;

  const sessionMap = new Map<string, number>();
  trades.forEach(t => {
    if (t.session) {
      const current = sessionMap.get(t.session) || 0;
      sessionMap.set(t.session, current + (t.pnl || 0));
    }
  });
  const sessionEntries = Array.from(sessionMap.entries()).sort((a, b) => b[1] - a[1]);
  const mostProfitableSession = sessionEntries.length > 0
    ? { session: sessionEntries[0][0], pnl: Number(sessionEntries[0][1].toFixed(2)) }
    : null;

  const rrrs = trades.map(calculateRRR).filter(r => r > 0);
  const avgRRR = rrrs.length > 0
    ? Number((rrrs.reduce((s, r) => s + r, 0) / rrrs.length).toFixed(2))
    : 0;

  const sorted = [...trades].sort(
    (a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
  );

  let longestWinStreak = 0, longestLossStreak = 0;
  let currentWin = 0, currentLoss = 0;
  sorted.forEach(t => {
    if (t.result === 'Win') {
      currentWin++;
      currentLoss = 0;
      longestWinStreak = Math.max(longestWinStreak, currentWin);
    } else if (t.result === 'Loss') {
      currentLoss++;
      currentWin = 0;
      longestLossStreak = Math.max(longestLossStreak, currentLoss);
    } else {
      currentWin = 0;
      currentLoss = 0;
    }
  });

  const totalWins = trades.filter(t => t.result === 'Win').length;
  const totalLosses = trades.filter(t => t.result === 'Loss').length;
  const totalBreakeven = trades.filter(t => t.result === 'Breakeven').length;

  const grossProfit = trades.filter(t => t.pnl > 0).reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(trades.filter(t => t.pnl < 0).reduce((s, t) => s + t.pnl, 0));
  const profitFactor = grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : grossProfit > 0 ? Infinity : 0;

  const pnls = trades.map(t => t.pnl || 0);
  const bestTrade = Math.max(...pnls);
  const worstTrade = Math.min(...pnls);

  return {
    mostProfitablePair,
    mostProfitableSession,
    avgRRR,
    longestWinStreak,
    longestLossStreak,
    totalWins,
    totalLosses,
    totalBreakeven,
    profitFactor,
    bestTrade,
    worstTrade,
  };
}

/**
 * Aggregate trade PnL per day for the calendar.
 */
export function buildCalendarData(trades: Trade[]): CalendarDay[] {
  const map = new Map<string, { pnl: number; count: number }>();
  trades.forEach(t => {
    const dateStr = t.trade_date;
    const existing = map.get(dateStr) || { pnl: 0, count: 0 };
    existing.pnl += t.pnl || 0;
    existing.count++;
    map.set(dateStr, existing);
  });

  return Array.from(map.entries()).map(([date, data]) => ({
    date,
    pnl: Number(data.pnl.toFixed(2)),
    tradeCount: data.count,
  }));
}
