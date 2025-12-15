// src/components/ProtectedLayout.tsx
import React, { useMemo } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/lib/supabase/useAuthStore'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import LayoutSupremo from '@/components/LayoutSupremo'

function deriveActivePageFromPath(pathname: string): string {
  // /dashboard => dashboard
  if (pathname === '/dashboard' || pathname === '/dashboard/') return 'dashboard'

  // /app/:pageId => pageId
  if (pathname.startsWith('/app/')) {
    const id = pathname.replace('/app/', '').split('/')[0]
    return (id || 'dashboard').trim()
  }

  // /select-organization etc.
  return 'dashboard'
}

export function ProtectedLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const loadingOrgs = useAuthStore((s) => s.loadingOrgs)
  const needsOrgSelection = useAuthStore((s) => s.needsOrgSelection)

  const activePage = useMemo(() => deriveActivePageFromPath(location.pathname), [location.pathname])

  const onNavigate = (pageId: string) => {
    const id = (pageId ?? '').trim()
    if (!id) return

    // Canonical: dashboard em rota própria
    if (id === 'dashboard') {
      navigate('/dashboard', { replace: false })
      return
    }

    // Todas as demais páginas via registry: /app/:pageId
    navigate(`/app/${encodeURIComponent(id)}`, { replace: false })
  }

  if (loading || loadingOrgs) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Gate de org (evita loop se já estiver no selector)
  if (needsOrgSelection && location.pathname !== '/select-organization') {
    return <Navigate to="/select-organization" replace />
  }

  return (
    <LayoutSupremo activePage={activePage} onNavigate={onNavigate}>
      <Outlet />
    </LayoutSupremo>
  )
}
