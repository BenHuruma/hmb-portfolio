import { isSupabaseConfigured, supabase } from './supabase'
import { DEFAULT_SITE_SETTINGS } from './defaultSettings'
import type { SiteSettings } from './types'
import { withTimeout } from './withTimeout'
import { mergeSiteCopy } from './siteCopy'
import { isSupportedLanguage } from './locales'

const SETTINGS_REQUEST_TIMEOUT_MS = 12_000

export interface SettingsLoadResult {
  settings: SiteSettings
  isFallback: boolean
  error?: string
}

function mapRow(data: Record<string, unknown>): SiteSettings {
  const base: Omit<SiteSettings, 'default_language'> = {
    site_copy: mergeSiteCopy(data.site_copy),
    hero_name: data.hero_name as string,
    hero_subtitle: data.hero_subtitle as string,
    hero_status: data.hero_status as string,
    about_text: data.about_text as string,
    about_location: data.about_location as string,
    about_education: data.about_education as string,
    about_languages: data.about_languages as string,
    about_email: data.about_email as string,
    skills_mastered: data.skills_mastered as string,
    skills_progress: data.skills_progress as string,
    education_items: data.education_items as SiteSettings['education_items'],
    achievements: data.achievements as SiteSettings['achievements'],
    contact_email: data.contact_email as string,
    contact_phone: data.contact_phone as string,
    contact_location: data.contact_location as string,
    hero_photo_url: data.hero_photo_url as string,
    about_photo_url: data.about_photo_url as string,
    linkedin_url: data.linkedin_url as string,
    github_url: data.github_url as string,
    twitter_url: data.twitter_url as string,
    whatsapp_url: data.whatsapp_url as string,
  }
  const defaultLanguage = isSupportedLanguage(data.default_language) ? data.default_language : 'fr'
  return {
    ...base,
    default_language: defaultLanguage,
  }
}

export async function loadSettings(): Promise<SettingsLoadResult> {
  if (!isSupabaseConfigured) {
    return { settings: DEFAULT_SITE_SETTINGS, isFallback: true, error: 'Supabase n’est pas configuré.' }
  }

  try {
    const { data, error } = await withTimeout(
      supabase
        .from('site_settings')
        .select('id, site_copy, default_language, hero_name, hero_subtitle, hero_status, about_text, about_location, about_education, about_languages, about_email, skills_mastered, skills_progress, education_items, achievements, contact_email, contact_phone, contact_location, hero_photo_url, about_photo_url, linkedin_url, github_url, twitter_url, whatsapp_url')
        .eq('id', 1)
        .maybeSingle(),
      SETTINGS_REQUEST_TIMEOUT_MS,
      'Le chargement des réglages a expiré.',
    )

    if (error) throw error
    if (!data) throw new Error('No settings found')
    return { settings: mapRow(data), isFallback: false }
  } catch (error) {
    console.warn('Supabase settings unavailable; using built-in portfolio content.', error)
    return {
      settings: DEFAULT_SITE_SETTINGS,
      isFallback: true,
      error: error instanceof Error ? error.message : 'Lecture Supabase indisponible.',
    }
  }
}

export async function getSettings(): Promise<SiteSettings> {
  return (await loadSettings()).settings
}

export async function updateSettings(settings: SiteSettings): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Admin editing is unavailable.')
  }

  const { data, error } = await supabase
    .from('site_settings')
    .update({
      site_copy: settings.site_copy,
      default_language: settings.default_language,
      hero_name: settings.hero_name,
      hero_subtitle: settings.hero_subtitle,
      hero_status: settings.hero_status,
      about_text: settings.about_text,
      about_location: settings.about_location,
      about_education: settings.about_education,
      about_languages: settings.about_languages,
      about_email: settings.about_email,
      skills_mastered: settings.skills_mastered,
      skills_progress: settings.skills_progress,
      education_items: settings.education_items,
      achievements: settings.achievements,
      contact_email: settings.contact_email,
      contact_phone: settings.contact_phone,
      contact_location: settings.contact_location,
      hero_photo_url: settings.hero_photo_url,
      about_photo_url: settings.about_photo_url,
      linkedin_url: settings.linkedin_url,
      github_url: settings.github_url,
      twitter_url: settings.twitter_url,
      whatsapp_url: settings.whatsapp_url,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1)
    .select('id')
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error('Not authorized to update site settings')
}

