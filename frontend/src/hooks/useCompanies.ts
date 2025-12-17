import { useQuery } from '@tanstack/react-query';
import { getCompanies } from '@/services/api';
import type { CompanyListParams } from '@/types/api';

export function useCompanies(params?: CompanyListParams) {
  return useQuery({
    queryKey: ['companies', params],
    queryFn: () => getCompanies(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
