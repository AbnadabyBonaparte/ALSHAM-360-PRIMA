// src/App.tsx - VERSÃO FINAL ABSOLUTA COM AUTH REAL
import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/lib/supabase/useAuthStore'
import { ProtectedLayout } from '@/components/ProtectedLayout'
import { OrganizationSelector } from '@/pages/auth/OrganizationSelector'
import { LoadingSpinner } from '@/components/LoadingSpinner'

import { Login } from './pages/auth/Login'
import { SignUp } from './pages/auth/SignUp'
import { ForgotPassword } from './pages/auth/ForgotPassword'
import { ResetPassword } from './pages/auth/ResetPassword'

import DashboardSupremo from './pages/Dashboard' // seu dashboard lindo

function AppContent() {
  const { user, currentOrg, organizations, loading, needsOrgSelection, initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-background"><LoadingSpinner size="large" /></div>
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  if (needsOrgSelection || (organizations.length > 0 && !currentOrg)) {
    return <OrganizationSelector />
  }

  return (
    <ProtectedLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardSupremo />} />
        {/* Outras rotas aqui */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ProtectedLayout>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
