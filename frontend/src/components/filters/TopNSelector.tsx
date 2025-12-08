import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { TOP_N_OPTIONS } from '@/lib/constants';

interface TopNSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export function TopNSelector({ value, onChange }: TopNSelectorProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
        Top
      </span>
      <ToggleGroup
        type="single"
        value={String(value)}
        onValueChange={(v) => v && onChange(Number(v))}
        size="sm"
      >
        {TOP_N_OPTIONS.map((n) => (
          <ToggleGroupItem key={n} value={String(n)}>
            {n}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
