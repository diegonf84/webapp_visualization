import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOperationsData } from '@/hooks/useOperationsData';
import type { OperationsTabProps } from '@/types/operations';
import { RatioEvolutionChart } from './RatioEvolutionChart';
import { AbsoluteValuesChart } from './AbsoluteValuesChart';
import { TechnicalResultBar } from './TechnicalResultBar';
import { WaterfallChart } from './WaterfallChart';
import { OperationalAlerts } from './OperationalAlerts';

export function OperationsTab({ codCia }: OperationsTabProps) {
  const [selectedRamo, setSelectedRamo] = useState<string>('all');

  const { data, alerts, waterfallData, isLoading } = useOperationsData({
    codCia,
    selectedRamo: selectedRamo === 'all' ? null : selectedRamo,
  });

  const handleRamoChange = (value: string) => {
    setSelectedRamo(value);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Ramo:</label>
          <Select value={selectedRamo} onValueChange={handleRamoChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Seleccionar ramo" />
            </SelectTrigger>
            <SelectContent>
              {data?.availableRamos.map((ramo) => (
                <SelectItem key={ramo.value} value={ramo.value}>
                  {ramo.label}
                </SelectItem>
              )) || (
                <>
                  <SelectItem value="all">Todos los Ramos</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {selectedRamo !== 'all' && (
          <div className="ml-auto">
            <span className="text-sm text-slate-500">
              Mostrando datos de: <strong className="text-slate-700">{selectedRamo}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Section 1: Ratio Evolution */}
      <RatioEvolutionChart
        data={data?.periods || []}
        isLoading={isLoading}
      />

      {/* Section 2 & 3: Primas/Siniestros and Resultado Técnico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AbsoluteValuesChart
          data={data?.periods || []}
          isLoading={isLoading}
        />
        <TechnicalResultBar
          data={data?.periods || []}
          isLoading={isLoading}
        />
      </div>

      {/* Section 4: Waterfall (Collapsible) */}
      <WaterfallChart
        data={waterfallData}
        isLoading={isLoading}
      />

      {/* Section 5: Operational Alerts */}
      <OperationalAlerts
        alerts={alerts}
        isLoading={isLoading}
      />
    </div>
  );
}
