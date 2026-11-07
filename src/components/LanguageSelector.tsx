import { useEffect, useRef, useState } from 'react'
import { SUPPORTED_LANGUAGES, type Language } from '../lib/locales'

interface LanguageSelectorProps {
  defaultLanguage: Language
  label: string
}

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
const LANGUAGE_STORAGE_KEY = 'hmb-portfolio-language'

function readSavedLanguage(defaultLanguage: Language): Language {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (SUPPORTED_LANGUAGES.some((item) => item.code === saved)) return saved as Language
  } catch {
    // Use the configured default when browser storage is disabled.
  }
  const cookieLanguage = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith('googtrans='))
    ?.split('/')
    .pop()
  if (SUPPORTED_LANGUAGES.some((item) => item.code === cookieLanguage)) return cookieLanguage as Language
  return defaultLanguage
}

function saveLanguage(language: Language): void {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  } catch {
    // Translation can still be applied for this visit.
  }
  const cookieValue = language === 'fr' ? '' : `/fr/${language}`
  document.cookie = `googtrans=${cookieValue};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`
}

function getTranslateSelect(): HTMLSelectElement | null {
  return document.querySelector<HTMLSelectElement>('#google_translate_element select.goog-te-combo')
}

function initializeGoogleWidget(onReady: () => void, onError: () => void): void {
  let finished = false
  let attempts = 0
  const complete = (callback: () => void) => {
    if (finished) return
    finished = true
    callback()
  }

  const waitForWidget = () => {
    if (getTranslateSelect()) {
      complete(onReady)
      return
    }
    attempts += 1
    if (attempts >= 40) {
      complete(onError)
      return
    }
    window.setTimeout(waitForWidget, 250)
  }

  try {
    const TranslateElement = window.google?.translate?.TranslateElement
    if (!TranslateElement) {
      complete(onError)
      return
    }
    if (!getTranslateSelect()) {
      new TranslateElement({
        pageLanguage: 'fr',
        includedLanguages: 'ar,bn,zh-CN,en,fr,hi,pt,ru,es,sw',
        autoDisplay: false,
      }, 'google_translate_element')
    }
    waitForWidget()
  } catch {
    complete(onError)
  }
}

function loadGoogleTranslator(onReady: () => void, onError: () => void): void {
  const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
  if (existingScript) {
    if (window.google?.translate?.TranslateElement) initializeGoogleWidget(onReady, onError)
    else {
      window.googleTranslateElementInit = () => initializeGoogleWidget(onReady, onError)
      existingScript.addEventListener('error', onError, { once: true })
      window.setTimeout(() => {
        if (!window.google?.translate?.TranslateElement) onError()
      }, 10_000)
    }
    return
  }

  window.googleTranslateElementInit = () => initializeGoogleWidget(onReady, onError)
  const script = document.createElement('script')
  script.id = SCRIPT_ID
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
  script.async = true
  script.onerror = onError
  document.head.appendChild(script)
  window.setTimeout(() => {
    if (!window.google?.translate?.TranslateElement) onError()
  }, 10_000)
}

