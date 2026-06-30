'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Card from '../ui/Card';

interface WinLossPieProps {
  wins: number;
  losses: number;
  breakeven: number;
}

export default function WinLossPie({ wins, losses, breakeven }: WinLossPieProps) {
  const data = [
    { name: 'Wins', value: wins, color: '#10b981' },
    { name: 'Losses', value: losses, color: '#ef4444' },
    { name: 'Breakevens', value: breakeven, color: '#71717a' },
  ].filter(d => d.value > 0);

  return (
    <Card className="flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Win / Loss Distribution
        </h3>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Proportional breakdown of trade outcomes
        </p>
      </div>

      <div className="h-64 w-full flex-1">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-zinc-400">
            No trade data logged yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e4e4e7',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
