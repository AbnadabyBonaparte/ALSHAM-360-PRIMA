// src/components/ProtectedLayout.tsx
import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/lib/supabase/useAuthStore'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import LayoutSupremo from '@/components/LayoutSupremo'

export function ProtectedLayout() {
  const location = useLocation()

  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const loadingOrgs = useAuthStore((s) => s.loadingOrgs)
  const organizations = useAuthStore((s) => s.organizations)
  const currentOrgId = useAuthStore((s) => s.currentOrgId)

  // 1) Loader global
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // 2) Sem sessão => login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 3) Enquanto orgs ainda estão carregando, não decide rotas
  if (loadingOrgs) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const orgCount = Array.isArray(organizations) ? organizations.length : 0
  const hasOrgSelected = !!currentOrgId

  // 4) Gate canônico:
  // - Se 0 orgs => vai para selector (que mostra estado "sem org")
  // - Se >1 orgs e não selecionou => selector
  // - Evita loop se já estiver no selector
  const mustSelectOrg = !hasOrgSelected && (orgCount === 0 || orgCount > 1)

  if (mustSelectOrg && location.pathname !== '/select-organization') {
    return <Navigate to="/select-organization" replace />
  }

  return (
    <LayoutSupremo>
      <Outlet />
    </LayoutSupremo>
  )
}
