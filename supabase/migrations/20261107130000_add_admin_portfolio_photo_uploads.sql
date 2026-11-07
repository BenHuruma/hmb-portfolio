-- Public portfolio photos are separate from the private legacy CV bucket.
-- Anyone may display the portfolio images; only the designated admin may write.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-photos',
  'portfolio-photos',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "public_read_portfolio_photos" ON storage.objects;
CREATE POLICY "public_read_portfolio_photos"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'portfolio-photos');

DROP POLICY IF EXISTS "portfolio_admin_upload_photos" ON storage.objects;
CREATE POLICY "portfolio_admin_upload_photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'portfolio-photos'
    AND (SELECT public.is_portfolio_admin())
  );

DROP POLICY IF EXISTS "portfolio_admin_update_photos" ON storage.objects;
CREATE POLICY "portfolio_admin_update_photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'portfolio-photos'
    AND (SELECT public.is_portfolio_admin())
  )
  WITH CHECK (
    bucket_id = 'portfolio-photos'
    AND (SELECT public.is_portfolio_admin())
  );
