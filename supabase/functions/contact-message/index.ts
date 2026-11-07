const DEFAULT_ALLOWED_ORIGINS = [
  'https://benhuruma.github.io',
  'http://localhost:5173',
]

interface SupabaseEdgeRuntime {
  env: { get(name: string): string | undefined }
  serve(handler: (request: Request) => Response | Promise<Response>): void
}

const edgeRuntime = (globalThis as typeof globalThis & { Deno: SupabaseEdgeRuntime }).Deno

function allowedOrigins(): string[] {
  const configured = edgeRuntime.env.get('ALLOWED_ORIGINS')
  return configured
    ? configured.split(',').map((origin) => origin.trim()).filter(Boolean)
    : DEFAULT_ALLOWED_ORIGINS
}

function responseHeaders(origin: string | null): HeadersInit {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
    'Content-Type': 'application/json',
  }
  if (origin && allowedOrigins().includes(origin)) headers['Access-Control-Allow-Origin'] = origin
  return headers
}

function jsonResponse(body: Record<string, unknown>, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders(origin) })
}

async function consumePersistentRateLimit(clientAddress: string): Promise<boolean> {
  const projectUrl = edgeRuntime.env.get('SUPABASE_URL')
  const serviceRoleKey = edgeRuntime.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const rateLimitSalt = edgeRuntime.env.get('CONTACT_RATE_LIMIT_SALT')
  if (!projectUrl || !serviceRoleKey || !rateLimitSalt) {
    throw new Error('Persistent contact rate-limit secrets are not configured.')
  }

  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`${clientAddress}:${rateLimitSalt}`),
  )
  const clientHash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
  const response = await fetch(`${projectUrl.replace(/\/$/, '')}/rest/v1/rpc/consume_contact_rate_limit`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ p_client_hash: clientHash, p_limit: 5, p_window_seconds: 600 }),
    signal: AbortSignal.timeout(5_000),
  })

  if (!response.ok) {
    console.error('Persistent contact rate limit request failed.', { status: response.status })
    throw new Error('Rate-limit storage is unavailable.')
  }
  return await response.json() === true
}

interface ContactSecuritySettings {
  captchaEnabled: boolean
  honeypotEnabled: boolean
}

async function loadContactSecuritySettings(): Promise<ContactSecuritySettings> {
  const projectUrl = edgeRuntime.env.get('SUPABASE_URL')
  const serviceRoleKey = edgeRuntime.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!projectUrl || !serviceRoleKey) throw new Error('Supabase server credentials are not configured.')

  const response = await fetch(
    `${projectUrl.replace(/\/$/, '')}/rest/v1/site_settings?select=security_captcha_enabled,security_honeypot_enabled&id=eq.1`,
    {
      headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
      signal: AbortSignal.timeout(5_000),
    },
  )
  if (!response.ok) throw new Error('Unable to load contact security policy.')
  const rows = await response.json() as Array<Partial<Record<'security_captcha_enabled' | 'security_honeypot_enabled', boolean>>>
  if (!rows[0] || typeof rows[0].security_captcha_enabled !== 'boolean' || typeof rows[0].security_honeypot_enabled !== 'boolean') {
    throw new Error('Contact security settings are missing. Apply the contact security migration.')
  }
  return {
    captchaEnabled: rows[0].security_captcha_enabled,
    honeypotEnabled: rows[0].security_honeypot_enabled,
  }
}

async function verifyTurnstile(token: string, remoteIp: string): Promise<boolean> {
  const secret = edgeRuntime.env.get('TURNSTILE_SECRET_KEY')
  if (!secret) throw new Error('Turnstile secret key is not configured.')
  const form = new URLSearchParams({ secret, response: token })
  if (remoteIp !== 'unknown-client') form.set('remoteip', remoteIp)
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
    signal: AbortSignal.timeout(5_000),
  })
  if (!response.ok) throw new Error('Turnstile verification service is unavailable.')
  const result = await response.json() as { success?: boolean }
  return result.success === true
}

