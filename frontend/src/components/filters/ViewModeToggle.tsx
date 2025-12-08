import { TrendingUp, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewModeToggleProps {
  value: 'accumulated' | 'current';
  onChange: (value: 'accumulated' | 'current') => void;
}

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <div className="inline-flex items-center rounded-lg bg-slate-100 p-1 gap-0.5">
      <button
        type="button"
        onClick={() => onChange('accumulated')}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-md px-4 h-9 text-sm font-medium transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2',
          value === 'accumulated'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'bg-transparent text-slate-600 hover:text-slate-900'
        )}
      >
        <TrendingUp className="h-4 w-4" />
        <span className="hidden sm:inline">Acumulado</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('current')}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-md px-4 h-9 text-sm font-medium transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2',
          value === 'current'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'bg-transparent text-slate-600 hover:text-slate-900'
        )}
      >
        <CalendarDays className="h-4 w-4" />
        <span className="hidden sm:inline">Corriente</span>
      </button>
    </div>
  );
}
