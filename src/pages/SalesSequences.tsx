// src/pages/SalesSequences.tsx
// ALSHAM 360° PRIMA — Sequences de Vendas (automations com gatilho sequence, multi-tenant)
import React, { useMemo } from 'react'
import { Send, ListOrdered, Play } from 'lucide-react'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Automation {
  id: string
  name: string
  description: string | null
  trigger_type: string
  actions: unknown[] | null
  status: string
  created_at: string
}

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <Card className="bg-[var(--surface)] border-[var(--border)]">
    <CardContent className="p-5 flex items-center gap-4">
      <div className="grid h-11 w-11 place-content-center rounded-xl bg-[var(--surface-strong)] text-[var(--accent-2)]">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">{label}</p>
        <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
      </div>
    </CardContent>
  </Card>
)

export default function SalesSequences() {
  // Sequences são automações cujo gatilho é 'sequence' (filtro real via org_id + trigger_type).
  const { data = [], isLoading, error, refetch } = useOrgData<Automation>('automations', {
    orderBy: { column: 'created_at', ascending: false },
    limit: 300,
    filters: { trigger_type: 'sequence' },
  })

  const active = useMemo(
    () => data.filter((a) => ['active', 'ativo', 'enabled'].includes((a.status || '').toLowerCase())).length,
    [data],
  )
  const totalSteps = useMemo(
    () => data.reduce((s, a) => s + (Array.isArray(a.actions) ? a.actions.length : 0), 0),
    [data],
  )

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Sequences de Vendas" description="Cadências automatizadas de follow-up com seus leads" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Send className="h-5 w-5" />} label="Sequences" value={data.length} />
        <StatCard icon={<Play className="h-5 w-5" />} label="Ativas" value={active} />
        <StatCard icon={<ListOrdered className="h-5 w-5" />} label="Etapas totais" value={totalSteps} />
      </div>

      {data.length === 0 ? (
        <EmptyState
          title="Nenhuma sequence ainda"
          description="Crie automações com gatilho de sequência para nutrir e converter leads automaticamente."
          icon={<Send className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((a) => (
            <Card key={a.id} className="bg-[var(--surface)] border-[var(--border)]">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--text-primary)]">{a.name}</span>
                  <Badge variant="outline">{a.status}</Badge>
                </div>
                {a.description && (
                  <p className="text-sm text-[var(--text-secondary)]">{a.description}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <ListOrdered className="h-4 w-4" />
                  {Array.isArray(a.actions) ? a.actions.length : 0} etapa(s)
                  <span className="ml-auto">{new Date(a.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
