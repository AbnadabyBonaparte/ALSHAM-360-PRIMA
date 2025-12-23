import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../lib/supabase/useAuthStore'
import { LoadingSpinner } from '../components/LoadingSpinner'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export const Settings: React.FC = () => {
  const { currentOrg, user, signOut } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    await signOut()
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text)]">Configurações</h1>
          <p className="text-[var(--text-2)] mt-2">
            Gerencie suas preferências e conta
          </p>
        </div>

        <div className="space-y-6">
          {/* Account Info */}
          <Card className="bg-[var(--surface)] border-[var(--border)]">
            <CardHeader>
              <CardTitle className="text-xl text-[var(--text)]">Informações da Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-2)]">
                  Email
                </label>
                <p className="text-[var(--text)]">{user?.email}</p>
              </div>
              {currentOrg && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-2)]">
                    Organização Atual
                  </label>
                  <p className="text-[var(--text)]">{currentOrg.name}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="bg-[var(--surface)] border-[var(--border)]">
            <CardHeader>
              <CardTitle className="text-xl text-[var(--text)]">Ações da Conta</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleSignOut}
                disabled={loading}
                variant="destructive"
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4 rounded-full" />
                    Saindo...
                  </div>
                ) : (
                  'Sair da conta'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}