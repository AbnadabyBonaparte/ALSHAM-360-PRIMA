// src/pages/GamificationAnalytics.tsx
// ALSHAM 360° PRIMA — Analytics de Gamificação (agregação real de pontos/badges/recompensas, multi-tenant)
import React, { useMemo } from 'react'
import { Star, Award, Gift, Users } from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface PointsRow { id: string; user_id: string; points: number; reason: string }
interface Badge { id: string; name: string; points_required: number }
interface Reward { id: string; reward_type: string; reward_value: number }

const CHART_COLORS = [
  'var(--accent-1)', 'var(--accent-2)', 'var(--accent-3)', 'var(--accent-warm)', 'var(--accent-alert)',
]

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

export default function GamificationAnalytics() {
  const points = useOrgData<PointsRow>('gamification_points', { columns: 'id, user_id, points, reason', limit: 5000 })
  const badges = useOrgData<Badge>('gamification_badges', { columns: 'id, name, points_required', limit: 500 })
  const rewards = useOrgData<Reward>('gamification_rewards', { columns: 'id, reward_type, reward_value', limit: 2000 })

  const pointsByReason = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of points.data ?? []) {
      const k = p.reason || 'Outros'
      map.set(k, (map.get(k) ?? 0) + (p.points ?? 0))
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [points.data])

  const rewardsByType = useMemo(() => {
    const map = new Map<string, number>()
    for (const r of rewards.data ?? []) {
      const k = r.reward_type || 'Outros'
      map.set(k, (map.get(k) ?? 0) + 1)
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [rewards.data])

  const totalPoints = useMemo(() => (points.data ?? []).reduce((s, p) => s + (p.points ?? 0), 0), [points.data])
  const activeUsers = useMemo(() => new Set((points.data ?? []).map((p) => p.user_id)).size, [points.data])

  const isLoading = points.isLoading || badges.isLoading || rewards.isLoading
  const error = points.error || badges.error || rewards.error

  if (isLoading) return <PageSkeleton />
  if (error) {
    return (
      <ErrorState
        message={(error as Error).message}
        onRetry={() => { points.refetch(); badges.refetch(); rewards.refetch() }}
      />
    )
  }

  const hasData = (points.data ?? []).length > 0 || (rewards.data ?? []).length > 0 || (badges.data ?? []).length > 0

  const tooltipStyle = {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text-primary)',
  }

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Analytics de Gamificação" description="Distribuição de pontos, badges e recompensas concedidas na organização" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Star className="h-5 w-5" />} label="Pontos distribuídos" value={totalPoints.toLocaleString('pt-BR')} />
        <StatCard icon={<Users className="h-5 w-5" />} label="Usuários pontuados" value={activeUsers} />
        <StatCard icon={<Award className="h-5 w-5" />} label="Badges disponíveis" value={(badges.data ?? []).length} />
        <StatCard icon={<Gift className="h-5 w-5" />} label="Recompensas concedidas" value={(rewards.data ?? []).length} />
      </div>

      {!hasData ? (
        <EmptyState
          title="Sem dados de gamificação"
          description="Quando pontos, badges e recompensas forem registrados, as análises aparecerão aqui."
          icon={<Star className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="bg-[var(--surface)] border-[var(--border)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)] text-base">Pontos por motivo</CardTitle>
              </CardHeader>
              <CardContent>
                {pointsByReason.length === 0 ? (
                  <p className="py-12 text-center text-sm text-[var(--text-secondary)]">Sem pontos registrados.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={pointsByReason.slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--surface-strong)' }} />
                      <Bar dataKey="value" fill="var(--accent-1)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="bg-[var(--surface)] border-[var(--border)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)] text-base">Recompensas por tipo</CardTitle>
              </CardHeader>
              <CardContent>
                {rewardsByType.length === 0 ? (
                  <p className="py-12 text-center text-sm text-[var(--text-secondary)]">Nenhuma recompensa concedida.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={rewardsByType} dataKey="value" nameKey="name" outerRadius={90} label>
                        {rewardsByType.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {(badges.data ?? []).length > 0 && (
            <Card className="bg-[var(--surface)] border-[var(--border)]">
              <CardContent className="p-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Badge</TableHead>
                        <TableHead className="text-right">Pontos necessários</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(badges.data ?? [])
                        .slice()
                        .sort((a, b) => (a.points_required ?? 0) - (b.points_required ?? 0))
                        .map((b) => (
                          <TableRow key={b.id}>
                            <TableCell className="font-medium text-[var(--text-primary)]">{b.name}</TableCell>
                            <TableCell className="text-right text-[var(--text-secondary)]">
                              {(b.points_required ?? 0).toLocaleString('pt-BR')}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
