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

edgeRuntime.serve(async (request: Request) => {
  const origin = request.headers.get('origin')
  const allowed = allowedOrigins()

  if (request.method === 'OPTIONS') {
    if (origin && !allowed.includes(origin)) return new Response(null, { status: 403 })
    return new Response('ok', { headers: responseHeaders(origin) })
  }
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405, origin)
  if (origin && !allowed.includes(origin)) return jsonResponse({ error: 'Origin not allowed.' }, 403, origin)

  // Use gateway-provided IP headers only; do not trust a caller-supplied
  // X-Forwarded-For chain. Only the salted hash is persisted in Postgres.
  const clientAddress = request.headers.get('cf-connecting-ip')
    ?? request.headers.get('x-real-ip')
    ?? request.headers.get('x-forwarded-for')?.split(',').pop()?.trim()
    ?? 'unknown-client'
  try {
    if (!await consumePersistentRateLimit(clientAddress)) {
      return jsonResponse({ error: 'Too many messages. Please wait 10 minutes and try again.' }, 429, origin)
    }
  } catch (error) {
    console.error('Contact rate limiting failed closed.', error)
    return jsonResponse({ error: 'The contact service is temporarily unavailable.' }, 503, origin)
  }

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

  // Hidden honeypot field used to reject simple automated form submissions.
  if (typeof payload.website === 'string' && payload.website.trim()) {
    return jsonResponse({ ok: true }, 200, origin)
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
    return jsonResponse({ error: 'The direct contact service is not configured yet.' }, 503, origin)
  }

  const emailResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [recipient],
      reply_to: email,
      subject: `Portfolio contact — ${name.replace(/[\r\n]/g, ' ')}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    }),
    signal: AbortSignal.timeout(10_000),
  }).catch((error: unknown) => {
    console.error('Email provider request failed.', error)
    return null
  })

  if (!emailResponse?.ok) {
    const providerMessage = emailResponse ? await emailResponse.text().catch(() => '') : ''
    console.error('Email provider rejected the contact message.', {
      status: emailResponse?.status,
      response: providerMessage.slice(0, 1000),
    })
    return jsonResponse({ error: 'The message could not be delivered. Please use the email fallback.' }, 502, origin)
  }

  return jsonResponse({ ok: true }, 200, origin)
})
