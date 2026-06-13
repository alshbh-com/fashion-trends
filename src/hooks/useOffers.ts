import { useQuery } from '@tanstack/react-query';
import type { StoreOffer } from '@/types/store';

export const useOffers = () => {
  return useQuery<StoreOffer[]>({
    queryKey: ['offers'],
    queryFn: async () => [],
  });
};
