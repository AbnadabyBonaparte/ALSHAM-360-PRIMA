// src/components/ProtectedLayout.tsx
import React, { useCallback, useMemo } from 'react'
import { Navigate, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '@/lib/supabase/useAuthStore'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import LayoutSupremo from '@/components/LayoutSupremo'

function normalizePageId(value: string | undefined | null) {
  const v = (value ?? '').trim()
  if (!v) return 'dashboard'
  return v.replace(/^\//, '')
}

export function ProtectedLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams()

  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const loadingOrgs = useAuthStore((s) => s.loadingOrgs)
  const needsOrgSelection = useAuthStore((s) => s.needsOrgSelection)

  // ✅ Deriva o "activePage" da URL.
  // - Se sua App está em /dashboard -> activePage="dashboard"
  // - Se estiver em /leads -> activePage="leads"
  // - Se estiver em /p/:pageId -> usa params.pageId
  const activePage = useMemo(() => {
    const byParam = normalizePageId((params as any)?.pageId)
    if ((params as any)?.pageId) return byParam

    const path = normalizePageId(location.pathname)
    // path pode virar "dashboard", "select-organization", etc.
    // Para páginas internas, usamos o próprio path.
    return path || 'dashboard'
  }, [location.pathname, params])

  // ✅ Navegação real (Sidebar deixa de ser no-op)
  const onNavigate = useCallback(
    (pageId: string) => {
      const id = normalizePageId(pageId)

      // Proteções simples
      if (!id) return

      // Convenção canônica recomendada:
      // 1) dashboard fica em /dashboard
      // 2) demais páginas podem ficar em /<pageId> (ou /p/<pageId> se você preferir)
      //
      // Aqui adotamos /<pageId> para ser o mais simples e direto.
      // Se você já usa /p/:pageId no App.tsx, troque para: navigate(`/p/${id}`)
      navigate(`/${id}`, { replace: false })
    },
    [navigate]
  )

  // ✅ Loading gate global
  if (loading || loadingOrgs) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // ✅ Auth gate
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // ✅ Org gate (evita loop se já estiver no selector)
  if (needsOrgSelection && location.pathname !== '/select-organization') {
    return <Navigate to="/select-organization" replace />
  }

  return (
    <LayoutSupremo
      activePage={activePage}
      onNavigate={onNavigate}
    >
      <Outlet />
    </LayoutSupremo>
  )
}
