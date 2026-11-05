-- Add native French, English, and Swahili portfolio content with a configurable
-- default language. Empty translation objects are filled from application
-- defaults on read, then persisted in full the next time the admin saves.
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS default_language text NOT NULL DEFAULT 'fr',
  ADD COLUMN IF NOT EXISTS translations jsonb NOT NULL DEFAULT '{}'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.site_settings'::regclass
      AND conname = 'site_settings_default_language_check'
  ) THEN
    ALTER TABLE public.site_settings
      ADD CONSTRAINT site_settings_default_language_check
      CHECK (default_language IN ('fr', 'en', 'sw'));
  END IF;
END
$$;

GRANT SELECT (default_language, translations)
  ON public.site_settings TO anon, authenticated;
