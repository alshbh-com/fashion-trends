import { ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSettings } from '@/hooks/useAppSettings';

const SplashScreen = ({ storeName }: { storeName: string }) => (
  <motion.div
    className="fixed inset-0 z-50 flex flex-col items-center justify-center gradient-primary"
    exit={{ opacity: 0, scale: 1.1 }}
    transition={{ duration: 0.5 }}
  >
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, type: 'spring' }}
      className="text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl font-bold text-primary-foreground">FT</span>
      </div>
      <h1 className="text-2xl font-bold text-primary-foreground">{storeName}</h1>
      <p className="text-primary-foreground/70 text-sm mt-1">ملابس أطفال مميزة</p>
    </motion.div>
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: 120 }}
      transition={{ duration: 1.5, delay: 0.3 }}
      className="h-1 bg-primary-foreground/30 rounded-full mt-8 overflow-hidden"
    >
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ duration: 1, repeat: Infinity }}
        className="h-full w-1/2 bg-primary-foreground rounded-full"
      />
    </motion.div>
  </motion.div>
);

export const AppShell = ({ children }: { children: ReactNode }) => {
  const [showSplash, setShowSplash] = useState(true);
  const { data: settings } = useAppSettings();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Apply theme_mode from DB
  useEffect(() => {
    if (!settings) return;
    const mode = (settings as any).theme_mode;
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen storeName={settings?.platform_name || 'Family Trend'} />}
      </AnimatePresence>
      {children}
    </>
  );
};
