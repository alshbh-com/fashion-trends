import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBanners } from '@/hooks/useBanners';
import { useAppSettings } from '@/hooks/useAppSettings';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { LogOut, Image, Palette, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { isAuthenticated, isLoading, logout } = useAdminAuth();
  const { data: banners, refetch: refetchBanners } = useBanners();
  const { data: settings, refetch: refetchSettings } = useAppSettings();
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerTitle, setBannerTitle] = useState('');
  const [themeHue, setThemeHue] = useState('340');
  const [saving, setSaving] = useState(false);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAuthenticated) return <Navigate to="/admin" replace />;

  const handleAddBanner = async () => {
    if (!bannerUrl || !bannerTitle) { toast.error('أدخل العنوان والرابط'); return; }
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
      .update({ active_theme: themeHue, updated_at: new Date().toISOString() })
      .eq('id', 'main');
    setSaving(false);
    if (error) { toast.error('حدث خطأ'); return; }
    toast.success('تم تحديث الثيم');
    refetchSettings();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-20" dir="rtl">
      <header className="sticky top-0 z-30 glass border-b border-border safe-top">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-lg font-bold">لوحة التحكم</h1>
          <button onClick={logout} className="p-2 text-destructive"><LogOut size={18} /></button>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
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
