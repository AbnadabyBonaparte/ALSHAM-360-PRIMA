// src/pages/OpportunitiesKanban.tsx
// ALSHAM 360° PRIMA — Oportunidades (Kanban por estágio, multi-tenant)
import React, { useMemo } from 'react'
import { Briefcase, DollarSign, Layers } from 'lucide-react'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Opportunity {
  id: string
  title: string
  value: number
  currency: string
  stage: string
  probability: number
  expected_close_date: string | null
  created_at: string
}

const money = (v: number, c = 'BRL') =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: c, maximumFractionDigits: 0 })

// Ordem canônica de estágios; estágios desconhecidos entram ao final preservando o dado real.
const STAGE_ORDER = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <Card className="bg-[var(--surface)] border-[var(--border)]">
    <CardContent className="p-5 flex items-center gap-4">
      <div className="grid h-11 w-11 place-content-center rounded-xl bg-[var(--surface-strong)] text-[var(--accent-1)]">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">{label}</p>
        <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
      </div>
    </CardContent>
  </Card>
)

export default function OpportunitiesKanban() {
  const { data = [], isLoading, error, refetch } = useOrgData<Opportunity>('opportunities', {
    orderBy: { column: 'created_at', ascending: false },
    limit: 500,
  })

  const columns = useMemo(() => {
    const groups = new Map<string, Opportunity[]>()
    for (const o of data) {
      const stage = o.stage || 'sem_estagio'
      if (!groups.has(stage)) groups.set(stage, [])
      groups.get(stage)!.push(o)
    }
    const keys = Array.from(groups.keys()).sort((a, b) => {
      const ia = STAGE_ORDER.indexOf(a)
      const ib = STAGE_ORDER.indexOf(b)
      if (ia === -1 && ib === -1) return a.localeCompare(b)
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })
    return keys.map((stage) => {
      const items = groups.get(stage)!
      const total = items.reduce((s, o) => s + (o.value ?? 0), 0)
      return { stage, items, total }
    })
  }, [data])

  const pipelineValue = useMemo(() => data.reduce((s, o) => s + (o.value ?? 0), 0), [data])

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Oportunidades (Kanban)" description="Pipeline visual das oportunidades por estágio" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Briefcase className="h-5 w-5" />} label="Oportunidades" value={data.length} />
        <StatCard icon={<Layers className="h-5 w-5" />} label="Estágios" value={columns.length} />
        <StatCard icon={<DollarSign className="h-5 w-5" />} label="Valor do pipeline" value={money(pipelineValue)} />
      </div>

      {data.length === 0 ? (
        <EmptyState
          title="Nenhuma oportunidade ainda"
          description="Converta leads em oportunidades para visualizá-las no quadro Kanban."
          icon={<Briefcase className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-4 min-w-max">
            {columns.map((col) => (
              <div key={col.stage} className="w-72 flex-shrink-0 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-sm font-semibold text-[var(--text-primary)] capitalize">
                    {col.stage.replace(/_/g, ' ')}
                  </span>
                  <Badge variant="secondary">{col.items.length}</Badge>
                </div>
                <p className="px-1 text-xs text-[var(--text-secondary)]">{money(col.total)}</p>
                <div className="space-y-3">
                  {col.items.map((o) => (
                    <Card key={o.id} className="bg-[var(--surface)] border-[var(--border)]">
                      <CardContent className="p-4 space-y-2">
                        <p className="font-medium text-[var(--text-primary)] leading-snug">{o.title}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[var(--accent-1)]">{money(o.value, o.currency)}</span>
                          <span className="text-[var(--text-secondary)]">{o.probability}%</span>
                        </div>
                        {o.expected_close_date && (
                          <p className="text-xs text-[var(--text-secondary)]">
                            Fecha em {new Date(o.expected_close_date).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
