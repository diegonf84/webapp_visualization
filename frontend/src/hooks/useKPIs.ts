import { useQuery } from '@tanstack/react-query';
import { getKPIs } from '@/services/api';
import type { FilterParams } from '@/types/api';

export function useKPIs(params: FilterParams) {
  return useQuery({
    queryKey: ['kpis', params],
    queryFn: () => getKPIs(params),
    enabled: Boolean(params.year && params.quarter),
  });
}
