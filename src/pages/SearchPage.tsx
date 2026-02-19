import { useState } from 'react';
import { useSearchProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/product/ProductCard';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Search as SearchIcon, X } from 'lucide-react';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const { data: products, isLoading } = useSearchProducts(query);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-20" dir="rtl">
      <header className="sticky top-0 z-30 glass border-b border-border safe-top">
        <div className="px-4 h-14 flex items-center gap-3">
          <SearchIcon size={18} className="text-muted-foreground shrink-0" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="ابحث عن منتج..."
            className="border-0 bg-transparent focus-visible:ring-0 h-10 text-base"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1"><X size={18} /></button>
          )}
        </div>
      </header>

      <div className="px-4 py-4">
        {query.length < 2 ? (
          <p className="text-center text-muted-foreground py-10">اكتب حرفين على الأقل للبحث</p>
        ) : isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products?.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">لا توجد نتائج</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products?.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SearchPage;