edgeRuntime.serve(async (request: Request) => {
  const origin = request.headers.get('origin')
  const allowed = allowedOrigins()

  if (request.method === 'OPTIONS') {
    if (origin && !allowed.includes(origin)) return new Response(null, { status: 403 })
    return new Response('ok', { headers: responseHeaders(origin) })
  }
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405, origin)
  if (origin && !allowed.includes(origin)) return jsonResponse({ error: 'Origin not allowed.' }, 403, origin)

  let payload: { name?: unknown; email?: unknown; message?: unknown; website?: unknown }
  try {
    const body = await request.text()
    if (new TextEncoder().encode(body).byteLength > 16_384) {
      return jsonResponse({ error: 'Request is too large.' }, 413, origin)
    }
    payload = JSON.parse(body)
  } catch {
    return jsonResponse({ error: 'Invalid request body.' }, 400, origin)
  }

  let security: ContactSecuritySettings
  try {
    security = await loadContactSecuritySettings()
  } catch (error) {
    console.error('Unable to load contact security policy.', error)
    return jsonResponse({ error: 'The contact service is not configured. Please use the email fallback.' }, 503, origin)
  }

  // Use gateway-provided IP headers; persist only a salted hash server-side.
  const clientAddress = request.headers.get('cf-connecting-ip')
    ?? request.headers.get('x-real-ip')
    ?? request.headers.get('x-forwarded-for')?.split(',').pop()?.trim()
    ?? 'unknown-client'

  if (security.honeypotEnabled && typeof payload.website === 'string' && payload.website.trim()) {
    return jsonResponse({ ok: true }, 200, origin)
  }

  if (security.captchaEnabled) {
    const captchaToken = typeof payload.captchaToken === 'string' ? payload.captchaToken.trim() : ''
    if (!captchaToken) return jsonResponse({ error: 'Complete the CAPTCHA before sending.', code: 'captcha_required' }, 400, origin)
    try {
      if (!await verifyTurnstile(captchaToken, clientAddress)) {
        return jsonResponse({ error: 'CAPTCHA verification failed. Please try again.', code: 'captcha_failed' }, 400, origin)
      }
    } catch (error) {
      console.error('Turnstile verification unavailable.', error)
      return jsonResponse({ error: 'CAPTCHA verification is unavailable. Please use the email fallback.', code: 'captcha_unavailable' }, 503, origin)
    }
  }

  try {
    if (!await consumePersistentRateLimit(clientAddress)) {
      return jsonResponse({ error: 'Too many messages. Please wait 10 minutes and try again.', code: 'rate_limited' }, 429, origin)
    }
  } catch (error) {
    console.error('Contact rate limiting failed closed.', error)
    return jsonResponse({ error: 'The contact service is temporarily unavailable.' }, 503, origin)
  }

  const name = typeof payload.name === 'string' ? payload.name.trim() : ''
  const email = typeof payload.email === 'string' ? payload.email.trim() : ''
  const message = typeof payload.message === 'string' ? payload.message.trim() : ''
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!name || name.length > 100) return jsonResponse({ error: 'Name must be between 1 and 100 characters.' }, 400, origin)
  if (!emailPattern.test(email) || email.length > 254) return jsonResponse({ error: 'Enter a valid email address.' }, 400, origin)
  if (!message || message.length > 5000) return jsonResponse({ error: 'Message must be between 1 and 5000 characters.' }, 400, origin)

  const apiKey = edgeRuntime.env.get('RESEND_API_KEY')
  const from = edgeRuntime.env.get('CONTACT_FROM_EMAIL')
  const recipient = edgeRuntime.env.get('CONTACT_TO_EMAIL')
  if (!apiKey || !from || !recipient) {
    console.error('Contact function is missing RESEND_API_KEY, CONTACT_FROM_EMAIL, or CONTACT_TO_EMAIL.')
    return jsonResponse({ ok: false, fallback: true, error: 'Resend is not configured. Your message will be opened in your email application.' }, 200, origin)
  }

  const idempotencyKey = crypto.randomUUID()
  let lastFailure: string | null = null
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          from,
          to: [recipient],
          reply_to: email,
          subject: `Portfolio contact — ${name.replace(/[\r\n]/g, ' ')}`,
          text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
        }),
        signal: AbortSignal.timeout(10_000),
      })

      if (emailResponse.ok) return jsonResponse({ ok: true }, 200, origin)

      const providerMessage = await emailResponse.text().catch(() => '')
      lastFailure = `Resend returned HTTP ${emailResponse.status}.`
      console.error('Email provider rejected the contact message.', {
        attempt,
        status: emailResponse.status,
        response: providerMessage.slice(0, 1000),
      })
    } catch (error) {
      lastFailure = error instanceof Error ? error.message : 'Unknown provider error.'
      console.error('Email provider request failed.', { attempt, error })
    }
    if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 400))
  }

  return jsonResponse({
    ok: false,
    fallback: true,
    error: `Resend failed after two attempts (${lastFailure ?? 'unknown error'}). Your message will be opened in your email application.`,
  }, 200, origin)
})
