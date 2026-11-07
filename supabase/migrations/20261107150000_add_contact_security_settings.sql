-- Editable public CAPTCHA settings. The Turnstile site key is public by design;
-- its secret key is stored only as an Edge Function secret.
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS security_captcha_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS security_honeypot_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS turnstile_site_key text NOT NULL DEFAULT '';

-- The browser needs the public site key and policy flags to render the form.
-- No CAPTCHA secret is stored in this table or granted to clients.
GRANT SELECT (
  security_captcha_enabled,
  security_honeypot_enabled,
  turnstile_site_key
) ON public.site_settings TO anon, authenticated;
