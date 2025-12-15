import React, { useEffect, useState } from 'react'
import { leadsQueries } from '../lib/supabase/queries/leads'
import { useAuthStore } from '../lib/supabase/useAuthStore'
import { LoadingSpinner } from '../components/LoadingSpinner'
import type { Lead } from '../lib/supabase/types'

export const Leads: React.FC = () => {
  const { currentOrg } = useAuthStore()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  useEffect(() => {
    if (currentOrg) {
      loadLeads()
    }
  }, [currentOrg, searchTerm, statusFilter])

  const loadLeads = async () => {
    try {
      setLoading(true)
      setError(null)

      const filters: any = {}
      if (searchTerm) filters.search = searchTerm
      if (statusFilter) filters.status = statusFilter

      const { data, error } = await leadsQueries.getAll(filters)

      if (error) {
        setError('Erro ao carregar leads')
        return
      }

      setLeads(data)
    } catch (err) {
      console.error('Error loading leads:', err)
      setError('Erro ao carregar leads')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'novo': return 'bg-green-100 text-green-800'
      case 'qualificado': return 'bg-blue-100 text-blue-800'
      case 'contato': return 'bg-yellow-100 text-yellow-800'
      case 'proposta': return 'bg-purple-100 text-purple-800'
      case 'fechado': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTemperatureColor = (temperature: string) => {
    switch (temperature) {
      case 'quente': return 'bg-red-100 text-red-800'
      case 'morno': return 'bg-yellow-100 text-yellow-800'
      case 'frio': return 'bg-blue-100 text-blue-800'
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
          <h1 className="text-3xl font-bold text-alsham-text-primary">Leads</h1>
          <p className="text-alsham-text-secondary mt-2">
            Gerencie seus leads e prospects
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por nome, email ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-alsham-border-default rounded-lg focus:ring-2 focus:ring-alsham-primary focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-alsham-border-default rounded-lg focus:ring-2 focus:ring-alsham-primary focus:border-transparent"
              >
                <option value="">Todos os status</option>
                <option value="novo">Novo</option>
                <option value="qualificado">Qualificado</option>
                <option value="contato">Contato</option>
                <option value="proposta">Proposta</option>
                <option value="fechado">Fechado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {leads.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Temperatura
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Criado em
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {lead.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {lead.email}
                          </div>
                          {lead.phone && (
                            <div className="text-sm text-gray-500">
                              {lead.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {lead.company || '-'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {lead.position || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTemperatureColor(lead.temperature)}`}>
                          {lead.temperature}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.score}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(lead.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-alsham-text-secondary">
                {error || 'Nenhum lead encontrado'}
              </p>
              {error && (
                <button
                  onClick={loadLeads}
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