import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const PAGE_SIZE = 20;

export const useProducts = () => {
  return useInfiniteQuery({
    queryKey: ['products'],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*), product_color_variants(*)')
        .order('created_at', { ascending: false })
        .range(from, to);
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
  return useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*), product_color_variants(*)')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(10);
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
  return useQuery({
    queryKey: ['search-products', search],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .or(`name.ilike.%${search}%,name_ar.ilike.%${search}%`)
        .limit(30);
      if (error) throw error;
      return data;
    },
    enabled: search.length >= 2,
  });
};
