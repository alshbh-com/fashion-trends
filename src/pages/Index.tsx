import { motion } from 'framer-motion';
import { HeroBanner } from '@/components/home/HeroBanner';
import { CategorySection } from '@/components/home/CategorySection';
import { OffersMarquee } from '@/components/home/OffersMarquee';
import { ProductGrid } from '@/components/home/ProductGrid';
import { useAppSettings } from '@/hooks/useAppSettings';
import { Phone, MessageCircle, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

const Index = () => {
  const { data: settings } = useAppSettings();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setDark(d => !d);
    navigator.vibrate?.(30);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-20"
      dir="rtl"
    >
      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b border-border safe-top">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-lg font-bold text-gradient">{settings?.platform_name || 'Family Trend'}</h1>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-muted transition-colors">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <a href="https://wa.me/201013701405" className="p-2 rounded-full hover:bg-muted transition-colors text-success">
              <MessageCircle size={18} />
            </a>
            <a href="tel:01013701405" className="p-2 rounded-full hover:bg-muted transition-colors text-primary">
              <Phone size={18} />
            </a>
          </div>
        </div>
      </header>

      <main className="px-4 space-y-5 mt-4">
        {/* Offers Marquee */}
        <OffersMarquee />
        
        {/* Banner */}
        <HeroBanner />

        {/* Categories */}
        <section>
          <h2 className="text-base font-bold mb-2">التصنيفات</h2>
          <CategorySection />
        </section>

        {/* All Products */}
        <section>
          <h2 className="text-base font-bold mb-3">جميع المنتجات</h2>
          <ProductGrid />
        </section>
      </main>
    </motion.div>
  );
};

export default Index;
