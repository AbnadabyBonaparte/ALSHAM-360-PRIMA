// src/pages/Settings.tsx
// ALSHAM 360° PRIMA — Settings (migrado para shadcn/ui)

import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../lib/supabase/useAuthStore'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const Settings: React.FC = () => {
  const { currentOrg, user, signOut } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    await signOut()
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Configurações</h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Gerencie suas preferências e conta
          </p>
        </div>

        <div className="space-y-6">
          {/* Account Info */}
          <Card className="bg-[var(--surface)] border-[var(--border)]">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-[var(--text-primary)]">
                Informações da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)]">
                  Email
                </label>
                <p className="text-[var(--text-primary)]">{user?.email}</p>
              </div>
              {currentOrg && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)]">
                    Organização Atual
                  </label>
                  <p className="text-[var(--text-primary)]">{currentOrg.name}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="bg-[var(--surface)] border-[var(--border)]">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-[var(--text-primary)]">
                Ações da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleSignOut}
                disabled={loading}
                variant="destructive"
                className="w-full sm:w-auto bg-[var(--accent-alert)] hover:bg-[var(--accent-alert)]/90"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Sair da conta'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
