import React, { useEffect, useState } from 'react'
import { opportunitiesQueries } from '../lib/supabase/queries/opportunities'
import { useAuthStore } from '../lib/supabase/useAuthStore'
import { LoadingSpinner } from '../components/LoadingSpinner'
import type { Opportunity } from '../lib/supabase/types'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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
      setOpportunities(data || [])
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

  const getStageVariant = (stage: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (stage.toLowerCase()) {
      case 'prospecção': return 'secondary'
      case 'qualificação': return 'default'
      case 'proposta': return 'outline'
      case 'negociação': return 'outline'
      case 'fechada': return 'default'
      case 'perdida': return 'destructive'
      default: return 'secondary'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="space-y-4">
          <div className="h-8 w-64 bg-[var(--surface)] rounded animate-pulse"></div>
          <div className="h-4 w-96 bg-[var(--surface)] rounded animate-pulse"></div>
          <div className="h-96 w-full max-w-7xl bg-[var(--surface)] rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text)]">Oportunidades</h1>
          <p className="text-[var(--text-2)] mt-2">
            Gerencie seu pipeline de vendas
          </p>
        </div>

        {/* Opportunities List */}
        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardHeader>
            <CardTitle>Lista de Oportunidades</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {opportunities.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[var(--text-2)]">Oportunidade</TableHead>
                      <TableHead className="text-[var(--text-2)]">Valor</TableHead>
                      <TableHead className="text-[var(--text-2)]">Stage</TableHead>
                      <TableHead className="text-[var(--text-2)]">Probabilidade</TableHead>
                      <TableHead className="text-[var(--text-2)]">Fechamento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {opportunities.map((opp) => (
                      <TableRow key={opp.id} className="hover:bg-[var(--surface-elev)]">
                        <TableCell className="font-medium">
                          <div>
                            <div className="text-sm font-medium text-[var(--text)]">
                              {opp.title}
                            </div>
                            {opp.lead && (
                              <div className="text-sm text-[var(--text-2)]">
                                {opp.lead.name} - {opp.lead.company}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-[var(--text)]">
                          {formatCurrency(opp.value)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStageVariant(opp.stage)}>
                            {opp.stage}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[var(--text)]">
                          {opp.probability}%
                        </TableCell>
                        <TableCell className="text-[var(--text-2)]">
                          {opp.expected_close_date ? formatDate(opp.expected_close_date) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-[var(--text-2)]">
                  {error || 'Nenhuma oportunidade encontrada'}
                </p>
                {error && (
                  <Button onClick={loadOpportunities} className="mt-4">
                    Tentar novamente
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
