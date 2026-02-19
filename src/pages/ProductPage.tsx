import { useParams } from 'react-router-dom';
import { useProduct, useRelatedProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Share2, ShoppingCart, Zap, Star, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/product/ProductCard';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id!);
  const { addItem } = useCart();
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);

  const { data: relatedProducts } = useRelatedProducts(product?.category_id ?? null, id!);

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

  const images = product.product_images?.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)) || [];
  const allImages = images.length > 0 ? images.map(i => i.image_url) : [product.image_url || '/placeholder.svg'];

  const displayPrice = product.is_offer && product.offer_price ? product.offer_price : (product.discount_price || product.price);
  const hasDiscount = displayPrice < product.price;
  const discountPercent = hasDiscount ? Math.round(((product.price - displayPrice) / product.price) * 100) : 0;

  const colors = product.product_color_variants?.map(v => v.color) || product.color_options || [];
  const sizes = product.product_color_variants?.find(v => v.color === selectedColor)?.sizes || product.size_options || [];

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.share({ title: product.name, url });
    } catch {
      await navigator.clipboard.writeText(url);
      toast.success('تم نسخ الرابط');
    }
  };

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: displayPrice,
      originalPrice: hasDiscount ? product.price : undefined,
      image: allImages[0],
      color: selectedColor || undefined,
      size: selectedSize || undefined,
      quantity,
    });
    toast.success('تمت الإضافة للسلة');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  // Quantity pricing
  const quantityPricing = product.quantity_pricing as Array<{ min: number; max: number; price: number }> | null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-24" dir="rtl">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-30 glass safe-top">
        <div className="flex items-center justify-between px-4 h-12">
          <button onClick={() => navigate(-1)} className="p-2">
            <ArrowRight size={20} />
          </button>
          <button onClick={handleShare} className="p-2">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative w-full aspect-square mt-12 overflow-hidden bg-muted">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImage}
            src={allImages[currentImage]}
            alt={product.name}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ touchAction: 'pinch-zoom' }}
          />
        </AnimatePresence>
        {allImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {allImages.map((_, i) => (
              <button key={i} onClick={() => setCurrentImage(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === currentImage ? 'bg-primary w-5' : 'bg-foreground/30'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="px-4 py-4 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-xl font-bold leading-tight flex-1">{product.name}</h1>
          {product.rating && product.rating > 0 && (
            <div className="flex items-center gap-1 shrink-0 bg-warning/10 px-2 py-1 rounded-lg">
              <Star size={14} className="fill-warning text-warning" />
              <span className="text-sm font-semibold">{product.rating}</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-primary">{displayPrice} ج.م</span>
          {hasDiscount && (
            <>
              <span className="text-base text-muted-foreground line-through">{product.price} ج.م</span>
              <Badge className="bg-primary text-primary-foreground">خصم {discountPercent}%</Badge>
            </>
          )}
        </div>

        {/* Stock Warning */}
        {product.stock !== null && product.stock > 0 && product.stock <= (product.low_stock_threshold || 5) && (
          <p className="text-sm text-warning font-semibold">⚠️ باقي {product.stock} قطع فقط!</p>
        )}

        {/* Description */}
        {product.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
        )}

        {/* Colors */}
        {colors.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">اللون</h3>
            <div className="flex flex-wrap gap-2">
              {colors.map(color => (
                <button key={color} onClick={() => { setSelectedColor(color); setSelectedSize(''); }}
                  className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                    selectedColor === color ? 'border-primary bg-primary-light text-primary font-semibold' : 'border-border'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sizes */}
        {sizes && sizes.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">المقاس</h3>
            <div className="flex flex-wrap gap-2">
              {sizes.map(size => (
                <button key={size} onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                    selectedSize === size ? 'border-primary bg-primary-light text-primary font-semibold' : 'border-border'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity Pricing */}
        {quantityPricing && quantityPricing.length > 0 && (
          <div className="bg-primary-light rounded-xl p-3">
            <h3 className="text-sm font-semibold mb-2">عروض الكمية</h3>
            <div className="space-y-1">
              {quantityPricing.map((qp, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{qp.min} - {qp.max} قطع</span>
                  <span className="font-bold text-primary">{qp.price} ج.م / قطعة</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-semibold">الكمية</h3>
          <div className="flex items-center gap-3 bg-muted rounded-lg p-1">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1.5 rounded-md hover:bg-background"><Minus size={16} /></button>
            <span className="w-8 text-center font-semibold">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} className="p-1.5 rounded-md hover:bg-background"><Plus size={16} /></button>
          </div>
        </div>
      </div>

      {/* Buy Buttons - Fixed Bottom */}
      <div className="fixed bottom-16 left-0 right-0 z-30 glass border-t border-border px-4 py-3 space-y-2 safe-bottom">
        <Button onClick={handleBuyNow} className="w-full h-12 gradient-primary text-primary-foreground font-bold text-base gap-2 rounded-xl">
          <Zap size={18} /> شراء مباشر
        </Button>
        <Button onClick={handleAddToCart} variant="outline" className="w-full h-11 font-semibold text-sm gap-2 rounded-xl border-primary text-primary">
          <ShoppingCart size={16} /> إضافة للسلة
        </Button>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="px-4 mt-6">
          <h2 className="text-base font-bold mb-3">منتجات مشابهة</h2>
          <div className="grid grid-cols-2 gap-3">
            {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ProductPage;
