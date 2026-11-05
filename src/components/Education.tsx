import { useReveal } from '../hooks/useReveal'
import type { SiteSettings } from '../lib/types'

interface EducationProps {
  settings: SiteSettings
}

const ICONS: Record<string, string> = {
  'Licence en Génie Logiciel': 'fa-solid fa-graduation-cap',
  "Diplôme d'État": 'fa-solid fa-certificate',
  'Opérateur de saisie & Formateur technique': 'fa-solid fa-briefcase',
}

export function Education({ settings }: EducationProps) {
  const { ref, visible } = useReveal<HTMLDivElement>()

  return (
    <section id="education" className="section" ref={ref}>
      <div className="container">
        <div className={`reveal ${visible ? 'visible' : ''}`}>
          <span className="section-label">{settings.site_copy.education_label}</span>
          <h2 className="section-title">{settings.site_copy.education_heading}</h2>
          <p className="section-description">{settings.site_copy.education_description}</p>
        </div>

        <div className={`education__timeline ${visible ? 'reveal visible' : 'reveal'}`}>
          {settings.education_items.map((item, i) => (
            <div key={i} className="education__item">
              <div className="education__marker">
                <i className={ICONS[item.title] || 'fa-solid fa-graduation-cap'}></i>
              </div>
              <div className="education__content">
                <span className="education__period">{item.period}</span>
                <h3 className="education__title">{item.title}</h3>
                <p className="education__place">{item.place}</p>
                <p className="education__desc">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
      <style>{`
        .education__timeline { margin-top: 48px; display: flex; flex-direction: column; gap: 0; position: relative; }
        .education__item { display: grid; grid-template-columns: 48px 1fr; gap: 24px; padding-bottom: 40px; position: relative; }
        .education__item:last-child { padding-bottom: 0; }
        .education__item:not(:last-child)::before { content: ''; position: absolute; left: 23px; top: 48px; bottom: 0; width: 2px; background: var(--color-border-soft); }
        .education__marker { width: 48px; height: 48px; border-radius: 50%; background: var(--color-bg-card); border: 2px solid var(--color-accent); display: flex; align-items: center; justify-content: center; color: var(--color-accent); font-size: 1.0625rem; flex-shrink: 0; z-index: 1; position: relative; }
        .education__content { background: var(--color-bg-card); border: 1px solid var(--color-border-soft); border-radius: var(--radius-md); padding: 24px; transition: border-color var(--transition), transform var(--transition); }
        .education__content:hover { border-color: var(--color-border); transform: translateX(4px); }
        .education__period { display: inline-block; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--color-accent); background: var(--color-accent-soft); padding: 3px 10px; border-radius: 100px; margin-bottom: 12px; }
        .education__title { font-size: 1.0625rem; font-weight: 600; color: var(--color-text); margin-bottom: 4px; }
        .education__place { font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: 12px; }
        .education__desc { font-size: 0.875rem; color: var(--color-text-secondary); line-height: 1.7; }
        @media (max-width: 480px) {
          .education__item { grid-template-columns: 40px 1fr; gap: 16px; }
          .education__marker { width: 40px; height: 40px; font-size: 0.875rem; }
          .education__item:not(:last-child)::before { left: 19px; top: 40px; }
        }
      `}</style>
    </section>
  )
}
