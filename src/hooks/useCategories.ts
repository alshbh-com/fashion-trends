import { useQuery } from '@tanstack/react-query';
import { useAccessoryCategoryIds } from './useAccessoryCategory';
import type { StoreCategory } from '@/types/store';

export const useCategories = () => {
  const { data: accessoryIds = [] } = useAccessoryCategoryIds();
  return useQuery<StoreCategory[]>({
    queryKey: ['categories', accessoryIds],
    queryFn: async () => [],
  });
};

// Returns only accessory categories (for the hidden /ax page)
export const useAccessoryCategories = () => {
  const { data: accessoryIds = [], isLoading } = useAccessoryCategoryIds();
  return useQuery<StoreCategory[]>({
    queryKey: ['accessory-categories', accessoryIds],
    queryFn: async () => [],
    enabled: !isLoading,
  });
};
