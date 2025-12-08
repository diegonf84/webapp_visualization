import { useQuery } from '@tanstack/react-query';
import { getCompanyRanking } from '@/services/api';
import type { FilterParams } from '@/types/api';

export function useCompanyRanking(params: FilterParams & { top_n?: number }) {
  return useQuery({
    queryKey: ['ranking', params],
    queryFn: () => getCompanyRanking(params),
    enabled: Boolean(params.year && params.quarter),
  });
}
