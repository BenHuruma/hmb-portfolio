-- Persistent server-side rate limiting for the public contact Edge Function.
-- The table stores only salted hashes of client IP addresses, never raw IPs.
CREATE TABLE IF NOT EXISTS public.contact_rate_limits (
  client_hash text PRIMARY KEY,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  request_count integer NOT NULL DEFAULT 0 CHECK (request_count >= 0)
);

CREATE INDEX IF NOT EXISTS contact_rate_limits_window_started_at_idx
  ON public.contact_rate_limits (window_started_at);

ALTER TABLE public.contact_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.contact_rate_limits FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.consume_contact_rate_limit(
  p_client_hash text,
  p_limit integer DEFAULT 5,
  p_window_seconds integer DEFAULT 600
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  allowed boolean;
BEGIN
  IF p_client_hash IS NULL OR length(p_client_hash) <> 64
    OR p_limit < 1 OR p_window_seconds < 1 THEN
    RETURN false;
  END IF;

  DELETE FROM public.contact_rate_limits
  WHERE window_started_at < now() - interval '1 day';

  INSERT INTO public.contact_rate_limits AS current_limit
    (client_hash, window_started_at, request_count)
  VALUES
    (p_client_hash, now(), 1)
  ON CONFLICT (client_hash) DO UPDATE SET
    window_started_at = CASE
      WHEN current_limit.window_started_at <= now() - make_interval(secs => p_window_seconds)
        THEN now()
      ELSE current_limit.window_started_at
    END,
    request_count = CASE
      WHEN current_limit.window_started_at <= now() - make_interval(secs => p_window_seconds)
        THEN 1
      ELSE current_limit.request_count + 1
    END
  RETURNING request_count <= p_limit INTO allowed;

  RETURN allowed;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_contact_rate_limit(text, integer, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_contact_rate_limit(text, integer, integer)
  TO service_role;
