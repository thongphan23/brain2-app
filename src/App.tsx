import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { ToastProvider } from './components/shared/Toast'
import { ErrorBoundary } from './components/shared/ErrorBoundary'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Skeleton } from './components/shared/Skeleton'

// Eager loads (critical)
import { LandingPage } from './pages/LandingPage'
import { AuthCallback } from './pages/AuthCallback'
import { OnboardingPage } from './pages/OnboardingPage'
import { ChatPage } from './pages/ChatPage'

// Lazy loads (non-critical)
const VaultPage = lazy(() => import('./pages/VaultPage').then(m => ({ default: m.VaultPage })))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const ImportPage = lazy(() => import('./pages/ImportPage').then(m => ({ default: m.ImportPage })))
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })))

// ─── Page Fallback ────────────────────────────────────────────
function PageFallback() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Skeleton height="40px" width="200px" />
    </div>
  )
}

// ─── Landing Route ─────────────────────────────────────────────
function LandingRoute() {
  const { user, loading, profile, signInWithGoogle } = useAuth()

  if (loading) {
    return (
      <div className="auth-callback">
        <div className="auth-callback-card">
          <div className="auth-callback-spinner">⏳</div>
        </div>
      </div>
    )
  }

  if (user && profile?.onboarding_completed) return <Navigate to="/chat" replace />
  if (user && !profile?.onboarding_completed) return <Navigate to="/onboarding" replace />

  return <LandingPage onGetStarted={signInWithGoogle} />
}

// ─── Protected Route Wrapper ──────────────────────────────────
// NOTE: Calls useAuth() from context — no new listener created.
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, profile } = useAuth()

  if (loading) {
    return (
      <div className="auth-callback">
        <div className="auth-callback-card">
          <div className="auth-callback-spinner">⏳</div>
          <div className="auth-callback-title">🧠 Brain2</div>
          <div className="auth-callback-subtitle">Đang tải...</div>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/" replace />
  if (!profile?.onboarding_completed) return <Navigate to="/onboarding" replace />

  return <>{children}</>
}

// ─── Routes ───────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingRoute />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Auth + onboarding */}
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />

      {/* Lazy-loaded */}
      <Route path="/vault" element={<ProtectedRoute><Suspense fallback={<PageFallback />}><VaultPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Suspense fallback={<PageFallback />}><DashboardPage /></Suspense></ProtectedRoute>} />
      <Route path="/import" element={<ProtectedRoute><Suspense fallback={<PageFallback />}><ImportPage /></Suspense></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Suspense fallback={<PageFallback />}><SettingsPage /></Suspense></ProtectedRoute>} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// ─── App Root ──────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ErrorBoundary>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ErrorBoundary>
      </ToastProvider>
    </BrowserRouter>
  )
}
