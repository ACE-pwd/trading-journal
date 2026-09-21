'use client';

import { useState, useMemo } from 'react';
import { useTrades } from '@/hooks/useTrades';
import Card from '@/components/ui/Card';
import { ChartSkeleton } from '@/components/ui/Skeleton';
import { cn, formatCurrency, buildCalendarData } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format as fnsFormat,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
} from 'date-fns';

export default function CalendarPage() {
  const { trades, loading } = useTrades();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const calendarData = useMemo(() => buildCalendarData(trades), [trades]);

  // Build calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getPnlForDate = (date: Date) => {
    const dateStr = fnsFormat(date, 'yyyy-MM-dd');
    return calendarData.find(d => d.date === dateStr);
  };

  const tradesForSelectedDate = selectedDate
    ? trades.filter(t => t.trade_date === selectedDate)
    : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Calendar</h1>
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Calendar</h1>

      <Card>
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-950/50 transition-colors cursor-pointer text-zinc-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-zinc-850 dark:text-zinc-100">
            {fnsFormat(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-950/50 transition-colors cursor-pointer text-zinc-600"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-semibold text-zinc-450 py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((d, i) => {
            const dayData = getPnlForDate(d);
            const dateStr = fnsFormat(d, 'yyyy-MM-dd');
            const inMonth = isSameMonth(d, currentMonth);
            const selected = selectedDate === dateStr;

            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedDate(selected ? null : dateStr)}
                className={cn(
                  'relative p-2.5 min-h-[80px] rounded-2xl text-left transition-all cursor-pointer border',
                  !inMonth && 'opacity-25',
                  selected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20'
                    : 'border-zinc-100/50 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900/45 bg-white dark:bg-zinc-950',
                  isToday(d) && !selected && 'border-zinc-250 bg-zinc-50/30'
                )}
              >
                <span
                  className={cn(
                    'text-xs font-semibold',
                    isToday(d)
                      ? 'text-indigo-600 dark:text-indigo-400 font-extrabold bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 rounded-md'
                      : 'text-zinc-600 dark:text-zinc-400'
                  )}
                >
                  {fnsFormat(d, 'd')}
                </span>
                {dayData && (
                  <div
                    className={cn(
                      'mt-2.5 text-2xs font-extrabold rounded-lg px-2 py-1 text-center',
                      dayData.pnl > 0
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-500'
                        : dayData.pnl < 0
                        ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-500'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                    )}
                  >
                    {dayData.pnl > 0 ? '+' : ''}
                    {dayData.pnl.toFixed(0)}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Selected day trades */}
      {selectedDate && (
        <Card className="shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 border-b border-zinc-50 dark:border-zinc-850 pb-2">
            Trades on {selectedDate}
          </h3>
          {tradesForSelectedDate.length === 0 ? (
            <p className="text-xs text-zinc-450 py-4 text-center">No trades logged on this day</p>
          ) : (
            <div className="space-y-2">
              {tradesForSelectedDate.map(trade => (
                <a
                  key={trade.id}
                  href={`/journal/${trade.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors border border-zinc-100/30 dark:border-zinc-800"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full',
                        trade.result === 'Win' ? 'bg-emerald-500' : trade.result === 'Loss' ? 'bg-red-500' : 'bg-zinc-400'
                      )}
                    />
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{trade.pair}</span>
                    <span
                      className={cn(
                        'text-2xs font-semibold px-2 py-0.5 rounded-full',
                        trade.direction === 'Buy'
                          ? 'bg-emerald-55 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600'
                          : 'bg-red-50 dark:bg-red-950/30 text-red-600'
                      )}
                    >
                      {trade.direction}
                    </span>
                  </div>
                  <span
                    className={cn(
                      'text-sm font-bold',
                      trade.pnl >= 0 ? 'text-emerald-600' : 'text-red-600'
                    )}
                  >
                    {formatCurrency(trade.pnl)}
                  </span>
                </a>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
