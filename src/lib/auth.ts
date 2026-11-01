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
    return { success: false, error: 'Mot de passe Supabase incorrect. Le mot de passe Google ou GitHub ne peut pas être utilisé ici.' }
  }
  return { success: true }
}

/** Send a Supabase password-recovery link back to the admin page. */
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'La récupération du mot de passe nécessite une configuration Supabase.' }
  }
  if (!email) {
    return { success: false, error: 'Email requis' }
  }
  const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}admin?flow=reset`

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo })
    if (error) {
      console.error('Supabase password recovery request failed.', {
        message: error.message,
        status: error.status,
        code: error.code,
      })
      if (error.status === 429) {
        return { success: false, error: 'Trop de demandes de récupération. Attendez quelques minutes avant de réessayer.' }
      }
      return {
        success: false,
        error: `Supabase n’a pas pu envoyer le lien : ${error.message}`,
      }
    }
  } catch (error) {
    console.error('Password recovery request failed.', error)
    return {
      success: false,
      error: error instanceof Error
        ? `Impossible de contacter Supabase : ${error.message}`
        : 'Impossible de contacter Supabase. Vérifiez votre connexion puis réessayez.',
    }
  }
  return { success: true }
}

/** Set a new password using the active Supabase recovery session. */
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

  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      return { success: false, error: `Impossible de vérifier la session Supabase : ${sessionError.message}` }
    }
    if (!sessionData.session) {
      return {
        success: false,
        error: 'La session de récupération est absente ou expirée. Demandez un nouveau lien et ouvrez-le dans ce même navigateur.',
      }
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      return { success: false, error: `Supabase refuse la mise à jour : ${error.message}` }
    }
  } catch (error) {
    console.error('Password recovery update failed.', error)
    return {
      success: false,
      error: error instanceof Error
        ? `Échec de la mise à jour : ${error.message}`
        : 'Échec de la mise à jour. Vérifiez la connexion et demandez un nouveau lien si nécessaire.',
    }
  }
  return { success: true }
}
