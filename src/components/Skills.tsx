import { useReveal } from '../hooks/useReveal'
import type { SiteSettings } from '../lib/types'

interface SkillsProps {
  settings: SiteSettings
}

const SKILL_ICONS: Record<string, string> = {
  'HTML5 & CSS3': 'fa-brands fa-html5',
  JavaScript: 'fa-brands fa-js',
  'Git & GitHub': 'fa-brands fa-git-alt',
  Photoshop: 'fa-solid fa-image',
  'Suite Office': 'fa-solid fa-file-word',
  'Swahili / Français': 'fa-solid fa-language',
  React: 'fa-brands fa-react',
  Python: 'fa-brands fa-python',
  'C#': 'fa-solid fa-hashtag',
  PostgreSQL: 'fa-solid fa-database',
  'Dév. Backend': 'fa-solid fa-server',
  Blockchain: 'fa-solid fa-cube',
}

function getIcon(name: string): string {
  return SKILL_ICONS[name.trim()] || 'fa-solid fa-code'
}

export function Skills({ settings }: SkillsProps) {
  const { ref, visible } = useReveal<HTMLDivElement>()
  const mastered = settings.skills_mastered.split(',').map((s) => s.trim()).filter(Boolean)
  const progress = settings.skills_progress.split(',').map((s) => s.trim()).filter(Boolean)

  const groups = [
    { title: settings.site_copy.skills_mastered_title, status: settings.site_copy.skills_mastered_status, skills: mastered, badgeClass: 'skills__badge--solid' },
    { title: settings.site_copy.skills_progress_title, status: settings.site_copy.skills_progress_status, skills: progress, badgeClass: 'skills__badge--progress' },
  ]

  return (
    <section id="skills" className="section" ref={ref}>
      <div className="container">
        <div className={`reveal ${visible ? 'visible' : ''}`}>
          <span className="section-label">{settings.site_copy.skills_label}</span>
          <h2 className="section-title">{settings.site_copy.skills_heading}</h2>
          <p className="section-description">{settings.site_copy.skills_description}</p>
        </div>

        <div className={`skills__grid ${visible ? 'reveal visible' : 'reveal'}`}>
          {groups.map((group) => (
            <div key={group.title} className="skills__card">
              <div className="skills__card-header">
                <h3 className="skills__card-title">{group.title}</h3>
                <span className={`skills__badge ${group.badgeClass}`}>{group.status}</span>
              </div>
              <ul className="skills__list">
                {group.skills.map((skill) => (
                  <li key={skill} className="skills__item">
                    <span className="skills__icon"><i className={getIcon(skill)}></i></span>
                    <span className="skills__name">{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .skills__grid { display: grid; grid-template-columns: 1fr; gap: 24px; margin-top: 48px; }
        @media (min-width: 768px) { .skills__grid { grid-template-columns: repeat(2,1fr); } }
        .skills__card { background: var(--color-bg-card); border: 1px solid var(--color-border-soft); border-radius: var(--radius-lg); padding: 32px; transition: border-color var(--transition), transform var(--transition); }
        .skills__card:hover { border-color: var(--color-border); transform: translateY(-3px); }
        .skills__card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; gap: 12px; }
        .skills__card-title { font-size: 1.125rem; font-weight: 600; color: var(--color-text); }
        .skills__badge { font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; padding: 4px 12px; border-radius: 100px; white-space: nowrap; }
        .skills__badge--solid { background: rgba(34,197,94,0.12); color: var(--color-success); }
        .skills__badge--progress { background: rgba(245,158,11,0.12); color: var(--color-warning); }
        .skills__list { list-style: none; display: grid; grid-template-columns: 1fr; gap: 8px; }
        @media (min-width: 480px) { .skills__list { grid-template-columns: repeat(2,1fr); } }
        .skills__item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: var(--radius-sm); background: var(--color-surface); border: 1px solid var(--color-border-soft); transition: border-color var(--transition), background-color var(--transition); }
        .skills__item:hover { border-color: var(--color-accent); background: var(--color-accent-soft); }
        .skills__icon { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: var(--radius-sm); background: var(--color-bg-elevated); color: var(--color-accent); font-size: 0.875rem; flex-shrink: 0; }
        .skills__name { font-size: 0.875rem; font-weight: 500; color: var(--color-text); }
      `}</style>
    </section>
  )
}
