// src/pages/Campaigns.tsx
// ALSHAM 360° PRIMA — Campanhas (migrado para shadcn/ui)

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { campaignsQueries } from '../lib/supabase/queries/campaigns'
import { useAuthStore } from '../lib/supabase/useAuthStore'
import { PageSkeleton, ErrorState, EmptyState } from '@/components/PageStates'
import type { Campaign } from '../lib/supabase/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const Campaigns: React.FC = () => {
  const orgId = useAuthStore((s) => s.currentOrgId)

  const { data: campaigns = [], isLoading, error, refetch } = useQuery<Campaign[]>({
    queryKey: ['campaigns', orgId],
    queryFn: async () => {
      const { data, error } = await campaignsQueries.getAll()
      if (error) throw error
      return (data ?? []) as Campaign[]
    },
    enabled: !!orgId,
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getStatusVariant = (status: string): { bg: string; text: string } => {
    switch (status) {
      case 'active':
        return { bg: 'bg-[var(--accent-emerald)]/10', text: 'text-[var(--accent-emerald)]' }
      case 'paused':
        return { bg: 'bg-[var(--accent-warning)]/10', text: 'text-[var(--accent-warning)]' }
      case 'completed':
        return { bg: 'bg-[var(--accent-sky)]/10', text: 'text-[var(--accent-sky)]' }
      case 'cancelled':
        return { bg: 'bg-[var(--accent-alert)]/10', text: 'text-[var(--accent-alert)]' }
      default:
        return { bg: 'bg-[var(--surface-strong)]', text: 'text-[var(--text-secondary)]' }
    }
  }

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />
  if (!campaigns?.length) return <EmptyState title="Nenhuma campanha" description="Crie sua primeira campanha de marketing." />

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Campanhas</h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Gerencie suas campanhas de marketing
          </p>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.length > 0 ? (
            campaigns.map((campaign) => {
              const statusVariant = getStatusVariant(campaign.status)
              const progressPercent = Math.min((campaign.spent / campaign.budget) * 100, 100)

              return (
                <Card
                  key={campaign.id}
                  className="border-[var(--border)]/40 bg-[var(--surface)]/70 backdrop-blur-xl"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                          {campaign.name}
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] capitalize">
                          {campaign.type}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${statusVariant.bg} ${statusVariant.text} border-0 font-semibold`}
                      >
                        {campaign.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">Orçamento:</span>
                        <span className="font-medium text-[var(--text-primary)]">
                          {formatCurrency(campaign.budget)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">Gasto:</span>
                        <span className="font-medium text-[var(--text-primary)]">
                          {formatCurrency(campaign.spent)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">Período:</span>
                        <span className="font-medium text-[var(--text-primary)]">
                          {formatDate(campaign.start_date)}
                          {campaign.end_date && ` - ${formatDate(campaign.end_date)}`}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[var(--border)]">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[var(--text-secondary)]">Progresso</span>
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                          {Math.round(progressPercent)}%
                        </span>
                      </div>
                      <div className="mt-2 bg-[var(--surface-strong)] rounded-full h-2">
                        <div
                          className="bg-[var(--accent-sky)] h-2 rounded-full transition-all"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <div className="col-span-full">
              <Card className="border-[var(--border)]/40 bg-[var(--surface)]/70">
                <CardContent className="py-12 text-center">
                  <p className="text-[var(--text-secondary)]">
                    Nenhuma campanha encontrada
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
