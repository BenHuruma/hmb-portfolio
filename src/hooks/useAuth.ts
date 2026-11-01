import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { signOut as authSignOut } from '../lib/auth'

export function useAuth() {
  const [email, setEmail] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [adminLoading, setAdminLoading] = useState(true)

  const checkAuth = useCallback(async () => {
    const { data } = await supabase.auth.getSession()
    const user = data.session?.user
    setEmail(user?.email ?? null)
    setAdminLoading(!!user?.id)
    setUserId(user?.id ?? null)
    setLoading(false)
  }, [])

  useEffect(() => {
    checkAuth()
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user
      setEmail(user?.email ?? null)
      setAdminLoading(!!user?.id)
      setUserId(user?.id ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [checkAuth])

  useEffect(() => {
    let active = true
    if (!userId) {
      setIsAdmin(false)
      setAdminLoading(false)
      return () => { active = false }
    }

    setAdminLoading(true)
    void (async () => {
      try {
        const { data, error } = await supabase.rpc('is_portfolio_admin')
        if (active) setIsAdmin(!error && data === true)
      } catch (error) {
        console.error('Unable to verify portfolio admin access.', error)
        if (active) setIsAdmin(false)
      } finally {
        if (active) setAdminLoading(false)
      }
    })()

    return () => { active = false }
  }, [userId])

  const signOut = useCallback(() => {
    authSignOut()
    setEmail(null)
    setUserId(null)
    setIsAdmin(false)
  }, [])

  return { email, loading: loading || adminLoading, isAuthenticated: !!email, isAdmin, signOut, refresh: checkAuth }
}
