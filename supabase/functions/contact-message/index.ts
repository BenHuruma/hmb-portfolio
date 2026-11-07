const DEFAULT_ALLOWED_ORIGINS = [
  'https://benhuruma.github.io',
  'http://localhost:5173',
]
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 5
const requestsByClient = new Map<string, number[]>()

function allowedOrigins(): string[] {
  const configured = Deno.env.get('ALLOWED_ORIGINS')
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

function isRateLimited(clientId: string): boolean {
  const now = Date.now()
  const recent = (requestsByClient.get(clientId) ?? []).filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS)
  if (recent.length >= RATE_LIMIT_MAX) {
    requestsByClient.set(clientId, recent)
    return true
  }
  recent.push(now)
  requestsByClient.set(clientId, recent)
  if (requestsByClient.size > 1000) {
    for (const [key, timestamps] of requestsByClient) {
      const active = timestamps.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS)
      if (active.length) requestsByClient.set(key, active)
      else requestsByClient.delete(key)
    }
  }
  return false
}

Deno.serve(async (request) => {
  const origin = request.headers.get('origin')
  const allowed = allowedOrigins()

  if (request.method === 'OPTIONS') {
    if (origin && !allowed.includes(origin)) return new Response(null, { status: 403 })
    return new Response('ok', { headers: responseHeaders(origin) })
  }
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405, origin)
  if (origin && !allowed.includes(origin)) return jsonResponse({ error: 'Origin not allowed.' }, 403, origin)

  const forwardedIp = request.headers.get('x-forwarded-for')?.split(',').pop()?.trim()
  const clientId = request.headers.get('cf-connecting-ip')
    ?? request.headers.get('x-real-ip')
    ?? forwardedIp
    ?? 'unknown-client'
  if (isRateLimited(clientId)) {
    return jsonResponse({ error: 'Too many messages. Please wait a minute and try again.' }, 429, origin)
  }

  const contentLength = Number(request.headers.get('content-length') ?? '0')
  if (contentLength > 16_384) return jsonResponse({ error: 'Request is too large.' }, 413, origin)

  let payload: { name?: unknown; email?: unknown; message?: unknown; website?: unknown }
  try {
    payload = await request.json()
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

  const apiKey = Deno.env.get('RESEND_API_KEY')
  const from = Deno.env.get('CONTACT_FROM_EMAIL')
  const recipient = Deno.env.get('CONTACT_TO_EMAIL')
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
