import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAccessoryCategoryIds } from './useAccessoryCategory';
import type { ProductImageRow, ProductRow, StoreProduct } from '@/types/store';

const PAGE_SIZE = 20;

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const toNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  return toNumber(value);
};

const toStringArray = (value: unknown): string[] => {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
};

const toQuantityPricing = (value: unknown): Array<{ quantity: number; price: number }> => {
  if (!Array.isArray(value)) return [];
  return value
    .map(item => {
      if (!item || typeof item !== 'object') return null;
      const entry = item as Record<string, unknown>;
      return {
        quantity: toNumber(entry.quantity),
        price: toNumber(entry.price),
      };
    })
    .filter((item): item is { quantity: number; price: number } => !!item);
};

const normalizeProduct = (product: ProductRow, productImages: ProductImageRow[]): StoreProduct => ({
  ...product,
  price: toNumber(product.price),
  offer_price: toNullableNumber(product.offer_price),
  discount_price: toNullableNumber(product.discount_price),
  stock: toNullableNumber(product.stock),
  rating: toNullableNumber(product.rating),
  low_stock_threshold: toNullableNumber(product.low_stock_threshold),
  color_options: toStringArray(product.color_options),
  size_options: toStringArray(product.size_options),
  quantity_pricing: toQuantityPricing(product.quantity_pricing),
  product_images: productImages,
  product_color_variants: [],
});

const attachProductImages = async (products: ProductRow[] | null | undefined): Promise<StoreProduct[]> => {
  const safeProducts = products ?? [];
  const productIds = safeProducts.map(product => product.id).filter(Boolean) as string[];

  if (productIds.length === 0) {
    return safeProducts.map(product => normalizeProduct(product, []));
  }

  const { data: images, error } = await supabase
    .from('product_images')
    .select('*')
    .in('product_id', productIds)
    .order('display_order', { ascending: true });

  if (error) throw error;

  const safeImages = (images ?? []) as ProductImageRow[];

  return safeProducts.map(product => ({
    ...normalizeProduct(product, safeImages.filter(image => image.product_id === product.id)),
  }));
};

export const useProducts = () => {
  const { data: accessoryIds = [] } = useAccessoryCategoryIds();
  return useInfiniteQuery<StoreProduct[]>({
    queryKey: ['products', accessoryIds],
    queryFn: async ({ pageParam = 0 }) => {
      const from = Number(pageParam) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      let q = supabase
        .from('products')
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
        .from('products')
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
        .from('products')
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
        .from('products')
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
        .from('products')
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
        .from('products')
        .select('*')
        .in('category_id', accessoryIds)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return attachProductImages(data);
    },
    enabled: !loadingIds,
  });
};
