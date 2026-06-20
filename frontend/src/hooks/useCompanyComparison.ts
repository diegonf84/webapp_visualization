import { useQuery } from '@tanstack/react-query';
import { getCompanyComparison } from '@/services/api';
import type { ComparisonMethod } from '@/types/api';

export function useCompanyComparison(
  codCia: string | undefined,
  method: ComparisonMethod | undefined,
) {
  return useQuery({
    queryKey: ['companyComparison', codCia, method],
    queryFn: () => getCompanyComparison(codCia!, method!),
    enabled: Boolean(codCia && method),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
