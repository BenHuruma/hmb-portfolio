export interface NavLinkCopy {
  id: 'hero' | 'about' | 'skills' | 'education' | 'work' | 'contact'
  label: string
}

export interface AboutHighlight {
  label: string
  icon: string
}

export interface CertificateCopy {
  title: string
  image_url: string
  alt: string
}

export interface SiteCopy {
  navbar_brand_mark: string
  navbar_brand_name: string
  nav_links: NavLinkCopy[]
  hero_contact_cta: string
  about_label: string
  about_heading: string
  about_location_label: string
  about_education_label: string
  about_languages_label: string
  about_email_label: string
  about_highlights: AboutHighlight[]
  skills_label: string
  skills_heading: string
  skills_description: string
  skills_mastered_title: string
  skills_mastered_status: string
  skills_progress_title: string
  skills_progress_status: string
  education_label: string
  education_heading: string
  education_description: string
  work_label: string
  work_heading: string
  work_description: string
  certificates_title: string
  certificates: CertificateCopy[]
  contact_label: string
  contact_heading: string
  contact_description: string
  contact_email_label: string
  contact_phone_label: string
  contact_location_label: string
  contact_form_name_label: string
  contact_form_email_label: string
  contact_form_message_label: string
  contact_form_name_placeholder: string
  contact_form_email_placeholder: string
  contact_form_message_placeholder: string
  contact_form_send_label: string
  contact_form_sent_label: string
  footer_brand_mark: string
  footer_credit_prefix: string
  language_selector_label: string
  admin_login_welcome: string
  admin_login_title: string
  admin_login_subtitle: string
  admin_login_forgot_subtitle: string
  admin_login_google: string
  admin_login_github: string
  admin_login_or_email: string
  admin_login_email: string
  admin_login_password: string
  admin_login_forgot_password: string
  admin_login_submit: string
  admin_login_loading: string
  admin_login_back: string
  admin_login_send_reset: string
  admin_login_sending: string
  admin_login_reset_step: string
  admin_login_new_password: string
  admin_login_update_password: string
  admin_login_updating_password: string
  admin_login_return: string
  admin_login_reset_link_sent: string
  admin_login_reset_verified: string
  theme_toggle_label: string
  menu_toggle_label: string
  certificate_enlarge_label: string
  contact_email_subject_prefix: string
  contact_email_name_prefix: string
  contact_email_address_prefix: string
  contact_email_visitor_label: string
  contact_form_mailto_fallback: string
}

