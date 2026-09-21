import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({ children, className, padding = 'md', ...props }: CardProps) {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800/80 rounded-2xl shadow-[0_2px_8px_rgb(20_20_40/0.025)] transition-all duration-300',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
