import { Calendar, Layers, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QUARTER_LABELS } from '@/lib/constants';
import type { FilterOptions } from '@/types/api';

interface FilterBarProps {
  filters: FilterOptions | undefined;
  isLoading: boolean;
  year: string | null;
  quarter: string | null;
  ramo: string | null;
  onYearChange: (value: string) => void;
  onQuarterChange: (value: string) => void;
  onRamoChange: (value: string | null) => void;
}

export function FilterBar({
  filters,
  isLoading,
  year,
  quarter,
  ramo,
  onYearChange,
  onQuarterChange,
  onRamoChange,
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Year Filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Calendar className="h-3.5 w-3.5" />
            Año
          </label>
          <Select
            value={year || ''}
            onValueChange={onYearChange}
            disabled={isLoading || !filters}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar año" />
            </SelectTrigger>
            <SelectContent>
              {filters?.years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quarter Filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Calendar className="h-3.5 w-3.5" />
            Trimestre
          </label>
          <Select
            value={quarter || ''}
            onValueChange={onQuarterChange}
            disabled={isLoading || !filters}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar trimestre" />
            </SelectTrigger>
            <SelectContent>
              {filters?.quarters.map((q) => (
                <SelectItem key={q} value={q}>
                  {QUARTER_LABELS[q]?.long || q} ({QUARTER_LABELS[q]?.fiscal})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ramo Filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Layers className="h-3.5 w-3.5" />
            Ramo
          </label>
          <Select
            value={ramo || 'all'}
            onValueChange={(v) => onRamoChange(v === 'all' ? null : v)}
            disabled={isLoading || !filters}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos los ramos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <span className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 text-slate-400" />
                  Todos los ramos
                </span>
              </SelectItem>
              {filters?.ramos.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
