import { useQuery } from '@tanstack/react-query';

export const useAccessoryCategoryIds = () => {
  return useQuery<string[]>({
    queryKey: ['accessory-category-ids'],
    queryFn: async () => [],
    staleTime: 5 * 60 * 1000,
  });
};
