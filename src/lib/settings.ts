import { isSupabaseConfigured, supabase } from './supabase'
import { DEFAULT_SITE_SETTINGS } from './defaultSettings'
import type { SiteSettings } from './types'
import { withTimeout } from './withTimeout'

const SETTINGS_REQUEST_TIMEOUT_MS = 12_000

function mapRow(data: Record<string, unknown>): SiteSettings {
  return {
    cv_url: data.cv_url as string,
    cv_file_url: data.cv_file_url as string,
    cv_source: data.cv_source as SiteSettings['cv_source'],
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
}

export async function getSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured) return DEFAULT_SITE_SETTINGS

  try {
    const { data, error } = await withTimeout(
      supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle(),
      SETTINGS_REQUEST_TIMEOUT_MS,
      'Le chargement des réglages a expiré.',
    )

    if (error) throw error
    if (!data) throw new Error('No settings found')
    return mapRow(data)
  } catch (error) {
    console.warn('Supabase settings unavailable; using built-in portfolio content.', error)
    return DEFAULT_SITE_SETTINGS
  }
}

export async function updateSettings(settings: SiteSettings): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Admin editing is unavailable.')
  }

  const { data, error } = await supabase
    .from('site_settings')
    .update({
      cv_url: settings.cv_url,
      cv_file_url: settings.cv_file_url,
      cv_source: settings.cv_source,
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

/**
 * Convert a Google Drive document/edit link into a direct PDF download link.
 * Falls back to the original URL if it doesn't match the Drive document pattern.
 */
export function toDriveDownloadLink(driveUrl: string): string {
  const match = driveUrl.match(/\/document\/d\/([a-zA-Z0-9-_]+)/)
  if (match) {
    return `https://docs.google.com/document/d/${match[1]}/export?format=pdf`
  }
  return driveUrl
}

/**
 * Returns the URL visitors should use to download the CV, based on the
 * active source chosen in the admin dashboard.
 */
export function getCvDownloadUrl(settings: SiteSettings): string {
  if (settings.cv_source === 'upload' && settings.cv_file_url) {
    return settings.cv_file_url
  }
  return toDriveDownloadLink(settings.cv_url)
}

/**
 * Upload a CV file to Supabase Storage (portfolio-assets bucket).
 * The file is stored at `cv/cv.<ext>` and overwrites any previous upload.
 * Returns the public URL of the uploaded file.
 *
 * Validation is enforced both here (client) and at the bucket level (server):
 * only PDF / DOC / DOCX files up to 10 MB are accepted. The server-side MIME
 * restriction is the real enforcement; this check improves the UX feedback.
 */
const MAX_CV_SIZE = 10 * 1024 * 1024

export async function uploadCvFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  const allowedExt = ['pdf', 'doc', 'docx']
  if (!allowedExt.includes(ext)) {
    throw new Error('format')
  }
  if (file.size > MAX_CV_SIZE) {
    throw new Error('size')
  }
  const path = `cv/cv.${ext}`
  const { error } = await supabase.storage
    .from('portfolio-assets')
    .upload(path, file, { upsert: true, contentType: file.type })
  if (error) throw new Error('upload')
  const { data } = supabase.storage.from('portfolio-assets').getPublicUrl(path)
  return data.publicUrl
}
