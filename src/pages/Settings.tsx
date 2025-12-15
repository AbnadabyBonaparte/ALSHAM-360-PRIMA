import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../lib/supabase/useAuthStore'
import { LoadingSpinner } from '../components/LoadingSpinner'

export const Settings: React.FC = () => {
  const { currentOrg, user, signOut } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    await signOut()
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-alsham-bg-default">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-alsham-text-primary">Configurações</h1>
          <p className="text-alsham-text-secondary mt-2">
            Gerencie suas preferências e conta
          </p>
        </div>

        <div className="space-y-6">
          {/* Account Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-alsham-text-primary mb-4">
              Informações da Conta
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-alsham-text-secondary">
                  Email
                </label>
                <p className="text-alsham-text-primary">{user?.email}</p>
              </div>
              {currentOrg && (
                <div>
                  <label className="block text-sm font-medium text-alsham-text-secondary">
                    Organização Atual
                  </label>
                  <p className="text-alsham-text-primary">{currentOrg.name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-alsham-text-primary mb-4">
              Ações da Conta
            </h2>
            <div className="space-y-3">
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Sair da conta'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}