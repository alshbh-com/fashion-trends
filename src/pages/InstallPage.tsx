import { motion } from 'framer-motion';
import { Download, Smartphone, Share, PlusSquare } from 'lucide-react';

const InstallPage = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-20 px-4 py-10" dir="rtl">
      <div className="text-center mb-8">
        <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Download size={28} className="text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">تثبيت التطبيق</h1>
        <p className="text-muted-foreground text-sm">أضف التطبيق لشاشتك الرئيسية للوصول السريع</p>
      </div>

      <div className="space-y-4 max-w-sm mx-auto">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <Smartphone size={20} className="text-primary" />
            <h3 className="font-bold">iPhone / Safari</h3>
          </div>
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>اضغط على أيقونة المشاركة <Share size={14} className="inline" /></li>
            <li>اختر "إضافة إلى الشاشة الرئيسية" <PlusSquare size={14} className="inline" /></li>
            <li>اضغط "إضافة"</li>
          </ol>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <Smartphone size={20} className="text-primary" />
            <h3 className="font-bold">Android / Chrome</h3>
          </div>
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>اضغط على القائمة ⋮ في الأعلى</li>
            <li>اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"</li>
            <li>اضغط "تثبيت"</li>
          </ol>
        </div>
      </div>
    </motion.div>
  );
};

export default InstallPage;
