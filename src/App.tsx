// src/App.tsx
// ALSHAM 360° PRIMA — ROOT ROUTER (CANONICAL ORG GATE + INTERNAL PAGES)

import React, { useEffect, useMemo } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom'

import { useAuthStore } from '@/lib/supabase/useAuthStore'
import { ProtectedLayout } from '@/components/ProtectedLayout'
import { LoadingSpinner } from '@/components/LoadingSpinner'

// Internal page registry renderer
import { renderPage } from '@/routes'

// Auth pages
import { Login } from '@/pages/auth/Login'
import { SignUp } from '@/pages/auth/SignUp'
import { ForgotPassword } from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'

// Org
import { OrganizationSelector } from '@/pages/auth/OrganizationSelector'

// Precondition
import PreconditionGate from '@/pages/precondition/PreconditionGate'

function isRecoveryFlow(): boolean {
  if (typeof window === 'undefined') return false
  const h = window.location.hash || ''
  const s = window.location.search || ''
  return h.includes('type=recovery') || s.includes('type=recovery')
}

function AppPage() {
  const params = useParams()
  const pageId = params.pageId ?? 'dashboard'
  return <>{renderPage(pageId)}</>
}

/**
 * Rotas "reservadas" que NÃO devem cair na rota genérica "/:pageId".
 * Isso evita colisões e navegação errada.
 */
const RESERVED_TOP_LEVEL = new Set([
  'login',
  'signup',
  'forgot-password',
  'auth',
  'precondition',
  'select-organization',
  'dashboard',
  'app',
])

function AppContent() {
  const init = useAuthStore((s) => s.init)
  const loading = useAuthStore((s) => s.loading)
  const user = useAuthStore((s) => s.user)

  const currentOrgId = useAuthStore((s) => s.currentOrgId)
  const currentOrg = useAuthStore((s) => s.currentOrg)

  const recovery = useMemo(() => isRecoveryFlow(), [])

  useEffect(() => {
    init()
  }, [init])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const hasOrg = !!(currentOrgId && currentOrg)

  /**
   * ✅ Recovery MUST be forced.
   * Se tiver recovery no URL/hash, não pode existir "rota mais específica" que fure o redirect.
   */
  if (recovery) {
    return (
      <Routes>
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/auth/reset-password" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      {/* Always free */}
      <Route path="/precondition/:code" element={<PreconditionGate />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />

      {/* Public */}
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to={hasOrg ? '/dashboard' : '/select-organization'} replace />}
      />
      <Route
        path="/signup"
        element={!user ? <SignUp /> : <Navigate to={hasOrg ? '/dashboard' : '/select-organization'} replace />}
      />
      <Route
        path="/forgot-password"
        element={!user ? <ForgotPassword /> : <Navigate to={hasOrg ? '/dashboard' : '/select-organization'} replace />}
      />

      {/* Protected shell */}
      <Route element={<ProtectedLayout />}>
        {/* Org selector */}
        <Route
          path="/select-organization"
          element={hasOrg ? <Navigate to="/dashboard" replace /> : <OrganizationSelector />}
        />

        {/* Canonical dashboard */}
        <Route
          path="/dashboard"
          element={!hasOrg ? <Navigate to="/select-organization" replace /> : <>{renderPage('dashboard')}</>}
        />

        {/* Dynamic internal pages via registry (canonical) */}
        <Route
          path="/app/:pageId"
          element={!hasOrg ? <Navigate to="/select-organization" replace /> : <AppPage />}
        />

        /**
         * ✅ Compatibilidade com navegação do Sidebar via "/:pageId"
         * - Evita "travado no dashboard" quando Sidebar manda ids simples.
         * - Protege rotas reservadas.
         */
        <Route
          path="/:pageId"
          element={
            !hasOrg ? (
              <Navigate to="/select-organization" replace />
            ) : (
              <TopLevelPageGuard />
            )
          }
        />

        {/* Root */}
        <Route path="/" element={<Navigate to={hasOrg ? '/dashboard' : '/select-organization'} replace />} />

        {/* Catchall interno */}
        <Route path="*" element={<Navigate to={hasOrg ? '/dashboard' : '/select-organization'} replace />} />
      </Route>

      {/* Final fallback */}
      <Route path="*" element={<Navigate to={user ? (hasOrg ? '/dashboard' : '/select-organization') : '/login'} replace />} />
    </Routes>
  )
}

/**
 * Protege a rota genérica "/:pageId" contra colisões.
 * Se pageId for reservado, manda para a rota correta.
 * Caso contrário, renderiza via registry.
 */
function TopLevelPageGuard() {
  const params = useParams()
  const pageId = (params.pageId ?? '').trim()

  if (!pageId) return <Navigate to="/dashboard" replace />

  if (RESERVED_TOP_LEVEL.has(pageId)) {
    // Redireciona para o "canônico"
    if (pageId === 'dashboard') return <Navigate to="/dashboard" replace />
    if (pageId === 'select-organization') return <Navigate to="/select-organization" replace />
    if (pageId === 'login') return <Navigate to="/login" replace />
    if (pageId === 'signup') return <Navigate to="/signup" replace />
    if (pageId === 'forgot-password') return <Navigate to="/forgot-password" replace />
    if (pageId === 'auth') return <Navigate to="/auth/reset-password" replace />
    if (pageId === 'precondition') return <Navigate to="/precondition/BK_LOGIN" replace />
    if (pageId === 'app') return <Navigate to="/dashboard" replace />
  }

  // Renderiza página registrada
  return <>{renderPage(pageId)}</>
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}
