'use client';

import { useTrades } from '@/hooks/useTrades';
import Card from '@/components/ui/Card';
import { KpiSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { calculateAnalytics, formatCurrency } from '@/lib/utils';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Flame,
  Snowflake,
  BarChart3,
  Award,
} from 'lucide-react';

export default function AnalyticsPage() {
  const { trades, loading } = useTrades();

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Analytics</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <KpiSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Analytics</h1>
        <EmptyState title="No analytics data available" description="Please log some trades first to populate these calculations." />
      </div>
    );
  }

  const data = calculateAnalytics(trades);

  const stats = [
    {
      label: 'Most Profitable Pair',
      value: data.mostProfitablePair ? `${data.mostProfitablePair.pair}` : '—',
      sub: data.mostProfitablePair ? formatCurrency(data.mostProfitablePair.pnl) : '',
      icon: Trophy,
      color: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      label: 'Most Profitable Session',
      value: data.mostProfitableSession ? data.mostProfitableSession.session : '—',
      sub: data.mostProfitableSession ? formatCurrency(data.mostProfitableSession.pnl) : '',
      icon: Clock,
      color: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      label: 'Average Risk/Reward',
      value: data.avgRRR > 0 ? `${data.avgRRR}:1` : '—',
      sub: data.avgRRR >= 2 ? 'Above target edge' : 'Below recommended 2:1 target',
      icon: Target,
      color: data.avgRRR >= 2 ? 'text-emerald-600' : 'text-amber-500',
    },
    {
      label: 'Longest Win Streak',
      value: `${data.longestWinStreak} trades`,
      sub: 'Consecutive wins',
      icon: Flame,
      color: 'text-emerald-600',
    },
    {
      label: 'Longest Loss Streak',
      value: `${data.longestLossStreak} trades`,
      sub: 'Consecutive losses',
      icon: Snowflake,
      color: 'text-red-500',
    },
    {
      label: 'Best Trade',
      value: formatCurrency(data.bestTrade),
      sub: 'Maximum profit in single setup',
      icon: TrendingUp,
      color: 'text-emerald-600',
    },
    {
      label: 'Worst Trade',
      value: formatCurrency(data.worstTrade),
      sub: 'Maximum drawdown in single setup',
      icon: TrendingDown,
      color: 'text-red-500',
    },
    {
      label: 'Profit Factor',
      value: data.profitFactor === Infinity ? '∞' : data.profitFactor.toFixed(2),
      sub: data.profitFactor >= 1.5 ? 'Healthy account ratio' : 'Aggressive drawdown risk',
      icon: BarChart3,
      color: data.profitFactor >= 1.5 ? 'text-emerald-600' : 'text-amber-500',
    },
    {
      label: 'Outcome Proportions',
      value: `${data.totalWins}W / ${data.totalLosses}L / ${data.totalBreakeven}BE`,
      sub: `${trades.length} entries calculated`,
      icon: Award,
      color: 'text-indigo-600 dark:text-indigo-400',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="relative overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center shrink-0">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="space-y-1">
                <p className="text-2xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-lg font-bold text-zinc-850 dark:text-zinc-150">
                  {stat.value}
                </p>
                {stat.sub && (
                  <p className="text-2xs text-zinc-500 dark:text-zinc-400 font-medium">
                    {stat.sub}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
