import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAccessoryCategoryIds } from './useAccessoryCategory';
import type { ProductImageRow, ProductRow, StoreProduct } from '@/types/store';

const PAGE_SIZE = 20;

const attachProductImages = async (products: ProductRow[] | null | undefined): Promise<StoreProduct[]> => {
  const safeProducts = products ?? [];
  const productIds = safeProducts.map(product => product.id).filter(Boolean) as string[];

  if (productIds.length === 0) {
    return safeProducts.map(product => ({ ...product, product_images: [], product_color_variants: [] }));
  }

  const { data: images, error } = await supabase
    .from('product_images_rows')
    .select('*')
    .in('product_id', productIds)
    .order('display_order', { ascending: true });

  if (error) throw error;

  const safeImages = (images ?? []) as ProductImageRow[];

  return safeProducts.map(product => ({
    ...product,
    product_images: safeImages.filter(image => image.product_id === product.id),
    product_color_variants: [],
  }));
};

export const useProducts = () => {
  const { data: accessoryIds = [] } = useAccessoryCategoryIds();
  return useInfiniteQuery<StoreProduct[]>({
    queryKey: ['products', accessoryIds],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      let q = supabase
        .from('products_rows')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);
      if (accessoryIds.length > 0) {
        q = q.not('category_id', 'in', `(${accessoryIds.join(',')})`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return attachProductImages(data);
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE ? allPages.length : undefined;
    },
    initialPageParam: 0,
  });
};

export const useFeaturedProducts = () => {
  const { data: accessoryIds = [] } = useAccessoryCategoryIds();
  return useQuery<StoreProduct[]>({
    queryKey: ['featured-products', accessoryIds],
    queryFn: async () => {
      let q = supabase
        .from('products_rows')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(10);
      if (accessoryIds.length > 0) {
        q = q.not('category_id', 'in', `(${accessoryIds.join(',')})`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return attachProductImages(data);
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery<StoreProduct | undefined>({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products_rows')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      const [product] = await attachProductImages(data ? [data] : []);
      return product;
    },
    enabled: !!id,
  });
};

export const useRelatedProducts = (categoryId: string | null, excludeId: string) => {
  return useQuery<StoreProduct[]>({
    queryKey: ['related-products', categoryId, excludeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products_rows')
        .select('*')
        .eq('category_id', categoryId!)
        .neq('id', excludeId)
        .limit(6);
      if (error) throw error;
      return attachProductImages(data);
    },
    enabled: !!categoryId,
  });
};

export const useSearchProducts = (search: string) => {
  const { data: accessoryIds = [] } = useAccessoryCategoryIds();
  return useQuery<StoreProduct[]>({
    queryKey: ['search-products', search, accessoryIds],
    queryFn: async () => {
      let q = supabase
        .from('products_rows')
        .select('*')
        .or(`name.ilike.%${search}%,name_ar.ilike.%${search}%`)
        .limit(30);
      if (accessoryIds.length > 0) {
        q = q.not('category_id', 'in', `(${accessoryIds.join(',')})`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return attachProductImages(data);
    },
    enabled: search.length >= 2,
  });
};

// Accessories-only listing for the hidden /ax page
export const useAccessoryProducts = () => {
  const { data: accessoryIds = [], isLoading: loadingIds } = useAccessoryCategoryIds();
  return useQuery<StoreProduct[]>({
    queryKey: ['accessory-products', accessoryIds],
    queryFn: async () => {
      if (accessoryIds.length === 0) return [];
      const { data, error } = await supabase
        .from('products_rows')
        .select('*')
        .in('category_id', accessoryIds)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return attachProductImages(data);
    },
    enabled: !loadingIds,
  });
};
