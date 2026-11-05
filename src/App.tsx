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

function PublicSite() {
  const { theme, toggleTheme } = useTheme()
  const { settings, loading, error } = useSettings()

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

  return (
    <>
      <Navbar theme={theme} toggleTheme={toggleTheme} copy={settings.site_copy} />
      <main>
        <Hero settings={settings} />
        <About settings={settings} />
        <Skills settings={settings} />
        <Education settings={settings} />
        <Work settings={settings} />
        <Contact settings={settings} />
      </main>
      <Footer settings={settings} />
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
