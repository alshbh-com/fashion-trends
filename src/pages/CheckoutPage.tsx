import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useGovernorates } from '@/hooks/useGovernorates';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { data: governorates } = useGovernorates();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [govId, setGovId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);

  const selectedGov = governorates?.find(g => g.id === govId);
  const shippingCost = selectedGov?.shipping_cost || 0;
  const grandTotal = totalPrice + shippingCost;

  if (orderNumber) {
    return (
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="min-h-screen flex flex-col items-center justify-center px-6 pb-20" dir="rtl">
        <div className="gradient-primary w-20 h-20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">تم تأكيد الطلب! 🎉</h1>
        <p className="text-muted-foreground text-center mb-4">شكراً لك، سيتم التواصل معك قريباً</p>
        <div className="bg-primary-light rounded-xl p-4 w-full max-w-sm text-center mb-6">
          <p className="text-sm text-muted-foreground mb-1">رقم الطلب</p>
          <p className="text-3xl font-bold text-primary">#{orderNumber}</p>
        </div>
        <Button asChild className="gradient-primary text-primary-foreground rounded-xl w-full max-w-sm h-12">
          <a href="/">العودة للرئيسية</a>
        </Button>
      </motion.div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20" dir="rtl">
        <p className="text-muted-foreground">السلة فارغة</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address || !govId) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setIsSubmitting(true);
    try {
      // Create customer
      const { data: customer, error: custError } = await supabase
        .from('customers')
        .insert({ name, phone, address, governorate: selectedGov?.name || '' })
        .select()
        .single();
      if (custError) throw custError;

      // Create order
      // total_amount = products only (shipping stored separately to avoid double-counting)
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: customer.id,
          total_amount: totalPrice,   // products only — shipping is in shipping_cost field
          shipping_cost: shippingCost,
          governorate_id: govId,
          notes,
          status: 'pending',
        })
        .select()
        .single();
      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price,
        color: item.color || null,
        size: item.size || null,
        product_details: item.name,
      }));
      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      setOrderNumber(order.order_number || 0);
      clearCart();
      navigator.vibrate?.([100, 50, 100]);
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء إرسال الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-20" dir="rtl">
      <header className="sticky top-0 z-30 glass border-b border-border safe-top">
        <div className="px-4 h-14 flex items-center">
          <h1 className="text-lg font-bold">إتمام الطلب</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
        {/* Order Summary */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
          <h3 className="font-semibold text-sm mb-2">ملخص الطلب</h3>
          {items.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.name} × {item.quantity}</span>
              <span className="font-semibold">{item.price * item.quantity} ج.م</span>
            </div>
          ))}
          <div className="border-t border-border pt-2 mt-2 flex justify-between text-sm">
            <span>المنتجات</span>
            <span className="font-semibold">{totalPrice} ج.م</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>الشحن</span>
            <span className="font-semibold">{shippingCost} ج.م</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between">
            <span className="font-bold">الإجمالي</span>
            <span className="font-bold text-primary text-lg">{grandTotal} ج.م</span>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold mb-1 block">الاسم *</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="الاسم بالكامل" className="rounded-xl" required />
          </div>
          <div>
            <label className="text-sm font-semibold mb-1 block">رقم الهاتف *</label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="01xxxxxxxxx" className="rounded-xl" type="tel" required dir="ltr" />
          </div>
          <div>
            <label className="text-sm font-semibold mb-1 block">المحافظة *</label>
            <select value={govId} onChange={e => setGovId(e.target.value)} className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm" required>
              <option value="">اختر المحافظة</option>
              {governorates?.map(g => (
                <option key={g.id} value={g.id}>{g.name} - شحن {g.shipping_cost} ج.م</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold mb-1 block">العنوان بالتفصيل *</label>
            <Textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="المنطقة، الشارع، رقم العمارة" className="rounded-xl" required />
          </div>
          <div>
            <label className="text-sm font-semibold mb-1 block">ملاحظات</label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="ملاحظات إضافية (اختياري)" className="rounded-xl" />
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full h-12 gradient-primary text-primary-foreground font-bold text-base rounded-xl">
          {isSubmitting ? <Loader2 className="animate-spin" /> : 'تأكيد الطلب'}
        </Button>
      </form>
    </motion.div>
  );
};

export default CheckoutPage;
