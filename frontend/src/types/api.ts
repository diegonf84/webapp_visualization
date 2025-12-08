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
