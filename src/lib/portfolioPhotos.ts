import { supabase } from './supabase'

const MAX_PHOTO_SIZE = 10 * 1024 * 1024

const ALLOWED_PHOTO_TYPES = new Map<string, string>([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
  ['image/avif', 'avif'],
])

export function validatePortfolioPhoto(file: File): string | null {
  if (file.size > MAX_PHOTO_SIZE) return 'La photo dépasse la limite de 10 Mo.'
  if (!ALLOWED_PHOTO_TYPES.has(file.type)) return 'Format refusé. Utilisez JPEG/JPG, PNG, WebP, GIF ou AVIF.'
  return null
}

export async function uploadPortfolioPhoto(file: File): Promise<string> {
  const validationError = validatePortfolioPhoto(file)
  if (validationError) throw new Error(validationError)

  const extension = ALLOWED_PHOTO_TYPES.get(file.type)
  if (!extension) throw new Error('Format d’image non pris en charge.')

  const path = `hero/portrait.${extension}`
  const { error } = await supabase.storage
    .from('portfolio-photos')
    .upload(path, file, { upsert: true, contentType: file.type, cacheControl: '3600' })

  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('portfolio-photos').getPublicUrl(path)
  return `${data.publicUrl}?v=${Date.now()}`
}
