import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { ComparisonMethod } from '@/types/api';

const METHOD_OPTIONS: { value: ComparisonMethod; label: string }[] = [
  { value: 'total_percentile', label: 'Percentil Total' },
  { value: 'main_ramo_percentile', label: 'Percentil Ramo' },
  { value: 'ramo_similarity', label: 'Similitud de Ramo' },
];

interface MethodToggleProps {
  value: ComparisonMethod;
  onChange: (method: ComparisonMethod) => void;
  disabled?: boolean;
}

export function MethodToggle({ value, onChange, disabled }: MethodToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(val) => {
        if (val) onChange(val as ComparisonMethod);
      }}
      disabled={disabled}
      aria-label="Metodo de comparacion"
    >
      {METHOD_OPTIONS.map((opt) => (
        <ToggleGroupItem key={opt.value} value={opt.value}>
          {opt.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
