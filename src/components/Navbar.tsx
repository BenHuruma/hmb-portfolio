import { useEffect, useState } from 'react'
import { GoogleTranslateButton } from './GoogleTranslateButton'

const NAV_LINKS = [
  { href: '#hero', label: 'Accueil' },
  { href: '#about', label: 'À propos' },
  { href: '#skills', label: 'Compétences' },
  { href: '#education', label: 'Formation' },
  { href: '#work', label: 'Réalisations' },
  { href: '#contact', label: 'Contact' },
] as const

interface NavbarProps {
  theme: 'dark' | 'light'
  toggleTheme: () => void
}

export function Navbar({ theme, toggleTheme }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('#hero')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(`#${entry.target.id}`)
        })
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    NAV_LINKS.forEach(({ href }) => {
      const el = document.querySelector(href)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const handleNavClick = (href: string) => {
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        <a
          href="#hero"
          className="navbar__logo"
          onClick={(e) => {
            e.preventDefault()
            handleNavClick('#hero')
          }}
        >
          <span className="navbar__logo-mark">BH</span>
          <span className="navbar__logo-text">Benjamin Huruma</span>
        </a>

        <ul className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={activeSection === link.href ? 'navbar__link navbar__link--active' : 'navbar__link'}
                onClick={(e) => {
                  e.preventDefault()
                  handleNavClick(link.href)
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="navbar__actions">
          <GoogleTranslateButton />
          <button className="navbar__theme-btn" onClick={toggleTheme} aria-label="Changer de thème">
            <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
          <button className="navbar__menu-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
            <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
        </div>
      </div>
      <style>{`
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; height: var(--nav-height); z-index: 1000;
          display: flex; align-items: center;
          transition: background-color var(--transition), border-color var(--transition), box-shadow var(--transition);
          border-bottom: 1px solid transparent;
        }
        .navbar--scrolled {
          background-color: color-mix(in srgb, var(--color-bg) 85%, transparent);
          backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
          border-bottom-color: var(--color-border-soft); box-shadow: var(--shadow-sm);
        }
        .navbar__inner {
          max-width: var(--max-width); width: 100%; margin: 0 auto; padding: 0 24px;
          display: flex; align-items: center; justify-content: space-between; gap: 24px;
        }
        .navbar__logo {
          display: flex; align-items: center; gap: 10px; color: var(--color-text);
          font-family: var(--font-display); font-weight: 600; font-size: 0.9375rem; white-space: nowrap;
        }
        .navbar__logo:hover { color: var(--color-text); }
        .navbar__logo-mark {
          display: inline-flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; border-radius: var(--radius-sm);
          background: var(--color-accent); color: #fff; font-size: 0.875rem; font-weight: 700; flex-shrink: 0;
        }
        .navbar__logo-text { display: none; }
        @media (min-width: 640px) { .navbar__logo-text { display: inline; } }
        .navbar__links { display: none; list-style: none; align-items: center; gap: 4px; }
        @media (min-width: 768px) { .navbar__links { display: flex; } }
        .navbar__link {
          display: inline-block; padding: 8px 16px; border-radius: var(--radius-sm);
          font-size: 0.875rem; font-weight: 500; color: var(--color-text-secondary);
          transition: color var(--transition), background-color var(--transition);
        }
        .navbar__link:hover { color: var(--color-text); background-color: var(--color-surface); }
        .navbar__link--active { color: var(--color-accent); background-color: var(--color-accent-soft); }
        .navbar__actions { display: flex; align-items: center; gap: 8px; }
        .navbar__theme-btn, .navbar__menu-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 40px; height: 40px; border-radius: var(--radius-sm);
          color: var(--color-text-secondary); font-size: 1rem;
          transition: color var(--transition), background-color var(--transition);
        }
        .navbar__theme-btn:hover, .navbar__menu-btn:hover { color: var(--color-text); background-color: var(--color-surface); }
        .navbar__menu-btn { display: inline-flex; }
        @media (min-width: 768px) { .navbar__menu-btn { display: none; } }
        .navbar__links--open {
          display: flex; position: fixed; top: var(--nav-height); left: 0; right: 0;
          flex-direction: column; align-items: stretch; gap: 0;
          background-color: var(--color-bg-elevated); border-bottom: 1px solid var(--color-border-soft);
          padding: 12px 24px 24px; box-shadow: var(--shadow-md);
        }
        .navbar__links--open li { width: 100%; }
        .navbar__links--open .navbar__link { display: block; padding: 14px 16px; border-radius: var(--radius-sm); font-size: 0.9375rem; }
      `}</style>
    </nav>
  )
}
