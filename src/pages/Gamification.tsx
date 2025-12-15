import React, { useEffect, useState } from 'react'
import { gamificationQueries } from '../lib/supabase/queries/gamification'
import { useAuthStore } from '../lib/supabase/useAuthStore'
import { LoadingSpinner } from '../components/LoadingSpinner'

export const Gamification: React.FC = () => {
  const { currentOrg, user } = useAuthStore()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (currentOrg && user) {
      loadGamificationData()
    }
  }, [currentOrg, user])

  const loadGamificationData = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await gamificationQueries.getUserGamificationStats(user!.id)

      if (error) {
        setError('Erro ao carregar dados de gamificação')
        return
      }

      setStats(data)
    } catch (err) {
      console.error('Error loading gamification data:', err)
      setError('Erro ao carregar dados de gamificação')
    } finally {
      setLoading(false)
    }
  }

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
          <h1 className="text-3xl font-bold text-alsham-text-primary">Gamificação</h1>
          <p className="text-alsham-text-secondary mt-2">
            Acompanhe seus pontos e conquistas
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-alsham-primary mb-2">
                {stats.total_points}
              </div>
              <div className="text-alsham-text-secondary">Pontos Totais</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-alsham-primary mb-2">
                {stats.badges_count}
              </div>
              <div className="text-alsham-text-secondary">Badges Conquistados</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-alsham-primary mb-2">
                #{stats.current_rank}
              </div>
              <div className="text-alsham-text-secondary">Posição no Ranking</div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-alsham-text-secondary mb-4">{error}</p>
            <button
              onClick={loadGamificationData}
              className="px-4 py-2 bg-alsham-primary text-white rounded-lg hover:bg-alsham-primary-hover"
            >
              Tentar novamente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
