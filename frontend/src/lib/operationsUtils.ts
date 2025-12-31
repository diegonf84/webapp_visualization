import type {
  PeriodDataPoint,
  OperationalAlert,
  WaterfallData,
  WaterfallDataPoint,
} from '@/types/operations';

// Calculate operational alerts based on data patterns
export function calculateAlerts(
  periods: PeriodDataPoint[],
  selectedRamo: string | null
): OperationalAlert[] {
  const alerts: OperationalAlert[] = [];

  if (periods.length < 2) return alerts;

  // Check for ratio > 100% sustained (3+ consecutive periods)
  let consecutiveAbove100 = 0;
  for (const period of periods) {
    if (period.ratioCombinado > 100) {
      consecutiveAbove100++;
    } else {
      consecutiveAbove100 = 0;
    }
  }

  if (consecutiveAbove100 >= 3) {
    alerts.push({
      id: 'ratio-sustained',
      severity: 'critical',
      type: 'ratio_above_100',
      title: 'Ratio Combinado > 100% Sostenido',
      description: `El ratio combinado ha superado el 100% durante ${consecutiveAbove100} períodos consecutivos${selectedRamo && selectedRamo !== 'all' ? ` en ${selectedRamo}` : ''}.`,
      value: periods[periods.length - 1].ratioCombinado,
      threshold: 100,
    });
  }

  // Check YoY deterioration (ratio increased > 10 points)
  if (periods.length >= 5) {
    const currentRatio = periods[periods.length - 1].ratioCombinado;
    const yoyRatio = periods[periods.length - 5]?.ratioCombinado; // 4 quarters ago

    if (yoyRatio && currentRatio - yoyRatio > 10) {
      alerts.push({
        id: 'yoy-deterioration',
        severity: 'warning',
        type: 'yoy_deterioration',
        title: 'Deterioro Interanual Significativo',
        description: `El ratio combinado aumentó ${(currentRatio - yoyRatio).toFixed(1)} puntos porcentuales vs. mismo período año anterior.`,
        value: currentRatio - yoyRatio,
        threshold: 10,
      });
    }
  }

  // Check growth imbalance (siniestros growing faster than primas)
  if (periods.length >= 5) {
    const current = periods[periods.length - 1];
    const yoy = periods[periods.length - 5];

    if (yoy && yoy.primasDevengadas > 0 && yoy.siniestrosDevengados > 0) {
      const primasGrowth = ((current.primasDevengadas - yoy.primasDevengadas) / yoy.primasDevengadas) * 100;
      const siniestrosGrowth = ((current.siniestrosDevengados - yoy.siniestrosDevengados) / yoy.siniestrosDevengados) * 100;

      if (siniestrosGrowth > primasGrowth + 15) {
        alerts.push({
          id: 'growth-imbalance',
          severity: 'warning',
          type: 'growth_imbalance',
          title: 'Desbalance en Crecimiento',
          description: `Los siniestros crecen ${(siniestrosGrowth - primasGrowth).toFixed(1)}% más rápido que las primas.`,
          value: siniestrosGrowth - primasGrowth,
        });
      }
    }
  }

  // Info alert if ratio is healthy
  const latestRatio = periods[periods.length - 1].ratioCombinado;
  if (latestRatio < 95 && alerts.length === 0) {
    alerts.push({
      id: 'healthy-ratio',
      severity: 'info',
      type: 'ratio_above_100',
      title: 'Ratio Combinado Saludable',
      description: `El ratio combinado actual es ${latestRatio.toFixed(1)}%, indicando un margen técnico positivo.`,
      value: latestRatio,
    });
  }

  return alerts;
}

// Build waterfall data for Rolling 12-month YoY comparison
// Compares the last 12 months (4 quarters) vs the previous 12 months (4 quarters before that)
export function buildWaterfallData(
  periods: PeriodDataPoint[]
): WaterfallData | null {
  // Need at least 8 quarters for two full rolling 12-month windows
  if (periods.length < 8) return null;

  // Current rolling 12: sum of last 4 quarters (_current values)
  const currentWindow = periods.slice(-4);
  // Previous rolling 12: sum of 4 quarters before that
  const previousWindow = periods.slice(-8, -4);

  // Sum values for current rolling 12
  const currentR12 = {
    primas: currentWindow.reduce((sum, p) => sum + p.primasDevengadasCurrent, 0),
    siniestros: currentWindow.reduce((sum, p) => sum + p.siniestrosDevengadosCurrent, 0),
    gastos: currentWindow.reduce((sum, p) => sum + p.gastosDevengadosCurrent, 0),
  };
  // resultado = primas - siniestros - gastos
  const currentResultado = currentR12.primas - currentR12.siniestros - currentR12.gastos;

  // Sum values for previous rolling 12
  const previousR12 = {
    primas: previousWindow.reduce((sum, p) => sum + p.primasDevengadasCurrent, 0),
    siniestros: previousWindow.reduce((sum, p) => sum + p.siniestrosDevengadosCurrent, 0),
    gastos: previousWindow.reduce((sum, p) => sum + p.gastosDevengadosCurrent, 0),
  };
  const previousResultado = previousR12.primas - previousR12.siniestros - previousR12.gastos;

  // Calculate impacts on result
  // Primas: positive impact if increased (more primas = better result)
  const deltaPrimas = currentR12.primas - previousR12.primas;
  // Siniestros: negative impact if increased (multiply by -1)
  const impactSiniestros = -(currentR12.siniestros - previousR12.siniestros);
  // Gastos: negative impact if increased (multiply by -1)
  const impactGastos = -(currentR12.gastos - previousR12.gastos);

  // Build period labels for display (use last quarter of each window)
  const currentPeriodLabel = `R12 ${currentWindow[3].periodoLabel}`;
  const previousPeriodLabel = `R12 ${previousWindow[3].periodoLabel}`;

  const dataPoints: WaterfallDataPoint[] = [
    {
      name: `Resultado ${previousPeriodLabel}`,
      value: previousResultado,
      displayValue: previousResultado,
      type: 'initial',
      runningTotal: previousResultado,
    },
    {
      name: 'Δ Primas',
      value: deltaPrimas,
      displayValue: Math.abs(deltaPrimas),
      type: deltaPrimas >= 0 ? 'positive' : 'negative',
      runningTotal: previousResultado + deltaPrimas,
    },
    {
      name: 'Δ Siniestros',
      value: impactSiniestros,
      displayValue: Math.abs(impactSiniestros),
      type: impactSiniestros >= 0 ? 'positive' : 'negative',
      runningTotal: previousResultado + deltaPrimas + impactSiniestros,
    },
    {
      name: 'Δ Gastos',
      value: impactGastos,
      displayValue: Math.abs(impactGastos),
      type: impactGastos >= 0 ? 'positive' : 'negative',
      runningTotal: previousResultado + deltaPrimas + impactSiniestros + impactGastos,
    },
    {
      name: `Resultado ${currentPeriodLabel}`,
      value: currentResultado,
      displayValue: currentResultado,
      type: 'total',
      runningTotal: currentResultado,
    },
  ];

  return {
    periodFrom: previousPeriodLabel,
    periodTo: currentPeriodLabel,
    dataPoints,
  };
}

// Format currency for display
export function formatCurrency(value: number): string {
  const absValue = Math.abs(value);
  if (absValue >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
  if (absValue >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (absValue >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}

// Format percentage for display
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
