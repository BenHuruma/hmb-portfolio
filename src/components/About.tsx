import { useReveal } from '../hooks/useReveal'
import type { SiteSettings } from '../lib/types'

interface AboutProps {
  settings: SiteSettings
}

const HIGHLIGHTS = [
  { icon: 'fa-solid fa-code', label: 'Développement Web' },
  { icon: 'fa-solid fa-cube', label: 'Blockchain & Web3' },
  { icon: 'fa-solid fa-shield-halved', label: 'Cybersécurité' },
  { icon: 'fa-solid fa-server', label: 'Systèmes distribués' },
]

export function About({ settings }: AboutProps) {
  const { ref, visible } = useReveal<HTMLDivElement>()
  const paragraphs = settings.about_text.split('\n\n').filter((p) => p.trim())
  return (
    <section id="about" className="section" ref={ref}>
      <div className="container">
        <div className={`about ${visible ? 'reveal visible' : 'reveal'}`}>
          <div className="about__text">
            <span className="section-label">À propos</span>
            <h2 className="section-title">Un développeur guidé par le professionnalisme et la rigueur</h2>
            <div className="about__paragraphs">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="about__highlights">
              {HIGHLIGHTS.map((item) => (
                <div key={item.label} className="about__highlight">
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="about__visual">
            <div className="about__info-card">
              <div className="about__info-row">
                <span className="about__info-label">Localisation</span>
                <span className="about__info-value">{settings.about_location}</span>
              </div>
              <div className="about__info-row">
                <span className="about__info-label">Études</span>
                <span className="about__info-value">{settings.about_education}</span>
              </div>
              <div className="about__info-row">
                <span className="about__info-label">Langues</span>
                <span className="about__info-value">{settings.about_languages}</span>
              </div>
              <div className="about__info-row">
                <span className="about__info-label">Email</span>
                <span className="about__info-value">{settings.about_email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .about { display: grid; grid-template-columns: 1fr; gap: 48px; align-items: start; }
        @media (min-width: 880px) { .about { grid-template-columns: 1.3fr 0.7fr; gap: 64px; } }
        .about__paragraphs { margin-top: 20px; display: flex; flex-direction: column; gap: 16px; color: var(--color-text-secondary); font-size: 1rem; line-height: 1.8; }
        .about__highlights { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; margin-top: 32px; }
        .about__highlight { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-radius: var(--radius-md); background: var(--color-surface); border: 1px solid var(--color-border-soft); font-size: 0.875rem; font-weight: 500; color: var(--color-text); transition: border-color var(--transition), transform var(--transition); }
        .about__highlight:hover { border-color: var(--color-accent); transform: translateY(-2px); }
        .about__highlight i { color: var(--color-accent); font-size: 1.0625rem; }
        .about__visual { display: flex; flex-direction: column; gap: 20px; }
        .about__info-card { background: var(--color-bg-card); border: 1px solid var(--color-border-soft); border-radius: var(--radius-lg); padding: 8px 20px; }
        .about__info-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid var(--color-border-soft); gap: 16px; }
        .about__info-row:last-child { border-bottom: none; }
        .about__info-label { font-size: 0.8125rem; color: var(--color-text-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap; }
        .about__info-value { font-size: 0.875rem; color: var(--color-text); font-weight: 500; text-align: right; }
      `}</style>
    </section>
  )
}
