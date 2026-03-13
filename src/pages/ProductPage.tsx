import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useProduct, useRelatedProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { useGovernorates } from '@/hooks/useGovernorates';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Share2, ShoppingCart, Star, Minus, Plus, ChevronLeft, ChevronRight, CheckCircle2, Loader2, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/product/ProductCard';
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { trackEvent } from '@/lib/analytics';
import { fbTrack } from '@/lib/fbpixel';

// ─── Types ────────────────────────────────────────────────────────────────────
interface QuantityPricingTier { quantity: number; price: number; }
interface VariantSelection { color: string; size: string; quantity: number; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getEffectivePrice = (basePrice: number, tiers: QuantityPricingTier[], total: number): number => {
  if (!tiers || tiers.length === 0) return basePrice;
  const sorted = [...tiers].sort((a, b) => b.quantity - a.quantity);
  const matched = sorted.find(t => total >= t.quantity);
  return matched ? matched.price : basePrice;
};
const comboKey = (color: string, size: string) => `${color}||${size}`;
const MAX_QTY = 12;

// ─── Swipeable Image Gallery ──────────────────────────────────────────────────
const ImageGallery = ({ images, productName }: { images: string[]; productName: string }) => {
  const [current, setCurrent] = useState(0);
  const dragStartX = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const goNext = useCallback(() => setCurrent(c => (c + 1) % images.length), [images.length]);
  const goPrev = useCallback(() => setCurrent(c => (c - 1 + images.length) % images.length), [images.length]);
  const handleTouchStart = (e: React.TouchEvent) => { dragStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => { const d = dragStartX.current - e.changedTouches[0].clientX; if (Math.abs(d) > 50) d > 0 ? goNext() : goPrev(); };
  const handleMouseDown = (e: React.MouseEvent) => { dragStartX.current = e.clientX; };
  const handleMouseUp = (e: React.MouseEvent) => { const d = dragStartX.current - e.clientX; if (Math.abs(d) > 50) d > 0 ? goNext() : goPrev(); };

  return (
    <div ref={containerRef} className="relative w-full aspect-square overflow-hidden bg-muted select-none"
      onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} style={{ cursor: 'grab' }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.img key={current} src={images[current]} alt={`${productName} ${current + 1}`}
          className="w-full h-full object-contain pointer-events-none"
          initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }} transition={{ duration: 0.25 }} draggable={false} />
      </AnimatePresence>
      {images.length > 1 && (
        <>
          <button onClick={goPrev} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/70 flex items-center justify-center shadow"><ChevronRight size={16} /></button>
          <button onClick={goNext} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/70 flex items-center justify-center shadow"><ChevronLeft size={16} /></button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all ${i === current ? 'w-5 bg-primary' : 'w-2 bg-foreground/30'}`} />
            ))}
          </div>
          <span className="absolute top-3 left-3 bg-background/70 text-xs px-2 py-0.5 rounded-full">{current + 1} / {images.length}</span>
        </>
      )}
    </div>
  );
};

