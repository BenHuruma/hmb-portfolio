import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  signInWithEmail,
  signInWithGoogle,
  signInWithGitHub,
  requestPasswordReset,
  verifyResetCode,
  updatePassword,
} from '../lib/auth'
import { useAuth } from '../hooks/useAuth'

type Mode = 'signin' | 'forgot'
type ForgotStep = 'email' | 'code' | 'password'

export function LoginPage() {
  const [mode, setMode] = useState<Mode>('signin')
  const [forgotStep, setForgotStep] = useState<ForgotStep>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [forgotEmail, setForgotEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const { isAdmin, isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin/dashboard')
    }
  }, [isAdmin, navigate])

  useEffect(() => {
    if (mode === 'signin' && !authLoading && isAuthenticated && !isAdmin) {
      void supabase.auth.signOut()
      setError('Ce compte n’est pas autorisé à accéder à l’administration.')
    }
  }, [mode, authLoading, isAuthenticated, isAdmin])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    const result = await signInWithEmail(email, password)

    if (result.success) {
      const { data } = await supabase.auth.getSession()
      const { data: isAdmin } = await supabase.rpc('is_portfolio_admin')
      if (data.session && isAdmin === true) {
        navigate('/admin/dashboard')
      } else {
        await supabase.auth.signOut()
        setError('Ce compte n’est pas autorisé à accéder à l’administration.')
      }
    } else {
      setError(result.error || 'Une erreur est survenue')
    }
    setLoading(false)
  }

  const handleForgotEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)
    const result = await requestPasswordReset(forgotEmail)
    if (result.success) {
      setInfo('Si cette adresse est enregistrée, un code à 6 chiffres a été envoyé.')
      setForgotStep('code')
    } else {
      setError(result.error || 'Envoi impossible')
    }
    setLoading(false)
  }

  const handleForgotCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await verifyResetCode(forgotEmail, resetCode)
    if (result.success) {
      setForgotStep('password')
      setInfo(null)
    } else {
      setError(result.error || 'Code incorrect')
    }
    setLoading(false)
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await updatePassword(newPassword)
    if (result.success) {
      setInfo('Mot de passe mis à jour. Connectez-vous avec votre nouveau mot de passe.')
      setMode('signin')
      setForgotStep('email')
      setForgotEmail('')
      setResetCode('')
      setNewPassword('')
    } else {
      setError(result.error || 'Mise à jour impossible')
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setError(null)
    setOauthLoading('google')
    const result = await signInWithGoogle()
    if (!result.success) {
      setError(result.error || 'Erreur de connexion Google')
      setOauthLoading(null)
    }
  }

  const handleGitHub = async () => {
    setError(null)
    setOauthLoading('github')
    const result = await signInWithGitHub()
    if (!result.success) {
      setError(result.error || 'Erreur de connexion GitHub')
      setOauthLoading(null)
    }
  }

  const switchMode = (m: Mode) => {
    setMode(m)
    setForgotStep('email')
    setError(null)
    setInfo(null)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <a href={import.meta.env.BASE_URL} className="login-back">
          <i className="fa-solid fa-arrow-left"></i> Retour au site
        </a>

        <div className="login-header">
          <div className="login-logo">BH</div>
          <p className="login-welcome">Bienvenue dans votre espace d’administration du portfolio</p>
          <h1 className="login-title">Administration</h1>
          <p className="login-subtitle">
            {mode === 'forgot'
              ? 'Récupération du mot de passe'
              : 'Connectez-vous pour gérer votre portfolio'}
          </p>
        </div>

        {mode === 'forgot' ? (
          <>
            {forgotStep === 'email' && (
              <form className="login-form" onSubmit={handleForgotEmail}>
                <div className="login-field">
                  <label htmlFor="forgot-email">Email</label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    placeholder="vous@exemple.com"
                    autoComplete="email"
                  />
                </div>
                {info && <div className="login-info"><i className="fa-solid fa-circle-info"></i> {info}</div>}
                {error && <div className="login-error"><i className="fa-solid fa-circle-exclamation"></i> {error}</div>}
                <button type="submit" className="login-submit" disabled={loading}>
                  {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Envoi...</> : <><i className="fa-solid fa-paper-plane"></i> Envoyer le code</>}
                </button>
              </form>
            )}

            {forgotStep === 'code' && (
              <form className="login-form" onSubmit={handleForgotCode}>
                <p className="login-step-hint">Un code à 6 chiffres a été envoyé à <strong>{forgotEmail}</strong>.</p>
                <div className="login-field">
                  <label htmlFor="reset-code">Code à 6 chiffres</label>
                  <input
                    id="reset-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/[^0-9]/g, ''))}
                    required
                    autoFocus
                    placeholder="123456"
                  />
                </div>
                {error && <div className="login-error"><i className="fa-solid fa-circle-exclamation"></i> {error}</div>}
                <button type="submit" className="login-submit" disabled={loading}>
                  {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Vérification...</> : <><i className="fa-solid fa-check"></i> Vérifier le code</>}
                </button>
              </form>
            )}

            {forgotStep === 'password' && (
              <form className="login-form" onSubmit={handleForgotPassword}>
                <p className="login-step-hint">Définissez votre nouveau mot de passe.</p>
                <div className="login-field">
                  <label htmlFor="new-pwd">Nouveau mot de passe</label>
                  <input
                    id="new-pwd"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    autoFocus
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
                {error && <div className="login-error"><i className="fa-solid fa-circle-exclamation"></i> {error}</div>}
                <button type="submit" className="login-submit" disabled={loading}>
                  {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Mise à jour...</> : <><i className="fa-solid fa-key"></i> Définir le nouveau mot de passe</>}
                </button>
              </form>
            )}

            {info && forgotStep !== 'email' && <div className="login-info"><i className="fa-solid fa-circle-info"></i> {info}</div>}

            <div className="login-switch">
              <button onClick={() => switchMode('signin')} className="login-switch-btn">
                <i className="fa-solid fa-arrow-left"></i> Retour à la connexion
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="login-social">
              <button onClick={handleGoogle} className="login-social-btn" disabled={!!oauthLoading}>
                {oauthLoading === 'google' ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-brands fa-google"></i>}
                <span>Continuer avec Google</span>
              </button>
              <button onClick={handleGitHub} className="login-social-btn" disabled={!!oauthLoading}>
                {oauthLoading === 'github' ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-brands fa-github"></i>}
                <span>Continuer avec GitHub</span>
              </button>
            </div>

            <div className="login-divider">
              <span>ou par email</span>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="vous@exemple.com"
                  autoComplete="email"
                />
              </div>
              <div className="login-field">
                <label htmlFor="password">Mot de passe</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              {mode === 'signin' && (
                <button type="button" onClick={() => switchMode('forgot')} className="login-forgot">
                  Mot de passe oublié ?
                </button>
              )}

              {info && <div className="login-info"><i className="fa-solid fa-circle-info"></i> {info}</div>}
              {error && <div className="login-error"><i className="fa-solid fa-circle-exclamation"></i> {error}</div>}

              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? (
                  <><i className="fa-solid fa-spinner fa-spin"></i> Chargement...</>
                ) : (
                  <><i className="fa-solid fa-right-to-bracket"></i> Se connecter</>
                )}
              </button>
            </form>

            <div className="login-switch">
              <button onClick={() => switchMode('forgot')} className="login-switch-btn">
                Mot de passe oublié ?
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: var(--color-bg);
          background-image: radial-gradient(circle at 20% 20%, var(--color-accent-glow) 0%, transparent 50%);
        }
        .login-card {
          width: 100%;
          max-width: 420px;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 40px 32px;
          box-shadow: var(--shadow-lg);
        }
        .login-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8125rem;
          color: var(--color-text-muted);
          margin-bottom: 32px;
          transition: color var(--transition);
        }
        .login-back:hover { color: var(--color-text); }
        .login-header { text-align: center; margin-bottom: 28px; }
        .login-welcome { color: var(--color-text-secondary); font-size: 0.9375rem; font-weight: 500; margin: 0 0 8px; }
        .login-logo {
          display: inline-flex; align-items: center; justify-content: center;
          width: 56px; height: 56px; border-radius: var(--radius-md);
          background: var(--color-accent); color: #fff;
          font-family: var(--font-display); font-weight: 700; font-size: 1.25rem;
          margin-bottom: 16px;
        }
        .login-title { font-size: 1.5rem; font-weight: 600; color: var(--color-text); margin-bottom: 4px; }
        .login-subtitle { font-size: 0.875rem; color: var(--color-text-secondary); }
        .login-social { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
        .login-social-btn {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 12px 16px; border-radius: var(--radius-sm);
          border: 1px solid var(--color-border); background: var(--color-bg);
          color: var(--color-text); font-size: 0.875rem; font-weight: 500;
          transition: all var(--transition);
        }
        .login-social-btn:hover:not(:disabled) { border-color: var(--color-accent); }
        .login-social-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .login-social-btn i { font-size: 1.0625rem; }
        .login-divider { text-align: center; margin-bottom: 20px; position: relative; }
        .login-divider::before { content: ''; position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: var(--color-border-soft); }
        .login-divider span { position: relative; background: var(--color-bg-card); padding: 0 12px; font-size: 0.75rem; color: var(--color-text-muted); }
        .login-form { display: flex; flex-direction: column; gap: 20px; }
        .login-field { display: flex; flex-direction: column; gap: 8px; }
        .login-field label { font-size: 0.8125rem; font-weight: 500; color: var(--color-text-secondary); }
        .login-field input {
          padding: 12px 16px; border-radius: var(--radius-sm);
          border: 1px solid var(--color-border); background: var(--color-bg);
          color: var(--color-text); font-family: var(--font-sans); font-size: 0.9375rem;
          transition: border-color var(--transition), box-shadow var(--transition);
        }
        .login-field input::placeholder { color: var(--color-text-muted); }
        .login-field input:focus { outline: none; border-color: var(--color-accent); box-shadow: 0 0 0 3px var(--color-accent-soft); }
        .login-error {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 16px; border-radius: var(--radius-sm);
          background: rgba(239,68,68,0.1); color: var(--color-error);
          font-size: 0.8125rem;
        }
        .login-info {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 16px; border-radius: var(--radius-sm);
          background: rgba(59,130,246,0.1); color: var(--color-accent);
          font-size: 0.8125rem;
        }
        .login-step-hint { font-size: 0.8125rem; color: var(--color-text-secondary); line-height: 1.5; margin-bottom: 4px; }
        .login-forgot {
          align-self: flex-end;
          font-size: 0.8125rem;
          color: var(--color-text-muted);
          transition: color var(--transition);
          background: none;
          border: none;
          padding: 0;
        }
        .login-forgot:hover { color: var(--color-accent); }
        .login-submit {
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          padding: 14px 24px; border-radius: var(--radius-md);
          background: var(--color-accent); color: #fff;
          font-size: 0.9375rem; font-weight: 500;
          transition: all var(--transition);
        }
        .login-submit:hover:not(:disabled) {
          background: var(--color-accent-hover); transform: translateY(-2px); box-shadow: var(--shadow-glow);
        }
        .login-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .login-switch { text-align: center; margin-top: 24px; }
        .login-switch-btn {
          font-size: 0.8125rem; color: var(--color-text-muted);
          transition: color var(--transition);
          display: inline-flex; align-items: center; gap: 6px;
        }
        .login-switch-btn span { color: var(--color-accent); font-weight: 500; }
        .login-switch-btn:hover { color: var(--color-text); }
      `}</style>
    </div>
  )
}
