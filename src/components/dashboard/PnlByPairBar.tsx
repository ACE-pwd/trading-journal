'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import Card from '../ui/Card';

interface PairPnl {
  pair: string;
  pnl: number;
}

interface PnlByPairBarProps {
  data: PairPnl[];
}

export default function PnlByPairBar({ data }: PnlByPairBarProps) {
  // Format tooltip currency values
  const formatTooltip = (value: unknown) => {
    const num = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
    const isPositive = num >= 0;
    return [`$${num.toFixed(2)}`, isPositive ? 'Net Profit' : 'Net Loss'];
  };

  return (
    <Card className="flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Profit / Loss by Pair
        </h3>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Net performance aggregated per asset symbol
        </p>
      </div>

      <div className="h-64 min-h-64 w-full shrink-0">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-zinc-400">
            No trade data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" className="dark:stroke-zinc-800" />
              <XAxis
                dataKey="pair"
                tickLine={false}
                axisLine={false}
                stroke="#a1a1aa"
                fontSize={10}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                stroke="#a1a1aa"
                fontSize={10}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e4e4e7',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                }}
                labelClassName="font-medium text-zinc-500"
                formatter={formatTooltip}
              />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
