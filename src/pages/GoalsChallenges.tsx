// src/pages/GoalsChallenges.tsx
// ALSHAM 360° PRIMA — Metas e Desafios (metas individuais e desafios reais, multi-tenant)
import React, { useMemo } from 'react'
import { Target, Trophy, Flame, CheckCircle2 } from 'lucide-react'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Goal {
  id: string
  title: string
  description: string | null
  category: string
  metric: string | null
  target_value: number
  current_value: number
  unit: string | null
  status: string
  due_date: string | null
}

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

const pct = (g: Goal) => {
  if (!g.target_value || g.target_value <= 0) return 0
  return Math.min(100, Math.round((g.current_value / g.target_value) * 100))
}

export default function GoalsChallenges() {
  const { data = [], isLoading, error, refetch } = useOrgData<Goal>('goals', {
    orderBy: { column: 'due_date', ascending: true },
    limit: 2000,
  })

  const goals = useMemo(
    () => data.filter((g) => g.category === 'individual' || g.category === 'challenge'),
    [data],
  )

  const completed = useMemo(() => goals.filter((g) => g.status === 'completed').length, [goals])
  const active = useMemo(() => goals.filter((g) => g.status === 'active').length, [goals])
  const avgProgress = useMemo(() => {
    if (goals.length === 0) return 0
    return Math.round(goals.reduce((s, g) => s + pct(g), 0) / goals.length)
  }, [goals])

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Metas e Desafios" description="Metas individuais e desafios de gamificação da organização" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Target className="h-5 w-5" />} label="Metas / Desafios" value={goals.length} />
        <StatCard icon={<Flame className="h-5 w-5" />} label="Ativos" value={active} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Concluídos" value={completed} />
        <StatCard icon={<Trophy className="h-5 w-5" />} label="Progresso médio" value={`${avgProgress}%`} />
      </div>

      {goals.length === 0 ? (
        <EmptyState
          title="Nenhuma meta ou desafio"
          description="Defina metas individuais e desafios de gamificação para engajar a equipe. Eles aparecerão aqui com o progresso em tempo real."
          icon={<Target className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((g) => {
            const progress = pct(g)
            return (
              <Card key={g.id} className="bg-[var(--surface)] border-[var(--border)]">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">{g.title}</p>
                      {g.description && <p className="text-sm text-[var(--text-secondary)]">{g.description}</p>}
                    </div>
                    <Badge variant="outline">{g.category === 'challenge' ? 'Desafio' : 'Meta'}</Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                      <span>
                        {g.current_value.toLocaleString('pt-BR')} / {g.target_value.toLocaleString('pt-BR')} {g.unit ?? ''}
                      </span>
                      <span className="font-medium text-[var(--text-primary)]">{progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-strong)]">
                      <div className="h-full rounded-full bg-[var(--accent-1)]" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <Badge variant="secondary">{g.status}</Badge>
                    <span className="text-[var(--text-secondary)]">
                      {g.due_date ? `Prazo: ${new Date(g.due_date).toLocaleDateString('pt-BR')}` : 'Sem prazo'}
                    </span>
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
