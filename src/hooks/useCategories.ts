import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAccessoryCategoryIds } from './useAccessoryCategory';

export const useCategories = () => {
  const { data: accessoryIds = [] } = useAccessoryCategoryIds();
  return useQuery({
    queryKey: ['categories', accessoryIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      // Hide accessory categories from the public list
      return (data || []).filter(c => !accessoryIds.includes(c.id));
    },
  });
};

// Returns only accessory categories (for the hidden /ax page)
export const useAccessoryCategories = () => {
  const { data: accessoryIds = [], isLoading } = useAccessoryCategoryIds();
  return useQuery({
    queryKey: ['accessory-categories', accessoryIds],
    queryFn: async () => {
      if (accessoryIds.length === 0) return [];
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .in('id', accessoryIds)
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !isLoading,
  });
};
