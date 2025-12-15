// FORCED REBUILD TRIGGER - AUTH FLOW ACTIVE - 2025-12-15 09:15
// src/App.tsx - FINAL ESTÁVEL (SINGLETON SUPABASE + AUTH STORE LIMPO)
import React, { useEffect } from 'react'
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

// ✅ Precondition route (resolve /precondition/BK_LOGIN sem quebrar o router)
import PreconditionGate from '@/pages/precondition/PreconditionGate'

function AppContent() {
  const user = useAuthStore(s => s.user)
  const loading = useAuthStore(s => s.loading)
  const init = useAuthStore(s => s.init)

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

      {/* 🌐 Rotas públicas */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
      <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/dashboard" replace />} />
      <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" replace />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />

      {/* 🔒 Rotas protegidas (aninhadas com Outlet) */}
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardSupremo />} />
        {/* coloque suas outras páginas aqui, como children */}
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
