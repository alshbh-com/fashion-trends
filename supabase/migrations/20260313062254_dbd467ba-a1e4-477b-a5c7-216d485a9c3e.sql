
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read banners" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'banners');

CREATE POLICY "Allow public insert banners" ON storage.objects
FOR INSERT TO public WITH CHECK (bucket_id = 'banners');

CREATE POLICY "Allow public delete banners" ON storage.objects
FOR DELETE TO public USING (bucket_id = 'banners');
