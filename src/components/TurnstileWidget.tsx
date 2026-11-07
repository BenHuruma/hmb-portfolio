import { useEffect, useRef } from 'react'

type TurnstileOptions = {
  sitekey: string
  theme?: 'light' | 'dark' | 'auto'
  callback: (token: string) => void
  'expired-callback'?: () => void
  'error-callback'?: () => void
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileOptions) => string
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

let scriptPromise: Promise<void> | null = null

function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-turnstile-api]')
    const script = existing ?? document.createElement('script')
    const timeout = window.setTimeout(() => reject(new Error('Turnstile script timed out.')), 12_000)
    const ready = () => {
      window.clearTimeout(timeout)
      if (window.turnstile) resolve()
      else reject(new Error('Turnstile did not initialize.'))
    }
    script.addEventListener('load', ready, { once: true })
    script.addEventListener('error', () => {
      window.clearTimeout(timeout)
      reject(new Error('Turnstile could not be loaded.'))
    }, { once: true })
    if (!existing) {
      script.dataset.turnstileApi = 'true'
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    } else if (window.turnstile) {
      ready()
    }
  }).catch((error: unknown) => {
    scriptPromise = null
    throw error
  })
  return scriptPromise!
}

interface TurnstileWidgetProps {
  siteKey: string
  onToken: (token: string | null) => void
  onError: () => void
}

export function TurnstileWidget({ siteKey, onToken, onError }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onTokenRef = useRef(onToken)
  const onErrorRef = useRef(onError)
  onTokenRef.current = onToken
  onErrorRef.current = onError

  useEffect(() => {
    let cancelled = false
    let widgetId: string | null = null

    void loadTurnstile().then(() => {
      if (cancelled || !containerRef.current || !window.turnstile) return
      widgetId = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: 'auto',
        callback: (token) => onTokenRef.current(token),
        'expired-callback': () => onTokenRef.current(null),
        'error-callback': () => {
          onTokenRef.current(null)
          onErrorRef.current()
        },
      })
    }).catch(() => {
      if (!cancelled) onErrorRef.current()
    })

    return () => {
      cancelled = true
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId)
      onTokenRef.current(null)
    }
  }, [siteKey])

  return <div ref={containerRef} className="turnstile-widget" aria-label="Vérification anti-robot" />
}
