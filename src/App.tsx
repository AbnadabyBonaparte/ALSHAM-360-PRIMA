// src/App.tsx
// ALSHAM 360° PRIMA — ROOT ROUTER (FINAL STABLE)
// Auth orchestration lives HERE. Layout lives elsewhere.

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
 * (hash ou search param)
 */
function isRecoveryFlow(): boolean {
  if (typeof window === 'undefined') return false
  const h = window.location.hash || ''
  const s = window.location.search || ''
  return h.includes('type=recovery') || s.includes('type=recovery')
}

function AppContent() {
  const {
    user,
    loading,
    init,
    currentOrg,
  } = useAuthStore()

  // trava o estado de recovery no primeiro render
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
          🔓 ROTAS SEMPRE LIVRES
         ========================================================= */}
      <Route path="/precondition/:code" element={<PreconditionGate />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />

      {/* Força reset se for recovery */}
      {recovery && (
        <Route path="*" element={<Navigate to="/auth/reset-password" replace />} />
      )}

      {/* =========================================================
          🌐 ROTAS PÚBLICAS (NÃO LOGADO)
         ========================================================= */}
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/signup"
        element={!user ? <SignUp /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/forgot-password"
        element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" replace />}
      />

      {/* =========================================================
          🔒 ROTAS PROTEGIDAS (LOGIN OK)
         ========================================================= */}
      <Route element={<ProtectedLayout />}>
        {/* usuário logado, mas SEM organização */}
        {!currentOrg && (
          <Route
            path="*"
            element={<OrganizationSelector />}
          />
        )}

        {/* usuário logado + org selecionada */}
        {currentOrg && (
          <>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardSupremo />} />
            {/* outras páginas internas entram aqui */}
          </>
        )}
      </Route>

      {/* =========================================================
          🧭 FALLBACK FINAL
         ========================================================= */}
      <Route
        path="*"
        element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
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
