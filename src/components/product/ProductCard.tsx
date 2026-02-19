import { Tables } from '@/integrations/supabase/types';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

type Product = Tables<'products'> & {
  product_images?: Tables<'product_images'>[];
};

const getDisplayPrice = (product: Product) => {
  if (product.is_offer && product.offer_price) return product.offer_price;
  if (product.discount_price) return product.discount_price;
  return product.price;
};

const hasDiscount = (product: Product) => {
  return (product.is_offer && product.offer_price && product.offer_price < product.price) ||
    (product.discount_price && product.discount_price < product.price);
};

const getDiscountPercent = (product: Product) => {
  const displayPrice = getDisplayPrice(product);
  return Math.round(((product.price - displayPrice) / product.price) * 100);
};

export const ProductCard = ({ product }: { product: Product }) => {
  const mainImage = product.product_images?.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))[0]?.image_url || product.image_url;
  const showDiscount = hasDiscount(product);
  const displayPrice = getDisplayPrice(product);

  return (
    <Link to={`/product/${product.id}`} className="block group">
      <div className="relative rounded-xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={mainImage || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {showDiscount && (
            <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2">
              خصم {getDiscountPercent(product)}%
            </Badge>
          )}
          {product.is_offer && (
            <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs px-2">
              عرض
            </Badge>
          )}
          {product.stock !== null && product.stock !== undefined && product.stock > 0 && product.stock <= (product.low_stock_threshold || 5) && (
            <span className="absolute bottom-2 left-2 text-[10px] bg-warning/90 text-foreground px-2 py-0.5 rounded-full font-semibold">
              باقي {product.stock} قطع
            </span>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold line-clamp-2 leading-tight mb-1">{product.name}</h3>
          {product.rating && product.rating > 0 && (
            <div className="flex items-center gap-1 mb-1">
              <Star size={12} className="fill-warning text-warning" />
              <span className="text-xs text-muted-foreground">{product.rating}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-primary">{displayPrice} ج.م</span>
            {showDiscount && (
              <span className="text-xs text-muted-foreground line-through">{product.price} ج.م</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
