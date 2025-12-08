import { Building2, Banknote, Receipt, Wallet, AlertTriangle, TrendingUp } from 'lucide-react';
import { KPICard } from './KPICard';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { KPIResponse } from '@/types/api';

interface KPIRowProps {
  data: KPIResponse | undefined;
  isLoading: boolean;
}

export function KPIRow({ data, isLoading }: KPIRowProps) {
  // Calculate Resultado Técnico = Primas Devengadas - Siniestros Devengados - Gastos Devengados
  const resultadoTecnico = data
    ? data.primas_devengadas - data.siniestros_devengados - data.gastos_devengados
    : 0;

  const kpis = [
    {
      title: 'Entidades con Emisión',
      value: data ? formatNumber(data.entities_count) : '—',
      icon: Building2,
      accentColor: 'blue' as const,
    },
    {
      title: 'Total de Producción',
      value: data ? formatCurrency(data.primas_emitidas) : '—',
      icon: Banknote,
      accentColor: 'emerald' as const,
    },
    {
      title: 'Primas Devengadas',
      value: data ? formatCurrency(data.primas_devengadas) : '—',
      icon: Receipt,
      accentColor: 'amber' as const,
    },
    {
      title: 'Total Gastos',
      value: data ? formatCurrency(data.gastos_devengados) : '—',
      icon: Wallet,
      accentColor: 'purple' as const,
    },
    {
      title: 'Siniestros Devengados',
      value: data ? formatCurrency(data.siniestros_devengados) : '—',
      icon: AlertTriangle,
      accentColor: 'rose' as const,
    },
    {
      title: 'Resultado Técnico',
      value: data ? formatCurrency(resultadoTecnico) : '—',
      icon: TrendingUp,
      accentColor: resultadoTecnico >= 0 ? 'emerald' as const : 'rose' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {kpis.map((kpi, index) => (
        <div
          key={kpi.title}
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
        >
          <KPICard
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            accentColor={kpi.accentColor}
            isLoading={isLoading}
          />
        </div>
      ))}
    </div>
  );
}
