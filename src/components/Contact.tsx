import { useState } from 'react'
import { useReveal } from '../hooks/useReveal'
import type { SiteSettings } from '../lib/types'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { TurnstileWidget } from './TurnstileWidget'

interface ContactProps {
  settings: SiteSettings
}

export function Contact({ settings }: ContactProps) {
  const { ref, visible } = useReveal<HTMLDivElement>()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [website, setWebsite] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaUnavailable, setCaptchaUnavailable] = useState(false)
  const sentLabel = settings.site_copy.contact_form_sent_label === 'Message prêt à être envoyé'
    ? 'Message envoyé avec succès'
    : settings.site_copy.contact_form_sent_label

  const mailtoUrl = () => {
    const subject = encodeURIComponent(`${settings.site_copy.contact_email_subject_prefix} ${name || settings.site_copy.contact_email_visitor_label}`)
    const body = encodeURIComponent(`${settings.site_copy.contact_email_name_prefix}: ${name}\n${settings.site_copy.contact_email_address_prefix}: ${email}\n\n${message}`)
    return `mailto:${settings.contact_email}?subject=${subject}&body=${body}`
  }

  const useMailtoFallback = (reason: string) => {
    setSendError(reason)
    window.location.assign(mailtoUrl())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSendError(null)
    setSent(false)
    if (!isSupabaseConfigured) {
      setSendError('L’envoi direct n’est pas disponible. Utilisez le lien de secours par e-mail.')
      return
    }
    if (settings.security_captcha_enabled && (!settings.turnstile_site_key || !captchaToken)) {
      setSendError(settings.turnstile_site_key
        ? 'Terminez la vérification CAPTCHA avant l’envoi.'
        : 'La vérification anti-robot n’est pas encore configurée. Utilisez le lien e-mail de secours.')
      return
    }

    setSending(true)
    try {
      const { data, error } = await supabase.functions.invoke('contact-message', {
        body: {
          name,
          email,
          message,
          captchaToken,
          ...(settings.security_honeypot_enabled ? { website } : {}),
        },
      })
      if (error) {
        const context = (error as { context?: Response }).context
        const status = context?.status
        const payload = context ? await context.clone().json().catch(() => null) as { error?: string; fallback?: boolean } | null : null
        if (payload?.fallback) {
          useMailtoFallback(payload.error || 'Le service d’envoi est indisponible après deux tentatives. Votre message est repris dans votre application e-mail.')
          return
        }
        if (status !== undefined) {
          throw new Error(payload?.error || 'La vérification de sécurité a échoué. Vérifiez le CAPTCHA et réessayez.')
        }
        useMailtoFallback('Le service direct est momentanément indisponible. Votre message est repris dans votre application e-mail.')
        return
      }
      if (data?.fallback) {
        useMailtoFallback(data.error || 'Le service d’envoi est indisponible après deux tentatives. Votre message est repris dans votre application e-mail.')
        return
      }
      if (!data?.ok) throw new Error(data?.error || 'Le message n’a pas pu être envoyé.')
      setSent(true)
      setName('')
      setEmail('')
      setMessage('')
      setWebsite('')
      setCaptchaToken(null)
    } catch (error) {
      console.error('Direct contact message failed.', error)
      setSendError(error instanceof Error ? error.message : 'L’envoi direct a échoué. Utilisez le lien de secours par e-mail.')
    } finally {
      setSending(false)
    }
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
            {settings.security_honeypot_enabled && <div className="contact__honeypot" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>}
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
            {settings.security_captcha_enabled && settings.turnstile_site_key && (
              <div className="contact__captcha">
                <TurnstileWidget
                  siteKey={settings.turnstile_site_key}
                  onToken={(token) => { setCaptchaToken(token); setCaptchaUnavailable(false) }}
                  onError={() => { setCaptchaToken(null); setCaptchaUnavailable(true) }}
                />
                {captchaUnavailable && <span className="contact__delivery-error">La vérification CAPTCHA est indisponible. Utilisez le lien e-mail de secours.</span>}
              </div>
            )}
            {settings.security_captcha_enabled && !settings.turnstile_site_key && (
              <p className="contact__delivery-error" role="status">La vérification anti-robot est activée mais n’est pas configurée. L’envoi direct est bloqué ; le lien e-mail de secours reste disponible.</p>
            )}
            <button type="submit" className="contact__submit" disabled={sending || (settings.security_captcha_enabled && (!settings.turnstile_site_key || !captchaToken || captchaUnavailable))}>
              {sending ? <><i className="fa-solid fa-spinner fa-spin"></i> Envoi…</> : sent ? (<><i className="fa-solid fa-check"></i> {sentLabel}</>) : (<><i className="fa-solid fa-paper-plane"></i> {settings.site_copy.contact_form_send_label}</>)}
            </button>
            <p className="contact__delivery-status" aria-live="polite">
              {sendError && <span className="contact__delivery-error">{sendError}</span>}
              {sent && <span className="contact__delivery-success">Message envoyé. Merci de m’avoir contacté.</span>}
              <a href={mailtoUrl()} className="contact__fallback-link">{settings.site_copy.contact_form_mailto_fallback}</a>
            </p>
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
        .contact__honeypot { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
        .contact__field { display: flex; flex-direction: column; gap: 8px; }
        .contact__field label { font-size: 0.8125rem; font-weight: 500; color: var(--color-text-secondary); }
        .contact__field input, .contact__field textarea { padding: 12px 16px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: var(--color-bg); color: var(--color-text); font-family: var(--font-sans); font-size: 0.9375rem; transition: border-color var(--transition), box-shadow var(--transition); resize: vertical; }
        .contact__field input::placeholder, .contact__field textarea::placeholder { color: var(--color-text-muted); }
        .contact__field input:focus, .contact__field textarea:focus { outline: none; border-color: var(--color-accent); box-shadow: 0 0 0 3px var(--color-accent-soft); }
        .contact__submit { display: inline-flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 24px; border-radius: var(--radius-md); background: var(--color-accent); color: #fff; font-size: 0.9375rem; font-weight: 500; transition: all var(--transition); }
        .contact__submit:hover { background: var(--color-accent-hover); transform: translateY(-2px); box-shadow: var(--shadow-glow); }
        .contact__submit:disabled { opacity: 0.65; cursor: wait; }
        .contact__delivery-status { display: flex; flex-direction: column; gap: 8px; color: var(--color-text-muted); font-size: 0.8125rem; }
        .contact__delivery-error { color: var(--color-error); }
        .contact__delivery-success { color: var(--color-success); }
        .contact__captcha { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; }
        .contact__fallback-link { color: var(--color-text-secondary); text-decoration: underline; text-underline-offset: 3px; }
        .contact__fallback-link:hover { color: var(--color-accent); }
      `}</style>
    </section>
  )
}
