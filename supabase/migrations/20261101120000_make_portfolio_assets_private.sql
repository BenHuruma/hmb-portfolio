-- The portfolio no longer offers public CV downloads or CV uploads.
-- Keep existing stored files, but make the bucket private and remove all
-- client policies for this bucket so old public object URLs stop working.
UPDATE storage.buckets
SET public = false
WHERE id = 'portfolio-assets';

DROP POLICY IF EXISTS "public_read_portfolio_assets" ON storage.objects;
DROP POLICY IF EXISTS "admin_upload_portfolio_assets" ON storage.objects;
DROP POLICY IF EXISTS "admin_update_portfolio_assets" ON storage.objects;
DROP POLICY IF EXISTS "admin_delete_portfolio_assets" ON storage.objects;

-- The legacy CV links are stored in site_settings. Revoke table-level SELECT,
-- then grant only the fields used by the public portfolio. This prevents the
-- old Drive URL and Storage URL columns from being read through the Data API.
REVOKE SELECT ON public.site_settings FROM anon, authenticated;
REVOKE SELECT (cv_url, cv_file_url, cv_source) ON public.site_settings FROM anon, authenticated;
GRANT SELECT (
	id,
	hero_name,
	hero_subtitle,
	hero_status,
	about_text,
	about_location,
	about_education,
	about_languages,
	about_email,
	skills_mastered,
	skills_progress,
	education_items,
	achievements,
	contact_email,
	contact_phone,
	contact_location,
	hero_photo_url,
	about_photo_url,
	linkedin_url,
	github_url,
	twitter_url,
	whatsapp_url,
	updated_at
) ON public.site_settings TO anon, authenticated;
