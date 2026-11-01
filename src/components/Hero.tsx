import { useReveal } from '../hooks/useReveal'
import type { SiteSettings } from '../lib/types'

interface HeroProps {
  settings: SiteSettings
}

export function Hero({ settings }: HeroProps) {
  const { ref, visible } = useReveal<HTMLDivElement>()
  const heroPhoto = settings.hero_photo_url || `${import.meta.env.BASE_URL}ma_photo.WebP`

  return (
    <section id="hero" className="hero" ref={ref}>
      <div className="container hero__inner">
        <div className={`hero__content ${visible ? 'reveal visible' : 'reveal'}`}>
          <span className="hero__status">
            <span className="hero__status-dot"></span>
            {settings.hero_status}
          </span>
          <h1 className="hero__title">{settings.hero_name}</h1>
          <p className="hero__subtitle">{settings.hero_subtitle}</p>
          <div className="hero__actions">
            <a
              href="#contact"
              className="hero__btn hero__btn--primary"
              onClick={(e) => {
                e.preventDefault()
                document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Me contacter
              <i className="fa-solid fa-arrow-right"></i>
            </a>
          </div>
          <div className="hero__socials">
            {settings.linkedin_url && <a href={settings.linkedin_url} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i className="fa-brands fa-linkedin-in"></i></a>}
            {settings.github_url && <a href={settings.github_url} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i className="fa-brands fa-github"></i></a>}
            {settings.twitter_url && <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" aria-label="X"><i className="fa-brands fa-x-twitter"></i></a>}
            {settings.whatsapp_url && <a href={settings.whatsapp_url} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><i className="fa-brands fa-whatsapp"></i></a>}
          </div>
        </div>

        <div className={`hero__visual ${visible ? 'reveal visible' : 'reveal'}`}>
          <div className="hero__photo-wrap">
            <div className="hero__photo-glow"></div>
            <img src={heroPhoto} alt={settings.hero_name} className="hero__photo" />
            <div className="hero__badge">
              <i className="fa-solid fa-location-dot"></i>
              {settings.about_location}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .hero { min-height: 100vh; display: flex; align-items: center; padding: calc(var(--nav-height) + 40px) 0 60px; position: relative; overflow: hidden; }
        .hero::before { content: ''; position: absolute; top: -10%; right: -10%; width: 500px; height: 500px; background: radial-gradient(circle, var(--color-accent-glow) 0%, transparent 70%); pointer-events: none; opacity: 0.6; }
        .hero__inner { display: grid; grid-template-columns: 1fr; gap: 48px; align-items: center; position: relative; z-index: 1; }
        @media (min-width: 880px) { .hero__inner { grid-template-columns: 1.2fr 0.8fr; gap: 64px; } }
        .hero__status { display: inline-flex; align-items: center; gap: 8px; font-size: 0.8125rem; font-weight: 500; color: var(--color-success); background: rgba(34,197,94,0.1); padding: 6px 14px; border-radius: 100px; margin-bottom: 24px; }
        .hero__status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-success); animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .hero__title { font-size: clamp(2.5rem,6vw,4rem); font-weight: 700; line-height: 1.1; letter-spacing: -0.03em; margin-bottom: 20px; background: linear-gradient(135deg, var(--color-text) 0%, var(--color-text-secondary) 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
        .hero__subtitle { font-size: 1.125rem; color: var(--color-text-secondary); line-height: 1.7; max-width: 520px; margin-bottom: 32px; }
        .hero__actions { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 36px; }
        .hero__btn { display: inline-flex; align-items: center; gap: 10px; padding: 12px 24px; border-radius: var(--radius-md); font-size: 0.9375rem; font-weight: 500; transition: all var(--transition); border: 1px solid transparent; }
        .hero__btn--primary { background: var(--color-accent); color: #fff; }
        .hero__btn--primary:hover { background: var(--color-accent-hover); color: #fff; transform: translateY(-2px); box-shadow: var(--shadow-glow); }
        .hero__btn--ghost { background: transparent; color: var(--color-text); border-color: var(--color-border); }
        .hero__btn--ghost:hover { border-color: var(--color-accent); color: var(--color-accent); }
        .hero__socials { display: flex; gap: 14px; }
        .hero__socials a { display: inline-flex; align-items: center; justify-content: center; width: 42px; height: 42px; border-radius: var(--radius-sm); color: var(--color-text-secondary); background: var(--color-surface); border: 1px solid var(--color-border-soft); font-size: 1.0625rem; transition: all var(--transition); }
        .hero__socials a:hover { color: var(--color-accent); border-color: var(--color-accent); transform: translateY(-3px); }
        .hero__visual { display: flex; justify-content: center; }
        .hero__photo-wrap { position: relative; width: 280px; height: 340px; border-radius: var(--radius-lg); overflow: hidden; }
        @media (min-width: 880px) { .hero__photo-wrap { width: 320px; height: 400px; } }
        .hero__photo { width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-lg); border: 1px solid var(--color-border); position: relative; z-index: 2; }
        .hero__photo-glow { position: absolute; inset: -20px; background: radial-gradient(circle, var(--color-accent-glow) 0%, transparent 65%); z-index: 1; animation: glow-drift 6s ease-in-out infinite; }
        @keyframes glow-drift { 0%,100% { transform: translate(0,0) scale(1); opacity: 0.5; } 50% { transform: translate(10px,-10px) scale(1.1); opacity: 0.8; } }
        .hero__badge { position: absolute; bottom: 16px; left: 16px; z-index: 3; display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 100px; background: color-mix(in srgb, var(--color-bg-elevated) 80%, transparent); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); color: var(--color-text); font-size: 0.8125rem; font-weight: 500; border: 1px solid var(--color-border); }
        .hero__badge i { color: var(--color-accent); font-size: 0.75rem; }
      `}</style>
    </section>
  )
}
