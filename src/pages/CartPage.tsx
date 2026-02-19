import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const CartPage = () => {
  const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pb-20 px-4" dir="rtl">
        <ShoppingCart size={64} className="text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-bold mb-2">السلة فارغة</h2>
        <p className="text-muted-foreground text-sm mb-6">أضف منتجات لبدء التسوق</p>
        <Button asChild className="gradient-primary text-primary-foreground rounded-xl">
          <Link to="/">تسوق الآن</Link>
        </Button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-44" dir="rtl">
      <header className="sticky top-0 z-30 glass border-b border-border safe-top">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-lg font-bold">السلة ({totalItems})</h1>
          <button onClick={clearCart} className="text-sm text-destructive">مسح الكل</button>
        </div>
      </header>

      <div className="px-4 py-3 space-y-3">
        <AnimatePresence>
          {items.map(item => (
            <motion.div
              key={item.id}
              layout
              exit={{ opacity: 0, x: -100 }}
              className="flex gap-3 bg-card rounded-xl border border-border p-3"
            >
              <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold line-clamp-1">{item.name}</h3>
                {(item.color || item.size) && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.color && `اللون: ${item.color}`} {item.size && `| المقاس: ${item.size}`}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-bold text-primary">{item.price * item.quantity} ج.م</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 rounded-md bg-muted"><Minus size={14} /></button>
                    <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 rounded-md bg-muted"><Plus size={14} /></button>
                    <button onClick={() => removeItem(item.id)} className="p-1 rounded-md text-destructive ml-1"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Summary Fixed Bottom */}
      <div className="fixed bottom-16 left-0 right-0 z-30 glass border-t border-border px-4 py-3 safe-bottom">
        <div className="flex justify-between items-center mb-3">
          <span className="text-muted-foreground">المجموع</span>
          <span className="text-xl font-bold text-primary">{totalPrice} ج.م</span>
        </div>
        <Button onClick={() => navigate('/checkout')} className="w-full h-12 gradient-primary text-primary-foreground font-bold text-base rounded-xl gap-2">
          إتمام الطلب <ArrowLeft size={18} />
        </Button>
      </div>
    </motion.div>
  );
};

export default CartPage;
