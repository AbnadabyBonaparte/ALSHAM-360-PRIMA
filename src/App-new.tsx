import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedLayout } from './components/ProtectedLayout'

// Pages principais (já existentes e reais)
import { Dashboard } from './pages/Dashboard'
import { Leads } from './pages/Leads'
import { Opportunities } from './pages/Opportunities'
import { Campaigns } from './pages/Campaigns'
import { Analytics } from './pages/Analytics'
import { Automations } from './pages/Automations'
import { Gamification } from './pages/Gamification'
import { Settings } from './pages/Settings'

// Auth Pages - named exports corrigidos
import { Login } from './pages/auth/Login.tsx'
import { SignUp } from './pages/auth/SignUp.tsx'
import { ForgotPassword } from './pages/auth/ForgotPassword.tsx'
import { ResetPassword } from './pages/auth/ResetPassword.tsx'
import { OrganizationSelector } from './pages/auth/OrganizationSelector.tsx'

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />

        {/* Rotas Protegidas */}
        <Route path="/" element={<ProtectedLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="opportunities" element={<Opportunities />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="automations" element={<Automations />} />
          <Route path="gamification" element={<Gamification />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch-all: redireciona para dashboard se logado */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App
