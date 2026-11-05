import { useState } from 'react'
import { useReveal } from '../hooks/useReveal'
import { sortAchievementsNewestFirst } from '../lib/achievements'
import type { SiteSettings } from '../lib/types'

interface WorkProps {
  settings: SiteSettings
}

const ICONS: Record<string, string> = {
  'Validateur B-Nodes sur Safrochain': 'fa-solid fa-cube',
  'Réviseur communautaire — Cardano Catalyst': 'fa-solid fa-check-to-slot',
  'Membre actif — Midnight Network': 'fa-solid fa-moon',
  'Membre actif — Safrochain': 'fa-solid fa-link',
}

function resolveCertificateUrl(url: string): string {
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('/')) return url
  return `${import.meta.env.BASE_URL}${url}`
}

export function Work({ settings }: WorkProps) {
  const { ref, visible } = useReveal<HTMLDivElement>()
  const [modalImg, setModalImg] = useState<{ src: string; alt: string } | null>(null)

  return (
    <section id="work" className="section" ref={ref}>
      <div className="container">
        <div className={`reveal ${visible ? 'visible' : ''}`}>
          <span className="section-label">{settings.site_copy.work_label}</span>
          <h2 className="section-title">{settings.site_copy.work_heading}</h2>
          <p className="section-description">{settings.site_copy.work_description}</p>
        </div>

        <div className={`work__grid ${visible ? 'reveal visible' : 'reveal'}`}>
          {sortAchievementsNewestFirst(settings.achievements).map((item, i) => (
            <article key={i} className="work__card">
              <div className="work__card-top">
                <span className="work__icon"><i className={ICONS[item.title] || 'fa-solid fa-cube'}></i></span>
                <span className="work__year">{item.year}</span>
              </div>
              <h3 className="work__card-title">{item.title}</h3>
              <p className="work__card-desc">{item.description}</p>
              <a href={item.link_url} target="_blank" rel="noopener noreferrer" className="work__card-link">
                {item.link_label}
                <i className="fa-solid fa-arrow-up-right-from-square"></i>
              </a>
            </article>
          ))}
        </div>

        {settings.site_copy.certificates.length > 0 && <div className={`work__certificates ${visible ? 'reveal visible' : 'reveal'}`}>
          <h3 className="work__cert-title">{settings.site_copy.certificates_title}</h3>
          <div className="work__cert-grid">
            {settings.site_copy.certificates.map((cert, index) => {
              const image = { src: resolveCertificateUrl(cert.image_url), alt: cert.alt }
              return <button key={`${cert.image_url}-${index}`} className="work__cert-img-btn" onClick={() => setModalImg(image)} aria-label={`Agrandir: ${cert.title || cert.alt}`}>
                <img src={image.src} alt={image.alt} />
                {cert.title && <span>{cert.title}</span>}
              </button>
            })}
          </div>
        </div>}
      </div>

      {modalImg && (
        <div className="work__modal" onClick={() => setModalImg(null)}>
          <button className="work__modal-close" aria-label="Fermer"><i className="fa-solid fa-xmark"></i></button>
          <img src={modalImg.src} alt={modalImg.alt} />
        </div>
      )}

      <style>{`
        .work__grid { display: grid; grid-template-columns: 1fr; gap: 20px; margin-top: 48px; }
        @media (min-width: 640px) { .work__grid { grid-template-columns: repeat(2,1fr); } }
        .work__card { background: var(--color-bg-card); border: 1px solid var(--color-border-soft); border-radius: var(--radius-lg); padding: 28px; display: flex; flex-direction: column; transition: border-color var(--transition), transform var(--transition), box-shadow var(--transition); }
        .work__card:hover { border-color: var(--color-border); transform: translateY(-4px); box-shadow: var(--shadow-md); }
        .work__card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .work__icon { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: var(--radius-md); background: var(--color-accent-soft); color: var(--color-accent); font-size: 1.125rem; }
        .work__year { font-size: 0.8125rem; font-weight: 600; color: var(--color-text-muted); letter-spacing: 0.03em; }
        .work__card-title { font-size: 1.0625rem; font-weight: 600; color: var(--color-text); margin-bottom: 10px; }
        .work__card-desc { font-size: 0.875rem; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 20px; flex-grow: 1; }
        .work__card-link { display: inline-flex; align-items: center; gap: 8px; font-size: 0.8125rem; font-weight: 500; color: var(--color-accent); }
        .work__card-link i { font-size: 0.6875rem; transition: transform var(--transition); }
        .work__card-link:hover i { transform: translate(2px,-2px); }
        .work__certificates { margin-top: 56px; }
        .work__cert-title { font-size: 1.125rem; font-weight: 600; color: var(--color-text); margin-bottom: 20px; }
        .work__cert-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
        @media (min-width: 640px) { .work__cert-grid { grid-template-columns: repeat(2,1fr); } }
        .work__cert-img-btn { display: block; border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--color-border-soft); background: none; padding: 0; cursor: zoom-in; transition: border-color var(--transition), transform var(--transition); }
        .work__cert-img-btn:hover { border-color: var(--color-accent); transform: translateY(-2px); }
        .work__cert-img-btn img { width: 100%; height: auto; display: block; }
        .work__cert-img-btn span { display: block; padding: 12px 16px; color: var(--color-text-secondary); font-size: 0.875rem; text-align: left; }
        .work__modal { position: fixed; inset: 0; z-index: 2000; background: rgba(0,0,0,0.88); display: flex; align-items: center; justify-content: center; padding: 32px; animation: fade-in 0.25s ease; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .work__modal img { max-width: 100%; max-height: 90vh; border-radius: var(--radius-md); box-shadow: var(--shadow-lg); }
        .work__modal-close { position: absolute; top: 24px; right: 24px; width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.1); color: #fff; font-size: 1.25rem; display: flex; align-items: center; justify-content: center; transition: background-color var(--transition); }
        .work__modal-close:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </section>
  )
}
