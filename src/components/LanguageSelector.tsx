import { useEffect, useRef, useState } from 'react'
import { SUPPORTED_LANGUAGES, type Language } from '../lib/locales'

interface LanguageSelectorProps {
  language: Language
  onChange: (language: Language) => void
  label: string
}

export function LanguageSelector({ language, onChange, label }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = SUPPORTED_LANGUAGES.find((item) => item.code === language) ?? SUPPORTED_LANGUAGES[0]

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  return (
    <div className="language-selector" ref={rootRef}>
      <button
        type="button"
        className="language-selector__trigger"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((value) => !value)}
      >
        <i className="fa-solid fa-globe" aria-hidden="true"></i>
        <span>{selected.flag}</span>
        <span className="language-selector__code">{selected.code.toUpperCase()}</span>
        <i className={`fa-solid ${open ? 'fa-chevron-up' : 'fa-chevron-down'} language-selector__chevron`} aria-hidden="true"></i>
      </button>
      {open && (
        <div className="language-selector__menu" role="listbox" aria-label="Langues disponibles">
          {SUPPORTED_LANGUAGES.map((item) => (
            <button
              type="button"
              role="option"
              aria-selected={item.code === language}
              className={`language-selector__option${item.code === language ? ' language-selector__option--active' : ''}`}
              key={item.code}
              onClick={() => {
                onChange(item.code)
                setOpen(false)
              }}
            >
              <span className="language-selector__flag" aria-hidden="true">{item.flag}</span>
              <span>{item.nativeName}</span>
              {item.code === language && <i className="fa-solid fa-check" aria-hidden="true"></i>}
            </button>
          ))}
        </div>
      )}
      <style>{`
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
