import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { WaterfallChartProps } from '@/types/operations';
import { formatCurrency } from '@/lib/operationsUtils';

const COLORS = {
  initial: '#64748b',
  positive: '#22c55e',
  negative: '#ef4444',
  total: '#3b82f6',
};

export function WaterfallChart({ data, isLoading }: WaterfallChartProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Puente de Resultado Tecnico (Rolling 12 meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[60px] flex items-center justify-center">
            <div className="animate-pulse text-slate-400">Cargando...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Puente de Resultado Tecnico (Rolling 12 meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-500 text-center py-4">
            No hay suficientes datos historicos (se requieren 8 trimestres minimo)
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for recharts waterfall
  const chartData = data.dataPoints.map((point, index) => {
    const prevTotal = index === 0 ? 0 : data.dataPoints[index - 1].runningTotal;

    if (point.type === 'initial' || point.type === 'total') {
      return {
        name: point.name,
        value: point.value,
        invisible: 0,
        type: point.type,
      };
    }

    return {
      name: point.name,
      value: point.value,
      invisible: point.value >= 0 ? prevTotal : prevTotal + point.value,
      type: point.type,
    };
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <CardTitle className="text-base font-semibold">
            Puente de Resultado Tecnico (Rolling 12 meses)
            <span className="ml-2 text-sm font-normal text-slate-500">
              {data.periodFrom} → {data.periodTo}
            </span>
          </CardTitle>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          )}
        </button>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={{ stroke: '#e2e8f0' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={{ stroke: '#e2e8f0' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value, name) => {
                    if (name === 'invisible') return [null, null];
                    const numValue = value as number;
                    const prefix = numValue >= 0 ? '+' : '';
                    return [`${prefix}$${formatCurrency(numValue)}`, ''];
                  }}
                  labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                />
                <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1} />
                <Bar dataKey="invisible" stackId="stack" fill="transparent" />
                <Bar dataKey="value" stackId="stack" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.type as keyof typeof COLORS]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex justify-center gap-6 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.initial }} />
              <span className="text-slate-600">Resultado R12</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.positive }} />
              <span className="text-slate-600">Impacto positivo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.negative }} />
              <span className="text-slate-600">Impacto negativo</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-slate-600">
                Este grafico muestra por que cambio el resultado tecnico entre dos periodos rolling 12 meses.
                Las barras intermedias representan el impacto de cada componente: un aumento en primas mejora el resultado,
                mientras que aumentos en siniestros o gastos lo empeoran.
              </p>
            </div>
          </div>
        </CardContent>
      )}

      {!isExpanded && (
        <CardContent className="pt-0">
          <p className="text-sm text-slate-500">
            Click para expandir y ver como evolucionaron primas, siniestros y gastos en los ultimos 12 meses
          </p>
        </CardContent>
      )}
    </Card>
  );
}
