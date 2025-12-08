import { useQuery } from '@tanstack/react-query';
import { getRamosDistribution, getSubramosDistribution } from '@/services/api';
import type { FilterParams } from '@/types/api';

export function useDistribution(params: FilterParams, type: 'ramos' | 'subramos') {
  const fetchFn = type === 'ramos' ? getRamosDistribution : getSubramosDistribution;

  return useQuery({
    queryKey: ['distribution', type, params],
    queryFn: () => fetchFn(params),
    enabled: Boolean(params.year && params.quarter),
  });
}
