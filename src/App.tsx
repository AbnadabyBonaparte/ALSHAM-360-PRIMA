// src/App.tsx
import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/lib/supabase/useAuthStore'
import { ProtectedLayout } from '@/components/ProtectedLayout'
import { OrganizationSelector } from '@/pages/auth/OrganizationSelector' // ou '@/components/auth/OrganizationSelector' se for o premium
import { LoadingSpinner } from '@/components/LoadingSpinner'

// Auth Pages
import { Login } from './pages/auth/Login'
import { SignUp } from './pages/auth/SignUp'
import { ForgotPassword } from './pages/auth/ForgotPassword'
import { ResetPassword } from './pages/auth/ResetPassword'

// Pages principais (importe as reais)
import { Dashboard } from './pages/Dashboard'
import { Leads } from './pages/Leads'
import { Opportunities } from './pages/Opportunities'
import { Campaigns } from './pages/Campaigns'
import { Analytics } from './pages/Analytics'
import { Automations } from './pages/Automations'
import { Gamification } from './pages/Gamification'
import { Settings } from './pages/Settings'

function AppContent() {
  const { user, currentOrg, organizations, loading, needsOrgSelection, initialize } = useAuthStore()

  useEffect(() => {
    initialize() // Inicializa sessão + listener
  }, [initialize])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  // Não logado → rotas públicas
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

  // Logado, mas precisa selecionar org
  if (needsOrgSelection || (organizations.length > 0 && !currentOrg)) {
    return <OrganizationSelector />
  }

  // Tudo pronto → app protegido
  return (
    <ProtectedLayout>
      <Routes>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="leads" element={<Leads />} />
        <Route path="opportunities" element={<Opportunities />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="automations" element={<Automations />} />
        <Route path="gamification" element={<Gamification />} />
        <Route path="settings" element={<Settings />} />
        {/* Adicione outras rotas aqui */}
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
