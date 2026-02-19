import { useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(password);
    setLoading(false);
    if (success) {
      navigate('/admin/dashboard');
    } else {
      toast.error('كلمة المرور غير صحيحة');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex items-center justify-center px-6" dir="rtl">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock size={28} className="text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">لوحة التحكم</h1>
          <p className="text-muted-foreground text-sm mt-1">أدخل كلمة المرور للدخول</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            className="rounded-xl h-12 text-center text-lg"
            autoFocus
            required
          />
          <Button type="submit" disabled={loading} className="w-full h-12 gradient-primary text-primary-foreground font-bold rounded-xl">
            {loading ? <Loader2 className="animate-spin" /> : 'دخول'}
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

export default AdminLogin;
