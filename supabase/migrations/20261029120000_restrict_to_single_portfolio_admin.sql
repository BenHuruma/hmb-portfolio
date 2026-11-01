-- Store exactly one trusted administrator. The table has no client privileges;
-- only a database administrator can provision or replace the account.
CREATE TABLE IF NOT EXISTS public.portfolio_admin (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.portfolio_admin ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.portfolio_admin FROM anon, authenticated;

-- Safe client-side authorization check; it exposes only a boolean, never the
-- administrator UUID. SECURITY DEFINER is constrained to an empty search_path.
CREATE OR REPLACE FUNCTION public.is_portfolio_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.portfolio_admin
    WHERE id = 1 AND user_id = (SELECT auth.uid())
  );
$$;

REVOKE ALL ON FUNCTION public.is_portfolio_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_portfolio_admin() TO authenticated;

DROP POLICY IF EXISTS "admin_update_settings" ON public.site_settings;
CREATE POLICY "admin_update_settings"
  ON public.site_settings
  FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_portfolio_admin()))
  WITH CHECK ((SELECT public.is_portfolio_admin()));

DROP POLICY IF EXISTS "admin_upload_portfolio_assets" ON storage.objects;
CREATE POLICY "admin_upload_portfolio_assets"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'portfolio-assets'
    AND (SELECT public.is_portfolio_admin())
  );

DROP POLICY IF EXISTS "admin_update_portfolio_assets" ON storage.objects;
CREATE POLICY "admin_update_portfolio_assets"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'portfolio-assets'
    AND (SELECT public.is_portfolio_admin())
  )
  WITH CHECK (
    bucket_id = 'portfolio-assets'
    AND (SELECT public.is_portfolio_admin())
  );

DROP POLICY IF EXISTS "admin_delete_portfolio_assets" ON storage.objects;
CREATE POLICY "admin_delete_portfolio_assets"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'portfolio-assets'
    AND (SELECT public.is_portfolio_admin())
  );