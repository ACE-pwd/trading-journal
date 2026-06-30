'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Card from '../ui/Card';

interface EquityPoint {
  date: string;
  equity: number;
}

interface EquityCurveProps {
  data: EquityPoint[];
}

export default function EquityCurve({ data }: EquityCurveProps) {
  // Format tooltip currency values
  const formatTooltip = (value: any) => {
    const num = typeof value === 'number' ? value : parseFloat(value) || 0;
    const isPositive = num >= 0;
    return [`$${num.toFixed(2)}`, isPositive ? 'Profit' : 'Loss'];
  };

  return (
    <Card className="flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Equity Curve
        </h3>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Cumulative PnL growth over time
        </p>
      </div>

      <div className="h-64 w-full flex-1">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-zinc-400">
            Not enough data points
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" className="dark:stroke-zinc-800" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                stroke="#a1a1aa"
                fontSize={10}
                tickFormatter={(str) => {
                  try {
                    const date = new Date(str);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  } catch {
                    return str;
                  }
                }}
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
              <Area
                type="monotone"
                dataKey="equity"
                stroke="#4f46e5"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorEquity)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
