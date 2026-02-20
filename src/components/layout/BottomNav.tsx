import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, ShoppingCart, Grid3X3, Menu, X, Package, Shield, Download, MapPin, Phone } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: Home, label: 'الرئيسية' },
  { to: '/categories', icon: Grid3X3, label: 'التصنيفات' },
  { to: '/search', icon: Search, label: 'بحث' },
  { to: '/cart', icon: ShoppingCart, label: 'السلة' },
];

const menuLinks = [
  { to: '/', icon: Home, label: 'الرئيسية' },
  { to: '/categories', icon: Grid3X3, label: 'التصنيفات' },
  { to: '/search', icon: Search, label: 'البحث' },
  { to: '/cart', icon: ShoppingCart, label: 'السلة' },
  { to: '/track-order', icon: Package, label: 'تتبع الطلب' },
  { to: '/policies', icon: Shield, label: 'السياسات' },
  { to: '/install', icon: Download, label: 'تثبيت التطبيق' },
];

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  if (location.pathname.startsWith('/admin')) return null;

  return (
    <>
      {/* ── Dropdown Menu Overlay ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed bottom-20 left-4 right-4 z-50 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
              dir="rtl"
            >
              <div className="p-2">
                <p className="text-xs text-muted-foreground px-3 py-2 font-semibold">الصفحات</p>
                {menuLinks.map(({ to, icon: Icon, label }) => (
                  <button
                    key={to}
                    onClick={() => { navigate(to); setMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-colors hover:bg-muted ${
                      location.pathname === to ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground'
                    }`}
                  >
                    <Icon size={18} className={location.pathname === to ? 'text-primary' : 'text-muted-foreground'} />
                    {label}
                  </button>
                ))}

                {/* Divider */}
                <div className="border-t border-border mx-3 my-2" />

                {/* Customer Service */}
                <a
                  href="tel:01013701405"
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-foreground hover:bg-muted"
                  onClick={() => setMenuOpen(false)}
                >
                  <Phone size={18} className="text-muted-foreground" />
                  خدمة العملاء: 01013701405
                </a>
                <a
                  href="https://wa.me/201013701405"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-foreground hover:bg-muted"
                  onClick={() => setMenuOpen(false)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-green-500">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  واتساب
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Bottom Navigation Bar ── */}
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
                  <Icon size={22} className={isActive ? 'text-primary' : 'text-muted-foreground'} />
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
                  <motion.div layoutId="bottomNav" className="absolute top-0 w-8 h-0.5 rounded-full bg-primary" />
                )}
              </NavLink>
            );
          })}

          {/* Menu Button */}
          <button
            className="relative flex flex-col items-center justify-center w-16 h-full"
            onClick={() => { setMenuOpen(o => !o); navigator.vibrate?.(30); }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {menuOpen ? (
                <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X size={22} className="text-primary" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu size={22} className="text-muted-foreground" />
                </motion.div>
              )}
            </AnimatePresence>
            <span className={`text-[10px] mt-1 ${menuOpen ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
              المزيد
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
