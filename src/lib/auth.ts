import { isSupabaseConfigured, supabase } from './supabase'

export interface AuthResult {
  success: boolean
  error?: string
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'La connexion admin nécessite une configuration Supabase.' }
  }
  if (!email || !password) {
    return { success: false, error: 'Email et mot de passe requis' }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return { success: false, error: 'Email ou mot de passe incorrect' }
  }
  return { success: true }
}

export async function signInWithGoogle(): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'La connexion admin nécessite une configuration Supabase.' }
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}admin/dashboard` },
  })
  if (error) return { success: false, error: 'Connexion Google impossible.' }
  return { success: true }
}

export async function signInWithGitHub(): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'La connexion admin nécessite une configuration Supabase.' }
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}admin/dashboard` },
  })
  if (error) return { success: false, error: 'Connexion GitHub impossible.' }
  return { success: true }
}

export function signOut(): void {
  supabase.auth.signOut()
}

/**
 * Sudo verification: re-confirms the current admin's password before any
 * portfolio update is written. Uses the session user's email and re-signs-in.
 * Returns true only if the password matches the signed-in account.
 */
export async function verifySudoPassword(password: string): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'La connexion admin nécessite une configuration Supabase.' }
  }
  if (!password) {
    return { success: false, error: 'Mot de passe requis' }
  }
  const { data: sessionData } = await supabase.auth.getSession()
  const email = sessionData.session?.user?.email
  if (!email) {
    return { success: false, error: 'Session expirée. Reconnectez-vous.' }
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return { success: false, error: 'Mot de passe incorrect' }
  }
  return { success: true }
}

/**
 * Request a password reset: sends a 6-digit OTP code to the email via
 * Supabase's built-in email service. does not reveal whether the email exists.
 */
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'La récupération du mot de passe nécessite une configuration Supabase.' }
  }
  if (!email) {
    return { success: false, error: 'Email requis' }
  }
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  })
  if (error) {
    return { success: false, error: "Envoi impossible. Réessayez." }
  }
  return { success: true }
}

/**
 * Verify the 6-digit reset code. On success the user gets a temporary session
 * and can set a new password.
 */
export async function verifyResetCode(email: string, code: string): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'La récupération du mot de passe nécessite une configuration Supabase.' }
  }
  if (!email || !code) {
    return { success: false, error: 'Email et code requis' }
  }
  const { error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: 'email',
  })
  if (error) {
    return { success: false, error: 'Code incorrect ou expiré' }
  }
  return { success: true }
}

/**
 * Set a new password after OTP verification. Requires an active session
 * (established by verifyResetCode).
 */
export async function updatePassword(newPassword: string): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'La connexion admin nécessite une configuration Supabase.' }
  }
  if (!newPassword) {
    return { success: false, error: 'Nouveau mot de passe requis' }
  }
  if (newPassword.length < 6) {
    return { success: false, error: 'Le mot de passe doit faire au moins 6 caractères' }
  }
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) {
    return { success: false, error: "Mise à jour impossible. Réessayez." }
  }
  return { success: true }
}
