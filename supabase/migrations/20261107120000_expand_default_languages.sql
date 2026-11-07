-- Allow the portfolio default language to be any language in the selector.
ALTER TABLE public.site_settings
  DROP CONSTRAINT IF EXISTS site_settings_default_language_check;

ALTER TABLE public.site_settings
  ADD CONSTRAINT site_settings_default_language_check
  CHECK (default_language IN ('ar', 'bn', 'zh-CN', 'en', 'fr', 'hi', 'pt', 'ru', 'es', 'sw'));
