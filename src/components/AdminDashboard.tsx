import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSettings } from '../hooks/useSettings'
import { updateSettings, uploadCvFile } from '../lib/settings'
import { verifySudoPassword } from '../lib/auth'
import type { SiteSettings, EducationItem, Achievement } from '../lib/types'

export function AdminDashboard() {
  const { email, signOut } = useAuth()
  const { settings, loading, reload } = useSettings()
  const navigate = useNavigate()
  const [form, setForm] = useState<SiteSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [cvUploading, setCvUploading] = useState(false)
  const [cvUploadError, setCvUploadError] = useState<string | null>(null)
  const [sudoOpen, setSudoOpen] = useState(false)
  const [sudoPassword, setSudoPassword] = useState('')
  const [sudoError, setSudoError] = useState<string | null>(null)
  const [sudoVerifying, setSudoVerifying] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (settings) setForm({ ...settings })
  }, [settings])

  const handleSignOut = () => {
    signOut()
    navigate('/admin')
  }

  const update = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setForm((prev) => prev ? { ...prev, [key]: value } : prev)
  }

  const handleSaveClick = () => {
    setSudoOpen(true)
    setSudoPassword('')
    setSudoError(null)
  }

  const handleSave = async () => {
    if (!form) return
    setSudoVerifying(true)
    setSudoError(null)
    const result = await verifySudoPassword(sudoPassword)
    if (!result.success) {
      setSudoVerifying(false)
      setSudoError(result.error || 'Vérification impossible')
      return
    }
    setSaving(true)
    try {
      await updateSettings(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      await reload()
      setSudoOpen(false)
      setSudoPassword('')
    } catch (err) {
      console.error('settings update failed', err)
      setSaveError("Échec de l'enregistrement. Réessayez.")
      setTimeout(() => setSaveError(null), 5000)
      setSudoOpen(false)
    } finally {
      setSaving(false)
      setSudoVerifying(false)
    }
  }

  const closeSudo = () => {
    if (!sudoVerifying && !saving) {
      setSudoOpen(false)
      setSudoPassword('')
      setSudoError(null)
    }
  }

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCvUploading(true)
    setCvUploadError(null)
    try {
      const publicUrl = await uploadCvFile(file)
      update('cv_file_url', publicUrl)
      update('cv_source', 'upload')
    } catch (err) {
      const code = err instanceof Error ? err.message : ''
      if (code === 'format') {
        setCvUploadError('Format non autorisé. Seuls les fichiers PDF, DOC et DOCX sont acceptés.')
      } else if (code === 'size') {
        setCvUploadError('Le fichier dépasse 10 Mo. Choisissez un fichier plus léger.')
      } else {
        setCvUploadError('Échec du téléversement. Réessayez.')
      }
      console.error('cv upload failed', err)
    } finally {
      setCvUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (loading || !form) {
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
        <div className="admin__content">
          {/* CV + Photos */}
          <section className="admin__section">
            <h2 className="admin__section-title"><i className="fa-solid fa-file-lines"></i> Curriculum vitae (CV)</h2>
            <div className="admin__cv-source-toggle">
              <button
                type="button"
                className={form.cv_source === 'drive' ? 'admin__cv-tab admin__cv-tab--active' : 'admin__cv-tab'}
                onClick={() => update('cv_source', 'drive')}
              >
                <i className="fa-brands fa-google-drive"></i> Lien Google Drive
              </button>
              <button
                type="button"
                className={form.cv_source === 'upload' ? 'admin__cv-tab admin__cv-tab--active' : 'admin__cv-tab'}
                onClick={() => update('cv_source', 'upload')}
              >
                <i className="fa-solid fa-upload"></i> Fichier téléversé
              </button>
            </div>

            {form.cv_source === 'drive' ? (
              <>
                <div className="admin__field">
                  <label>Lien du CV (Google Drive)</label>
                  <input className="admin__input" type="url" value={form.cv_url} onChange={(e) => update('cv_url', e.target.value)} placeholder="https://docs.google.com/document/d/..." />
                </div>
                <p className="admin__section-hint">Le lien Google Drive sera automatiquement converti en téléchargement PDF pour les visiteurs.</p>
              </>
            ) : (
              <>
                <div className="admin__field">
                  <label>Téléverser un CV depuis votre appareil</label>
                  <div className="admin__upload-zone">
                    <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleCvUpload} className="admin__file-input" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="admin__upload-btn" disabled={cvUploading}>
                      {cvUploading ? (<><i className="fa-solid fa-spinner fa-spin"></i> Téléversement...</>) : (<><i className="fa-solid fa-cloud-arrow-up"></i> Choisir un fichier</>)}
                    </button>
                    {form.cv_file_url && (
                      <p className="admin__upload-status">
                        <i className="fa-solid fa-circle-check"></i> Fichier enregistré — les visiteurs le téléchargeront automatiquement.
                      </p>
                    )}
                  </div>
                </div>
                {cvUploadError && <div className="admin__upload-error"><i className="fa-solid fa-circle-exclamation"></i> {cvUploadError}</div>}
                <p className="admin__section-hint">Formats acceptés : PDF, DOC, DOCX. Le fichier remplace le précédent à chaque téléversement.</p>
              </>
            )}
            <p className="admin__section-hint">Source active : {form.cv_source === 'drive' ? 'Google Drive' : 'Fichier téléversé'}. Cliquez sur « Enregistrer les modifications » pour appliquer le changement.</p>
          </section>

          <section className="admin__section">
            <h2 className="admin__section-title"><i className="fa-solid fa-image"></i> Photo d'accueil</h2>
            <div className="admin__field">
              <label>Photo d'accueil (URL)</label>
              <input className="admin__input" type="url" value={form.hero_photo_url} onChange={(e) => update('hero_photo_url', e.target.value)} placeholder="https://... (ou laissez vide pour la photo par défaut)" />
            </div>
          </section>

          {/* Hero */}
          <section className="admin__section">
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
          <section className="admin__section">
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
          <section className="admin__section">
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
          <section className="admin__section">
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
          <section className="admin__section">
            <h2 className="admin__section-title"><i className="fa-solid fa-trophy"></i> Réalisations</h2>
            {form.achievements.map((item, i) => (
              <div key={i} className="admin__sub-card">
                <div className="admin__sub-card-header">
                  <span>Réalisation {i + 1}</span>
                  <button onClick={() => {
                    const items = form.achievements.filter((_, idx) => idx !== i)
                    update('achievements', items)
                  }} className="admin__remove-btn"><i className="fa-solid fa-trash"></i></button>
                </div>
                <div className="admin__field">
                  <label>Année</label>
                  <input className="admin__input" type="text" value={item.year} onChange={(e) => {
                    const items = [...form.achievements]
                    items[i] = { ...items[i], year: e.target.value }
                    update('achievements', items)
                  }} />
                </div>
                <div className="admin__field">
                  <label>Titre</label>
                  <input className="admin__input" type="text" value={item.title} onChange={(e) => {
                    const items = [...form.achievements]
                    items[i] = { ...items[i], title: e.target.value }
                    update('achievements', items)
                  }} />
                </div>
                <div className="admin__field">
                  <label>Description</label>
                  <textarea className="admin__textarea" rows={2} value={item.description} onChange={(e) => {
                    const items = [...form.achievements]
                    items[i] = { ...items[i], description: e.target.value }
                    update('achievements', items)
                  }} />
                </div>
                <div className="admin__grid-2">
                  <div className="admin__field">
                    <label>Texte du lien</label>
                    <input className="admin__input" type="text" value={item.link_label} onChange={(e) => {
                      const items = [...form.achievements]
                      items[i] = { ...items[i], link_label: e.target.value }
                      update('achievements', items)
                    }} />
                  </div>
                  <div className="admin__field">
                    <label>URL du lien</label>
                    <input className="admin__input" type="url" value={item.link_url} onChange={(e) => {
                      const items = [...form.achievements]
                      items[i] = { ...items[i], link_url: e.target.value }
                      update('achievements', items)
                    }} />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => {
              const newItem: Achievement = { year: '', title: '', description: '', link_label: '', link_url: '' }
              update('achievements', [...form.achievements, newItem])
            }} className="admin__add-btn">
              <i className="fa-solid fa-plus"></i> Ajouter une réalisation
            </button>
          </section>

          {/* Contact */}
          <section className="admin__section">
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
          <section className="admin__section">
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
            {saveError && <span className="admin__save-error"><i className="fa-solid fa-circle-exclamation"></i> {saveError}</span>}
            <button onClick={handleSaveClick} className="admin__btn admin__btn--primary" disabled={saving}>
              {saving ? <><i className="fa-solid fa-spinner fa-spin"></i> Enregistrement...</> : <><i className="fa-solid fa-floppy-disk"></i> Enregistrer les modifications</>}
            </button>
          </div>
        </div>
      </main>

      {sudoOpen && (
        <div className="sudo-overlay" onClick={closeSudo}>
          <div className="sudo-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sudo-header">
              <span className="sudo-icon"><i className="fa-solid fa-shield-halved"></i></span>
              <div>
                <h3 className="sudo-title">Vérification administrateur</h3>
                <p className="sudo-subtitle">Entrez votre mot de passe Supabase. Le mot de passe de votre compte Google ou GitHub ne fonctionne pas ici. Si vous n’avez pas de mot de passe Supabase, déconnectez-vous puis utilisez « Mot de passe oublié ? » sur la page de connexion pour en définir un.</p>
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
                  {sudoVerifying || saving ? <><i className="fa-solid fa-spinner fa-spin"></i> Vérification...</> : <><i className="fa-solid fa-check"></i> Confirmer et enregistrer</>}
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
        .admin__header-inner { max-width: 900px; margin: 0 auto; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
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
        .admin__main { padding: 32px 24px 80px; }
        .admin__content { max-width: 700px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }
        .admin__section { background: var(--color-bg-card); border: 1px solid var(--color-border-soft); border-radius: var(--radius-lg); padding: 28px; }
        .admin__section-title { font-size: 1.0625rem; font-weight: 600; color: var(--color-text); margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }
        .admin__section-title i { color: var(--color-accent); font-size: 1rem; }
        .admin__section-hint { font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 16px; }
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
        .admin__add-btn:hover { border-color: var(--color-accent); color: var(--color-accent); }
        .admin__cv-source-toggle { display: flex; gap: 8px; margin-bottom: 20px; padding: 4px; background: var(--color-bg); border: 1px solid var(--color-border-soft); border-radius: var(--radius-md); }
        .admin__cv-tab { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 16px; border-radius: var(--radius-sm); font-size: 0.8125rem; font-weight: 500; color: var(--color-text-secondary); transition: all var(--transition); }
        .admin__cv-tab--active { background: var(--color-accent); color: #fff; }
        .admin__cv-tab:not(.admin__cv-tab--active):hover { color: var(--color-text); background: var(--color-surface); }
        .admin__upload-zone { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; padding: 24px; border: 1px dashed var(--color-border); border-radius: var(--radius-md); background: var(--color-bg); }
        .admin__file-input { display: none; }
        .admin__upload-btn { display: inline-flex; align-items: center; gap: 10px; padding: 12px 20px; border-radius: var(--radius-sm); background: var(--color-accent); color: #fff; font-size: 0.875rem; font-weight: 500; transition: all var(--transition); }
        .admin__upload-btn:hover:not(:disabled) { background: var(--color-accent-hover); transform: translateY(-1px); }
        .admin__upload-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .admin__upload-status { font-size: 0.8125rem; color: var(--color-success); display: flex; align-items: center; gap: 6px; }
        .admin__upload-error { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: var(--radius-sm); background: rgba(239,68,68,0.1); color: var(--color-error); font-size: 0.8125rem; margin-bottom: 16px; }
        .admin__save-bar { position: sticky; bottom: 24px; display: flex; align-items: center; justify-content: flex-end; gap: 16px; padding: 16px 24px; background: var(--color-bg-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-lg); box-shadow: var(--shadow-md); }
        .admin__saved { font-size: 0.8125rem; color: var(--color-success); display: flex; align-items: center; gap: 6px; }
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
        @media (max-width: 600px) {
          .admin__header-inner { flex-direction: column; align-items: flex-start; }
          .admin__header-actions { width: 100%; }
          .admin__btn--ghost { flex: 1; justify-content: center; }
        }
      `}</style>
    </div>
  )
}
