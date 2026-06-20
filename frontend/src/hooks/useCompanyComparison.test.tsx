import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { useCompanyComparison } from './useCompanyComparison';
import * as api from '@/services/api';
import type { CompanyComparisonResponse } from '@/types/api';

vi.mock('@/services/api');

const mockResponse: CompanyComparisonResponse = {
  selected_company: {
    cod_cia: 'A001',
    nombre_corto: 'Company A',
    tipo_cia: 'Generales',
    primas_emitidas: 800_000_000,
    ranking_position: 2,
    relative_position: 0,
    main_ramo_primas: null,
    similarity_distance: null,
  },
  method: 'total_percentile',
  main_ramo: null,
  main_ramo_percentage: null,
  companies_above: [
    {
      cod_cia: 'X001',
      nombre_corto: 'Company X',
      tipo_cia: 'Generales',
      primas_emitidas: 1_000_000_000,
      ranking_position: 1,
      relative_position: -1,
      main_ramo_primas: null,
      similarity_distance: null,
    },
  ],
  companies_below: [
    {
      cod_cia: 'B002',
      nombre_corto: 'Company B',
      tipo_cia: 'Generales',
      primas_emitidas: 250_000_000,
      ranking_position: 3,
      relative_position: 1,
      main_ramo_primas: null,
      similarity_distance: null,
    },
  ],
  similar_companies: [],
  periodo: '202404',
  total_companies_in_tipo: 10,
  total_companies_with_ramo: null,
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('useCompanyComparison', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not fetch when codCia is undefined', () => {
    const getComparisonSpy = vi.spyOn(api, 'getCompanyComparison');
    renderHook(() => useCompanyComparison(undefined, 'total_percentile'), {
      wrapper: createWrapper(),
    });
    expect(getComparisonSpy).not.toHaveBeenCalled();
  });

  it('should return data on successful fetch (R6)', async () => {
    vi.spyOn(api, 'getCompanyComparison').mockResolvedValue(mockResponse);

    const { result } = renderHook(
      () => useCompanyComparison('A001', 'total_percentile'),
      { wrapper: createWrapper() },
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.data?.selected_company.cod_cia).toBe('A001');
    expect(result.current.data?.companies_above).toHaveLength(1);
    expect(result.current.data?.companies_below).toHaveLength(1);
  });

  it('should return error on API failure (R7)', async () => {
    vi.spyOn(api, 'getCompanyComparison').mockRejectedValue(
      new Error('Network error'),
    );

    const { result } = renderHook(
      () => useCompanyComparison('INVALID', 'total_percentile'),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});
