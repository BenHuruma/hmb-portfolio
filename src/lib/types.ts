import type { SiteCopy } from './siteCopy'
import type { Language } from './locales'
export interface SiteSettings {
  default_language: Language
  site_copy: SiteCopy
  hero_name: string
  hero_subtitle: string
  hero_status: string
  about_text: string
  about_location: string
  about_education: string
  about_languages: string
  about_email: string
  skills_mastered: string
  skills_progress: string
  education_items: EducationItem[]
  achievements: Achievement[]
  contact_email: string
  contact_phone: string
  contact_location: string
  hero_photo_url: string
  about_photo_url: string
  linkedin_url: string
  github_url: string
  twitter_url: string
  whatsapp_url: string
}

export interface EducationItem {
  period: string
  title: string
  place: string
  description: string
}

export interface Achievement {
  year: string
  title: string
  description: string
  link_label: string
  link_url: string
}
