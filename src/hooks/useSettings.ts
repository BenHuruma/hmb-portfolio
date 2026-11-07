import { useEffect, useState, useCallback } from 'react'
import { loadSettings, readLastKnownSettings } from '../lib/settings'
import type { SiteSettings } from '../lib/types'

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFallback, setIsFallback] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await loadSettings()
      setSettings(result.settings)
      setIsFallback(result.isFallback)
      setLoadError(result.error ?? null)
      setError(null)
    } catch (e) {
      const cachedSettings = readLastKnownSettings()
      if (cachedSettings) {
        setSettings(cachedSettings)
        setIsFallback(true)
      }
      setError(e instanceof Error ? e.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { settings, loading, error, isFallback, loadError, reload: load }
}
