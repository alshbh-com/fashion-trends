import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAccessoryCategoryIds } from './useAccessoryCategory';

const PAGE_SIZE = 20;

export const useProducts = () => {
  const { data: accessoryIds = [] } = useAccessoryCategoryIds();
  return useInfiniteQuery({
    queryKey: ['products', accessoryIds],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      let q = supabase
        .from('products')
        .select('*, product_images(*), product_color_variants(*)')
        .order('created_at', { ascending: false })
        .range(from, to);
      if (accessoryIds.length > 0) {
        q = q.not('category_id', 'in', `(${accessoryIds.join(',')})`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE ? allPages.length : undefined;
    },
    initialPageParam: 0,
  });
};

export const useFeaturedProducts = () => {
  const { data: accessoryIds = [] } = useAccessoryCategoryIds();
  return useQuery({
    queryKey: ['featured-products', accessoryIds],
    queryFn: async () => {
      let q = supabase
        .from('products')
        .select('*, product_images(*), product_color_variants(*)')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(10);
      if (accessoryIds.length > 0) {
        q = q.not('category_id', 'in', `(${accessoryIds.join(',')})`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*), product_color_variants(*), categories(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useRelatedProducts = (categoryId: string | null, excludeId: string) => {
  return useQuery({
    queryKey: ['related-products', categoryId, excludeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .eq('category_id', categoryId!)
        .neq('id', excludeId)
        .limit(6);
      if (error) throw error;
      return data;
    },
    enabled: !!categoryId,
  });
};

export const useSearchProducts = (search: string) => {
  const { data: accessoryIds = [] } = useAccessoryCategoryIds();
  return useQuery({
    queryKey: ['search-products', search, accessoryIds],
    queryFn: async () => {
      let q = supabase
        .from('products')
        .select('*, product_images(*)')
        .or(`name.ilike.%${search}%,name_ar.ilike.%${search}%`)
        .limit(30);
      if (accessoryIds.length > 0) {
        q = q.not('category_id', 'in', `(${accessoryIds.join(',')})`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: search.length >= 2,
  });
};

// Accessories-only listing for the hidden /ax page
export const useAccessoryProducts = () => {
  const { data: accessoryIds = [], isLoading: loadingIds } = useAccessoryCategoryIds();
  return useQuery({
    queryKey: ['accessory-products', accessoryIds],
    queryFn: async () => {
      if (accessoryIds.length === 0) return [];
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*), product_color_variants(*)')
        .in('category_id', accessoryIds)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !loadingIds,
  });
};