export const DEFAULT_SITE_COPY: SiteCopy = {
  navbar_brand_mark: 'BH',
  navbar_brand_name: 'Benjamin Huruma',
  nav_links: [
    { id: 'hero', label: 'Accueil' },
    { id: 'about', label: 'À propos' },
    { id: 'skills', label: 'Compétences' },
    { id: 'education', label: 'Formation' },
    { id: 'work', label: 'Réalisations' },
    { id: 'contact', label: 'Contact' },
  ],
  hero_contact_cta: 'Me contacter',
  about_label: 'À propos',
  about_heading: 'Un développeur guidé par le professionnalisme et la rigueur',
  about_location_label: 'Localisation',
  about_education_label: 'Études',
  about_languages_label: 'Langues',
  about_email_label: 'Email',
  about_highlights: [
    { icon: 'fa-solid fa-code', label: 'Développement Web' },
    { icon: 'fa-solid fa-cube', label: 'Blockchain & Web3' },
    { icon: 'fa-solid fa-shield-halved', label: 'Cybersécurité' },
    { icon: 'fa-solid fa-server', label: 'Systèmes distribués' },
  ],
  skills_label: 'Compétences',
  skills_heading: "Ce que je maîtrise et ce que j'apprends",
  skills_description: 'Un aperçu de mes compétences techniques et de celles que je développe activement.',
  skills_mastered_title: 'Compétences maîtrisées',
  skills_mastered_status: 'Maîtrise',
  skills_progress_title: 'En progression',
  skills_progress_status: 'En progression',
  education_label: 'Formation',
  education_heading: 'Parcours académique et expérience',
  education_description: 'Une formation en génie logiciel enrichie par des expériences pratiques sur le terrain.',
  work_label: 'Réalisations',
  work_heading: 'Projets et contributions',
  work_description: "Au fil du temps, j'ai travaillé sur des projets logiciels et je me suis impliqué activement dans plusieurs écosystèmes blockchain.",
  certificates_title: 'Certificats — Midnight Network',
  certificates: [
    { title: 'Certificat Midnight — Benjamin Huruma', image_url: 'certificatMidnight1.WebP', alt: 'Certificat Midnight — Benjamin Huruma' },
    { title: 'Certificat Midnight — Benjamin Huruma', image_url: 'CertificatMidnight2.WebP', alt: 'Certificat Midnight — Benjamin Huruma' },
  ],
  contact_label: 'Contact',
  contact_heading: 'Restons en contact',
  contact_description: "Une question, une opportunité ou envie d'échanger ? N'hésitez pas à m'écrire.",
  contact_email_label: 'Email',
  contact_phone_label: 'Téléphone',
  contact_location_label: 'Localisation',
  contact_form_name_label: 'Nom',
  contact_form_email_label: 'Email',
  contact_form_message_label: 'Message',
  contact_form_name_placeholder: 'Votre nom',
  contact_form_email_placeholder: 'vous@exemple.com',
  contact_form_message_placeholder: 'Votre message...',
  contact_form_send_label: 'Envoyer le message',
  contact_form_sent_label: 'Message envoyé avec succès',
  footer_brand_mark: 'BH',
  footer_credit_prefix: 'Conçu et développé par',
  language_selector_label: 'Choisir la langue du portfolio',
  admin_login_welcome: 'Bienvenue dans votre espace d’administration du portfolio',
  admin_login_title: 'Administration',
  admin_login_subtitle: 'Connectez-vous pour gérer votre portfolio',
  admin_login_forgot_subtitle: 'Récupération du mot de passe',
  admin_login_google: 'Continuer avec Google',
  admin_login_github: 'Continuer avec GitHub',
  admin_login_or_email: 'ou par email',
  admin_login_email: 'Email',
  admin_login_password: 'Mot de passe',
  admin_login_forgot_password: 'Mot de passe oublié ?',
  admin_login_submit: 'Se connecter',
  admin_login_loading: 'Chargement...',
  admin_login_back: 'Retour au site',
  admin_login_send_reset: 'Envoyer le lien',
  admin_login_sending: 'Envoi...',
  admin_login_reset_step: 'Définissez votre nouveau mot de passe.',
  admin_login_new_password: 'Nouveau mot de passe',
  admin_login_update_password: 'Définir le nouveau mot de passe',
  admin_login_updating_password: 'Mise à jour...',
  admin_login_return: 'Retour à la connexion',
  admin_login_reset_link_sent: 'Si cette adresse correspond à un compte, un lien de réinitialisation a été envoyé. Ouvrez-le sur le même navigateur pour définir un nouveau mot de passe.',
  admin_login_reset_verified: 'Lien vérifié. Définissez maintenant votre nouveau mot de passe Supabase.',
  theme_toggle_label: 'Changer de thème',
  menu_toggle_label: 'Ouvrir le menu',
  certificate_enlarge_label: 'Agrandir',
  contact_email_subject_prefix: 'Message de',
  contact_email_name_prefix: 'Nom',
  contact_email_address_prefix: 'Email',
  contact_email_visitor_label: 'un visiteur',
  contact_form_mailto_fallback: 'Ou envoyez le message avec votre application de messagerie',
}

