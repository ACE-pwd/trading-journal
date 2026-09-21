'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTrades } from '@/hooks/useTrades';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import EmptyState from '@/components/ui/EmptyState';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { cn, formatCurrency } from '@/lib/utils';
import { PlusCircle, ArrowUpDown, Eye, Image as ImageIcon } from 'lucide-react';

type SortField = 'trade_date' | 'pair' | 'pnl' | 'result';
type SortDir = 'asc' | 'desc';

function SortHeader({ field, children, sortField, toggleSort }: { field: SortField; children: React.ReactNode; sortField: SortField; toggleSort: (field: SortField) => void }) { return (
    <th
      className="px-6 py-4.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-indigo-600 select-none transition-colors"
      onClick={() => toggleSort(field)}
    >
      <span className="inline-flex items-center gap-1.5">
        {children}{' '}
        <ArrowUpDown
          className={cn(
            'w-3 h-3 transition-colors',
            sortField === field ? 'text-indigo-600' : 'text-zinc-300'
          )}
        />
      </span>
    </th>
  );
}

export default function JournalPage() {
  const { trades, loading, error } = useTrades();
  const [sortField, setSortField] = useState<SortField>('trade_date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filterPair, setFilterPair] = useState('');
  const [filterResult, setFilterResult] = useState('');
  const [filterSession, setFilterSession] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const filtered = useMemo(() => {
    let result = [...trades];
    if (filterPair) {
      result = result.filter(t => t.pair.toLowerCase().includes(filterPair.toLowerCase()));
    }
    if (filterResult) {
      result = result.filter(t => t.result === filterResult);
    }
    if (filterSession) {
      result = result.filter(t => t.session === filterSession);
    }
    if (filterDateFrom) {
      result = result.filter(t => t.trade_date >= filterDateFrom);
    }
    if (filterDateTo) {
      result = result.filter(t => t.trade_date <= filterDateTo);
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'trade_date') {
        cmp = a.trade_date.localeCompare(b.trade_date);
      } else if (sortField === 'pair') {
        cmp = a.pair.localeCompare(b.pair);
      } else if (sortField === 'pnl') {
        cmp = (a.pnl || 0) - (b.pnl || 0);
      } else if (sortField === 'result') {
        cmp = a.result.localeCompare(b.result);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [trades, sortField, sortDir, filterPair, filterResult, filterSession, filterDateFrom, filterDateTo]);



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Trade Journal</h1>
        <Link href="/add-trade">
          <Button>
            <PlusCircle className="w-4 h-4 shrink-0" /> Add Trade
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs font-mono border border-red-150">
          <strong>Database Sync Error:</strong> {error}
        </div>
      )}

      {/* Filters Form Panel */}
      <Card padding="sm" className="shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Input
            id="filterPair"
            placeholder="Filter by pair..."
            value={filterPair}
            onChange={e => setFilterPair(e.target.value)}
          />
          <Select
            id="filterResult"
            value={filterResult}
            onChange={e => setFilterResult(e.target.value)}
            placeholder="All Results"
            options={[
              { value: 'Win', label: 'Win' },
              { value: 'Loss', label: 'Loss' },
              { value: 'Breakeven', label: 'Breakeven' },
            ]}
          />
          <Select
            id="filterSession"
            value={filterSession}
            onChange={e => setFilterSession(e.target.value)}
            placeholder="All Sessions"
            options={[
              { value: 'London', label: 'London' },
              { value: 'NY', label: 'New York' },
              { value: 'Asia', label: 'Asia' },
            ]}
          />
          <Input
            id="filterDateFrom"
            type="date"
            placeholder="From"
            value={filterDateFrom}
            onChange={e => setFilterDateFrom(e.target.value)}
          />
          <Input
            id="filterDateTo"
            type="date"
            placeholder="To"
            value={filterDateTo}
            onChange={e => setFilterDateTo(e.target.value)}
          />
        </div>
      </Card>

      {/* Logging Table */}
      <Card padding="none" className="overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-zinc-100 dark:border-zinc-850">
              <tr>
                <SortHeader sortField={sortField} toggleSort={toggleSort} field="trade_date">Date</SortHeader>
                <SortHeader sortField={sortField} toggleSort={toggleSort} field="pair">Pair</SortHeader>
                <th className="px-6 py-4.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Direction
                </th>
                <SortHeader sortField={sortField} toggleSort={toggleSort} field="result">Result</SortHeader>
                <SortHeader sortField={sortField} toggleSort={toggleSort} field="pnl">PnL</SortHeader>
                <th className="px-6 py-4.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Session
                </th>
                <th className="px-6 py-4.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Screenshot
                </th>
                <th className="px-6 py-4.5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 bg-white dark:bg-zinc-950">
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} cols={8} />
                ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6">
                    <EmptyState
                      title="No trades found"
                      description="Try adjusting your filter search criteria or record a new trade."
                    />
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map(trade => (
                  <tr
                    key={trade.id}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors"
                  >
                    <td className="px-6 py-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      {trade.trade_date}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-zinc-800 dark:text-zinc-200">
                      {trade.pair}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-extrabold',
                          trade.direction === 'Buy'
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-500'
                            : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-500'
                        )}
                      >
                        {trade.direction}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-extrabold',
                          trade.result === 'Win'
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-500'
                            : trade.result === 'Loss'
                            ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-500'
                            : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400'
                        )}
                      >
                        {trade.result}
                      </span>
                    </td>
                    <td
                      className={cn(
                        'px-6 py-4 text-sm font-extrabold whitespace-nowrap',
                        trade.pnl >= 0 ? 'text-emerald-600' : 'text-red-600'
                      )}
                    >
                      {formatCurrency(trade.pnl)}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      {trade.session || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {trade.screenshot_url ? (
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-zinc-100 dark:border-zinc-800">
                          <img
                            src={trade.screenshot_url}
                            alt="Screenshot thumb"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-850 flex items-center justify-center text-zinc-400">
                          <ImageIcon className="w-4 h-4 shrink-0" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link href={`/journal/${trade.id}`}>
                        <Button variant="outline" size="sm" className="h-8 gap-1.5 py-1 px-3">
                          <Eye className="w-3.5 h-3.5" /> View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
