import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { Skills } from './components/Skills'
import { Education } from './components/Education'
import { Work } from './components/Work'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { LoginPage } from './components/LoginPage'
import { AdminDashboard } from './components/AdminDashboard'
import { useTheme } from './hooks/useTheme'
import { useSettings } from './hooks/useSettings'
import { useAuth } from './hooks/useAuth'
import { getLocalizedSettings, type Language } from './lib/locales'

const LANGUAGE_STORAGE_KEY = 'hmb-portfolio-language'

function readSavedLanguage(): Language | null {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return saved === 'fr' || saved === 'en' || saved === 'sw' ? saved : null
  } catch {
    return null
  }
}

function PublicSite() {
  const { theme, toggleTheme } = useTheme()
  const { settings, loading, error } = useSettings()
  const [language, setLanguage] = useState<Language>(() => readSavedLanguage() ?? 'fr')

  useEffect(() => {
    if (settings && !readSavedLanguage()) setLanguage(settings.default_language)
  }, [settings?.default_language])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const changeLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage)
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage)
    } catch {
      // The selected language still applies for this page session.
    }
  }

  if (loading) {
    return (
      <div className="site-loading">
        <i className="fa-solid fa-spinner fa-spin"></i>
      </div>
    )
  }

  if (error || !settings) {
    return (
      <div className="site-loading">
        <i className="fa-solid fa-triangle-exclamation"></i>
        <p>Une erreur est survenue. Rechargez la page.</p>
      </div>
    )
  }

  const localizedSettings = getLocalizedSettings(settings, language)

  return (
    <>
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        copy={localizedSettings.site_copy}
        language={language}
        onLanguageChange={changeLanguage}
      />
      <main>
        <Hero settings={localizedSettings} />
        <About settings={localizedSettings} />
        <Skills settings={localizedSettings} />
        <Education settings={localizedSettings} />
        <Work settings={localizedSettings} />
        <Contact settings={localizedSettings} />
      </main>
      <Footer settings={localizedSettings} />
    </>
  )
}

function ProtectedAdmin() {
  const { isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="site-loading">
        <i className="fa-solid fa-spinner fa-spin"></i>
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/admin" replace />
  }

  return <AdminDashboard />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicSite />} />
      <Route path="/admin" element={<LoginPage />} />
      <Route path="/admin/dashboard" element={<ProtectedAdmin />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
