import { useParams, useNavigate } from 'react-router-dom';
import { useProduct, useRelatedProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { useGovernorates } from '@/hooks/useGovernorates';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Share2, ShoppingCart, Star, Minus, Plus, ChevronLeft, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/product/ProductCard';
import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
interface QuantityPricingTier {
  quantity: number;  // min quantity to unlock this price
  price: number;
}

interface VariantSelection {
  color: string;
  size: string;
  quantity: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
// DB format: [{quantity: 1, price: 249}, {quantity: 2, price: 220}, ...]
// Returns the price per unit for the given total quantity
const getEffectivePrice = (basePrice: number, tiers: QuantityPricingTier[], total: number): number => {
  if (!tiers || tiers.length === 0) return basePrice;
  // Sort descending by quantity threshold, pick first where total >= threshold
  const sorted = [...tiers].sort((a, b) => b.quantity - a.quantity);
  const matched = sorted.find(t => total >= t.quantity);
  return matched ? matched.price : basePrice;
};

const MAX_QTY = 12;

// ─── Swipeable Image Gallery ──────────────────────────────────────────────────
const ImageGallery = ({ images, productName }: { images: string[]; productName: string }) => {
  const [current, setCurrent] = useState(0);
  const dragStartX = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const goNext = useCallback(() => setCurrent(c => (c + 1) % images.length), [images.length]);
  const goPrev = useCallback(() => setCurrent(c => (c - 1 + images.length) % images.length), [images.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = dragStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
  };
  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartX.current = e.clientX;
  };
  const handleMouseUp = (e: React.MouseEvent) => {
    const diff = dragStartX.current - e.clientX;
    if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square overflow-hidden bg-muted select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{ cursor: 'grab' }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.img
          key={current}
          src={images[current]}
          alt={`${productName} ${current + 1}`}
          className="w-full h-full object-cover pointer-events-none"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.25 }}
          draggable={false}
        />
      </AnimatePresence>

      {images.length > 1 && (
        <>
          <button onClick={goPrev} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/70 flex items-center justify-center shadow">
            <ChevronRight size={16} />
          </button>
          <button onClick={goNext} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/70 flex items-center justify-center shadow">
            <ChevronLeft size={16} />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all ${i === current ? 'w-5 bg-primary' : 'w-2 bg-foreground/30'}`}
              />
            ))}
          </div>
          <span className="absolute top-3 left-3 bg-background/70 text-xs px-2 py-0.5 rounded-full">
            {current + 1} / {images.length}
          </span>
        </>
      )}
    </div>
  );
};

// ─── Variant Selector Row ─────────────────────────────────────────────────────
const VariantSelectorRow = ({
  sel, colors, getSizesForColor, onChange, onRemove, index,
}: {
  sel: VariantSelection;
  colors: string[];
  getSizesForColor: (c: string) => string[];
  onChange: (index: number, updated: VariantSelection) => void;
  onRemove: (index: number) => void;
  index: number;
}) => {
  const sizes = getSizesForColor(sel.color);
  return (
    <div className="bg-muted rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">قطعة {index + 1}</span>
        {index > 0 && (
          <button onClick={() => onRemove(index)} className="text-destructive text-xs">حذف</button>
        )}
      </div>
      {/* Color */}
      <div>
        <p className="text-xs text-muted-foreground mb-1">اللون</p>
        <div className="flex flex-wrap gap-1.5">
          {colors.map(c => (
            <button key={c}
              onClick={() => onChange(index, { ...sel, color: c, size: '' })}
              className={`px-3 py-1 rounded-lg text-xs border transition-all ${sel.color === c ? 'border-primary bg-primary text-primary-foreground font-semibold' : 'border-border bg-background'}`}
            >{c}</button>
          ))}
        </div>
      </div>
      {/* Size */}
      {sel.color && sizes.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-1">المقاس</p>
          <div className="flex flex-wrap gap-1.5">
            {sizes.map(s => (
              <button key={s}
                onClick={() => onChange(index, { ...sel, size: s })}
                className={`px-3 py-1 rounded-lg text-xs border transition-all ${sel.size === s ? 'border-primary bg-primary text-primary-foreground font-semibold' : 'border-border bg-background'}`}
              >{s}</button>
            ))}
          </div>
        </div>
      )}
      {/* Qty */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">الكمية</span>
        <div className="flex items-center gap-2 bg-background rounded-lg px-2 py-1">
          <button onClick={() => onChange(index, { ...sel, quantity: Math.max(1, sel.quantity - 1) })}>
            <Minus size={12} />
          </button>
          <span className="text-sm font-semibold w-5 text-center">{sel.quantity}</span>
          <button onClick={() => onChange(index, { ...sel, quantity: sel.quantity + 1 })}>
            <Plus size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Order Success Screen ─────────────────────────────────────────────────────
const OrderSuccess = ({ orderNumber, onBack }: { orderNumber: number; onBack: () => void }) => (
  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background px-6" dir="rtl">
    <div className="gradient-primary w-20 h-20 rounded-full flex items-center justify-center mb-6">
      <CheckCircle2 size={40} className="text-primary-foreground" />
    </div>
    <h1 className="text-2xl font-bold mb-2">تم تأكيد الطلب! 🎉</h1>
    <p className="text-muted-foreground text-center mb-4">شكراً لك، سيتم التواصل معك قريباً</p>
    <div className="bg-primary/10 rounded-xl p-4 w-full max-w-sm text-center mb-6">
      <p className="text-sm text-muted-foreground mb-1">رقم الطلب</p>
      <p className="text-3xl font-bold text-primary">#{orderNumber}</p>
    </div>
    <Button onClick={onBack} className="gradient-primary text-primary-foreground rounded-xl w-full max-w-sm h-12">
      العودة للمتجر
    </Button>
  </motion.div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id!);
  const { addItem } = useCart();
  const { data: governorates } = useGovernorates();
  const { data: relatedProducts } = useRelatedProducts(product?.category_id ?? null, id!);

  // Direct buy form state
  const [buyName, setBuyName] = useState('');
  const [buyPhone, setBuyPhone] = useState('');
  const [buyAddress, setBuyAddress] = useState('');
  const [buyGovId, setBuyGovId] = useState('');
  const [buyNotes, setBuyNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);

  // Variant selections (array for multi-piece picking)
  const [variants, setVariants] = useState<VariantSelection[]>([{ color: '', size: '', quantity: 1 }]);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20" dir="rtl">
        <Skeleton className="w-full aspect-square" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (!product) return <div className="min-h-screen flex items-center justify-center">المنتج غير موجود</div>;

  if (orderNumber) {
    return <OrderSuccess orderNumber={orderNumber} onBack={() => navigate('/')} />;
  }

  // ── Computed values ──
  const images = product.product_images?.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)) || [];
  const allImages = images.length > 0 ? images.map(i => i.image_url) : [product.image_url || '/placeholder.svg'];

  const displayPrice = product.is_offer && product.offer_price ? product.offer_price : (product.discount_price || product.price);
  const hasDiscount = displayPrice < product.price;
  const discountPercent = hasDiscount ? Math.round(((product.price - displayPrice) / product.price) * 100) : 0;

  // All unique colors from color_variants or color_options
  const colorVariants = product.product_color_variants || [];
  const colors: string[] = colorVariants.length > 0
    ? [...new Set(colorVariants.map(v => v.color))]
    : (product.color_options || []);

  const getSizesForColor = (color: string): string[] => {
    if (!color) return product.size_options || [];
    const variant = colorVariants.find(v => v.color === color);
    return variant?.sizes || product.size_options || [];
  };

  // Quantity pricing tiers
  const rawTiers = product.quantity_pricing;
  const tiers: QuantityPricingTier[] = Array.isArray(rawTiers) ? (rawTiers as unknown as QuantityPricingTier[]) : [];

  // Total quantity across all variant rows
  const totalQty = variants.reduce((s, v) => s + v.quantity, 0);

  // Effective price per piece based on total qty
  const effectiveUnitPrice = getEffectivePrice(displayPrice, tiers, totalQty);
  const totalProductPrice = effectiveUnitPrice * totalQty;

  // Selected gov shipping
  const selectedGov = governorates?.find(g => g.id === buyGovId);
  const shippingCost = selectedGov?.shipping_cost || 0;
  const grandTotal = totalProductPrice + shippingCost;

  // ── Variant helpers ──
  const handleVariantChange = (index: number, updated: VariantSelection) => {
    setVariants(prev => prev.map((v, i) => i === index ? updated : v));
  };
  const handleVariantRemove = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };
  const handleAddVariantRow = () => {
    const newTotal = totalQty + 1;
    if (newTotal > MAX_QTY) {
      toast.error(`الحد الأقصى ${MAX_QTY} قطعة. يرجى فتح طلب جديد برقم الطلب الذي ستحصل عليه`);
      return;
    }
    setVariants(prev => [...prev, { color: '', size: '', quantity: 1 }]);
  };

  // Validate: all rows must have color & size selected
  const allVariantsValid = variants.every(v => v.color && v.size);
  const hasColors = colors.length > 0;
  const hasSizes = getSizesForColor(variants[0]?.color || '').length > 0 || (product.size_options || []).length > 0;
  // If product has no colors/sizes, skip validation for those
  const isSelectionValid = (
    (!hasColors || variants.every(v => v.color)) &&
    (!hasSizes || variants.every(v => v.size))
  );

  // ── Add to Cart ──
  const handleAddToCart = () => {
    if (!isSelectionValid) {
      toast.error('يرجى اختيار اللون والمقاس أولاً');
      return;
    }
    variants.forEach(v => {
      addItem({
        productId: product.id,
        name: product.name,
        price: effectiveUnitPrice,
        originalPrice: hasDiscount ? product.price : undefined,
        image: allImages[0],
        color: v.color || undefined,
        size: v.size || undefined,
        quantity: v.quantity,
      });
    });
    toast.success(`تمت الإضافة للسلة ✓`);
    navigator.vibrate?.(50);
  };

  // ── Share ──
  const handleShare = async () => {
    const url = window.location.href;
    try { await navigator.share({ title: product.name, url }); }
    catch { await navigator.clipboard.writeText(url); toast.success('تم نسخ الرابط'); }
  };

  // ── Direct Buy (Submit Order) ──
  const handleDirectBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSelectionValid) {
      toast.error('يرجى اختيار اللون والمقاس لكل قطعة');
      return;
    }
    if (!buyName || !buyPhone || !buyAddress || !buyGovId) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setIsSubmitting(true);
    try {
      // 1. Create customer
      const { data: customer, error: custErr } = await supabase
        .from('customers')
        .insert({ name: buyName, phone: buyPhone, address: buyAddress, governorate: selectedGov?.name || '' })
        .select().single();
      if (custErr) throw custErr;

      // 2. Create order — total_amount = products only (shipping stored separately)
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          customer_id: customer.id,
          total_amount: totalProductPrice,   // products only — shipping in shipping_cost field
          shipping_cost: shippingCost,
          governorate_id: buyGovId,
          notes: buyNotes || null,
          status: 'pending',
        })
        .select().single();
      if (orderErr) throw orderErr;

      // 3. Create order items (one per variant row)
      const orderItems = variants.map(v => ({
        order_id: order.id,
        product_id: product.id,
        quantity: v.quantity,
        price: effectiveUnitPrice,
        color: v.color || null,
        size: v.size || null,
        product_details: `${product.name}${v.color ? ` - ${v.color}` : ''}${v.size ? ` - ${v.size}` : ''}`,
      }));
      const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
      if (itemsErr) throw itemsErr;

      setOrderNumber(order.order_number || 0);
      navigator.vibrate?.([100, 50, 100]);
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء إرسال الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-24" dir="rtl">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-30 glass safe-top">
        <div className="flex items-center justify-between px-4 h-12">
          <button onClick={() => navigate(-1)} className="p-2"><ArrowRight size={20} /></button>
          <button onClick={handleShare} className="p-2"><Share2 size={20} /></button>
        </div>
      </div>

      {/* Image Gallery — swipeable */}
      <div className="mt-12">
        <ImageGallery images={allImages} productName={product.name} />
      </div>

      {/* Product Info */}
      <div className="px-4 py-4 space-y-4">

        {/* Name + Rating */}
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-xl font-bold leading-tight flex-1">{product.name}</h1>
        {product.rating != null && product.rating > 0 && (
            <div className="flex items-center gap-1 shrink-0 bg-accent px-2 py-1 rounded-lg">
              <Star size={14} className="fill-primary text-primary" />
              <span className="text-sm font-semibold">{product.rating}</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-2xl font-bold text-primary">{effectiveUnitPrice} ج.م</span>
          {hasDiscount && (
            <>
              <span className="text-base text-muted-foreground line-through">{product.price} ج.م</span>
              <Badge className="bg-primary text-primary-foreground">خصم {discountPercent}%</Badge>
            </>
          )}
          {totalQty > 1 && (
            <span className="text-sm text-muted-foreground">× {totalQty} = <strong className="text-foreground">{totalProductPrice} ج.م</strong></span>
          )}
        </div>

        {/* Stock Warning */}
        {product.stock != null && product.stock > 0 && product.stock <= (product.low_stock_threshold || 5) && (
          <p className="text-sm text-destructive font-semibold">⚠️ باقي {product.stock} قطع فقط!</p>
        )}

        {/* Description */}
        {product.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
        )}

        {/* Quantity Pricing Tiers */}
        {tiers.length > 0 && (
          <div className="bg-primary/10 rounded-xl p-3 border border-primary/20">
            <h3 className="text-sm font-bold mb-2 text-primary">🎁 عروض الكمية</h3>
            <div className="space-y-1">
              {tiers.map((t, i) => {
                const nextTier = tiers[i + 1];
                const isActive = totalQty >= t.quantity && (!nextTier || totalQty < nextTier.quantity);
                return (
                  <div key={i} className={`flex justify-between text-sm rounded-lg px-2 py-1 transition-all ${isActive ? 'bg-primary text-primary-foreground font-bold' : ''}`}>
                    <span>{t.quantity}{nextTier ? ` – ${nextTier.quantity - 1}` : '+'} قطعة</span>
                    <span>{t.price} ج.م / قطعة</span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">الحد الأقصى {MAX_QTY} قطعة لكل طلب</p>
          </div>
        )}

        {/* ── Variant selections ── */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold">اختر اللون والمقاس والكمية</h3>
          {variants.map((sel, i) => (
            <VariantSelectorRow
              key={i}
              index={i}
              sel={sel}
              colors={colors}
              getSizesForColor={getSizesForColor}
              onChange={handleVariantChange}
              onRemove={handleVariantRemove}
            />
          ))}
          {totalQty < MAX_QTY && (
            <button
              onClick={handleAddVariantRow}
              className="w-full border border-dashed border-primary text-primary text-sm rounded-xl py-2 hover:bg-primary/5 transition-colors"
            >
              + إضافة مقاس/لون مختلف
            </button>
          )}
          {totalQty >= MAX_QTY && (
            <p className="text-xs text-center text-muted-foreground bg-muted rounded-lg p-2">
              وصلت للحد الأقصى ({MAX_QTY} قطعة). لطلب كميات أكبر يرجى فتح طلب جديد.
            </p>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────
            DIRECT BUY FORM (inline on product page)
        ───────────────────────────────────────────────────── */}
        <div className="bg-primary/10 rounded-2xl p-5 space-y-4 shadow-lg border-2 border-primary/30">
          <h3 className="font-bold text-xl text-primary">🛒 اطلب الآن</h3>
          <p className="text-sm text-muted-foreground">أكمل بياناتك لإتمام الطلب مباشرة بدون سلة</p>

          <form onSubmit={handleDirectBuy} className="space-y-3">
            <div>
              <label className="text-xs font-semibold mb-1 block">الاسم *</label>
              <Input value={buyName} onChange={e => setBuyName(e.target.value)} placeholder="الاسم بالكامل" className="rounded-xl h-11" required />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">رقم الهاتف *</label>
              <Input value={buyPhone} onChange={e => setBuyPhone(e.target.value)} placeholder="01xxxxxxxxx" className="rounded-xl h-11" type="tel" dir="ltr" required />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">المحافظة *</label>
              <select
                value={buyGovId}
                onChange={e => setBuyGovId(e.target.value)}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm"
                required
              >
                <option value="">اختر المحافظة</option>
                {governorates?.map(g => (
                  <option key={g.id} value={g.id}>{g.name} – شحن {g.shipping_cost} ج.م</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">العنوان بالتفصيل *</label>
              <Input value={buyAddress} onChange={e => setBuyAddress(e.target.value)} placeholder="المنطقة، الشارع، رقم العمارة" className="rounded-xl h-11" required />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">ملاحظات (اختياري)</label>
              <Input value={buyNotes} onChange={e => setBuyNotes(e.target.value)} placeholder="أي ملاحظات للمندوب" className="rounded-xl h-11" />
            </div>

            {/* Order Summary */}
            {buyGovId && (
              <div className="bg-muted rounded-xl p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span>المنتجات ({totalQty} قطعة)</span>
                  <span className="font-semibold">{totalProductPrice} ج.م</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>الشحن</span>
                  <span>{shippingCost} ج.م</span>
                </div>
                <div className="flex justify-between font-bold text-primary border-t border-border pt-1 mt-1">
                  <span>الإجمالي</span>
                  <span>{grandTotal} ج.م</span>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || !isSelectionValid}
              className="w-full h-12 gradient-primary text-primary-foreground font-bold text-base rounded-xl"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : `إتمام الطلب — ${grandTotal} ج.م`}
            </Button>
            {!isSelectionValid && (
              <p className="text-xs text-center text-destructive">يجب اختيار اللون والمقاس لكل قطعة أولاً</p>
            )}
          </form>
        </div>

        {/* ─────────────────────────────────────────────────────
            ADD TO CART — below direct buy
        ───────────────────────────────────────────────────── */}
        <Button
          onClick={handleAddToCart}
          variant="outline"
          className="w-full h-12 font-bold text-base gap-2 rounded-xl border-primary text-primary"
        >
          <ShoppingCart size={18} /> إضافة للسلة
        </Button>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-6">
            <h2 className="text-base font-bold mb-3">منتجات مشابهة</h2>
            <div className="grid grid-cols-2 gap-3">
              {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductPage;
