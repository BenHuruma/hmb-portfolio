import { useState } from 'react'

type TranslationLanguage = 'fr' | 'en'
type TranslateElementOptions = {
  pageLanguage: string
  includedLanguages: string
  autoDisplay: boolean
}

declare global {
  interface Window {
    googleTranslateElementInit?: () => void
    google?: {
      translate?: {
        TranslateElement: new (options: TranslateElementOptions, elementId: string) => unknown
      }
    }
  }
}

const SCRIPT_ID = 'google-website-translator-script'

function getSavedLanguage(): TranslationLanguage {
  if (typeof document === 'undefined') return 'fr'
  const savedTranslation = document.cookie
    .split('; ')
    .map((cookie) => decodeURIComponent(cookie))
    .find((cookie) => cookie.startsWith('googtrans='))
  return savedTranslation?.includes('/fr/en') ? 'en' : 'fr'
}

export function GoogleTranslateButton() {
  const [language, setLanguage] = useState<TranslationLanguage>(getSavedLanguage)
  const [loading, setLoading] = useState(false)
  const [unavailable, setUnavailable] = useState(false)

  const applyLanguage = (target: TranslationLanguage) => {
    const select = document.querySelector<HTMLSelectElement>('.goog-te-combo')
    if (!select?.querySelector(`option[value="${target}"]`)) return false

    setLanguage(target)
    select.value = target
    select.dispatchEvent(new Event('change', { bubbles: true }))
    setLoading(false)
    setUnavailable(false)
    return true
  }

  const toggleLanguage = () => {
    const target: TranslationLanguage = language === 'fr' ? 'en' : 'fr'
    if (applyLanguage(target)) return

    setLoading(true)
    setUnavailable(false)
    let attempts = 0
    let finished = false

    const finishWithFailure = () => {
      if (finished) return
      finished = true
      setLoading(false)
      setUnavailable(true)
    }

    const waitForWidget = () => {
      if (finished) return
      if (applyLanguage(target)) {
        finished = true
        return
      }
      attempts += 1
      if (attempts >= 40) {
        finishWithFailure()
        return
      }
      window.setTimeout(waitForWidget, 250)
    }

    window.googleTranslateElementInit = () => {
      try {
        const TranslateElement = window.google?.translate?.TranslateElement
        if (!TranslateElement) {
          finishWithFailure()
          return
        }
        new TranslateElement(
          { pageLanguage: 'fr', includedLanguages: 'en,fr', autoDisplay: false },
          'google_translate_element',
        )
        waitForWidget()
      } catch {
        finishWithFailure()
      }
    }

    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
    if (existingScript) {
      if (window.google?.translate?.TranslateElement) {
        waitForWidget()
      } else {
        existingScript.addEventListener('error', finishWithFailure, { once: true })
        waitForWidget()
      }
      return
    }

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
    script.async = true
    script.onerror = finishWithFailure
    document.head.appendChild(script)

    window.setTimeout(() => {
      if (!finished && !window.google?.translate?.TranslateElement) finishWithFailure()
    }, 10000)
  }

  const label = language === 'fr' ? 'EN' : 'FR'
  const description = unavailable
    ? 'Le service Google Translate est indisponible. Vérifiez votre connexion internet.'
    : language === 'fr'
      ? 'Traduire la page en anglais avec Google Translate'
      : 'Afficher la page en français avec Google Translate'

  return (
    <>
      <button
        className="navbar__translate-btn notranslate"
        onClick={toggleLanguage}
        disabled={loading}
        aria-label={description}
        title={description}
        aria-live="polite"
        translate="no"
      >
        <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-globe'}`} aria-hidden="true"></i>
        <span className="notranslate" translate="no">{loading ? '…' : label}</span>
      </button>
      <div id="google_translate_element" aria-hidden="true" />
      <style>{`
        #google_translate_element { position: fixed; left: -10000px; top: 0; width: 1px; height: 1px; overflow: hidden; }
        .navbar__translate-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 5px;
          min-width: 48px; height: 40px; padding: 0 8px; border-radius: var(--radius-sm);
          color: var(--color-text-secondary); font-size: 0.8125rem; font-weight: 700;
          transition: color var(--transition), background-color var(--transition);
        }
        .navbar__translate-btn:hover:not(:disabled) { color: var(--color-text); background-color: var(--color-surface); }
        .navbar__translate-btn:disabled { opacity: 0.65; cursor: wait; }
      `}</style>
    </>
  )
}
