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
  contact_form_sent_label: 'Message prêt à être envoyé',
  footer_brand_mark: 'BH',
  footer_credit_prefix: 'Conçu et développé par',
}

/** Merge persisted JSON with defaults so newly added copy fields remain backward-compatible. */
export function mergeSiteCopy(value: unknown): SiteCopy {
  const stored = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Partial<SiteCopy>
    : {}

  return {
    ...DEFAULT_SITE_COPY,
    ...stored,
    nav_links: Array.isArray(stored.nav_links) ? stored.nav_links : DEFAULT_SITE_COPY.nav_links,
    about_highlights: Array.isArray(stored.about_highlights) ? stored.about_highlights : DEFAULT_SITE_COPY.about_highlights,
    certificates: Array.isArray(stored.certificates) ? stored.certificates : DEFAULT_SITE_COPY.certificates,
  }
}
