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
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <Routes>
      {/* ✅ Sempre disponível (evita “No routes matched /precondition/BK_LOGIN”) */}
      <Route path="/precondition/:code" element={<PreconditionGate />} />

      {!user ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <>
          <Route
            path="/*"
            element={
              <ProtectedLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardSupremo />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </ProtectedLayout>
            }
          />
        </>
      )}
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
