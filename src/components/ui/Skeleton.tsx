import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800', className)}
      {...props}
    />
  );
}

export function KpiSkeleton() {
  return (
    <div className="border border-zinc-100 dark:border-zinc-800/80 rounded-2xl p-6 bg-white dark:bg-zinc-900 space-y-3">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="border border-zinc-100 dark:border-zinc-800/80 rounded-2xl p-6 bg-white dark:bg-zinc-900 space-y-4">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-60 w-full" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}
