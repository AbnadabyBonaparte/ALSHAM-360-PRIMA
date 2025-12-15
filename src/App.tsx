// src/App.tsx
// ALSHAM 360° PRIMA — ROOT ROUTER (FINAL • ORG-AWARE • ANTI-LOOP)

import React, { useEffect, useMemo } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import { useAuthStore } from '@/lib/supabase/useAuthStore'
import { ProtectedLayout } from '@/components/ProtectedLayout'
import { LoadingSpinner } from '@/components/LoadingSpinner'

// Auth pages
import { Login } from '@/pages/auth/Login'
import { SignUp } from '@/pages/auth/SignUp'
import { ForgotPassword } from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'
import { OrganizationSelector } from '@/pages/auth/OrganizationSelector'

// App pages
import DashboardSupremo from '@/pages/Dashboard'

// Precondition
import PreconditionGate from '@/pages/precondition/PreconditionGate'

/**
 * Detecta fluxo de recovery do Supabase
 */
function isRecoveryFlow(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.location.hash.includes('type=recovery') ||
    window.location.search.includes('type=recovery')
  )
}

function AppContent() {
  const {
    user,
    loading,
    init,
    currentOrg,
  } = useAuthStore()

  // trava recovery no primeiro render
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

  return (
    <Routes>
      {/* =========================================================
          🔓 SEMPRE LIVRES
         ========================================================= */}
      <Route path="/precondition/:code" element={<PreconditionGate />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />

      {/* Recovery tem prioridade absoluta */}
      {recovery && (
        <Route path="*" element={<Navigate to="/auth/reset-password" replace />} />
      )}

      {/* =========================================================
          🌐 PÚBLICAS (NÃO LOGADO)
         ========================================================= */}
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/" replace />}
      />
      <Route
        path="/signup"
        element={!user ? <SignUp /> : <Navigate to="/" replace />}
      />
      <Route
        path="/forgot-password"
        element={!user ? <ForgotPassword /> : <Navigate to="/" replace />}
      />

      {/* =========================================================
          🔒 PROTEGIDAS (LOGADO)
         ========================================================= */}
      <Route element={<ProtectedLayout />}>
        {/* Root decide org vs dashboard */}
        <Route
          path="/"
          element={
            !currentOrg
              ? <Navigate to="/select-organization" replace />
              : <Navigate to="/dashboard" replace />
          }
        />

        {/* Seleção de organização */}
        <Route
          path="/select-organization"
          element={<OrganizationSelector />}
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            currentOrg
              ? <DashboardSupremo />
              : <Navigate to="/select-organization" replace />
          }
        />

        {/* outras páginas internas entram aqui */}
      </Route>

      {/* =========================================================
          🧭 FALLBACK FINAL
         ========================================================= */}
      <Route
        path="*"
        element={<Navigate to={user ? '/' : '/login'} replace />}
      />
    </Routes>
  )
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}
