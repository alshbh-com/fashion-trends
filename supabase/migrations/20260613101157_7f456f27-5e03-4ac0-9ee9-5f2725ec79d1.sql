GRANT SELECT ON public.products_rows TO anon;
GRANT SELECT ON public.products_rows TO authenticated;
GRANT ALL ON public.products_rows TO service_role;
ALTER TABLE public.products_rows ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'products_rows' AND policyname = 'Public can view products rows'
  ) THEN
    CREATE POLICY "Public can view products rows"
    ON public.products_rows
    FOR SELECT
    TO anon, authenticated
    USING (true);
  END IF;
END $$;

GRANT SELECT ON public.product_images_rows TO anon;
GRANT SELECT ON public.product_images_rows TO authenticated;
GRANT ALL ON public.product_images_rows TO service_role;
ALTER TABLE public.product_images_rows ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'product_images_rows' AND policyname = 'Public can view product images rows'
  ) THEN
    CREATE POLICY "Public can view product images rows"
    ON public.product_images_rows
    FOR SELECT
    TO anon, authenticated
    USING (true);
  END IF;
END $$;

GRANT SELECT ON public.banners_rows TO anon;
GRANT SELECT ON public.banners_rows TO authenticated;
GRANT ALL ON public.banners_rows TO service_role;
ALTER TABLE public.banners_rows ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'banners_rows' AND policyname = 'Public can view banners rows'
  ) THEN
    CREATE POLICY "Public can view banners rows"
    ON public.banners_rows
    FOR SELECT
    TO anon, authenticated
    USING (true);
  END IF;
END $$;

GRANT SELECT ON public.app_settings_rows TO anon;
GRANT SELECT ON public.app_settings_rows TO authenticated;
GRANT ALL ON public.app_settings_rows TO service_role;
ALTER TABLE public.app_settings_rows ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'app_settings_rows' AND policyname = 'Public can view app settings rows'
  ) THEN
    CREATE POLICY "Public can view app settings rows"
    ON public.app_settings_rows
    FOR SELECT
    TO anon, authenticated
    USING (true);
  END IF;
END $$;

GRANT SELECT ON public.governorates_rows TO anon;
GRANT SELECT ON public.governorates_rows TO authenticated;
GRANT ALL ON public.governorates_rows TO service_role;
ALTER TABLE public.governorates_rows ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'governorates_rows' AND policyname = 'Public can view governorates rows'
  ) THEN
    CREATE POLICY "Public can view governorates rows"
    ON public.governorates_rows
    FOR SELECT
    TO anon, authenticated
    USING (true);
  END IF;
END $$;