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
  const needsOrgSelection = useAuthStore((s) => s.needsOrgSelection)

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

  // ✅ Gate de org: evita loop se já estiver no selector
  if (needsOrgSelection && location.pathname !== '/select-organization') {
    return <Navigate to="/select-organization" replace />
  }

  return (
    <LayoutSupremo>
      <Outlet />
    </LayoutSupremo>
  )
}
