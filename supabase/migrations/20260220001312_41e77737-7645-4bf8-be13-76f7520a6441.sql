
-- Insert admin password record
INSERT INTO public.system_passwords (id, password, description)
VALUES ('admin_password', 'omarmahmoudamar', 'كلمة مرور لوحة تحكم التطبيق')
ON CONFLICT (id) DO UPDATE SET password = 'omarmahmoudamar', updated_at = now();
