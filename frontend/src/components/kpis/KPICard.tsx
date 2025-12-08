import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  accentColor?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple';
  isLoading?: boolean;
}

const accentStyles = {
  blue: {
    icon: 'text-blue-500',
    border: 'border-l-blue-500',
    value: 'text-slate-900',
  },
  emerald: {
    icon: 'text-emerald-500',
    border: 'border-l-emerald-500',
    value: 'text-slate-900',
  },
  amber: {
    icon: 'text-amber-500',
    border: 'border-l-amber-500',
    value: 'text-slate-900',
  },
  rose: {
    icon: 'text-rose-500',
    border: 'border-l-rose-500',
    value: 'text-slate-900',
  },
  purple: {
    icon: 'text-purple-500',
    border: 'border-l-purple-500',
    value: 'text-slate-900',
  },
};

export function KPICard({
  title,
  value,
  icon: Icon,
  accentColor = 'blue',
  isLoading = false,
}: KPICardProps) {
  const styles = accentStyles[accentColor];

  return (
    <div
      className={cn(
        'group relative bg-white rounded-lg border border-slate-200/80',
        'border-l-[3px] transition-all duration-200',
        'hover:shadow-md hover:border-slate-300/80',
        'px-4 py-3',
        styles.border,
        isLoading && 'animate-pulse'
      )}
    >
      {/* Title row with icon */}
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider leading-tight">
          {title}
        </p>
        <Icon className={cn('h-4 w-4 flex-shrink-0', styles.icon)} strokeWidth={2} />
      </div>

      {/* Value - the hero */}
      {isLoading ? (
        <div className="h-7 w-24 bg-slate-200 rounded animate-pulse" />
      ) : (
        <p className={cn(
          'text-xl font-bold tabular-nums tracking-tight',
          styles.value
        )}>
          {value}
        </p>
      )}
    </div>
  );
}