/** Merge persisted JSON with defaults so newly added copy fields remain backward-compatible. */
export function mergeSiteCopy(value: unknown, fallback: SiteCopy = DEFAULT_SITE_COPY): SiteCopy {
  const stored = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Partial<SiteCopy>
    : {}

  return {
    ...fallback,
    ...stored,
    footer_credit_prefix: typeof stored.footer_credit_prefix === 'string'
      ? stored.footer_credit_prefix
      : fallback.footer_credit_prefix,
    language_selector_label: typeof stored.language_selector_label === 'string'
      ? stored.language_selector_label
      : fallback.language_selector_label,
    theme_toggle_label: typeof stored.theme_toggle_label === 'string'
      ? stored.theme_toggle_label
      : fallback.theme_toggle_label,
    menu_toggle_label: typeof stored.menu_toggle_label === 'string'
      ? stored.menu_toggle_label
      : fallback.menu_toggle_label,
    certificate_enlarge_label: typeof stored.certificate_enlarge_label === 'string'
      ? stored.certificate_enlarge_label
      : fallback.certificate_enlarge_label,
    contact_email_subject_prefix: typeof stored.contact_email_subject_prefix === 'string'
      ? stored.contact_email_subject_prefix
      : fallback.contact_email_subject_prefix,
    contact_email_name_prefix: typeof stored.contact_email_name_prefix === 'string'
      ? stored.contact_email_name_prefix
      : fallback.contact_email_name_prefix,
    contact_email_address_prefix: typeof stored.contact_email_address_prefix === 'string'
      ? stored.contact_email_address_prefix
      : fallback.contact_email_address_prefix,
    contact_email_visitor_label: typeof stored.contact_email_visitor_label === 'string'
      ? stored.contact_email_visitor_label
      : fallback.contact_email_visitor_label,
    admin_login_welcome: typeof stored.admin_login_welcome === 'string' ? stored.admin_login_welcome : fallback.admin_login_welcome,
    admin_login_title: typeof stored.admin_login_title === 'string' ? stored.admin_login_title : fallback.admin_login_title,
    admin_login_subtitle: typeof stored.admin_login_subtitle === 'string' ? stored.admin_login_subtitle : fallback.admin_login_subtitle,
    admin_login_forgot_subtitle: typeof stored.admin_login_forgot_subtitle === 'string' ? stored.admin_login_forgot_subtitle : fallback.admin_login_forgot_subtitle,
    admin_login_google: typeof stored.admin_login_google === 'string' ? stored.admin_login_google : fallback.admin_login_google,
    admin_login_github: typeof stored.admin_login_github === 'string' ? stored.admin_login_github : fallback.admin_login_github,
    admin_login_or_email: typeof stored.admin_login_or_email === 'string' ? stored.admin_login_or_email : fallback.admin_login_or_email,
    admin_login_email: typeof stored.admin_login_email === 'string' ? stored.admin_login_email : fallback.admin_login_email,
    admin_login_password: typeof stored.admin_login_password === 'string' ? stored.admin_login_password : fallback.admin_login_password,
    admin_login_forgot_password: typeof stored.admin_login_forgot_password === 'string' ? stored.admin_login_forgot_password : fallback.admin_login_forgot_password,
    admin_login_submit: typeof stored.admin_login_submit === 'string' ? stored.admin_login_submit : fallback.admin_login_submit,
    admin_login_loading: typeof stored.admin_login_loading === 'string' ? stored.admin_login_loading : fallback.admin_login_loading,
    admin_login_back: typeof stored.admin_login_back === 'string' ? stored.admin_login_back : fallback.admin_login_back,
    admin_login_send_reset: typeof stored.admin_login_send_reset === 'string' ? stored.admin_login_send_reset : fallback.admin_login_send_reset,
    admin_login_sending: typeof stored.admin_login_sending === 'string' ? stored.admin_login_sending : fallback.admin_login_sending,
    admin_login_reset_step: typeof stored.admin_login_reset_step === 'string' ? stored.admin_login_reset_step : fallback.admin_login_reset_step,
    admin_login_new_password: typeof stored.admin_login_new_password === 'string' ? stored.admin_login_new_password : fallback.admin_login_new_password,
    admin_login_update_password: typeof stored.admin_login_update_password === 'string' ? stored.admin_login_update_password : fallback.admin_login_update_password,
    admin_login_updating_password: typeof stored.admin_login_updating_password === 'string' ? stored.admin_login_updating_password : fallback.admin_login_updating_password,
    admin_login_return: typeof stored.admin_login_return === 'string' ? stored.admin_login_return : fallback.admin_login_return,
    admin_login_reset_link_sent: typeof stored.admin_login_reset_link_sent === 'string' ? stored.admin_login_reset_link_sent : fallback.admin_login_reset_link_sent,
    admin_login_reset_verified: typeof stored.admin_login_reset_verified === 'string' ? stored.admin_login_reset_verified : fallback.admin_login_reset_verified,
    nav_links: Array.isArray(stored.nav_links) ? stored.nav_links : fallback.nav_links,
    about_highlights: Array.isArray(stored.about_highlights) ? stored.about_highlights : fallback.about_highlights,
    certificates: Array.isArray(stored.certificates) ? stored.certificates : fallback.certificates,
  }
}
