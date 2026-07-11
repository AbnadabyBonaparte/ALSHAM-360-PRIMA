// src/pages/AIInsights.tsx
// ALSHAM 360° PRIMA — AI Insights (predições reais, multi-tenant)
import React, { useMemo } from 'react'
import { Brain, Gauge, Sparkles } from 'lucide-react'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface Prediction {
  id: string
  lead_id: string
  prediction_type: string
  confidence: number
  prediction_data: Record<string, unknown> | null
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

export default function AIInsights() {
  const { data = [], isLoading, error, refetch } = useOrgData<Prediction>('ai_predictions', {
    orderBy: { column: 'created_at', ascending: false },
    limit: 200,
  })

  const avgConfidence = useMemo(() => {
    if (data.length === 0) return 0
    return Math.round((data.reduce((s, p) => s + (p.confidence ?? 0), 0) / data.length) * 100)
  }, [data])

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="AI Insights" description="Predições geradas por IA sobre seus leads" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Brain className="h-5 w-5" />} label="Predições" value={data.length} />
        <StatCard icon={<Gauge className="h-5 w-5" />} label="Confiança média" value={`${avgConfidence}%`} />
        <StatCard
          icon={<Sparkles className="h-5 w-5" />}
          label="Tipos distintos"
          value={new Set(data.map((p) => p.prediction_type)).size}
        />
      </div>

      {data.length === 0 ? (
        <EmptyState
          title="Nenhuma predição ainda"
          description="Quando a IA gerar insights sobre seus leads, eles aparecerão aqui."
          icon={<Brain className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((p) => {
            const pct = Math.round((p.confidence ?? 0) * 100)
            return (
              <Card key={p.id} className="bg-[var(--surface)] border-[var(--border)]">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{p.prediction_type}</Badge>
                    <span className="text-xs text-[var(--text-secondary)]">
                      {new Date(p.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[var(--text-secondary)] truncate">Lead: {p.lead_id}</p>
                  <div>
                    <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1">
                      <span>Confiança</span>
                      <span className="text-[var(--accent-2)] font-semibold">{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
