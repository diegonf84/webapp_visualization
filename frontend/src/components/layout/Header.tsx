import { Badge } from '@/components/ui/badge';
import { ViewModeToggle } from '@/components/filters/ViewModeToggle';
import { formatPeriod } from '@/lib/utils';
import { VIEW_MODES } from '@/lib/constants';
import { BarChart3 } from 'lucide-react';

interface HeaderProps {
  year: string | null;
  quarter: string | null;
  viewMode: 'accumulated' | 'current';
  onViewModeChange: (value: 'accumulated' | 'current') => void;
}

export function Header({
  year,
  quarter,
  viewMode,
  onViewModeChange,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-[1600px] mx-auto px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Title & Period */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl shadow-sm">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Mercado Asegurador Argentino
                </h1>
                <p className="text-sm text-slate-500">
                  Dashboard de Producción
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <ViewModeToggle value={viewMode} onChange={onViewModeChange} />

            <div className="h-8 w-px bg-slate-200" />

            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                Período
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {formatPeriod(year, quarter)}
              </p>
            </div>

            <Badge variant={viewMode === 'accumulated' ? 'info' : 'secondary'}>
              {VIEW_MODES[viewMode].label}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
