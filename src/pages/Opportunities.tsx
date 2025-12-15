import React, { useEffect, useState } from 'react'
import { opportunitiesQueries } from '../lib/supabase/queries/opportunities'
import { useAuthStore } from '../lib/supabase/useAuthStore'
import { LoadingSpinner } from '../components/LoadingSpinner'
import type { Opportunity } from '../lib/supabase/types'

export const Opportunities: React.FC = () => {
  const { currentOrg } = useAuthStore()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (currentOrg) {
      loadOpportunities()
    }
  }, [currentOrg])

  const loadOpportunities = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await opportunitiesQueries.getAll()

      if (error) {
        setError('Erro ao carregar oportunidades')
        return
      }

      setOpportunities(data)
    } catch (err) {
      console.error('Error loading opportunities:', err)
      setError('Erro ao carregar oportunidades')
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

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'prospecção': return 'bg-gray-100 text-gray-800'
      case 'qualificação': return 'bg-blue-100 text-blue-800'
      case 'proposta': return 'bg-yellow-100 text-yellow-800'
      case 'negociação': return 'bg-purple-100 text-purple-800'
      case 'fechada': return 'bg-green-100 text-green-800'
      case 'perdida': return 'bg-red-100 text-red-800'
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
          <h1 className="text-3xl font-bold text-alsham-text-primary">Oportunidades</h1>
          <p className="text-alsham-text-secondary mt-2">
            Gerencie seu pipeline de vendas
          </p>
        </div>

        {/* Opportunities List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {opportunities.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Oportunidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Probabilidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fechamento
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {opportunities.map((opp) => (
                    <tr key={opp.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {opp.title}
                          </div>
                          {opp.lead && (
                            <div className="text-sm text-gray-500">
                              {opp.lead.name} - {opp.lead.company}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(opp.value)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(opp.stage)}`}>
                          {opp.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {opp.probability}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {opp.expected_close_date ? formatDate(opp.expected_close_date) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-alsham-text-secondary">
                {error || 'Nenhuma oportunidade encontrada'}
              </p>
              {error && (
                <button
                  onClick={loadOpportunities}
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