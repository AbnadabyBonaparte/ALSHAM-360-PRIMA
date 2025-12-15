import React, { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../lib/supabase/useAuthStore'
import { OrganizationSelector } from './OrganizationSelector'
import { LoadingSpinner } from './LoadingSpinner'

export const ProtectedLayout: React.FC = () => {
  const {
    isAuthenticated,
    loading,
    needsOrgSelection,
    initialize,
    clearError
  } = useAuthStore()

  const location = useLocation()

  // Inicializar auth state quando o componente monta
  useEffect(() => {
    initialize()
  }, [initialize])

  // Limpar erros quando a rota muda
  useEffect(() => {
    clearError()
  }, [location.pathname, clearError])

  // Mostrar loading enquanto inicializa
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-alsham-primary/5 to-alsham-secondary/5">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Redirecionar para login se não estiver autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Mostrar seletor de organização se necessário
  if (needsOrgSelection) {
    return <OrganizationSelector />
  }

  // Renderizar conteúdo protegido
  return <Outlet />
}

// Componente para seleção de organização
const OrganizationSelector: React.FC = () => {
  const { organizations, switchOrganization, loading, error } = useAuthStore()

  const handleOrgSelect = async (orgId: string) => {
    await switchOrganization(orgId)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-alsham-primary/5 to-alsham-secondary/5 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-alsham-text-primary mb-2">
            Selecionar Organização
          </h1>
          <p className="text-alsham-text-secondary">
            Escolha qual organização você deseja acessar
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          {organizations.map((org) => (
            <button
              key={org.id}
              onClick={() => handleOrgSelect(org.id)}
              disabled={loading}
              className="w-full p-4 border border-alsham-border-default rounded-lg hover:bg-alsham-bg-surface hover:border-alsham-primary transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center space-x-3">
                {org.logo_url ? (
                  <img
                    src={org.logo_url}
                    alt={org.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-alsham-primary/10 flex items-center justify-center">
                    <span className="text-alsham-primary font-semibold text-lg">
                      {org.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-alsham-text-primary">
                    {org.name}
                  </h3>
                  {org.domain && (
                    <p className="text-sm text-alsham-text-secondary">
                      {org.domain}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => window.location.reload()}
            className="text-alsham-primary hover:text-alsham-primary-hover text-sm underline"
          >
            Recarregar página
          </button>
        </div>
      </div>
    </div>
  )
}

// Componente de loading simples
const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`${sizeClasses[size]} border-4 border-alsham-primary/20 border-t-alsham-primary rounded-full animate-spin`}></div>
  )
}
