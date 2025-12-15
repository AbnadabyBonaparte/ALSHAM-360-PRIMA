import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../lib/supabase/useAuthStore'
import { LoadingSpinner } from '../components/LoadingSpinner'

export const Automations: React.FC = () => {
  const { currentOrg } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentOrg) {
      // TODO: Load automations data
      setTimeout(() => setLoading(false), 1000)
    }
  }, [currentOrg])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-alsham-bg-default">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-alsham-text-primary">Automações</h1>
          <p className="text-alsham-text-secondary mt-2">
            Configure workflows automatizados
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-semibold text-alsham-text-primary mb-4">
            Automações em Desenvolvimento
          </h2>
          <p className="text-alsham-text-secondary">
            Sistema de automação inteligente será implementado em breve.
          </p>
        </div>
      </div>
    </div>
  )
}
