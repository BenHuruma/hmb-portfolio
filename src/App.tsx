import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { Skills } from './components/Skills'
import { Education } from './components/Education'
import { Work } from './components/Work'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { useTheme } from './hooks/useTheme'
import { useSettings } from './hooks/useSettings'
import { useAuth } from './hooks/useAuth'

const LoginPage = lazy(() => import('./components/LoginPage').then((module) => ({ default: module.LoginPage })))
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then((module) => ({ default: module.AdminDashboard })))

function RouteLoading() {
  return <div className="site-loading"><i className="fa-solid fa-spinner fa-spin"></i></div>
}

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
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        copy={settings.site_copy}
        defaultLanguage={settings.default_language}
      />
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
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route path="/" element={<PublicSite />} />
        <Route path="/admin" element={<LoginPage />} />
        <Route path="/admin/dashboard" element={<ProtectedAdmin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
