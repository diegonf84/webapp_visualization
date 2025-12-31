import { useQuery } from '@tanstack/react-query';
import { getCompanyOperations } from '@/services/api';
import type {
  OperationsTimeSeriesResponse,
  PeriodDataPoint,
  OperationalAlert,
  WaterfallData,
} from '@/types/operations';
import {
  calculateAlerts,
  buildWaterfallData,
} from '@/lib/operationsUtils';

interface UseOperationsDataParams {
  codCia: string;
  selectedRamo: string | null;
}

interface UseOperationsDataResult {
  data: OperationsTimeSeriesResponse | undefined;
  alerts: OperationalAlert[];
  waterfallData: WaterfallData | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

// Transform API response (snake_case) to frontend format (camelCase)
function transformAPIResponse(apiData: Awaited<ReturnType<typeof getCompanyOperations>>): OperationsTimeSeriesResponse {
  return {
    codCia: apiData.cod_cia,
    nombreCorto: apiData.nombre_corto,
    selectedRamo: apiData.selected_ramo,
    periods: apiData.periods.map((p): PeriodDataPoint => ({
      periodo: p.periodo,
      periodoLabel: p.periodo_label,
      // Accumulated values
      primasEmitidas: p.primas_emitidas,
      primasDevengadas: p.primas_devengadas,
      siniestrosDevengados: p.siniestros_devengados,
      gastosDevengados: p.gastos_devengados,
      resultadoTecnico: p.resultado_tecnico,
      // Current quarter values
      primasDevengadasCurrent: p.primas_devengadas_current,
      siniestrosDevengadosCurrent: p.siniestros_devengados_current,
      gastosDevengadosCurrent: p.gastos_devengados_current,
      resultadoTecnicoCurrent: p.resultado_tecnico_current,
      // Ratios
      ratioCombinado: p.ratio_combinado,
      ratioSiniestralidad: p.ratio_siniestralidad,
      ratioGastos: p.ratio_gastos,
      marketRatioCombinado: p.market_ratio_combinado,
    })),
    availableRamos: apiData.available_ramos.map((r) => ({
      value: r.value,
      label: r.label,
    })),
  };
}

export function useOperationsData({
  codCia,
  selectedRamo,
}: UseOperationsDataParams): UseOperationsDataResult {
  const query = useQuery({
    queryKey: ['operations', codCia, selectedRamo],
    queryFn: async (): Promise<OperationsTimeSeriesResponse> => {
      const apiData = await getCompanyOperations(codCia, selectedRamo);
      return transformAPIResponse(apiData);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate alerts from the data
  const alerts = query.data?.periods
    ? calculateAlerts(query.data.periods, selectedRamo)
    : [];

  // Build waterfall data
  const waterfallData = query.data?.periods
    ? buildWaterfallData(query.data.periods)
    : null;

  return {
    data: query.data,
    alerts,
    waterfallData,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
