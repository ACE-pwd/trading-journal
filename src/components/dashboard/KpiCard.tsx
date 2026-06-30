import React from 'react';
import Card from '../ui/Card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  format?: 'currency' | 'percent' | 'number';
  trend?: 'up' | 'down' | 'neutral';
}

export default function KpiCard({
  title,
  value,
  icon: Icon,
  format = 'number',
  trend = 'neutral',
}: KpiCardProps) {
  let displayValue = value.toString();
  if (format === 'currency') {
    const absVal = Math.abs(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    displayValue = value >= 0 ? `+$${absVal}` : `-$${absVal}`;
  } else if (format === 'percent') {
    displayValue = `${value.toFixed(1)}%`;
  }

  const trendColors = {
    up: 'text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100/50 dark:border-emerald-900/20',
    down: 'text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-950/20 border-red-100/50 dark:border-red-900/20',
    neutral: 'text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800',
  };

  const textColors = {
    up: 'text-emerald-600 dark:text-emerald-500',
    down: 'text-red-600 dark:text-red-500',
    neutral: 'text-zinc-900 dark:text-zinc-50',
  };

  return (
    <Card className="relative overflow-hidden group">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            {title}
          </span>
          <h2 className={cn('text-2xl font-black tracking-tight', format === 'currency' ? textColors[trend] : 'text-zinc-900 dark:text-zinc-50')}>
            {displayValue}
          </h2>
        </div>

        <div className={cn('w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-300 group-hover:scale-105', trendColors[trend])}>
          <Icon className="w-5 h-5 shrink-0" />
        </div>
      </div>
    </Card>
  );
}
