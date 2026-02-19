import { useCategories } from '@/hooks/useCategories';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductCard } from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const CategoriesPage = () => {
  const { data: categories, isLoading: catsLoading } = useCategories();
  const [searchParams] = useSearchParams();
  const selectedId = searchParams.get('id');

  const { data: products, isLoading: prodsLoading } = useQuery({
    queryKey: ['category-products', selectedId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .eq('category_id', selectedId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedId,
  });

  const selectedCat = categories?.find(c => c.id === selectedId);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-20" dir="rtl">
      <header className="sticky top-0 z-30 glass border-b border-border safe-top">
        <div className="px-4 h-14 flex items-center gap-3">
          {selectedId && (
            <Link to="/categories" className="p-1"><ArrowRight size={20} /></Link>
          )}
          <h1 className="text-lg font-bold">{selectedCat?.name || 'التصنيفات'}</h1>
        </div>
      </header>

      <div className="px-4 py-4">
        {!selectedId ? (
          <div className="grid grid-cols-2 gap-3">
            {catsLoading ? (
              Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)
            ) : (
              categories?.map(cat => (
                <Link key={cat.id} to={`/categories?id=${cat.id}`}
                  className="relative aspect-square rounded-xl overflow-hidden bg-primary-light border border-border flex items-center justify-center group"
                >
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : null}
                  <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-lg">{cat.name}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {prodsLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[3/5] rounded-xl" />)
            ) : products?.length === 0 ? (
              <p className="col-span-2 text-center text-muted-foreground py-10">لا توجد منتجات في هذا التصنيف</p>
            ) : (
              products?.map(p => <ProductCard key={p.id} product={p} />)
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CategoriesPage;
