import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSettings } from '../hooks/useSettings'
import { updateSettings } from '../lib/settings'
import { verifySudoPassword, type AuthResult } from '../lib/auth'
import { sortAchievementsWithSourceIndex } from '../lib/achievements'
import type { SiteSettings, EducationItem, Achievement } from '../lib/types'
import type { SiteCopy } from '../lib/siteCopy'
import { SUPPORTED_LANGUAGES, type Language } from '../lib/locales'
import { uploadPortfolioPhoto, validatePortfolioPhoto } from '../lib/portfolioPhotos'

type AdminSectionId = 'language' | 'appearance' | 'copy' | 'hero' | 'about' | 'skills' | 'education' | 'achievements' | 'contact' | 'social'
type SudoAction = 'save' | 'photo-upload'

const ADMIN_SECTIONS: Array<{ id: AdminSectionId; label: string; icon: string }> = [
  { id: 'language', label: 'Langue', icon: 'fa-solid fa-language' },
  { id: 'appearance', label: 'Photo', icon: 'fa-solid fa-image' },
  { id: 'copy', label: 'Textes du site', icon: 'fa-solid fa-pen-to-square' },
  { id: 'hero', label: 'Accueil', icon: 'fa-solid fa-house' },
  { id: 'about', label: 'À propos', icon: 'fa-solid fa-user' },
  { id: 'skills', label: 'Compétences', icon: 'fa-solid fa-code' },
  { id: 'education', label: 'Formation', icon: 'fa-solid fa-graduation-cap' },
  { id: 'achievements', label: 'Réalisations', icon: 'fa-solid fa-trophy' },
  { id: 'contact', label: 'Contact', icon: 'fa-solid fa-envelope' },
  { id: 'social', label: 'Réseaux sociaux', icon: 'fa-solid fa-share-nodes' },
]

const draftStorageKey = (email: string) => `hmb-portfolio-admin-draft:${email.toLowerCase()}`

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableSerialize(record[key])}`).join(',')}}`
  }
  return JSON.stringify(value) ?? 'null'
}