// ─── Order Success ────────────────────────────────────────────────────────────
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
    <Button onClick={onBack} className="gradient-primary text-primary-foreground rounded-xl w-full max-w-sm h-12">العودة للمتجر</Button>
  </motion.div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: product, isLoading } = useProduct(id!);
  const { addItem } = useCart();
  const { data: governorates } = useGovernorates();
  const { data: relatedProducts } = useRelatedProducts(product?.category_id ?? null, id!);

  const sharedData = useMemo(() => {
    const s = searchParams.get('share');
    if (!s) return null;
    try { return JSON.parse(decodeURIComponent(escape(atob(s)))) as VariantSelection[]; }
    catch { return null; }
  }, [searchParams]);
  const isLocked = !!sharedData;

  const [buyName, setBuyName] = useState('');
  const [buyPhone, setBuyPhone] = useState('');
  const [buyAddress, setBuyAddress] = useState('');
  const [buyGovId, setBuyGovId] = useState('');
  const [buyNotes, setBuyNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);

  // Combos: key = "color||size", value = quantity
  const [combos, setCombos] = useState<Record<string, number>>({});
  // For products without colors/sizes, just a simple quantity
  const [simpleQty, setSimpleQty] = useState(1);

  // Initialize from shared data
  useEffect(() => {
    if (sharedData && sharedData.length > 0) {
      const map: Record<string, number> = {};
      let simple = 0;
      sharedData.forEach(v => {
        if (!v.color && !v.size) { simple += v.quantity; }
        else { map[comboKey(v.color, v.size)] = (map[comboKey(v.color, v.size)] || 0) + v.quantity; }
      });
      setCombos(map);
      if (simple > 0) setSimpleQty(simple);
    }
  }, [sharedData]);

  useEffect(() => { if (id) trackEvent('page_visit', id); }, [id]);
  useEffect(() => {
    if (product) fbTrack('ViewContent', { content_name: product.name, content_ids: [product.id], content_type: 'product', value: product.price, currency: 'EGP' });
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20" dir="rtl">
        <Skeleton className="w-full aspect-square" />
        <div className="p-4 space-y-3"><Skeleton className="h-6 w-3/4" /><Skeleton className="h-8 w-1/3" /><Skeleton className="h-20 w-full" /></div>
      </div>
    );
  }

  if (!product) return <div className="min-h-screen flex items-center justify-center">المنتج غير موجود</div>;
  if (orderNumber) return <OrderSuccess orderNumber={orderNumber} onBack={() => navigate('/')} />;

  // ── Computed ──
  const imgList = product.product_images?.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)) || [];
  const allImages = imgList.length > 0 ? imgList.map(i => i.image_url) : [product.image_url || '/placeholder.svg'];
  const displayPrice = product.is_offer && product.offer_price ? product.offer_price : (product.discount_price || product.price);
  const hasDiscount = displayPrice < product.price;
  const discountPercent = hasDiscount ? Math.round(((product.price - displayPrice) / product.price) * 100) : 0;

  const colorVariants = product.product_color_variants || [];
  const colors: string[] = colorVariants.length > 0
    ? [...new Set(colorVariants.map(v => v.color))]
    : (product.color_options || []);

  const getSizesForColor = (color: string): string[] => {
    if (!color) return product.size_options || [];
    const variant = colorVariants.find(v => v.color === color);
    return variant?.sizes || product.size_options || [];
  };

  const hasColors = colors.length > 0;
  const globalSizes = product.size_options || [];
  const hasSizes = hasColors
    ? colors.some(c => getSizesForColor(c).length > 0)
    : globalSizes.length > 0;
  const needsVariants = hasColors || hasSizes;

  const rawTiers = product.quantity_pricing;
  const tiers: QuantityPricingTier[] = Array.isArray(rawTiers) ? (rawTiers as unknown as QuantityPricingTier[]) : [];

  // Build variants array from combos
  const variants: VariantSelection[] = needsVariants
    ? Object.entries(combos).filter(([, q]) => q > 0).map(([key, qty]) => {
        const [color, size] = key.split('||');
        return { color, size, quantity: qty };
      })
    : [{ color: '', size: '', quantity: simpleQty }];

  const totalQty = variants.reduce((s, v) => s + v.quantity, 0);
  const effectiveUnitPrice = getEffectivePrice(displayPrice, tiers, totalQty);
  const totalProductPrice = effectiveUnitPrice * totalQty;
  const selectedGov = governorates?.find(g => g.id === buyGovId);
  const shippingCost = selectedGov?.shipping_cost || 0;
  const grandTotal = totalProductPrice + shippingCost;

  const isSelectionValid = needsVariants
    ? totalQty > 0 && variants.every(v => (!hasColors || v.color) && (!hasSizes || v.size))
    : simpleQty > 0;

  // ── Toggle a color+size combo ──
  const toggleCombo = (color: string, size: string) => {
    if (isLocked) return;
    const key = comboKey(color, size);
    setCombos(prev => {
      if (prev[key]) {
        // Remove it
        const next = { ...prev };
        delete next[key];
        return next;
      }
      // Check max
      const currentTotal = Object.values(prev).reduce((s, q) => s + q, 0);
      if (currentTotal >= MAX_QTY) {
        toast.error(`الحد الأقصى ${MAX_QTY} قطعة لكل طلب`);
        return prev;
      }
      return { ...prev, [key]: 1 };
    });
  };

  const changeComboQty = (key: string, delta: number) => {
    if (isLocked) return;
    setCombos(prev => {
      const current = prev[key] || 0;
      const newQty = current + delta;
      if (newQty <= 0) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      const currentTotal = Object.values(prev).reduce((s, q) => s + q, 0);
      if (delta > 0 && currentTotal >= MAX_QTY) {
        toast.error(`الحد الأقصى ${MAX_QTY} قطعة لكل طلب`);
        return prev;
      }
      return { ...prev, [key]: newQty };
    });
  };

  const changeSimpleQty = (delta: number) => {
    if (isLocked) return;
    setSimpleQty(prev => {
      const n = prev + delta;
      if (n < 1) return 1;
      if (n > MAX_QTY) { toast.error(`الحد الأقصى ${MAX_QTY} قطعة`); return prev; }
      return n;
    });
  };

  // ── Actions ──
  const handleAddToCart = () => {
    if (!isSelectionValid) { toast.error('يرجى اختيار اللون والمقاس أولاً'); return; }
    variants.forEach(v => {
      addItem({
        productId: product.id, name: product.name, price: effectiveUnitPrice,
        originalPrice: hasDiscount ? product.price : undefined,
        image: allImages[0], color: v.color || undefined, size: v.size || undefined, quantity: v.quantity,
      });
    });
    toast.success('تمت الإضافة للسلة ✓');
    trackEvent('add_to_cart', product.id, { qty: totalQty });
    fbTrack('AddToCart', { content_name: product.name, content_ids: [product.id], value: totalProductPrice, currency: 'EGP', num_items: totalQty });
    navigator.vibrate?.(50);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try { await navigator.share({ title: product.name, url }); }
    catch { await navigator.clipboard.writeText(url); toast.success('تم نسخ الرابط'); }
  };

  const handleSharePieces = async () => {
    if (!isSelectionValid) { toast.error('يرجى اختيار اللون والمقاس أولاً'); return; }
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(variants))));
    const url = `${window.location.origin}/product/${id}?share=${encoded}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('تم نسخ رابط المشاركة بنجاح ✅');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
      toast.success('تم نسخ رابط المشاركة بنجاح ✅');
    }
  };

  const handleDirectBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSelectionValid) { toast.error('يرجى اختيار اللون والمقاس لكل قطعة'); return; }
    if (!buyName || !buyPhone || !buyAddress || !buyGovId) { toast.error('يرجى ملء جميع الحقول المطلوبة'); return; }
    setIsSubmitting(true);
    trackEvent('checkout_start', product.id, { qty: totalQty });
    fbTrack('InitiateCheckout', { content_ids: [product.id], value: grandTotal, currency: 'EGP', num_items: totalQty });
    try {
      const { data: customer, error: custErr } = await supabase
        .from('customers').insert({ name: buyName, phone: buyPhone, address: buyAddress, governorate: selectedGov?.name || '' }).select().single();
      if (custErr) throw custErr;
      const { data: order, error: orderErr } = await supabase
        .from('orders').insert({ customer_id: customer.id, total_amount: totalProductPrice, shipping_cost: shippingCost, governorate_id: buyGovId, notes: buyNotes || null, status: 'pending' }).select().single();
      if (orderErr) throw orderErr;
      const orderItems = variants.map(v => ({
        order_id: order.id, product_id: product.id, quantity: v.quantity, price: effectiveUnitPrice,
        color: v.color || null, size: v.size || null,
        product_details: `${product.name}${v.color ? ` - ${v.color}` : ''}${v.size ? ` - ${v.size}` : ''}`,
      }));
      const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
      if (itemsErr) throw itemsErr;
      trackEvent('order_complete', product.id, { qty: totalQty, order_id: order.id });
      fbTrack('Purchase', { content_ids: [product.id], value: grandTotal, currency: 'EGP', num_items: totalQty });
      setOrderNumber(order.order_number || 0);
      navigator.vibrate?.([100, 50, 100]);
    } catch (err) { console.error(err); toast.error('حدث خطأ أثناء إرسال الطلب'); }
    finally { setIsSubmitting(false); }
  };

  // ── Determine which colors have active combos ──
  const activeColors = new Set(Object.keys(combos).map(k => k.split('||')[0]).filter(Boolean));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-24" dir="rtl">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-30 glass safe-top">
        <div className="flex items-center justify-between px-4 h-12">
          <button onClick={() => navigate(-1)} className="p-2"><ArrowRight size={20} /></button>
          <button onClick={handleShare} className="p-2"><Share2 size={20} /></button>
        </div>
      </div>

      <div className="mt-12"><ImageGallery images={allImages} productName={product.name} /></div>

      {isLocked && (
        <div className="mx-4 mt-3 bg-primary/15 border-2 border-primary/40 rounded-xl p-3 flex items-center gap-2">
          <Link2 size={18} className="text-primary shrink-0" />
          <p className="text-sm font-semibold text-primary">تم تحديد القطع مسبقاً — أكمل بياناتك للطلب</p>
        </div>
      )}

      <div className="px-4 py-4 space-y-4">
        {/* Name & Rating */}
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

        {product.stock != null && product.stock > 0 && product.stock <= (product.low_stock_threshold || 5) && (
          <p className="text-sm text-destructive font-semibold">⚠️ باقي {product.stock} قطع فقط!</p>
        )}

        {product.description && <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>}

        {/* Quantity Tiers */}
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

        {/* ── Variant Selection ── */}
        <div className="bg-primary/10 rounded-2xl p-4 space-y-4 border-2 border-primary/30 shadow-lg">
          {needsVariants ? (
            <>
              <h3 className="font-bold text-lg text-primary">🎨 اختر اللون والمقاس</h3>
              <p className="text-xs text-muted-foreground -mt-2">اضغط على اللون ثم المقاس لإضافته، واستخدم +/- لتعديل الكمية</p>

              {/* Colors */}
              {hasColors && (
                <div>
                  <p className="text-xs font-bold text-foreground mb-2">الألوان</p>
                  <div className="flex flex-wrap gap-2">
                    {colors.map(c => {
                      const isActive = activeColors.has(c);
                      return (
                        <button key={c} disabled={isLocked}
                          className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${isActive ? 'border-primary bg-primary text-primary-foreground shadow-md scale-105' : 'border-primary/30 bg-background text-primary hover:bg-primary/10'} ${isLocked ? 'opacity-80 cursor-default' : ''}`}
                        >
                          {c}
                          {isActive && (
                            <span className="mr-1 text-xs opacity-80">
                              ({Object.entries(combos).filter(([k]) => k.startsWith(c + '||')).reduce((s, [, q]) => s + q, 0)})
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sizes per color (or global sizes if no colors) */}
              {hasColors ? (
                colors.map(color => {
                  const sizes = getSizesForColor(color);
                  if (sizes.length === 0) {
                    // Color without sizes — single toggle
                    const key = comboKey(color, '');
                    const qty = combos[key] || 0;
                    return (
                      <div key={color} className="bg-background rounded-xl p-3 border border-primary/15">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-foreground">{color}</span>
                          <div className="flex items-center gap-2">
                            {qty > 0 ? (
                              <div className="flex items-center gap-2 bg-primary/10 rounded-xl px-2 py-1 border border-primary/20">
                                {!isLocked && (
                                  <button onClick={() => changeComboQty(key, -1)} className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary active:scale-90 transition-transform">
                                    <Minus size={14} />
                                  </button>
                                )}
                                <span className="text-base font-bold text-primary w-6 text-center">{qty}</span>
                                {!isLocked && (
                                  <button onClick={() => changeComboQty(key, 1)} className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary active:scale-90 transition-transform">
                                    <Plus size={14} />
                                  </button>
                                )}
                              </div>
                            ) : !isLocked && (
                              <button onClick={() => toggleCombo(color, '')} className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                                + أضف
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={color} className="bg-background rounded-xl p-3 space-y-2 border border-primary/15">
                      <p className="text-sm font-bold text-foreground">{color}</p>
                      <div className="flex flex-wrap gap-2">
                        {sizes.map(size => {
                          const key = comboKey(color, size);
                          const qty = combos[key] || 0;
                          const isActive = qty > 0;
                          return (
                            <div key={size} className="flex flex-col items-center gap-1">
                              <button
                            onClick={() => !isLocked && toggleCombo(color, size)}
                                disabled={isLocked}
                                className={`px-4 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all min-w-[3rem] ${isActive ? 'border-primary bg-primary text-primary-foreground shadow-md' : 'border-primary/30 bg-primary/5 text-primary hover:bg-primary/10'} ${isLocked ? 'opacity-80 cursor-default' : ''}`}
                              >
                                {size}
                              </button>
                              {isActive && (
                                <div className="flex items-center gap-1 bg-primary/10 rounded-lg px-1 py-0.5 border border-primary/20">
                                  {!isLocked && (
                                    <button onClick={() => changeComboQty(key, -1)} className="w-6 h-6 rounded flex items-center justify-center text-primary active:scale-90 transition-transform">
                                      <Minus size={12} />
                                    </button>
                                  )}
                                  <span className="text-sm font-bold text-primary w-5 text-center">{qty}</span>
                                  {!isLocked && (
                                    <button onClick={() => changeComboQty(key, 1)} className="w-6 h-6 rounded flex items-center justify-center text-primary active:scale-90 transition-transform">
                                      <Plus size={12} />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : hasSizes && (
                <div className="bg-background rounded-xl p-3 space-y-2 border border-primary/15">
                  <p className="text-sm font-bold text-foreground">المقاس</p>
                  <div className="flex flex-wrap gap-2">
                    {globalSizes.map(size => {
                      const key = comboKey('', size);
                      const qty = combos[key] || 0;
                      const isActive = qty > 0;
                      return (
                        <div key={size} className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => !isLocked && toggleCombo('', size)}
                            disabled={isLocked}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all min-w-[3rem] ${isActive ? 'border-primary bg-primary text-primary-foreground shadow-md' : 'border-primary/30 bg-primary/5 text-primary hover:bg-primary/10'} ${isLocked ? 'opacity-80 cursor-default' : ''}`}
                          >
                            {size}
                          </button>
                          {isActive && (
                            <div className="flex items-center gap-1 bg-primary/10 rounded-lg px-1 py-0.5 border border-primary/20">
                              {!isLocked && (
                                <button onClick={() => changeComboQty(key, -1)} className="w-6 h-6 rounded flex items-center justify-center text-primary active:scale-90 transition-transform">
                                  <Minus size={12} />
                                </button>
                              )}
                              <span className="text-sm font-bold text-primary w-5 text-center">{qty}</span>
                              {!isLocked && (
                                <button onClick={() => changeComboQty(key, 1)} className="w-6 h-6 rounded flex items-center justify-center text-primary active:scale-90 transition-transform">
                                  <Plus size={12} />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Summary of selected */}
              {totalQty > 0 && (
                <div className="bg-background rounded-xl p-3 border border-primary/20">
                  <p className="text-xs font-bold text-primary mb-2">📦 الملخص ({totalQty} قطعة)</p>
                  <div className="space-y-1">
                    {variants.map((v, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span>{v.color}{v.color && v.size ? ' - ' : ''}{v.size}</span>
                        <span className="font-bold">×{v.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* No colors/sizes — just quantity */
            <>
              <h3 className="font-bold text-lg text-primary">📦 الكمية</h3>
              <div className="flex items-center gap-3 bg-background rounded-xl p-3 border border-primary/20">
                {!isLocked && (
                  <button onClick={() => changeSimpleQty(-1)} className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary active:scale-90 transition-transform">
                    <Minus size={16} />
                  </button>
                )}
                <span className="text-xl font-bold text-primary w-10 text-center">{simpleQty}</span>
                {!isLocked && (
                  <button onClick={() => changeSimpleQty(1)} className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary active:scale-90 transition-transform">
                    <Plus size={16} />
                  </button>
                )}
                <span className="text-sm text-muted-foreground mr-2">قطعة</span>
              </div>
            </>
          )}
        </div>

        {/* Share Pieces */}
        {!isLocked && totalQty > 0 && (
          <Button onClick={handleSharePieces} variant="outline"
            className="w-full h-11 font-bold text-sm gap-2 rounded-xl border-primary text-primary">
            <Link2 size={16} /> مشاركة القطع المحددة كرابط
          </Button>
        )}

        {/* Direct Buy Form */}
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
              <select value={buyGovId} onChange={e => setBuyGovId(e.target.value)}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm" required>
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
            {buyGovId && (
              <div className="bg-muted rounded-xl p-3 text-sm space-y-1">
                <div className="flex justify-between"><span>المنتجات ({totalQty} قطعة)</span><span className="font-semibold">{totalProductPrice} ج.م</span></div>
                <div className="flex justify-between text-muted-foreground"><span>الشحن</span><span>{shippingCost} ج.م</span></div>
                <div className="flex justify-between font-bold text-primary border-t border-border pt-1 mt-1"><span>الإجمالي</span><span>{grandTotal} ج.م</span></div>
              </div>
            )}
            <Button type="submit" disabled={isSubmitting || !isSelectionValid}
              className="w-full h-12 gradient-primary text-primary-foreground font-bold text-base rounded-xl">
              {isSubmitting ? <Loader2 className="animate-spin" /> : `إتمام الطلب — ${grandTotal} ج.م`}
            </Button>
            {!isSelectionValid && (
              <p className="text-xs text-center text-destructive">يجب اختيار اللون والمقاس أولاً</p>
            )}
          </form>
        </div>

        {/* Add to Cart */}
        {!isLocked && (
          <Button onClick={handleAddToCart} variant="outline"
            className="w-full h-12 font-bold text-base gap-2 rounded-xl border-primary text-primary">
            <ShoppingCart size={18} /> إضافة للسلة
          </Button>
        )}

        {/* Related */}
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
