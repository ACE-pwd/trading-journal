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
import MetricInfo from '../ui/MetricInfo';

interface EquityPoint {
  date: string;
  equity: number;
}

interface EquityCurveProps {
  data: EquityPoint[];
}

export default function EquityCurve({ data }: EquityCurveProps) {
  const baselineDate = data.length ? new Date(`${data[0].date}T12:00:00Z`) : null;
  if (baselineDate) baselineDate.setUTCDate(baselineDate.getUTCDate() - 1);
  const chartData = baselineDate ? [{ date: baselineDate.toISOString().slice(0, 10), equity: 0 }, ...data] : [];
  // Format tooltip currency values
  const formatTooltip = (value: unknown) => {
    const num = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
    const isPositive = num >= 0;
    return [`$${num.toFixed(2)}`, isPositive ? 'Profit' : 'Loss'];
  };

  return (
    <Card className="flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Equity curve <MetricInfo term="Equity curve" />
        </h3>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Cumulative realized P&L · zero starting baseline
        </p>
      </div>

      <div className="h-64 min-h-64 w-full shrink-0">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-zinc-400">
            Not enough data points
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
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
                type="linear"
                dataKey="equity"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={data.length < 3 ? { r: 3 } : false}
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
