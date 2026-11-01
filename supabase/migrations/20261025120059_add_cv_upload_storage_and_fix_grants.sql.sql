/*
# Add CV upload from local storage + fix over-permissive grants

1. Schema changes
- Add `cv_file_url` (text) to `site_settings` — stores the public URL of an
  uploaded CV file in Supabase Storage.
- Add `cv_source` (text, default 'drive') to `site_settings` — controls which
  CV source is active: 'drive' (Google Drive link) or 'upload' (file uploaded
  to Supabase Storage). Default 'drive' keeps existing behavior.

2. Storage
- Create a public storage bucket `portfolio-assets` for CV file uploads.
- Storage policies:
  - Public READ: anyone (anon, authenticated) can read/download files — the
    CV must be downloadable by all visitors.
  - Authenticated WRITE: only signed-in users (the admin) can upload or
    overwrite files in the bucket. Unauthenticated visitors cannot upload.

3. Security fixes (site_settings table)
- Previous grants gave anon and authenticated INSERT + DELETE + UPDATE on
  all columns even though no INSERT or DELETE policies existed. While RLS
  blocked those actions (no policy = denied), the grants violated least
  privilege and would become a real hole if an INSERT/DELETE policy were
  ever added.
- Revoke INSERT, DELETE from anon and authenticated (singleton row, never
  inserted or deleted via the Data API).
- Revoke UPDATE from anon (the UPDATE policy targets authenticated only).
- Keep: anon SELECT, authenticated SELECT + UPDATE.

4. Notes
- The UPDATE policy `admin_update_settings` allows any authenticated user to
  update settings (USING true / WITH CHECK true). This is intentional for a
  single-admin portfolio: anyone who creates an account is the admin. No
  change needed here.
- The `cv_source` column is added with a safe default so existing reads keep
  working without a redeploy of the seed data.
*/

-- Add CV source columns to site_settings
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS cv_file_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cv_source text NOT NULL DEFAULT 'drive'
    CHECK (cv_source IN ('drive', 'upload'));

-- Fix over-permissive grants: revoke INSERT, DELETE from both roles,
-- and revoke UPDATE from anon (only authenticated may update).
REVOKE INSERT, DELETE, UPDATE ON site_settings FROM anon;
REVOKE INSERT, DELETE ON site_settings FROM authenticated;
-- Re-grant the minimum needed:
GRANT SELECT ON site_settings TO anon, authenticated;
GRANT UPDATE ON site_settings TO authenticated;

-- Create a public storage bucket for CV file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-assets', 'portfolio-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read, authenticated write
DROP POLICY IF EXISTS "public_read_portfolio_assets" ON storage.objects;
CREATE POLICY "public_read_portfolio_assets"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'portfolio-assets');

DROP POLICY IF EXISTS "admin_upload_portfolio_assets" ON storage.objects;
CREATE POLICY "admin_upload_portfolio_assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'portfolio-assets');

DROP POLICY IF EXISTS "admin_update_portfolio_assets" ON storage.objects;
CREATE POLICY "admin_update_portfolio_assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'portfolio-assets')
  WITH CHECK (bucket_id = 'portfolio-assets');

DROP POLICY IF EXISTS "admin_delete_portfolio_assets" ON storage.objects;
CREATE POLICY "admin_delete_portfolio_assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'portfolio-assets');
