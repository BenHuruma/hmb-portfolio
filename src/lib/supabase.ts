import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

let validSupabaseUrl = false
try {
  const parsedUrl = new URL(supabaseUrl)
  validSupabaseUrl = parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:'
} catch {
  // An absent or malformed URL means the optional backend is not configured.
}

export const isSupabaseConfigured = validSupabaseUrl && Boolean(supabaseAnonKey)

// Keep the public portfolio renderable without backend configuration. All
// backend operations are guarded and never use this placeholder URL.
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://not-configured.invalid',
  isSupabaseConfigured ? supabaseAnonKey : 'not-configured',
  {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  },
)
