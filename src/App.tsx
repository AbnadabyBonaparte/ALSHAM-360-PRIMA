// src/App.tsx
// ALSHAM 360° PRIMA — ROOT ROUTER (CANONICAL ORG GATE)

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

function AppPage() {
  const params = useParams()
  const pageId = params.pageId ?? 'dashboard'
  return <>{renderPage(pageId)}</>
}

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
        {/* Org gate */}
        <Route
          path="/select-organization"
          element={hasOrg ? <Navigate to="/dashboard" replace /> : <OrganizationSelector />}
        />

        {/* Canonical dashboard */}
        <Route
          path="/dashboard"
          element={!hasOrg ? <Navigate to="/select-organization" replace /> : <DashboardSupremo />}
        />

        {/* Dynamic internal pages via registry */}
        <Route
          path="/app/:pageId"
          element={!hasOrg ? <Navigate to="/select-organization" replace /> : <AppPage />}
        />

        <Route path="/" element={<Navigate to={hasOrg ? '/dashboard' : '/select-organization'} replace />} />

        {/* Catchall interno: decide por org */}
        <Route
          path="*"
          element={<Navigate to={hasOrg ? '/dashboard' : '/select-organization'} replace />}
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
