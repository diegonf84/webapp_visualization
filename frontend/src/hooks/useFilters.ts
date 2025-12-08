import { useQuery } from '@tanstack/react-query';
import { getFilters } from '@/services/api';

export function useFilters() {
  return useQuery({
    queryKey: ['filters'],
    queryFn: getFilters,
    staleTime: 10 * 60 * 1000, // 10 minutes - filter options rarely change
  });
}
