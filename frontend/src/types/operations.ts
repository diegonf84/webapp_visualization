// Types for Operations Tab - Time series, ratios, alerts, waterfall

// API response types (snake_case from backend)
export interface PeriodDataPointAPI {
  periodo: string;
  periodo_label: string;
  // Accumulated values
  primas_emitidas: number;
  primas_devengadas: number;
  siniestros_devengados: number;
  gastos_devengados: number;
  resultado_tecnico: number;
  // Current quarter values
  primas_devengadas_current: number;
  siniestros_devengados_current: number;
  gastos_devengados_current: number;
  resultado_tecnico_current: number;
  // Ratios
  ratio_combinado: number;
  ratio_siniestralidad: number;
  ratio_gastos: number;
  market_ratio_combinado: number;
}

export interface RamoOptionAPI {
  value: string;
  label: string;
}

export interface OperationsAPIResponse {
  cod_cia: string;
  nombre_corto: string;
  selected_ramo: string | null;
  periods: PeriodDataPointAPI[];
  available_ramos: RamoOptionAPI[];
}

// Frontend types (camelCase)
export interface PeriodDataPoint {
  periodo: string;
  periodoLabel: string;
  // Accumulated values (for ratios chart)
  primasEmitidas: number;
  primasDevengadas: number;
  siniestrosDevengados: number;
  gastosDevengados: number;
  resultadoTecnico: number;
  // Current quarter values (for absolute values charts and rolling 12)
  primasDevengadasCurrent: number;
  siniestrosDevengadosCurrent: number;
  gastosDevengadosCurrent: number;
  resultadoTecnicoCurrent: number;
  // Ratios
  ratioCombinado: number;
  ratioSiniestralidad: number;
  ratioGastos: number;
  marketRatioCombinado: number;
}

export interface RamoOption {
  value: string;
  label: string;
}

export interface OperationsTimeSeriesResponse {
  codCia: string;
  nombreCorto: string;
  selectedRamo: string | null;
  periods: PeriodDataPoint[];
  availableRamos: RamoOption[];
}

export type AlertSeverity = 'warning' | 'critical' | 'info';
export type AlertType =
  | 'ratio_above_100'
  | 'yoy_deterioration'
  | 'growth_imbalance'
  | 'concentration_risk';

export interface OperationalAlert {
  id: string;
  severity: AlertSeverity;
  type: AlertType;
  title: string;
  description: string;
  affectedRamos?: string[];
  value?: number;
  threshold?: number;
}

export interface WaterfallDataPoint {
  name: string;
  value: number;
  displayValue: number; // For display (absolute value)
  type: 'initial' | 'positive' | 'negative' | 'total';
  runningTotal: number;
}

export interface WaterfallData {
  periodFrom: string;
  periodTo: string;
  dataPoints: WaterfallDataPoint[];
}

// Props interfaces for components
export interface OperationsTabProps {
  codCia: string;
}

export interface RatioEvolutionChartProps {
  data: PeriodDataPoint[];
  isLoading?: boolean;
}

export interface AbsoluteValuesChartProps {
  data: PeriodDataPoint[];
  isLoading?: boolean;
}

export interface TechnicalResultBarProps {
  data: PeriodDataPoint[];
  isLoading?: boolean;
}

export interface WaterfallChartProps {
  data: WaterfallData | null;
  isLoading?: boolean;
}

export interface OperationalAlertsProps {
  alerts: OperationalAlert[];
  isLoading?: boolean;
}
