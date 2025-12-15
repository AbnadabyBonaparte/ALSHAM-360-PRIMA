// src/components/ProtectedLayout.tsx
import React, { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/lib/supabase/useAuthStore'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import LayoutSupremo from '@/components/LayoutSupremo'
import { OrganizationSelector } from '@/pages/auth/OrganizationSelector'

/**
 * ProtectedLayout (CANÔNICO)
 * - Gate de autenticação
 * - Gate de seleção de organização (se aplicável)
 * - Envolve TODAS as rotas internas com LayoutSupremo (Sidebar + Header + Shell)
 */
export function ProtectedLayout() {
  const location = useLocation()

  const user = useAuthStore(s => s.user)
  const loading = useAuthStore(s => s.loading)
  const init = useAuthStore(s => s.init)

  // Se seu store tiver estes campos, ele usa; se não tiver, não quebra.
  const needsOrgSelection = useAuthStore(s => (s as any).needsOrgSelection)
  const clearError = useAuthStore(s => (s as any).clearError)

  useEffect(() => {
    init?.()
  }, [init])

  useEffect(() => {
    clearError?.()
  }, [location.pathname, clearError])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Se o sistema usa orgs e o store sinaliza que precisa selecionar, renderiza o selector.
  if (needsOrgSelection) {
    return <OrganizationSelector />
  }

  // ✅ Aqui volta o chrome inteiro do app (sidebar + header)
  return (
    <LayoutSupremo>
      <Outlet />
    </LayoutSupremo>
  )
}
