import axios from 'axios';
import type {
  FilterOptions,
  KPIResponse,
  CompanyRankingResponse,
  DistributionResponse,
  FilterParams,
  HealthResponse,
} from '@/types/api';

// API base URL:
// - Development: Vite proxy handles /api/* (see vite.config.ts)
// - Docker: nginx proxies /api/* to backend
// - Render: VITE_API_URL points to backend service
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    // Render deployment - full URL to backend service
    return `https://${import.meta.env.VITE_API_URL}/api`;
  }
  // Local dev or Docker - use relative path (proxy handles it)
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Functions

export async function getHealth(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>('/health');
  return data;
}

export async function getFilters(): Promise<FilterOptions> {
  const { data } = await api.get<FilterOptions>('/filters');
  return data;
}

export async function getKPIs(params: FilterParams): Promise<KPIResponse> {
  const { data } = await api.get<KPIResponse>('/data/kpis', { params });
  return data;
}

export async function getCompanyRanking(
  params: FilterParams & { top_n?: number }
): Promise<CompanyRankingResponse> {
  const { data } = await api.get<CompanyRankingResponse>('/data/companies/ranking', { params });
  return data;
}

export async function getRamosDistribution(params: FilterParams): Promise<DistributionResponse> {
  const { data } = await api.get<DistributionResponse>('/data/distribution/ramos', { params });
  return data;
}

export async function getSubramosDistribution(params: FilterParams): Promise<DistributionResponse> {
  const { data } = await api.get<DistributionResponse>('/data/distribution/subramos', { params });
  return data;
}

export default api;