export function AdminDashboard() {
  const { email, signOut } = useAuth()
  const { settings, loading, reload, isFallback, loadError } = useSettings()
  const navigate = useNavigate()
  const [form, setForm] = useState<SiteSettings | null>(null)
  const [draftReady, setDraftReady] = useState(false)
  const [draftRestored, setDraftRestored] = useState(false)
  const [activeSection, setActiveSection] = useState<AdminSectionId>('language')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveNotice, setSaveNotice] = useState<string | null>(null)
  const [sudoOpen, setSudoOpen] = useState(false)
  const [sudoPassword, setSudoPassword] = useState('')
  const [sudoError, setSudoError] = useState<string | null>(null)
  const [sudoVerifying, setSudoVerifying] = useState(false)
  const [sudoAction, setSudoAction] = useState<SudoAction>('save')
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null)
  const [photoMode, setPhotoMode] = useState<'url' | 'upload'>('url')
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!settings || !email || draftReady) return
    let restored = false
    try {
      const rawDraft = localStorage.getItem(draftStorageKey(email))
      if (rawDraft) {
        const parsed = JSON.parse(rawDraft) as { form?: Partial<SiteSettings> }
        if (parsed.form && typeof parsed.form === 'object') {
          setForm({
            ...settings,
            ...parsed.form,
            site_copy: { ...settings.site_copy, ...parsed.form.site_copy },
          })
          restored = true
        }
      }
    } catch (error) {
      console.warn('Unable to restore the local admin draft.', error)
    }
    if (!restored) setForm({ ...settings })
    const restoredPhoto = restored ? (() => {
      try {
        const parsed = JSON.parse(localStorage.getItem(draftStorageKey(email)) || '{}') as { form?: Partial<SiteSettings> }
        return parsed.form?.hero_photo_url ?? settings.hero_photo_url
      } catch {
        return settings.hero_photo_url
      }
    })() : settings.hero_photo_url
    setPhotoMode(restoredPhoto.includes('/storage/v1/object/public/portfolio-photos/') ? 'upload' : 'url')
    setDraftRestored(restored)
    setDraftReady(true)
  }, [settings, email, draftReady])

  useEffect(() => {
    if (!draftReady || !email || !form) return
    try {
      localStorage.setItem(draftStorageKey(email), JSON.stringify({ savedAt: new Date().toISOString(), form }))
    } catch (error) {
      console.warn('Unable to save the local admin draft.', error)
    }
  }, [draftReady, email, form])

  const handleSignOut = () => {
    signOut()
    navigate('/admin')
  }

  const update = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setForm((prev) => prev ? { ...prev, [key]: value } : prev)
  }

  const updateCopy = <K extends keyof SiteCopy>(key: K, value: SiteCopy[K]) => {
    setForm((prev) => prev ? { ...prev, site_copy: { ...prev.site_copy, [key]: value } } : prev)
  }

  const handleSaveClick = (action: SudoAction = 'save') => {
    setSaveError(null)
    setSaveNotice(null)
    if (isFallback) {
      setSaveError(`Enregistrement désactivé : les réglages Supabase n’ont pas pu être chargés${loadError ? ` (${loadError})` : ''}. Réessayez de recharger la page avant de modifier le contenu.`)
      return
    }
    if (action === 'save' && settings && form && stableSerialize(form) === stableSerialize(settings)) {
      setSaveNotice('Aucune modification à enregistrer.')
      return
    }
    setSudoAction(action)
    setSudoOpen(true)
    setSudoPassword('')
    setSudoError(null)
  }

  const handleSave = async () => {
    if (!form) return
    setSudoVerifying(true)
    setSudoError(null)
    let result: AuthResult
    try {
      result = await verifySudoPassword(sudoPassword)
    } catch (error) {
      setSudoVerifying(false)
      setSudoError(error instanceof Error ? `Vérification Supabase impossible : ${error.message}` : 'Vérification Supabase impossible. Vérifiez la connexion et réessayez.')
      return
    }
    if (!result.success) {
      setSudoVerifying(false)
      setSudoError(result.error || 'Vérification impossible')
      return
    }
    setSaving(true)
    try {
      if (sudoAction === 'photo-upload') {
        if (!pendingPhoto) throw new Error('Choisissez une photo avant de continuer.')
        setPhotoUploading(true)
        const photoUrl = await uploadPortfolioPhoto(pendingPhoto)
        update('hero_photo_url', photoUrl)
        setPhotoMode('upload')
        setPendingPhoto(null)
        setPhotoError(null)
        setSaveNotice('Photo téléversée. Cliquez sur « Enregistrer les modifications » pour la publier sur le site.')
        setTimeout(() => setSaveNotice(null), 7000)
        setSudoOpen(false)
        setSudoPassword('')
        return
      }
      await updateSettings(form)
      if (email) localStorage.removeItem(draftStorageKey(email))
      setDraftRestored(false)
      setSaveNotice(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      await reload()
      setSudoOpen(false)
      setSudoPassword('')
    } catch (err) {
      console.error('settings update failed', err)
      const message = err instanceof Error ? err.message : "Échec de l'enregistrement. Réessayez."
      if (sudoAction === 'photo-upload') {
        setPhotoError(message)
        setSudoError(message)
      }
      else {
        setSaveError(message)
        setTimeout(() => setSaveError(null), 5000)
      }
    } finally {
      setSaving(false)
      setPhotoUploading(false)
      setSudoVerifying(false)
    }
  }

  const closeSudo = () => {
    if (!sudoVerifying && !saving) {
      setSudoOpen(false)
      setSudoPassword('')
      setSudoError(null)
      if (sudoAction === 'photo-upload') setPendingPhoto(null)
    }
  }

  const handlePhotoSelection = (file: File | undefined) => {
    if (!file) return
    if (isFallback) {
      setPhotoError('Téléversement désactivé : les réglages Supabase n’ont pas pu être chargés. Rechargez la page lorsque la connexion sera rétablie.')
      if (photoInputRef.current) photoInputRef.current.value = ''
      return
    }
    const validationError = validatePortfolioPhoto(file)
    if (validationError) {
      setPhotoError(validationError)
      if (photoInputRef.current) photoInputRef.current.value = ''
      return
    }
    setPhotoError(null)
    setPendingPhoto(file)
    handleSaveClick('photo-upload')
  }

  const sortedAchievements = form ? sortAchievementsWithSourceIndex(form.achievements) : []

  if (loading || !form || !draftReady) {
    return (
      <div className="admin-loading">
        <i className="fa-solid fa-spinner fa-spin"></i>
        <p>Chargement...</p>
      </div>
    )
  }

  return (
    <div className="admin">
      <header className="admin__header">
        <div className="admin__header-inner">
          <div className="admin__header-left">
            <span className="admin__logo">BH</span>
            <div>
              <h1 className="admin__title">Tableau de bord</h1>
              <p className="admin__user">{email}</p>
            </div>
          </div>
          <div className="admin__header-actions">
            <Link to="/" className="admin__btn admin__btn--ghost">
              <i className="fa-solid fa-eye"></i> Voir le site
            </Link>
            <button onClick={handleSignOut} className="admin__btn admin__btn--ghost">
              <i className="fa-solid fa-right-from-bracket"></i> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="admin__main">
        <div className="admin__workspace">
          <aside className="admin__sidebar" aria-label="Sections du tableau de bord">
            <p className="admin__sidebar-label">Gestion du portfolio</p>
            {ADMIN_SECTIONS.map((section) => (
              <button
                type="button"
                key={section.id}
                className={`admin__sidebar-link${activeSection === section.id ? ' admin__sidebar-link--active' : ''}`}
                aria-current={activeSection === section.id ? 'page' : undefined}
                onClick={() => setActiveSection(section.id)}
              >
                <i className={section.icon}></i><span>{section.label}</span>
              </button>
            ))}
          </aside>

          <div className="admin__content">
          {isFallback && <div className="admin__data-warning" role="alert">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>Les données affichées sont des valeurs de secours, pas celles chargées depuis Supabase. L’enregistrement et le téléversement sont désactivés pour éviter d’écraser votre contenu.</span>
          </div>}
          <div className="admin__section-heading">
            <div>
              <p className="admin__eyebrow">Éditeur du portfolio</p>
              <h2>{ADMIN_SECTIONS.find((section) => section.id === activeSection)?.label}</h2>
            </div>
            <span className={`admin__draft-status${draftRestored ? ' admin__draft-status--restored' : ''}`}>
              <i className="fa-solid fa-cloud-arrow-down"></i>
              {draftRestored ? 'Brouillon restauré' : 'Brouillon sauvegardé sur cet appareil'}
            </span>
          </div>

          <section className="admin__section" hidden={activeSection !== 'language'}>
            <h2 className="admin__section-title"><i className="fa-solid fa-language"></i> Langues du portfolio</h2>
            <div className="admin__field">
              <label htmlFor="default-language">Langue affichée par défaut aux visiteurs</label>
              <select
                id="default-language"
                className="admin__input"
                value={form.default_language}
                onChange={(e) => update('default_language', e.target.value as Language)}
              >
                {SUPPORTED_LANGUAGES.map((language) => <option key={language.code} value={language.code}>{language.flag} {language.nativeName}</option>)}
              </select>
            </div>
            <p className="admin__section-hint">Modifiez le contenu une seule fois en français dans les sections ci-dessous. Le sélecteur du site le traduit à la demande dans les dix langues disponibles. La traduction automatique peut nécessiter une relecture.</p>
          </section>

          {/* Photo */}
          <section className="admin__section" hidden={activeSection !== 'appearance'}>
            <h2 className="admin__section-title"><i className="fa-solid fa-image"></i> Photo d'accueil</h2>
            <div className="admin__photo-tabs" role="group" aria-label="Source de la photo">
              <button type="button" className={`admin__photo-tab${photoMode === 'url' ? ' admin__photo-tab--active' : ''}`} aria-pressed={photoMode === 'url'} onClick={() => setPhotoMode('url')}>
                <i className="fa-solid fa-link"></i> Utiliser une URL
              </button>
              <button type="button" className={`admin__photo-tab${photoMode === 'upload' ? ' admin__photo-tab--active' : ''}`} aria-pressed={photoMode === 'upload'} onClick={() => setPhotoMode('upload')}>
                <i className="fa-solid fa-cloud-arrow-up"></i> Téléverser une photo
              </button>
            </div>
            {photoMode === 'url' ? (
              <div className="admin__field">
                <label htmlFor="hero-photo-url">Adresse de la photo d’accueil</label>
                <input id="hero-photo-url" className="admin__input" type="url" value={form.hero_photo_url.startsWith(`${import.meta.env.BASE_URL}ma_photo.WebP`) ? '' : form.hero_photo_url} onChange={(e) => update('hero_photo_url', e.target.value)} placeholder="https://… (vide = photo par défaut)" />
                <p className="admin__section-hint">La photo doit être accessible publiquement par URL HTTPS.</p>
              </div>
            ) : (
              <div className="admin__field">
                <label htmlFor="hero-photo-file">Choisir une photo depuis votre appareil</label>
                <input
                  ref={photoInputRef}
                  id="hero-photo-file"
                  className="admin__file-input"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.gif,.avif,image/jpeg,image/png,image/webp,image/gif,image/avif"
                  onChange={(event) => handlePhotoSelection(event.target.files?.[0])}
                />
                <button type="button" className="admin__upload-btn" onClick={() => photoInputRef.current?.click()} disabled={photoUploading || saving || isFallback}>
                  {photoUploading ? <><i className="fa-solid fa-spinner fa-spin"></i> Téléversement…</> : <><i className="fa-solid fa-folder-open"></i> Parcourir les photos</>}
                </button>
                <p className="admin__section-hint">Formats acceptés : JPG/JPEG, PNG, WebP, GIF et AVIF. Taille maximale : 10 Mo. Le téléversement demande une vérification sudo ; cliquez ensuite sur « Enregistrer les modifications » pour publier la nouvelle photo.</p>
              </div>
            )}
            {photoError && <p className="admin__upload-error" role="alert"><i className="fa-solid fa-circle-exclamation"></i>{photoError}</p>}
            {form.hero_photo_url && (
              <div className="admin__photo-preview">
                <img src={form.hero_photo_url} alt="Aperçu de la photo d’accueil" />
                <span>Aperçu de la photo enregistrée ou en brouillon</span>
              </div>
            )}
          </section>

          <section className="admin__section" hidden={activeSection !== 'copy'}>
            <h2 className="admin__section-title"><i className="fa-solid fa-pen-to-square"></i> Textes et éléments visibles</h2>
            <p className="admin__section-hint">Modifiez ici les titres, descriptions, libellés, points forts et certificats affichés sur le site.</p>

            <details className="admin__copy-group" open>
              <summary>Navigation et accueil</summary>
              <div className="admin__grid-2">
                <div className="admin__field">
                  <label>Initiales de la marque</label>
                  <input className="admin__input" value={form.site_copy.navbar_brand_mark} onChange={(e) => updateCopy('navbar_brand_mark', e.target.value)} />
                </div>
                <div className="admin__field">
                  <label>Nom dans la navigation</label>
                  <input className="admin__input" value={form.site_copy.navbar_brand_name} onChange={(e) => updateCopy('navbar_brand_name', e.target.value)} />
                </div>
              </div>
              <div className="admin__grid-2">
                {form.site_copy.nav_links.map((item, index) => (
                  <div className="admin__field" key={item.id}>
                    <label>Menu : {item.id}</label>
                    <input className="admin__input" value={item.label} onChange={(e) => {
                      const links = [...form.site_copy.nav_links]
                      links[index] = { ...links[index], label: e.target.value }
                      updateCopy('nav_links', links)
                    }} />
                  </div>
                ))}
              </div>
              <div className="admin__field">
                <label>Bouton de contact sur l’accueil</label>
                <input className="admin__input" value={form.site_copy.hero_contact_cta} onChange={(e) => updateCopy('hero_contact_cta', e.target.value)} />
              </div>
            </details>

            <details className="admin__copy-group">
              <summary>À propos et points forts</summary>
              <div className="admin__grid-2">
                <div className="admin__field">
                  <label>Étiquette de section</label>
                  <input className="admin__input" value={form.site_copy.about_label} onChange={(e) => updateCopy('about_label', e.target.value)} />
                </div>
                <div className="admin__field">
                  <label>Titre</label>
                  <input className="admin__input" value={form.site_copy.about_heading} onChange={(e) => updateCopy('about_heading', e.target.value)} />
                </div>
              </div>
              <div className="admin__grid-2">
                {([
                  ['about_location_label', 'Libellé localisation'],
                  ['about_education_label', 'Libellé études'],
                  ['about_languages_label', 'Libellé langues'],
                  ['about_email_label', 'Libellé email'],
                ] as const).map(([key, label]) => (
                  <div className="admin__field" key={key}>
                    <label>{label}</label>
                    <input className="admin__input" value={form.site_copy[key]} onChange={(e) => updateCopy(key, e.target.value)} />
                  </div>
                ))}
              </div>
              <h3 className="admin__copy-subtitle">Points forts</h3>
              {form.site_copy.about_highlights.map((item, index) => (
                <div className="admin__sub-card" key={index}>
                  <div className="admin__sub-card-header">
                    <span>Point fort {index + 1}</span>
                    <button type="button" className="admin__remove-btn" onClick={() => updateCopy('about_highlights', form.site_copy.about_highlights.filter((_, i) => i !== index))} aria-label={`Supprimer le point fort ${index + 1}`}><i className="fa-solid fa-trash"></i></button>
                  </div>
                  <div className="admin__grid-2">
                    <div className="admin__field">
                      <label>Texte</label>
                      <input className="admin__input" value={item.label} onChange={(e) => {
                        const highlights = [...form.site_copy.about_highlights]
                        highlights[index] = { ...item, label: e.target.value }
                        updateCopy('about_highlights', highlights)
                      }} />
                    </div>
                    <div className="admin__field">
                      <label>Icône Font Awesome</label>
                      <input className="admin__input" value={item.icon} onChange={(e) => {
                        const highlights = [...form.site_copy.about_highlights]
                        highlights[index] = { ...item, icon: e.target.value }
                        updateCopy('about_highlights', highlights)
                      }} placeholder="fa-solid fa-code" />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" className="admin__add-btn" onClick={() => updateCopy('about_highlights', [...form.site_copy.about_highlights, { label: '', icon: 'fa-solid fa-code' }])}><i className="fa-solid fa-plus"></i> Ajouter un point fort</button>
            </details>

            <details className="admin__copy-group">
              <summary>Compétences, formation et réalisations</summary>
              {([
                ['skills_label', 'Étiquette compétences'],
                ['skills_heading', 'Titre compétences'],
                ['skills_description', 'Description compétences'],
                ['skills_mastered_title', 'Titre compétences maîtrisées'],
                ['skills_mastered_status', 'Badge compétences maîtrisées'],
                ['skills_progress_title', 'Titre compétences en progression'],
                ['skills_progress_status', 'Badge compétences en progression'],
                ['education_label', 'Étiquette formation'],
                ['education_heading', 'Titre formation'],
                ['education_description', 'Description formation'],
                ['work_label', 'Étiquette réalisations'],
                ['work_heading', 'Titre réalisations'],
                ['work_description', 'Description réalisations'],
              ] as const).map(([key, label]) => (
                <div className="admin__field" key={key}>
                  <label>{label}</label>
                  {key.endsWith('_description') ? (
                    <textarea className="admin__textarea" rows={2} value={form.site_copy[key]} onChange={(e) => updateCopy(key, e.target.value)} />
                  ) : (
                    <input className="admin__input" value={form.site_copy[key]} onChange={(e) => updateCopy(key, e.target.value)} />
                  )}
                </div>
              ))}
            </details>

            <details className="admin__copy-group">
              <summary>Certificats</summary>
              <div className="admin__field">
                <label>Titre du bloc</label>
                <input className="admin__input" value={form.site_copy.certificates_title} onChange={(e) => updateCopy('certificates_title', e.target.value)} />
              </div>
              <p className="admin__section-hint">Pour une image dans le dossier public, indiquez son nom (ex. certificat.WebP). Vous pouvez aussi coller une URL publique.</p>
              {form.site_copy.certificates.map((item, index) => (
                <div className="admin__sub-card" key={index}>
                  <div className="admin__sub-card-header">
                    <span>Certificat {index + 1}</span>
                    <button type="button" className="admin__remove-btn" onClick={() => updateCopy('certificates', form.site_copy.certificates.filter((_, i) => i !== index))} aria-label={`Supprimer le certificat ${index + 1}`}><i className="fa-solid fa-trash"></i></button>
                  </div>
                  {([
                    ['title', 'Titre'],
                    ['image_url', 'URL ou fichier image'],
                    ['alt', 'Texte alternatif'],
                  ] as const).map(([key, label]) => (
                    <div className="admin__field" key={key}>
                      <label>{label}</label>
                      <input className="admin__input" value={item[key]} onChange={(e) => {
                        const certificates = [...form.site_copy.certificates]
                        certificates[index] = { ...item, [key]: e.target.value }
                        updateCopy('certificates', certificates)
                      }} />
                    </div>
                  ))}
                </div>
              ))}
              <button type="button" className="admin__add-btn" onClick={() => updateCopy('certificates', [...form.site_copy.certificates, { title: '', image_url: '', alt: '' }])}><i className="fa-solid fa-plus"></i> Ajouter un certificat</button>
            </details>

            <details className="admin__copy-group">
              <summary>Contact et pied de page</summary>
              {([
                ['contact_label', 'Étiquette contact'],
                ['contact_heading', 'Titre contact'],
                ['contact_description', 'Description contact'],
                ['contact_email_label', 'Libellé email'],
                ['contact_phone_label', 'Libellé téléphone'],
                ['contact_location_label', 'Libellé localisation'],
                ['contact_form_name_label', 'Libellé champ nom'],
                ['contact_form_email_label', 'Libellé champ email'],
                ['contact_form_message_label', 'Libellé champ message'],
                ['contact_form_name_placeholder', 'Exemple champ nom'],
                ['contact_form_email_placeholder', 'Exemple champ email'],
                ['contact_form_message_placeholder', 'Exemple champ message'],
                ['contact_form_send_label', 'Bouton d’envoi'],
                ['contact_form_sent_label', 'Confirmation après clic'],
                ['footer_brand_mark', 'Initiales du pied de page'],
                ['footer_credit_prefix', 'Texte de crédit du pied de page'],
                ['language_selector_label', 'Libellé accessible du sélecteur de langue'],
                ['theme_toggle_label', 'Libellé du bouton de thème'],
                ['menu_toggle_label', 'Libellé du menu mobile'],
                ['certificate_enlarge_label', 'Libellé d’agrandissement des certificats'],
                ['contact_email_subject_prefix', 'Début de l’objet du courriel'],
                ['contact_email_name_prefix', 'Libellé du nom dans le courriel'],
                ['contact_email_address_prefix', 'Libellé de l’adresse dans le courriel'],
                ['contact_email_visitor_label', 'Texte si le nom du visiteur est vide'],
              ] as const).map(([key, label]) => (
                <div className="admin__field" key={key}>
                  <label>{label}</label>
                  {key === 'contact_description' || key === 'contact_form_message_placeholder' ? (
                    <textarea className="admin__textarea" rows={2} value={form.site_copy[key]} onChange={(e) => updateCopy(key, e.target.value)} />
                  ) : (
                    <input className="admin__input" value={form.site_copy[key]} onChange={(e) => updateCopy(key, e.target.value)} />
                  )}
                </div>
              ))}
            </details>
          </section>

          {/* Hero */}
          <section className="admin__section" hidden={activeSection !== 'hero'}>
            <h2 className="admin__section-title"><i className="fa-solid fa-house"></i> Section d'accueil</h2>
            <div className="admin__field">
              <label>Nom affiché</label>
              <input className="admin__input" type="text" value={form.hero_name} onChange={(e) => update('hero_name', e.target.value)} />
            </div>
            <div className="admin__field">
              <label>Sous-titre / accroche</label>
              <textarea className="admin__textarea" rows={3} value={form.hero_subtitle} onChange={(e) => update('hero_subtitle', e.target.value)} />
            </div>
            <div className="admin__field">
              <label>Statut (badge de disponibilité)</label>
              <input className="admin__input" type="text" value={form.hero_status} onChange={(e) => update('hero_status', e.target.value)} />
            </div>
          </section>

          {/* About */}
          <section className="admin__section" hidden={activeSection !== 'about'}>
            <h2 className="admin__section-title"><i className="fa-solid fa-user"></i> À propos</h2>
            <div className="admin__field">
              <label>Texte de présentation (séparez les paragraphes par une ligne vide)</label>
              <textarea className="admin__textarea" rows={8} value={form.about_text} onChange={(e) => update('about_text', e.target.value)} />
            </div>
            <div className="admin__grid-2">
              <div className="admin__field">
                <label>Localisation</label>
                <input className="admin__input" type="text" value={form.about_location} onChange={(e) => update('about_location', e.target.value)} />
              </div>
              <div className="admin__field">
                <label>Études</label>
                <input className="admin__input" type="text" value={form.about_education} onChange={(e) => update('about_education', e.target.value)} />
              </div>
            </div>
            <div className="admin__grid-2">
              <div className="admin__field">
                <label>Langues</label>
                <input className="admin__input" type="text" value={form.about_languages} onChange={(e) => update('about_languages', e.target.value)} />
              </div>
              <div className="admin__field">
                <label>Email (affiché dans À propos)</label>
                <input className="admin__input" type="email" value={form.about_email} onChange={(e) => update('about_email', e.target.value)} />
              </div>
            </div>
          </section>

          {/* Skills */}
          <section className="admin__section" hidden={activeSection !== 'skills'}>
            <h2 className="admin__section-title"><i className="fa-solid fa-code"></i> Compétences</h2>
            <p className="admin__section-hint">Séparez chaque compétence par une virgule.</p>
            <div className="admin__field">
              <label>Compétences maîtrisées</label>
              <textarea className="admin__textarea" rows={2} value={form.skills_mastered} onChange={(e) => update('skills_mastered', e.target.value)} />
            </div>
            <div className="admin__field">
              <label>Compétences en progression</label>
              <textarea className="admin__textarea" rows={2} value={form.skills_progress} onChange={(e) => update('skills_progress', e.target.value)} />
            </div>
          </section>

          {/* Education */}
          <section className="admin__section" hidden={activeSection !== 'education'}>
            <h2 className="admin__section-title"><i className="fa-solid fa-graduation-cap"></i> Formation et expérience</h2>
            {form.education_items.map((item, i) => (
              <div key={i} className="admin__sub-card">
                <div className="admin__sub-card-header">
                  <span>Élément {i + 1}</span>
                  <button onClick={() => {
                    const items = form.education_items.filter((_, idx) => idx !== i)
                    update('education_items', items)
                  }} className="admin__remove-btn"><i className="fa-solid fa-trash"></i></button>
                </div>
                <div className="admin__field">
                  <label>Période</label>
                  <input className="admin__input" type="text" value={item.period} onChange={(e) => {
                    const items = [...form.education_items]
                    items[i] = { ...items[i], period: e.target.value }
                    update('education_items', items)
                  }} />
                </div>
                <div className="admin__field">
                  <label>Titre</label>
                  <input className="admin__input" type="text" value={item.title} onChange={(e) => {
                    const items = [...form.education_items]
                    items[i] = { ...items[i], title: e.target.value }
                    update('education_items', items)
                  }} />
                </div>
                <div className="admin__field">
                  <label>Lieu</label>
                  <input className="admin__input" type="text" value={item.place} onChange={(e) => {
                    const items = [...form.education_items]
                    items[i] = { ...items[i], place: e.target.value }
                    update('education_items', items)
                  }} />
                </div>
                <div className="admin__field">
                  <label>Description</label>
                  <textarea className="admin__textarea" rows={2} value={item.description} onChange={(e) => {
                    const items = [...form.education_items]
                    items[i] = { ...items[i], description: e.target.value }
                    update('education_items', items)
                  }} />
                </div>
              </div>
            ))}
            <button onClick={() => {
              const newItem: EducationItem = { period: '', title: '', place: '', description: '' }
              update('education_items', [...form.education_items, newItem])
            }} className="admin__add-btn">
              <i className="fa-solid fa-plus"></i> Ajouter un élément
            </button>
          </section>

          {/* Achievements */}
          <section className="admin__section" hidden={activeSection !== 'achievements'}>
            <h2 className="admin__section-title"><i className="fa-solid fa-trophy"></i> Réalisations</h2>
            <button type="button" onClick={() => {
              const newItem: Achievement = {
                year: String(new Date().getFullYear()),
                title: '',
                description: '',
                link_label: '',
                link_url: '',
              }
              update('achievements', [newItem, ...form.achievements])
            }} className="admin__add-btn admin__add-btn--top">
              <i className="fa-solid fa-plus"></i> Ajouter une réalisation
            </button>
            {sortedAchievements.map(({ item, index }, i) => (
              <div key={i} className="admin__sub-card">
                <div className="admin__sub-card-header">
                  <span>Réalisation {i + 1} — {item.year || 'Année non précisée'}</span>
                  <button onClick={() => {
                    const items = form.achievements.filter((_, idx) => idx !== index)
                    update('achievements', items)
                  }} className="admin__remove-btn"><i className="fa-solid fa-trash"></i></button>
                </div>
                <div className="admin__field">
                  <label>Année</label>
                  <input className="admin__input" type="text" value={item.year} onChange={(e) => {
                    const items = [...form.achievements]
                    items[index] = { ...items[index], year: e.target.value }
                    update('achievements', items)
                  }} />
                </div>
                <div className="admin__field">
                  <label>Titre</label>
                  <input className="admin__input" type="text" value={item.title} onChange={(e) => {
                    const items = [...form.achievements]
                    items[index] = { ...items[index], title: e.target.value }
                    update('achievements', items)
                  }} />
                </div>
                <div className="admin__field">
                  <label>Description</label>
                  <textarea className="admin__textarea" rows={2} value={item.description} onChange={(e) => {
                    const items = [...form.achievements]
                    items[index] = { ...items[index], description: e.target.value }
                    update('achievements', items)
                  }} />
                </div>
                <div className="admin__grid-2">
                  <div className="admin__field">
                    <label>Texte du lien</label>
                    <input className="admin__input" type="text" value={item.link_label} onChange={(e) => {
                      const items = [...form.achievements]
                      items[index] = { ...items[index], link_label: e.target.value }
                      update('achievements', items)
                    }} />
                  </div>
                  <div className="admin__field">
                    <label>URL du lien</label>
                    <input className="admin__input" type="url" value={item.link_url} onChange={(e) => {
                      const items = [...form.achievements]
                      items[index] = { ...items[index], link_url: e.target.value }
                      update('achievements', items)
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Contact */}
          <section className="admin__section" hidden={activeSection !== 'contact'}>
            <h2 className="admin__section-title"><i className="fa-solid fa-envelope"></i> Contact</h2>
            <div className="admin__field">
              <label>Email de contact</label>
              <input className="admin__input" type="email" value={form.contact_email} onChange={(e) => update('contact_email', e.target.value)} />
            </div>
            <div className="admin__field">
              <label>Téléphone</label>
              <input className="admin__input" type="text" value={form.contact_phone} onChange={(e) => update('contact_phone', e.target.value)} />
            </div>
            <div className="admin__field">
              <label>Localisation</label>
              <input className="admin__input" type="text" value={form.contact_location} onChange={(e) => update('contact_location', e.target.value)} />
            </div>
          </section>

          {/* Social Links */}
          <section className="admin__section" hidden={activeSection !== 'social'}>
            <h2 className="admin__section-title"><i className="fa-solid fa-share-nodes"></i> Réseaux sociaux</h2>
            <div className="admin__field">
              <label>LinkedIn</label>
              <input className="admin__input" type="url" value={form.linkedin_url} onChange={(e) => update('linkedin_url', e.target.value)} />
            </div>
            <div className="admin__field">
              <label>GitHub</label>
              <input className="admin__input" type="url" value={form.github_url} onChange={(e) => update('github_url', e.target.value)} />
            </div>
            <div className="admin__field">
              <label>X (Twitter)</label>
              <input className="admin__input" type="url" value={form.twitter_url} onChange={(e) => update('twitter_url', e.target.value)} />
            </div>
            <div className="admin__field">
              <label>WhatsApp</label>
              <input className="admin__input" type="url" value={form.whatsapp_url} onChange={(e) => update('whatsapp_url', e.target.value)} />
            </div>
          </section>

          {/* Save bar */}
          <div className="admin__save-bar">
            {saved && <span className="admin__saved"><i className="fa-solid fa-check"></i> Modifications enregistrées</span>}
            {saveNotice && <span className="admin__save-notice" role="status"><i className="fa-solid fa-circle-info"></i> {saveNotice}</span>}
            {saveError && <span className="admin__save-error"><i className="fa-solid fa-circle-exclamation"></i> {saveError}</span>}
            <button type="button" onClick={() => handleSaveClick()} className="admin__btn admin__btn--primary" disabled={saving || isFallback}>
              {saving ? <><i className="fa-solid fa-spinner fa-spin"></i> Enregistrement...</> : <><i className="fa-solid fa-floppy-disk"></i> Enregistrer les modifications</>}
            </button>
          </div>
          </div>
        </div>
      </main>

      {sudoOpen && (
        <div className="sudo-overlay" onClick={closeSudo}>
          <div className="sudo-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sudo-header">
              <span className="sudo-icon"><i className="fa-solid fa-shield-halved"></i></span>
              <div>
                <h3 className="sudo-title">{sudoAction === 'photo-upload' ? 'Autoriser le téléversement' : 'Vérification administrateur'}</h3>
                <p className="sudo-subtitle">{sudoAction === 'photo-upload' ? `Confirmez votre identité avant d’envoyer « ${pendingPhoto?.name ?? 'la photo'} » vers le stockage public du portfolio.` : 'Entrez votre mot de passe Supabase. Le mot de passe de votre compte Google ou GitHub ne fonctionne pas ici. Si vous n’avez pas de mot de passe Supabase, déconnectez-vous puis utilisez « Mot de passe oublié ? » sur la page de connexion pour en définir un.'}</p>
              </div>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave() }} className="sudo-form">
              <div className="sudo-field">
                <label htmlFor="sudo-pwd">Mot de passe</label>
                <input
                  id="sudo-pwd"
                  type="password"
                  value={sudoPassword}
                  onChange={(e) => setSudoPassword(e.target.value)}
                  required
                  autoFocus
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </div>
              {sudoError && <div className="sudo-error"><i className="fa-solid fa-circle-exclamation"></i> {sudoError}</div>}
              <div className="sudo-actions">
                <button type="button" onClick={closeSudo} className="sudo-cancel" disabled={sudoVerifying || saving}>Annuler</button>
                <button type="submit" className="sudo-confirm" disabled={sudoVerifying || saving || !sudoPassword}>
                  {sudoVerifying || saving ? <><i className="fa-solid fa-spinner fa-spin"></i> {sudoAction === 'photo-upload' ? 'Vérification et téléversement…' : 'Vérification...'}</> : <><i className="fa-solid fa-check"></i> {sudoAction === 'photo-upload' ? 'Autoriser le téléversement' : 'Confirmer et enregistrer'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin { min-height: 100vh; background: var(--color-bg); }
        .admin-loading { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: var(--color-text-secondary); font-size: 1.125rem; }
        .admin-loading i { font-size: 2rem; color: var(--color-accent); }
        .admin__header { position: sticky; top: 0; z-index: 100; background: color-mix(in srgb, var(--color-bg-elevated) 90%, transparent); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border-bottom: 1px solid var(--color-border-soft); }
        .admin__header-inner { max-width: 1280px; margin: 0 auto; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .admin__header-left { display: flex; align-items: center; gap: 12px; }
        .admin__logo { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-sm); background: var(--color-accent); color: #fff; font-weight: 700; font-size: 0.875rem; }
        .admin__title { font-size: 1.125rem; font-weight: 600; color: var(--color-text); }
        .admin__user { font-size: 0.75rem; color: var(--color-text-muted); }
        .admin__header-actions { display: flex; gap: 8px; }
        .admin__btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: var(--radius-sm); font-size: 0.8125rem; font-weight: 500; transition: all var(--transition); border: 1px solid transparent; }
        .admin__btn--ghost { color: var(--color-text-secondary); border-color: var(--color-border); }
        .admin__btn--ghost:hover { color: var(--color-text); border-color: var(--color-text-muted); }
        .admin__btn--primary { background: var(--color-accent); color: #fff; padding: 12px 24px; font-size: 0.875rem; }
        .admin__btn--primary:hover:not(:disabled) { background: var(--color-accent-hover); transform: translateY(-1px); box-shadow: var(--shadow-glow); }
        .admin__btn--primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .admin__main { max-width: 1280px; margin: 0 auto; padding: 32px 24px 80px; }
        .admin__workspace { display: grid; grid-template-columns: 230px minmax(0, 1fr); align-items: start; gap: 28px; }
        .admin__sidebar { position: sticky; top: 96px; display: flex; flex-direction: column; gap: 5px; padding: 14px; border: 1px solid var(--color-border-soft); border-radius: var(--radius-lg); background: var(--color-bg-card); box-shadow: var(--shadow-sm); }
        .admin__sidebar-label { padding: 8px 10px 12px; color: var(--color-text-muted); font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; }
        .admin__sidebar-link { display: flex; align-items: center; gap: 12px; width: 100%; padding: 11px 12px; border-radius: var(--radius-md); color: var(--color-text-secondary); font-size: 0.8125rem; font-weight: 500; text-align: left; transition: background-color var(--transition), color var(--transition), transform var(--transition); }
        .admin__sidebar-link i { width: 18px; color: var(--color-text-muted); text-align: center; }
        .admin__sidebar-link:hover { color: var(--color-text); background: var(--color-surface); }
        .admin__sidebar-link--active { color: var(--color-accent); background: var(--color-accent-soft); font-weight: 700; }
        .admin__sidebar-link--active i { color: var(--color-accent); }
        .admin__content { min-width: 0; display: flex; flex-direction: column; gap: 20px; }
        .admin__data-warning { display: flex; align-items: flex-start; gap: 10px; padding: 14px 16px; border: 1px solid var(--color-warning); border-radius: var(--radius-md); background: rgba(245,158,11,0.1); color: var(--color-warning); font-size: 0.875rem; line-height: 1.5; }
        .admin__section-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 4px 2px; }
        .admin__section-heading h2 { color: var(--color-text); font-size: clamp(1.35rem, 3vw, 1.8rem); }
        .admin__eyebrow { margin-bottom: 4px; color: var(--color-accent); font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
        .admin__draft-status { display: inline-flex; align-items: center; gap: 8px; color: var(--color-text-muted); font-size: 0.75rem; white-space: nowrap; }
        .admin__draft-status i { color: var(--color-success); }
        .admin__draft-status--restored { color: var(--color-accent); }
        .admin__section[hidden] { display: none !important; }
        .admin__section { background: var(--color-bg-card); border: 1px solid var(--color-border-soft); border-radius: var(--radius-lg); padding: 28px; }
        .admin__copy-group { border-top: 1px solid var(--color-border-soft); padding: 16px 0; }
        .admin__copy-group:last-child { padding-bottom: 0; }
        .admin__copy-group summary { color: var(--color-text); font-size: 0.9375rem; font-weight: 600; cursor: pointer; margin-bottom: 16px; }
        .admin__copy-group[open] summary { color: var(--color-accent); }
        .admin__copy-subtitle { color: var(--color-text); font-size: 0.875rem; margin: 20px 0 12px; }
        .admin__section-title { font-size: 1.0625rem; font-weight: 600; color: var(--color-text); margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }
        .admin__section-title i { color: var(--color-accent); font-size: 1rem; }
        .admin__section-hint { font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 16px; }
        .admin__photo-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
        .admin__photo-tab { display: inline-flex; align-items: center; gap: 8px; padding: 11px 15px; border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-secondary); font-size: 0.8125rem; transition: all var(--transition); }
        .admin__photo-tab:hover { border-color: var(--color-accent); color: var(--color-text); }
        .admin__photo-tab--active { border-color: var(--color-accent); background: var(--color-accent-soft); color: var(--color-accent); font-weight: 600; }
        .admin__file-input { display: none; }
        .admin__upload-btn { display: inline-flex; align-items: center; gap: 9px; width: fit-content; padding: 11px 16px; border-radius: var(--radius-md); background: var(--color-accent); color: #fff; font-size: 0.8125rem; font-weight: 600; transition: all var(--transition); }
        .admin__upload-btn:hover:not(:disabled) { background: var(--color-accent-hover); transform: translateY(-1px); }
        .admin__upload-btn:disabled { opacity: 0.6; cursor: wait; }
        .admin__upload-error { display: flex; align-items: center; gap: 8px; color: var(--color-error); font-size: 0.8125rem; }
        .admin__photo-preview { display: flex; align-items: center; gap: 16px; margin-top: 20px; padding: 12px; border: 1px solid var(--color-border-soft); border-radius: var(--radius-md); background: var(--color-surface); color: var(--color-text-secondary); font-size: 0.8125rem; }
        .admin__photo-preview img { width: 76px; height: 76px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--color-border); }
        .admin__field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        .admin__field:last-child { margin-bottom: 0; }
        .admin__field label { font-size: 0.75rem; font-weight: 500; color: var(--color-text-secondary); }
        .admin__input, .admin__textarea { padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: var(--color-bg); color: var(--color-text); font-family: var(--font-sans); font-size: 0.875rem; transition: border-color var(--transition), box-shadow var(--transition); resize: vertical; }
        .admin__input:focus, .admin__textarea:focus { outline: none; border-color: var(--color-accent); box-shadow: 0 0 0 3px var(--color-accent-soft); }
        .admin__grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 600px) { .admin__grid-2 { grid-template-columns: 1fr; } }
        .admin__sub-card { background: var(--color-surface); border: 1px solid var(--color-border-soft); border-radius: var(--radius-md); padding: 20px; margin-bottom: 16px; }
        .admin__sub-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; font-size: 0.8125rem; font-weight: 500; color: var(--color-text-muted); }
        .admin__remove-btn { color: var(--color-error); font-size: 0.875rem; transition: opacity var(--transition); }
        .admin__remove-btn:hover { opacity: 0.7; }
        .admin__add-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: var(--radius-sm); border: 1px dashed var(--color-border); color: var(--color-text-secondary); font-size: 0.8125rem; transition: all var(--transition); }
        .admin__add-btn--top { margin-bottom: 16px; }
        .admin__add-btn:hover { border-color: var(--color-accent); color: var(--color-accent); }
        .admin__save-bar { position: sticky; bottom: 24px; display: flex; align-items: center; justify-content: flex-end; gap: 16px; padding: 16px 24px; background: var(--color-bg-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-lg); box-shadow: var(--shadow-md); }
        .admin__saved { font-size: 0.8125rem; color: var(--color-success); display: flex; align-items: center; gap: 6px; }
        .admin__save-notice { font-size: 0.8125rem; color: var(--color-text-secondary); display: flex; align-items: center; gap: 6px; }
        .admin__save-error { font-size: 0.8125rem; color: var(--color-error); display: flex; align-items: center; gap: 6px; }
        .sudo-overlay { position: fixed; inset: 0; z-index: 2000; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; padding: 24px; animation: fade-in 0.2s ease; }
        .sudo-modal { width: 100%; max-width: 420px; background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 32px; box-shadow: var(--shadow-lg); }
        .sudo-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 24px; }
        .sudo-icon { display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: var(--radius-md); background: var(--color-accent-soft); color: var(--color-accent); font-size: 1.25rem; flex-shrink: 0; }
        .sudo-title { font-size: 1.125rem; font-weight: 600; color: var(--color-text); margin-bottom: 4px; }
        .sudo-subtitle { font-size: 0.8125rem; color: var(--color-text-secondary); line-height: 1.5; }
        .sudo-form { display: flex; flex-direction: column; gap: 16px; }
        .sudo-field { display: flex; flex-direction: column; gap: 8px; }
        .sudo-field label { font-size: 0.8125rem; font-weight: 500; color: var(--color-text-secondary); }
        .sudo-field input { padding: 12px 16px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: var(--color-bg); color: var(--color-text); font-family: var(--font-sans); font-size: 0.9375rem; transition: border-color var(--transition), box-shadow var(--transition); }
        .sudo-field input:focus { outline: none; border-color: var(--color-accent); box-shadow: 0 0 0 3px var(--color-accent-soft); }
        .sudo-error { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: var(--radius-sm); background: rgba(239,68,68,0.1); color: var(--color-error); font-size: 0.8125rem; }
        .sudo-actions { display: flex; gap: 12px; justify-content: flex-end; }
        .sudo-cancel { padding: 10px 18px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); color: var(--color-text-secondary); font-size: 0.875rem; font-weight: 500; transition: all var(--transition); }
        .sudo-cancel:hover:not(:disabled) { color: var(--color-text); border-color: var(--color-text-muted); }
        .sudo-confirm { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: var(--radius-sm); background: var(--color-accent); color: #fff; font-size: 0.875rem; font-weight: 500; transition: all var(--transition); }
        .sudo-confirm:hover:not(:disabled) { background: var(--color-accent-hover); transform: translateY(-1px); }
        .sudo-confirm:disabled { opacity: 0.6; cursor: not-allowed; }
        @media (max-width: 800px) {
          .admin__workspace { grid-template-columns: minmax(0, 1fr); gap: 16px; }
          .admin__sidebar { position: sticky; top: 76px; z-index: 80; display: grid; grid-auto-flow: column; grid-auto-columns: max-content; overflow-x: auto; gap: 4px; padding: 8px; }
          .admin__sidebar-label { display: none; }
          .admin__sidebar-link { width: auto; padding: 10px 12px; }
          .admin__sidebar-link span { white-space: nowrap; }
        }
        @media (max-width: 600px) {
          .admin__header-inner { flex-direction: column; align-items: flex-start; }
          .admin__header-actions { width: 100%; }
          .admin__btn--ghost { flex: 1; justify-content: center; }
          .admin__main { padding: 20px 14px 60px; }
          .admin__section { padding: 20px; }
          .admin__section-heading { flex-direction: column; align-items: flex-start; }
          .admin__save-bar { flex-direction: column; align-items: stretch; padding: 12px; }
          .admin__save-bar .admin__btn { justify-content: center; }
        }
      `}</style>
    </div>
  )
}
