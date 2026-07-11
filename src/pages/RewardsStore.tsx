// src/pages/RewardsStore.tsx
// ALSHAM 360° PRIMA — Rewards Store (recompensas reais, multi-tenant)
import React, { useMemo } from 'react'
import { Gift, Coins, Trophy } from 'lucide-react'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Reward {
  id: string
  user_id: string
  badge_id: string | null
  reward_type: string
  reward_value: number
  granted_at: string
  granted_by: string | null
}

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <Card className="bg-[var(--surface)] border-[var(--border)]">
    <CardContent className="p-5 flex items-center gap-4">
      <div className="grid h-11 w-11 place-content-center rounded-xl bg-[var(--surface-strong)] text-[var(--accent-warm)]">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">{label}</p>
        <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
      </div>
    </CardContent>
  </Card>
)

export default function RewardsStore() {
  const { data = [], isLoading, error, refetch } = useOrgData<Reward>('gamification_rewards', {
    orderBy: { column: 'granted_at', ascending: false },
    limit: 300,
  })

  const totalValue = useMemo(() => data.reduce((s, r) => s + (r.reward_value ?? 0), 0), [data])
  const types = useMemo(() => new Set(data.map((r) => r.reward_type)).size, [data])

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Rewards Store" description="Recompensas concedidas aos membros da sua organização" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Gift className="h-5 w-5" />} label="Recompensas" value={data.length} />
        <StatCard icon={<Coins className="h-5 w-5" />} label="Valor total" value={totalValue.toLocaleString('pt-BR')} />
        <StatCard icon={<Trophy className="h-5 w-5" />} label="Tipos distintos" value={types} />
      </div>

      {data.length === 0 ? (
        <EmptyState
          title="Nenhuma recompensa ainda"
          description="Quando recompensas forem concedidas por pontos ou conquistas, elas aparecerão aqui."
          icon={<Gift className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((r) => (
            <Card key={r.id} className="bg-[var(--surface)] border-[var(--border)]">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="grid h-10 w-10 place-content-center rounded-xl bg-[var(--surface-strong)] text-[var(--accent-warm)]">
                    <Gift className="h-5 w-5" />
                  </div>
                  <Badge variant="secondary">{r.reward_type}</Badge>
                </div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {r.reward_value.toLocaleString('pt-BR')}
                </p>
                <div className="text-xs text-[var(--text-secondary)] space-y-1">
                  <p className="font-mono truncate">Para: {r.user_id}</p>
                  <p>Concedida em {new Date(r.granted_at).toLocaleDateString('pt-BR')}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
