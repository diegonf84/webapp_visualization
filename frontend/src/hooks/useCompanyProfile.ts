import { useQuery } from '@tanstack/react-query';
import { getCompanyProfile } from '@/services/api';

export function useCompanyProfile(codCia: string | undefined) {
  return useQuery({
    queryKey: ['companyProfile', codCia],
    queryFn: () => getCompanyProfile(codCia!),
    enabled: Boolean(codCia),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
