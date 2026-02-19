import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Search, Package, Truck, CheckCircle2, Clock, XCircle, RotateCcw } from 'lucide-react';

const statusMap: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: 'قيد المراجعة', icon: <Clock size={24} />, color: 'text-warning' },
  processing: { label: 'جاري التحضير', icon: <Package size={24} />, color: 'text-primary' },
  shipped: { label: 'تم الشحن', icon: <Truck size={24} />, color: 'text-primary' },
  delivered: { label: 'تم التوصيل', icon: <CheckCircle2 size={24} />, color: 'text-success' },
  cancelled: { label: 'ملغي', icon: <XCircle size={24} />, color: 'text-destructive' },
  returned: { label: 'مرتجع', icon: <RotateCcw size={24} />, color: 'text-muted-foreground' },
  delivered_with_modification: { label: 'تم التوصيل (معدّل)', icon: <CheckCircle2 size={24} />, color: 'text-success' },
  return_no_shipping: { label: 'مرتجع بدون شحن', icon: <RotateCcw size={24} />, color: 'text-muted-foreground' },
};

const TrackOrderPage = () => {
  const [orderNum, setOrderNum] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNum.trim()) return;
    setLoading(true);
    setNotFound(false);
    setOrder(null);

    const num = parseInt(orderNum.replace('#', ''));
    const { data, error } = await supabase
      .from('orders')
      .select('*, customers(*), governorates(*)')
      .eq('order_number', num)
      .single();

    if (error || !data) setNotFound(true);
    else setOrder(data);
    setLoading(false);
  };

  const status = order ? statusMap[order.status || 'pending'] : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-20" dir="rtl">
      <header className="sticky top-0 z-30 glass border-b border-border safe-top">
        <div className="px-4 h-14 flex items-center">
          <h1 className="text-lg font-bold">تتبع الطلب</h1>
        </div>
      </header>

      <div className="px-4 py-6">
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <Input
            value={orderNum}
            onChange={e => setOrderNum(e.target.value)}
            placeholder="أدخل رقم الطلب"
            className="rounded-xl flex-1"
            type="number"
            dir="ltr"
          />
          <Button type="submit" className="gradient-primary text-primary-foreground rounded-xl px-6" disabled={loading}>
            <Search size={18} />
          </Button>
        </form>

        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {notFound && (
          <div className="text-center py-10">
            <p className="text-muted-foreground">لم يتم العثور على طلب بهذا الرقم</p>
          </div>
        )}

        {order && status && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <div className={`${status.color} mb-3 flex justify-center`}>{status.icon}</div>
              <p className="text-sm text-muted-foreground">حالة الطلب</p>
              <p className={`text-xl font-bold ${status.color}`}>{status.label}</p>
              <p className="text-sm text-muted-foreground mt-2">رقم الطلب: #{order.order_number}</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 space-y-2">
              <h3 className="font-semibold text-sm mb-2">تفاصيل</h3>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">الإجمالي</span>
                <span className="font-semibold">{order.total_amount} ج.م</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">الشحن</span>
                <span className="font-semibold">{order.shipping_cost} ج.م</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">التاريخ</span>
                <span className="font-semibold">{new Date(order.created_at).toLocaleDateString('ar-EG')}</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default TrackOrderPage;
