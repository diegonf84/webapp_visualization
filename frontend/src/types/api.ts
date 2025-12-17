// API Response Types

export interface KPIResponse {
  primas_emitidas: number;
  primas_devengadas: number;
  siniestros_devengados: number;
  gastos_devengados: number;
  entities_count: number;
}

export interface CompanyRankingItem {
  nombre_corto: string;
  ramo_nombre_corto: string | null;
  subramo_nombre_corto: string | null;
  primas_emitidas: number;
}

export interface CompanyRankingResponse {
  companies: CompanyRankingItem[];
  total: number;
}

export interface DistributionItem {
  name: string;
  value: number;
  percentage: number;
}

export interface DistributionResponse {
  items: DistributionItem[];
  total: number;
}

export interface FilterOptions {
  years: string[];
  quarters: string[];
  ramos: string[];
}

export interface HealthResponse {
  status: string;
  version: string;
}

// Filter State
export interface FilterState {
  year: string | null;
  quarter: string | null;
  ramo: string | null;
  viewMode: 'accumulated' | 'current';
  topN: number;
}

// API Query Params
export interface FilterParams {
  year?: string;
  quarter?: string;
  ramo?: string;
  view_mode?: 'accumulated' | 'current';
  top_n?: number;
}

// Company list (for selection page)
export interface CompanyListItem {
  cod_cia: string;
  nombre_corto: string;
  tipo_cia: string;
  primas_emitidas: number;
  ramos_count: number;
}

export interface CompanyListResponse {
  companies: CompanyListItem[];
  total: number;
}

export interface CompanyListParams {
  tipo_cia?: string;
  search?: string;
}

// Ramo breakdown item (for company portfolio)
export interface RamoBreakdownItem {
  ramo: string;
  primas: number;
  percentage: number;
}

// Company profile (single company)
export interface CompanyProfileResponse {
  cod_cia: string;
  nombre_corto: string;
  tipo_cia: string;
  periodo: string;
  ramos_count: number;
  // Ranking position
  ranking_position: number;
  total_companies: number;
  // Accumulated metrics
  primas_emitidas: number;
  primas_devengadas: number;
  siniestros_devengados: number;
  gastos_devengados: number;
  // Results from otros_conceptos
  resultado_tecnico: number;
  resultado_financiero: number;
  resultado_final: number;
  // YoY variations (null if not calculable - new company, zero division, >1000%)
  yoy_primas_emitidas: number | null;
  yoy_resultado_tecnico: number | null;
  yoy_resultado_financiero: number | null;
  yoy_resultado_final: number | null;
  // Current period metrics (for monthly average = divide by 3)
  primas_emitidas_current: number;
  primas_devengadas_current: number;
  siniestros_devengados_current: number;
  gastos_devengados_current: number;
  // Top 5 ramos
  top_ramos: RamoBreakdownItem[];
}
