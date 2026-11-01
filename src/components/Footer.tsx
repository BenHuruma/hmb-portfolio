import type { SiteSettings } from '../lib/types'

interface FooterProps {
  settings: SiteSettings
}

export function Footer({ settings }: FooterProps) {
  const socialLinks = [
    { href: settings.linkedin_url, icon: 'fa-brands fa-linkedin-in', label: 'LinkedIn' },
    { href: settings.github_url, icon: 'fa-brands fa-github', label: 'GitHub' },
    { href: settings.twitter_url, icon: 'fa-brands fa-x-twitter', label: 'X' },
    { href: settings.whatsapp_url, icon: 'fa-brands fa-whatsapp', label: 'WhatsApp' },
  ].filter((s) => s.href)

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <span className="footer__logo">BH</span>
            <div>
              <p className="footer__name">{settings.hero_name}</p>
              <p className="footer__role">{settings.hero_subtitle.split(',')[0]}</p>
            </div>
          </div>
          <div className="footer__socials">
            {socialLinks.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="footer__social">
                <i className={s.icon}></i>
              </a>
            ))}
          </div>
        </div>
        <div className="footer__bottom">
          <p>{settings.contact_location} — {new Date().getFullYear()}</p>
          <p className="footer__credit">Conçu et développé par <a href={settings.github_url || '#'} target="_blank" rel="noopener noreferrer">{settings.hero_name}</a></p>
        </div>
      </div>
      <style>{`
        .footer { border-top: 1px solid var(--color-border-soft); padding: 48px 0 32px; background: var(--color-bg-elevated); }
        .footer__inner { display: flex; flex-direction: column; gap: 32px; }
        .footer__top { display: flex; flex-direction: column; gap: 24px; align-items: flex-start; }
        @media (min-width: 640px) { .footer__top { flex-direction: row; align-items: center; justify-content: space-between; } }
        .footer__brand { display: flex; align-items: center; gap: 14px; }
        .footer__logo { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-sm); background: var(--color-accent); color: #fff; font-weight: 700; font-size: 0.875rem; flex-shrink: 0; }
        .footer__name { font-family: var(--font-display); font-weight: 600; font-size: 0.9375rem; color: var(--color-text); }
        .footer__role { font-size: 0.8125rem; color: var(--color-text-muted); }
        .footer__socials { display: flex; gap: 10px; }
        .footer__social { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-sm); color: var(--color-text-secondary); background: var(--color-surface); border: 1px solid var(--color-border-soft); font-size: 1rem; transition: all var(--transition); }
        .footer__social:hover { color: var(--color-accent); border-color: var(--color-accent); transform: translateY(-3px); }
        .footer__bottom { display: flex; flex-direction: column; gap: 4px; padding-top: 24px; border-top: 1px solid var(--color-border-soft); font-size: 0.8125rem; color: var(--color-text-muted); }
        @media (min-width: 640px) { .footer__bottom { flex-direction: row; justify-content: space-between; align-items: center; } }
        .footer__credit a { color: var(--color-text-secondary); font-weight: 500; }
        .footer__credit a:hover { color: var(--color-accent); }
      `}</style>
    </footer>
  )
}
