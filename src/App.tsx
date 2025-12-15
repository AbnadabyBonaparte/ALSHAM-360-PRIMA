// src/App.tsx
// ALSHAM 360° PRIMA — ROOT ROUTER (CANONICAL ORG GATE)

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

// Org
import { OrganizationSelector } from '@/pages/auth/OrganizationSelector'

// App pages
import DashboardSupremo from '@/pages/Dashboard'

// Precondition
import PreconditionGate from '@/pages/precondition/PreconditionGate'

function isRecoveryFlow(): boolean {
  if (typeof window === 'undefined') return false
  const h = window.location.hash || ''
  const s = window.location.search || ''
  return h.includes('type=recovery') || s.includes('type=recovery')
}

function AppContent() {
  const init = useAuthStore((s) => s.init)
  const loading = useAuthStore((s) => s.loading)
  const user = useAuthStore((s) => s.user)

  // ✅ CORREÇÃO P0: usar estado tipado real do store (sem any cast)
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

  return (
    <Routes>
      {/* Always free */}
      <Route path="/precondition/:code" element={<PreconditionGate />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />

      {/* Force reset if recovery */}
      {recovery && <Route path="*" element={<Navigate to="/auth/reset-password" replace />} />}

      {/* Public */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
      <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/dashboard" replace />} />
      <Route
        path="/forgot-password"
        element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" replace />}
      />

      {/* Protected shell */}
      <Route element={<ProtectedLayout />}>
        {/* Org gate CANÔNICO */}
        <Route
          path="/select-organization"
          element={currentOrg ? <Navigate to="/dashboard" replace /> : <OrganizationSelector />}
        />

        {/* Internal pages */}
        <Route
          path="/dashboard"
          element={!currentOrg ? <Navigate to="/select-organization" replace /> : <DashboardSupremo />}
        />

        <Route
          path="/"
          element={<Navigate to={currentOrg ? '/dashboard' : '/select-organization'} replace />}
        />

        {/* Catchall interno: decide por org */}
        <Route
          path="*"
          element={<Navigate to={currentOrg ? '/dashboard' : '/select-organization'} replace />}
        />
      </Route>

      {/* Final fallback */}
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
