// FORCED REBUILD TRIGGER - AUTH FLOW ACTIVE - 2025-12-15 09:15
// src/App.tsx — FINAL ESTÁVEL (RECOVERY FIRST + SINGLETON SUPABASE + PROTECTED OUTLET)
import React, { useEffect, useMemo } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/lib/supabase/useAuthStore'
import { ProtectedLayout } from '@/components/ProtectedLayout'
import { LoadingSpinner } from '@/components/LoadingSpinner'

// Auth pages
import { Login } from '@/pages/auth/Login'
import { SignUp } from '@/pages/auth/SignUp'
import { ForgotPassword } from '@/pages/auth/ForgotPassword'
import { ResetPassword } from '@/pages/auth/ResetPassword'

// App pages
import DashboardSupremo from '@/pages/Dashboard'

// ✅ Precondition route
import PreconditionGate from '@/pages/precondition/PreconditionGate'

// Detecta fluxo de recovery do Supabase (normalmente vem no hash)
function isRecoveryFlow(): boolean {
  if (typeof window === 'undefined') return false
  const h = window.location.hash || ''
  const s = window.location.search || ''
  return h.includes('type=recovery') || s.includes('type=recovery')
}

function AppContent() {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const init = useAuthStore((s) => s.init)

  // “gruda” o estado do recovery no primeiro load (evita piscar/redirect errado)
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
      {/* ✅ Sempre disponível */}
      <Route path="/precondition/:code" element={<PreconditionGate />} />

      {/* ✅ Reset password sempre acessível (mesmo logado) */}
      <Route path="/auth/reset-password" element={<ResetPassword />} />

      {/* ✅ Se o link for recovery, força entrar no reset antes de qualquer redirect */}
      {recovery && <Route path="*" element={<Navigate to="/auth/reset-password" replace />} />}

      {/* 🌐 Rotas públicas */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
      <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/dashboard" replace />} />
      <Route
        path="/forgot-password"
        element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" replace />}
      />

      {/* 🔒 Rotas protegidas (aninhadas com Outlet) */}
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardSupremo />} />
        {/* coloque suas outras páginas aqui */}
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
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
