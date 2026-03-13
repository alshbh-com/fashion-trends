import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBanners } from '@/hooks/useBanners';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useAnalytics7Days } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useRef } from 'react';
import { LogOut, Image, Palette, Loader2, Sun, Moon, BarChart3, Eye, ShoppingCart, CreditCard, Package, Upload } from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { isAuthenticated, isLoading, logout } = useAdminAuth();
  const { data: banners, refetch: refetchBanners } = useBanners();
  const { data: settings, refetch: refetchSettings } = useAppSettings();
  const { data: analytics } = useAnalytics7Days();
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerTitle, setBannerTitle] = useState('');
  const [themeHue, setThemeHue] = useState('340');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings) {
      setThemeHue(settings.active_theme || '340');
      setThemeMode((settings as any).theme_mode === 'dark' ? 'dark' : 'light');
    }
  }, [settings]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAuthenticated) return <Navigate to="/admin" replace />;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `banner-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('banners').upload(fileName, file);
    if (error) { toast.error('فشل رفع الصورة'); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('banners').getPublicUrl(fileName);
    setBannerUrl(urlData.publicUrl);
    toast.success('تم رفع الصورة');
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddBanner = async () => {
    if (!bannerUrl || !bannerTitle) { toast.error('أدخل العنوان والصورة'); return; }
    setSaving(true);
    const { error } = await supabase.from('banners').insert({ image_url: bannerUrl, title: bannerTitle, is_active: true });
    setSaving(false);
    if (error) { toast.error('حدث خطأ'); return; }
    toast.success('تم إضافة البانر');
    setBannerUrl(''); setBannerTitle('');
    refetchBanners();
  };

  const handleDeleteBanner = async (id: string) => {
    await supabase.from('banners').delete().eq('id', id);
    toast.success('تم حذف البانر');
    refetchBanners();
  };

  const handleUpdateTheme = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('app_settings')
      .update({ active_theme: themeHue, theme_mode: themeMode, updated_at: new Date().toISOString() } as any)
      .eq('id', 'main');
    setSaving(false);
    if (error) { toast.error('حدث خطأ'); return; }
    toast.success('تم تحديث الثيم');
    refetchSettings();
  };

  const statsCards = [
    { label: 'الزائرين', value: analytics?.visitors || 0, icon: Eye, color: 'bg-blue-500/15 text-blue-600' },
    { label: 'إضافة للسلة', value: analytics?.addToCart || 0, icon: ShoppingCart, color: 'bg-orange-500/15 text-orange-600' },
    { label: 'بدء الشراء', value: analytics?.checkoutStarts || 0, icon: CreditCard, color: 'bg-purple-500/15 text-purple-600' },
    { label: 'طلبات مكتملة', value: analytics?.ordersComplete || 0, icon: Package, color: 'bg-green-500/15 text-green-600' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-20" dir="rtl">
      <header className="sticky top-0 z-30 glass border-b border-border safe-top">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-lg font-bold">لوحة التحكم</h1>
          <button onClick={logout} className="p-2 text-destructive"><LogOut size={18} /></button>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">

        {/* ── Analytics 7 Days ── */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={20} className="text-primary" />
            <h2 className="font-bold">إحصائيات آخر 7 أيام</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {statsCards.map((s, i) => (
              <div key={i} className={`rounded-xl p-4 flex flex-col items-center gap-2 ${s.color}`}>
                <s.icon size={24} />
                <span className="text-2xl font-bold">{s.value}</span>
                <span className="text-xs font-semibold">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Banner Management */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Image size={20} className="text-primary" />
            <h2 className="font-bold">إدارة البانر</h2>
          </div>
          <Input value={bannerTitle} onChange={e => setBannerTitle(e.target.value)} placeholder="عنوان البانر" className="rounded-xl" />
          <Input value={bannerUrl} onChange={e => setBannerUrl(e.target.value)} placeholder="رابط صورة البانر" className="rounded-xl" dir="ltr" />
          <Button onClick={handleAddBanner} disabled={saving} className="w-full gradient-primary text-primary-foreground rounded-xl">
            {saving ? <Loader2 className="animate-spin" /> : 'إضافة بانر'}
          </Button>
          {banners?.map(banner => (
            <div key={banner.id} className="flex items-center gap-3 bg-muted rounded-lg p-2">
              <img src={banner.image_url} alt={banner.title} className="w-16 h-10 rounded object-cover" />
              <span className="flex-1 text-sm truncate">{banner.title}</span>
              <button onClick={() => handleDeleteBanner(banner.id)} className="text-destructive text-xs">حذف</button>
            </div>
          ))}
        </div>

        {/* Theme Management */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Palette size={20} className="text-primary" />
            <h2 className="font-bold">ألوان الثيم</h2>
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-2">وضع الألوان</label>
            <div className="flex gap-2">
              <button onClick={() => setThemeMode('light')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${themeMode === 'light' ? 'border-primary bg-primary/10 font-bold' : 'border-border'}`}>
                <Sun size={18} /> فاتح
              </button>
              <button onClick={() => setThemeMode('dark')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${themeMode === 'dark' ? 'border-primary bg-primary/10 font-bold' : 'border-border'}`}>
                <Moon size={18} /> داكن
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Hue (0-360)</label>
            <Input type="range" min="0" max="360" value={themeHue} onChange={e => setThemeHue(e.target.value)} />
            <div className="flex items-center gap-3 mt-2">
              <div className="w-10 h-10 rounded-lg" style={{ background: `hsl(${themeHue}, 82%, 52%)` }} />
              <span className="text-sm font-semibold">Hue: {themeHue}</span>
            </div>
          </div>
          <Button onClick={handleUpdateTheme} disabled={saving} className="w-full gradient-primary text-primary-foreground rounded-xl">
            تحديث الثيم
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
