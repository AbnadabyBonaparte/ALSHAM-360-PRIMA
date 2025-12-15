// src/components/ProtectedLayout.tsx
// ALSHAM 360° PRIMA — Protected Shell (AUTH GATE + APP CHROME)

import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/lib/supabase/useAuthStore'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import LayoutSupremo from '@/components/LayoutSupremo'

/**
 * ProtectedLayout (CANÔNICO)
 * - Gate de autenticação APENAS
 * - NÃO decide organização (isso é roteamento em App.tsx)
 * - Envolve TODAS as rotas internas com LayoutSupremo (Sidebar + Header + Shell)
 * - NÃO chama init() aqui (evita múltiplos listeners e loops)
 */
export function ProtectedLayout() {
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)

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

  return (
    <LayoutSupremo>
      <Outlet />
    </LayoutSupremo>
  )
}
