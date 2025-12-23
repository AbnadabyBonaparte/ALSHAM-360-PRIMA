import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedLayout } from './components/ProtectedLayout'

// Pages
import { Dashboard } from './pages/Dashboard'
import { Leads } from './pages/Leads'
import { Opportunities } from './pages/Opportunities'
import { Campaigns } from './pages/Campaigns'
import { Analytics } from './pages/Analytics'
import { Automations } from './pages/Automations'
import { Gamification } from './pages/Gamification'
import { Settings } from './pages/Settings'

// Auth Pages
import { Login } from './pages/auth/Login'
import { SignUp } from './pages/auth/SignUp'
import { ForgotPassword } from './pages/auth/ForgotPassword'
import { ResetPassword } from './pages/auth/ResetPassword'
import { OrganizationSelector } from './pages/auth/OrganizationSelector'

// Placeholder for development
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-alsham-text-primary mb-4">{title}</h1>
      <p className="text-alsham-text-secondary">Página em desenvolvimento</p>
    </div>
  </div>
)

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
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

          {/* Placeholder routes for future development */}
          <Route path="leads/import" element={<PlaceholderPage title="Importação de Leads" />} />
          <Route path="leads/:id" element={<PlaceholderPage title="Detalhes do Lead" />} />
          <Route path="opportunities/:id" element={<PlaceholderPage title="Detalhes da Oportunidade" />} />
          <Route path="campaigns/:id" element={<PlaceholderPage title="Detalhes da Campanha" />} />
          <Route path="contacts" element={<PlaceholderPage title="Contatos" />} />
          <Route path="accounts" element={<PlaceholderPage title="Contas" />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
