import { motion } from 'framer-motion';
import { Shield, Truck, RefreshCw, Phone, MessageCircle } from 'lucide-react';

const PoliciesPage = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-20" dir="rtl">
      <header className="sticky top-0 z-30 glass border-b border-border safe-top">
        <div className="px-4 h-14 flex items-center">
          <h1 className="text-lg font-bold">السياسات</h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-4">
        <div className="bg-card border border-border rounded-xl p-4 flex gap-3">
          <RefreshCw size={24} className="text-primary shrink-0 mt-1" />
          <div>
            <h3 className="font-bold mb-1">سياسة الاستبدال</h3>
            <p className="text-sm text-muted-foreground">يمكنك استبدال المنتج خلال 7 أيام من تاريخ الاستلام بشرط أن يكون المنتج بحالته الأصلية.</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex gap-3">
          <Shield size={24} className="text-primary shrink-0 mt-1" />
          <div>
            <h3 className="font-bold mb-1">سياسة الاسترجاع</h3>
            <p className="text-sm text-muted-foreground">لا يوجد استرجاع نهائياً. يمكنك الاستبدال فقط.</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex gap-3">
          <Truck size={24} className="text-primary shrink-0 mt-1" />
          <div>
            <h3 className="font-bold mb-1">مدة التوصيل</h3>
            <p className="text-sm text-muted-foreground">يتم التوصيل خلال 2 إلى 3 أيام عمل من تاريخ تأكيد الطلب.</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h3 className="font-bold">تواصل معنا</h3>
          <a href="tel:01013701405" className="flex items-center gap-3 text-sm text-primary font-semibold">
            <Phone size={18} /> 01013701405
          </a>
          <a href="https://wa.me/201013701405" className="flex items-center gap-3 text-sm text-success font-semibold">
            <MessageCircle size={18} /> واتساب
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default PoliciesPage;
