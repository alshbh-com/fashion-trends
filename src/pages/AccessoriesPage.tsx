import { motion } from 'framer-motion';
import { useAccessoryProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const AccessoriesPage = () => {
  const { data: products, isLoading } = useAccessoryProducts();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-20" dir="rtl">
      <header className="sticky top-0 z-30 glass border-b border-border safe-top">
        <div className="px-4 h-14 flex items-center gap-3">
          <Link to="/" className="p-1"><ArrowRight size={20} /></Link>
          <Sparkles size={18} className="text-primary" />
          <h1 className="text-lg font-bold text-gradient">قسم الإكسسوارات</h1>
        </div>
      </header>

      <div className="px-4 py-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/5] rounded-xl" />
            ))}
          </div>
        ) : !products || products.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <p className="text-muted-foreground">لا توجد منتجات إكسسوارات بعد</p>
            <p className="text-xs text-muted-foreground">
              أضف تصنيفاً باسم "اكسسوارات" من لوحة التحكم وارفع المنتجات تحته
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AccessoriesPage;