export function LanguageSelector({ defaultLanguage, label }: LanguageSelectorProps) {
  const [language, setLanguage] = useState<Language>(() => typeof document === 'undefined' ? defaultLanguage : readSavedLanguage(defaultLanguage))
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const selected = SUPPORTED_LANGUAGES.find((item) => item.code === language) ?? SUPPORTED_LANGUAGES[0]

  useEffect(() => {
    setLanguage(readSavedLanguage(defaultLanguage))
  }, [defaultLanguage])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const selectedIndex = SUPPORTED_LANGUAGES.findIndex((item) => item.code === language)
    optionRefs.current[selectedIndex]?.focus()
  }, [open, language])

  useEffect(() => {
    if (language === 'fr') return
    setLoading(true)
    loadGoogleTranslator(() => {
      const select = getTranslateSelect()
      if (!select) {
        setLoading(false)
        setUnavailable(true)
        return
      }
      select.value = language
      select.dispatchEvent(new Event('change', { bubbles: true }))
      setLoading(false)
      setUnavailable(false)
    }, () => {
      setLoading(false)
      setUnavailable(true)
    })
  }, [language])

  const chooseLanguage = (target: Language) => {
    if (target === language) return
    saveLanguage(target)
    window.location.reload()
  }

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Tab') {
      setOpen(false)
      return
    }
    const currentIndex = optionRefs.current.indexOf(document.activeElement as HTMLButtonElement)
    let nextIndex: number | null = null
    if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1 + SUPPORTED_LANGUAGES.length) % SUPPORTED_LANGUAGES.length
    if (event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + SUPPORTED_LANGUAGES.length) % SUPPORTED_LANGUAGES.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = SUPPORTED_LANGUAGES.length - 1
    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
      return
    }
    if (nextIndex !== null) {
      event.preventDefault()
      optionRefs.current[nextIndex]?.focus()
    }
  }

  return (
    <div className="language-selector" ref={rootRef}>
      <button ref={triggerRef} type="button" className="language-selector__trigger" aria-label={label} aria-expanded={open} aria-haspopup="menu" aria-controls="portfolio-language-menu" title={unavailable ? 'Le service de traduction est indisponible' : label} onClick={() => setOpen((value) => !value)}>
        <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-globe'}`} aria-hidden="true"></i>
        <span>{selected.flag}</span><span className="language-selector__code">{selected.code.toUpperCase()}</span>
        <i className={`fa-solid ${open ? 'fa-chevron-up' : 'fa-chevron-down'} language-selector__chevron`} aria-hidden="true"></i>
      </button>
      {open && <div id="portfolio-language-menu" className="language-selector__menu" role="menu" aria-label={label} onKeyDown={handleMenuKeyDown}>
        {SUPPORTED_LANGUAGES.map((item, index) => <button ref={(element) => { optionRefs.current[index] = element }} type="button" role="menuitemradio" aria-checked={item.code === language} tabIndex={-1} className={`language-selector__option${item.code === language ? ' language-selector__option--active' : ''}`} key={item.code} onClick={() => { chooseLanguage(item.code); setOpen(false); triggerRef.current?.focus() }}>
          <span className="language-selector__flag" aria-hidden="true">{item.flag}</span><span>{item.nativeName}</span>
          {item.code === language && <i className="fa-solid fa-check" aria-hidden="true"></i>}
        </button>)}
      </div>}
      <div id="google_translate_element" aria-hidden="true" />
      <style>{`
        #google_translate_element { position: fixed; left: -10000px; top: 0; width: 1px; height: 1px; overflow: hidden; }
        .goog-te-banner-frame, iframe.skiptranslate, .skiptranslate.goog-te-gadget { display: none !important; }
        body { top: 0 !important; }
        .language-selector { position: relative; }
        .language-selector__trigger { display: inline-flex; align-items: center; justify-content: center; gap: 7px; height: 40px; min-width: 74px; padding: 0 10px; border: 1px solid var(--color-border-soft); border-radius: var(--radius-md); background: color-mix(in srgb, var(--color-bg-card) 82%, transparent); color: var(--color-text-secondary); font-size: 0.8125rem; font-weight: 700; transition: all var(--transition); }
        .language-selector__trigger:hover, .language-selector__trigger[aria-expanded='true'] { color: var(--color-text); border-color: var(--color-accent); background: var(--color-accent-soft); }
        .language-selector__code { letter-spacing: 0.04em; }
        .language-selector__chevron { font-size: 0.6rem; color: var(--color-text-muted); }
        .language-selector__menu { position: absolute; z-index: 1200; top: calc(100% + 10px); right: 0; width: 190px; padding: 6px; background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-md); box-shadow: var(--shadow-lg); animation: language-menu-in 0.15s ease-out; }
        @keyframes language-menu-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        .language-selector__option { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border-radius: var(--radius-sm); color: var(--color-text-secondary); font-size: 0.875rem; text-align: left; transition: background-color var(--transition), color var(--transition); }
        .language-selector__option:hover { background: var(--color-surface); color: var(--color-text); }
        .language-selector__option--active { color: var(--color-accent); background: var(--color-accent-soft); font-weight: 600; }
        .language-selector__flag { font-size: 1rem; }
        .language-selector__option .fa-check { margin-left: auto; font-size: 0.75rem; }
      `}</style>
    </div>
  )
}
