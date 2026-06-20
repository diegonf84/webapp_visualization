import { Calendar, Building2, Layers } from 'lucide-react';
import type { CompanyComparisonResponse } from '@/types/api';

interface ComparisonContextHeaderProps {
  data: CompanyComparisonResponse;
}

export function ComparisonContextHeader({ data }: ComparisonContextHeaderProps) {
  const { periodo, total_companies_in_tipo, main_ramo, main_ramo_percentage, method, total_companies_with_ramo } = data;

  // Format periodo label from YYYYQQ format
  const periodoLabel = (() => {
    const str = String(periodo);
    if (str.length === 6) {
      const year = str.slice(0, 4);
      const quarter = str.slice(4);
      const quarterLabels: Record<string, string> = {
        '01': '1er Trimestre',
        '02': '2do Trimestre',
        '03': '3er Trimestre',
        '04': '4to Trimestre',
      };
      return `${quarterLabels[quarter] || quarter} ${year}`;
    }
    return periodo;
  })();

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
      <div className="flex items-center gap-1.5">
        <Calendar className="h-4 w-4 text-slate-400" />
        <span>{periodoLabel}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <Building2 className="h-4 w-4 text-slate-400" />
        <span>
          {total_companies_in_tipo} companias en el tipo
        </span>
      </div>

      {method === 'main_ramo_percentile' && main_ramo && (
        <>
          <div className="flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-slate-400" />
            <span>
              Ramo: <span className="font-medium text-slate-900">{main_ramo}</span>
              {main_ramo_percentage != null && (
                <span className="text-slate-500"> ({main_ramo_percentage.toFixed(1)}%)</span>
              )}
            </span>
          </div>

          {total_companies_with_ramo != null && (
            <div className="text-slate-500">
              {total_companies_with_ramo} companias en el ramo
            </div>
          )}
        </>
      )}
    </div>
  );
}
