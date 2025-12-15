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

  // ✅ activePage canônico baseado no seu App.tsx:
  // - /dashboard => dashboard
  // - /app/:pageId => pageId
  // - /select-organization => select-organization
  const activePage = useMemo(() => {
    const paramPage = (params as any)?.pageId as string | undefined
    if (paramPage) return normalizePageId(paramPage)

    const path = location.pathname || ''
    if (path === '/dashboard') return 'dashboard'
    if (path === '/select-organization') return 'select-organization'

    // fallback: tenta derivar do último segmento (sem quebrar o app)
    const last = path.split('/').filter(Boolean).pop()
    return normalizePageId(last ?? 'dashboard')
  }, [location.pathname, params])

  // ✅ Navegação real alinhada ao Router canônico:
  // - dashboard => /dashboard
  // - demais => /app/<pageId>
  const onNavigate = useCallback(
    (pageId: string) => {
      const id = normalizePageId(pageId)
      if (!id) return

      if (id === 'dashboard') {
        navigate('/dashboard', { replace: false })
        return
      }

      // Evita rotas proibidas/estruturais
      if (id === 'select-organization') {
        navigate('/select-organization', { replace: false })
        return
      }

      navigate(`/app/${id}`, { replace: false })
    },
    [navigate]
  )

  // ✅ Loading gate
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
    <LayoutSupremo activePage={activePage} onNavigate={onNavigate}>
      <Outlet />
    </LayoutSupremo>
  )
}
