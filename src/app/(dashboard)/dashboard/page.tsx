'use client';

import { useTrades } from '@/hooks/useTrades';
import KpiCard from '@/components/dashboard/KpiCard';
import EquityCurve from '@/components/dashboard/EquityCurve';
import WinLossPie from '@/components/dashboard/WinLossPie';
import PnlByPairBar from '@/components/dashboard/PnlByPairBar';
import { KpiSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import {
  calculateDashboardStats,
  generateEquityCurve,
  aggregatePnlByPair,
  calculateWinLossBreakeven,
} from '@/lib/utils';
import { DollarSign, Target, BarChart3, TrendingUp, PlusCircle } from 'lucide-react';

export default function DashboardPage() {
  const { trades, loading } = useTrades();

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
          Dashboard
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <KpiSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
          Dashboard
        </h1>
        <EmptyState
          title="No trades recorded yet"
          description="Log your past execution logs or current entry positions to generate analytics charts."
          action={
            <Link href="/add-trade">
              <Button><PlusCircle className="w-4 h-4" /> Add Your First Trade</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const stats = calculateDashboardStats(trades);
  const equityData = generateEquityCurve(trades);
  const pairData = aggregatePnlByPair(trades);
  const wlb = calculateWinLossBreakeven(trades);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
          Dashboard
        </h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total PnL"
          value={stats.totalPnl}
          icon={DollarSign}
          format="currency"
          trend={stats.totalPnl >= 0 ? 'up' : 'down'}
        />
        <KpiCard
          title="Win Rate"
          value={stats.winRate}
          icon={Target}
          format="percent"
          trend={stats.winRate >= 50 ? 'up' : 'down'}
        />
        <KpiCard
          title="Total Trades"
          value={stats.totalTrades}
          icon={BarChart3}
          format="number"
          trend="neutral"
        />
        <KpiCard
          title="Avg Risk/Reward"
          value={stats.avgRRR}
          icon={TrendingUp}
          format="number"
          trend={stats.avgRRR >= 2 ? 'up' : stats.avgRRR >= 1 ? 'neutral' : 'down'}
        />
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EquityCurve data={equityData} />
        <WinLossPie wins={wlb.wins} losses={wlb.losses} breakeven={wlb.breakeven} />
      </div>

      {/* PnL by Pair Bar Chart */}
      <PnlByPairBar data={pairData} />
    </div>
  );
}
