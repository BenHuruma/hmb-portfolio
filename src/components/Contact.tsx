import { useState } from 'react'
import { useReveal } from '../hooks/useReveal'
import type { SiteSettings } from '../lib/types'

interface ContactProps {
  settings: SiteSettings
}

export function Contact({ settings }: ContactProps) {
  const { ref, visible } = useReveal<HTMLDivElement>()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Message de ${name || 'un visiteur'}`)
    const body = encodeURIComponent(`Nom: ${name}\nEmail: ${email}\n\n${message}`)
    window.location.href = `mailto:${settings.contact_email}?subject=${subject}&body=${body}`
    setSent(true)
    setTimeout(() => setSent(false), 5000)
  }

  const contactInfo = [
    { icon: 'fa-solid fa-envelope', label: settings.site_copy.contact_email_label, value: settings.contact_email, href: `mailto:${settings.contact_email}` },
    { icon: 'fa-solid fa-phone', label: settings.site_copy.contact_phone_label, value: settings.contact_phone, href: `https://wa.me/${settings.contact_phone.replace(/[^0-9]/g, '')}` },
    { icon: 'fa-solid fa-location-dot', label: settings.site_copy.contact_location_label, value: settings.contact_location, href: null },
  ]

  return (
    <section id="contact" className="section" ref={ref}>
      <div className="container">
        <div className={`reveal ${visible ? 'visible' : ''}`}>
          <span className="section-label">{settings.site_copy.contact_label}</span>
          <h2 className="section-title">{settings.site_copy.contact_heading}</h2>
          <p className="section-description">{settings.site_copy.contact_description}</p>
        </div>

        <div className={`contact ${visible ? 'reveal visible' : 'reveal'}`}>
          <div className="contact__info">
            {contactInfo.map((item) => (
              <div key={item.label} className="contact__info-item">
                <span className="contact__info-icon"><i className={item.icon}></i></span>
                <div>
                  <span className="contact__info-label">{item.label}</span>
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer" className="contact__info-value">{item.value}</a>
                  ) : (
                    <span className="contact__info-value">{item.value}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <form className="contact__form" onSubmit={handleSubmit}>
            <div className="contact__field">
              <label htmlFor="name">{settings.site_copy.contact_form_name_label}</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder={settings.site_copy.contact_form_name_placeholder} />
            </div>
            <div className="contact__field">
              <label htmlFor="email">{settings.site_copy.contact_form_email_label}</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder={settings.site_copy.contact_form_email_placeholder} />
            </div>
            <div className="contact__field">
              <label htmlFor="message">{settings.site_copy.contact_form_message_label}</label>
              <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} placeholder={settings.site_copy.contact_form_message_placeholder} />
            </div>
            <button type="submit" className="contact__submit">
              {sent ? (<><i className="fa-solid fa-check"></i> {settings.site_copy.contact_form_sent_label}</>) : (<><i className="fa-solid fa-paper-plane"></i> {settings.site_copy.contact_form_send_label}</>)}
            </button>
          </form>
        </div>
      </div>
      <style>{`
        .contact { display: grid; grid-template-columns: 1fr; gap: 32px; margin-top: 48px; }
        @media (min-width: 880px) { .contact { grid-template-columns: 0.8fr 1.2fr; gap: 48px; } }
        .contact__info { display: flex; flex-direction: column; gap: 20px; }
        .contact__info-item { display: flex; align-items: flex-start; gap: 16px; padding: 20px; background: var(--color-bg-card); border: 1px solid var(--color-border-soft); border-radius: var(--radius-md); transition: border-color var(--transition); }
        .contact__info-item:hover { border-color: var(--color-border); }
        .contact__info-icon { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-sm); background: var(--color-accent-soft); color: var(--color-accent); font-size: 1rem; flex-shrink: 0; }
        .contact__info-label { display: block; font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.04em; font-weight: 500; margin-bottom: 2px; }
        .contact__info-value { display: block; font-size: 0.9375rem; color: var(--color-text); font-weight: 500; word-break: break-word; }
        .contact__form { background: var(--color-bg-card); border: 1px solid var(--color-border-soft); border-radius: var(--radius-lg); padding: 32px; display: flex; flex-direction: column; gap: 20px; }
        .contact__field { display: flex; flex-direction: column; gap: 8px; }
        .contact__field label { font-size: 0.8125rem; font-weight: 500; color: var(--color-text-secondary); }
        .contact__field input, .contact__field textarea { padding: 12px 16px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: var(--color-bg); color: var(--color-text); font-family: var(--font-sans); font-size: 0.9375rem; transition: border-color var(--transition), box-shadow var(--transition); resize: vertical; }
        .contact__field input::placeholder, .contact__field textarea::placeholder { color: var(--color-text-muted); }
        .contact__field input:focus, .contact__field textarea:focus { outline: none; border-color: var(--color-accent); box-shadow: 0 0 0 3px var(--color-accent-soft); }
        .contact__submit { display: inline-flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 24px; border-radius: var(--radius-md); background: var(--color-accent); color: #fff; font-size: 0.9375rem; font-weight: 500; transition: all var(--transition); }
        .contact__submit:hover { background: var(--color-accent-hover); transform: translateY(-2px); box-shadow: var(--shadow-glow); }
      `}</style>
    </section>
  )
}
