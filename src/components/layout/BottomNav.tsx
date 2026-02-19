import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, User, Grid3X3 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/', icon: Home, label: 'الرئيسية' },
  { to: '/categories', icon: Grid3X3, label: 'التصنيفات' },
  { to: '/search', icon: Search, label: 'بحث' },
  { to: '/cart', icon: ShoppingCart, label: 'السلة' },
  { to: '/track-order', icon: User, label: 'طلباتي' },
];

export const BottomNav = () => {
  const location = useLocation();
  const { totalItems } = useCart();

  // Hide on admin pages
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className="relative flex flex-col items-center justify-center w-16 h-full"
              onClick={() => navigator.vibrate?.(30)}
            >
              <div className="relative">
                <Icon
                  size={22}
                  className={isActive ? 'text-primary' : 'text-muted-foreground'}
                />
                {to === '/cart' && totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center"
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </motion.span>
                )}
              </div>
              <span className={`text-[10px] mt-1 ${isActive ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                {label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottomNav"
                  className="absolute top-0 w-8 h-0.5 rounded-full bg-primary"
                />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
