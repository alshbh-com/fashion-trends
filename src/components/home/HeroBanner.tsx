import { useBanners } from '@/hooks/useBanners';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

export const HeroBanner = () => {
  const { data: banners, isLoading } = useBanners();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const timer = setInterval(() => setCurrent(c => (c + 1) % banners.length), 4000);
    return () => clearInterval(timer);
  }, [banners]);

  if (isLoading) return <Skeleton className="w-full aspect-[2/1] rounded-xl" />;
  if (!banners?.length) return null;

  return (
    <div className="relative w-full aspect-[2/1] rounded-xl overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={banners[current].id}
          src={banners[current].image_url}
          alt={banners[current].title}
          className="w-full h-full object-cover"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4 }}
        />
      </AnimatePresence>
      {banners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-primary-foreground w-5' : 'bg-primary-foreground/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
