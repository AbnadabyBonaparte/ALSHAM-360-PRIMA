import React, { useEffect, useState } from 'react'
import { campaignsQueries } from '../lib/supabase/queries/campaigns'
import { useAuthStore } from '../lib/supabase/useAuthStore'
import { LoadingSpinner } from '../components/LoadingSpinner'
import type { Campaign } from '../lib/supabase/types'

export const Campaigns: React.FC = () => {
  const { currentOrg } = useAuthStore()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (currentOrg) {
      loadCampaigns()
    }
  }, [currentOrg])

  const loadCampaigns = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await campaignsQueries.getAll()

      if (error) {
        setError('Erro ao carregar campanhas')
        return
      }

      setCampaigns(data)
    } catch (err) {
      console.error('Error loading campaigns:', err)
      setError('Erro ao carregar campanhas')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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
          <h1 className="text-3xl font-bold text-alsham-text-primary">Campanhas</h1>
          <p className="text-alsham-text-secondary mt-2">
            Gerencie suas campanhas de marketing
          </p>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.length > 0 ? (
            campaigns.map((campaign) => (
              <div key={campaign.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-alsham-text-primary">
                      {campaign.name}
                    </h3>
                    <p className="text-sm text-alsham-text-secondary capitalize">
                      {campaign.type}
                    </p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-alsham-text-secondary">Orçamento:</span>
                    <span className="font-medium">{formatCurrency(campaign.budget)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-alsham-text-secondary">Gasto:</span>
                    <span className="font-medium">{formatCurrency(campaign.spent)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-alsham-text-secondary">Período:</span>
                    <span className="font-medium">
                      {formatDate(campaign.start_date)}
                      {campaign.end_date && ` - ${formatDate(campaign.end_date)}`}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-alsham-text-secondary">Progresso</span>
                    <span className="text-sm font-medium">
                      {Math.round((campaign.spent / campaign.budget) * 100)}%
                    </span>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-alsham-primary h-2 rounded-full"
                      style={{ width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-alsham-text-secondary">
                {error || 'Nenhuma campanha encontrada'}
              </p>
              {error && (
                <button
                  onClick={loadCampaigns}
                  className="mt-4 px-4 py-2 bg-alsham-primary text-white rounded-lg hover:bg-alsham-primary-hover"
                >
                  Tentar novamente
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}