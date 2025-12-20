// src/pages/Opportunities.tsx
// ALSHAM 360° PRIMA — Opportunities (migrado para shadcn/ui)

import React, { useEffect, useState } from 'react'
import { opportunitiesQueries } from '../lib/supabase/queries/opportunities'
import { useAuthStore } from '../lib/supabase/useAuthStore'
import { LoadingSpinner } from '../components/LoadingSpinner'
import type { Opportunity } from '../lib/supabase/types'
import { Card, CardContent } from '@/components/ui/card'
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

  const getStageVariant = (stage: string): { bg: string; text: string } => {
    switch (stage) {
      case 'prospecção':
        return { bg: 'bg-[var(--surface-strong)]', text: 'text-[var(--text-secondary)]' }
      case 'qualificação':
        return { bg: 'bg-[var(--accent-sky)]/10', text: 'text-[var(--accent-sky)]' }
      case 'proposta':
        return { bg: 'bg-[var(--accent-warning)]/10', text: 'text-[var(--accent-warning)]' }
      case 'negociação':
        return { bg: 'bg-[var(--accent-purple)]/10', text: 'text-[var(--accent-purple)]' }
      case 'fechada':
        return { bg: 'bg-[var(--accent-emerald)]/10', text: 'text-[var(--accent-emerald)]' }
      case 'perdida':
        return { bg: 'bg-[var(--accent-alert)]/10', text: 'text-[var(--accent-alert)]' }
      default:
        return { bg: 'bg-[var(--surface-strong)]', text: 'text-[var(--text-secondary)]' }
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
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Oportunidades</h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Gerencie seu pipeline de vendas
          </p>
        </div>

        {/* Opportunities List */}
        <Card className="border-[var(--border)]/40 bg-[var(--surface)]/70 backdrop-blur-xl overflow-hidden">
          {opportunities.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[var(--border)]/50 hover:bg-transparent">
                    <TableHead className="text-[var(--text-secondary)]">Oportunidade</TableHead>
                    <TableHead className="text-[var(--text-secondary)]">Valor</TableHead>
                    <TableHead className="text-[var(--text-secondary)]">Stage</TableHead>
                    <TableHead className="text-[var(--text-secondary)]">Probabilidade</TableHead>
                    <TableHead className="text-[var(--text-secondary)]">Fechamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {opportunities.map((opp) => {
                    const stageVariant = getStageVariant(opp.stage)

                    return (
                      <TableRow
                        key={opp.id}
                        className="border-[var(--border)]/50 hover:bg-[var(--surface-strong)]/50 transition-colors"
                      >
                        <TableCell>
                          <div>
                            <div className="text-sm font-medium text-[var(--text-primary)]">
                              {opp.title}
                            </div>
                            {opp.lead && (
                              <div className="text-sm text-[var(--text-secondary)]">
                                {opp.lead.name} - {opp.lead.company}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium text-[var(--text-primary)]">
                            {formatCurrency(opp.value)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${stageVariant.bg} ${stageVariant.text} border-0 font-semibold`}
                          >
                            {opp.stage}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-[var(--text-primary)]">
                          {opp.probability}%
                        </TableCell>
                        <TableCell className="text-sm text-[var(--text-secondary)]">
                          {opp.expected_close_date ? formatDate(opp.expected_close_date) : '-'}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <CardContent className="py-12 text-center">
              <p className="text-[var(--text-secondary)]">
                {error || 'Nenhuma oportunidade encontrada'}
              </p>
              {error && (
                <Button
                  onClick={loadOpportunities}
                  className="mt-4 bg-[var(--accent-sky)] hover:bg-[var(--accent-sky)]/90 text-[var(--text-primary)]"
                >
                  Tentar novamente
                </Button>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
