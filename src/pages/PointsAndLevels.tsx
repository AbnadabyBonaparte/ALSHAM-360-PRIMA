// src/pages/PointsAndLevels.tsx
// ALSHAM 360° PRIMA — Pontuação e Níveis (agregação real, multi-tenant)
import React, { useMemo } from 'react'
import { Star, TrendingUp, History } from 'lucide-react'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface PointsRow {
  id: string
  user_id: string
  points: number
  reason: string
  created_at: string
}

interface RankRow {
  id: string
  user_id: string
  rank_position: number
  points_at_rank: number
  achieved_at: string
  period_start: string
  period_end: string
}

const POINTS_PER_LEVEL = 1000

const levelOf = (points: number) => Math.floor(Math.max(0, points) / POINTS_PER_LEVEL) + 1
const progressToNext = (points: number) => Math.round(((points % POINTS_PER_LEVEL) / POINTS_PER_LEVEL) * 100)

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

export default function PointsAndLevels() {
  const points = useOrgData<PointsRow>('gamification_points', {
    orderBy: { column: 'created_at', ascending: false },
    limit: 2000,
  })
  const ranks = useOrgData<RankRow>('gamification_rank_history', {
    orderBy: { column: 'achieved_at', ascending: false },
    limit: 200,
  })

  const perUser = useMemo(() => {
    const totals = new Map<string, number>()
    for (const row of points.data ?? []) {
      totals.set(row.user_id, (totals.get(row.user_id) ?? 0) + (row.points ?? 0))
    }
    return Array.from(totals.entries())
      .map(([user_id, total]) => ({ user_id, total, level: levelOf(total), progress: progressToNext(total) }))
      .sort((a, b) => b.total - a.total)
  }, [points.data])

  const totalPoints = useMemo(
    () => (points.data ?? []).reduce((s, r) => s + (r.points ?? 0), 0),
    [points.data],
  )
  const topLevel = useMemo(() => perUser.reduce((m, u) => Math.max(m, u.level), 0), [perUser])

  const isLoading = points.isLoading || ranks.isLoading
  const error = points.error || ranks.error

  if (isLoading) return <PageSkeleton />
  if (error) {
    return (
      <ErrorState
        message={(error as Error).message}
        onRetry={() => {
          points.refetch()
          ranks.refetch()
        }}
      />
    )
  }

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Pontuação e Níveis" description="Progresso de pontos e níveis dos membros da organização" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Star className="h-5 w-5" />} label="Pontos distribuídos" value={totalPoints.toLocaleString('pt-BR')} />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Membros pontuados" value={perUser.length} />
        <StatCard icon={<History className="h-5 w-5" />} label="Nível máximo" value={topLevel} />
      </div>

      {perUser.length === 0 ? (
        <EmptyState
          title="Nenhuma pontuação ainda"
          description="Quando os membros acumularem pontos, seus níveis e progresso aparecerão aqui."
          icon={<Star className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {perUser.map((u) => (
            <Card key={u.user_id} className="bg-[var(--surface)] border-[var(--border)]">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[var(--text-secondary)] truncate">{u.user_id}</span>
                  <Badge variant="secondary">Nível {u.level}</Badge>
                </div>
                <p className="text-2xl font-bold text-[var(--accent-1)]">{u.total.toLocaleString('pt-BR')} pts</p>
                <div>
                  <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1">
                    <span>Progresso ao nível {u.level + 1}</span>
                    <span>{u.progress}%</span>
                  </div>
                  <Progress value={u.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {(ranks.data ?? []).length > 0 && (
        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardContent className="p-4 space-y-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Histórico de ranking</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Posição</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead className="text-right">Pontos</TableHead>
                    <TableHead>Período</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(ranks.data ?? []).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell><Badge variant="outline">{r.rank_position}º</Badge></TableCell>
                      <TableCell className="font-mono text-xs text-[var(--text-primary)]">{r.user_id}</TableCell>
                      <TableCell className="text-right font-semibold text-[var(--text-primary)]">
                        {r.points_at_rank.toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-[var(--text-secondary)]">
                        {new Date(r.period_start).toLocaleDateString('pt-BR')} — {new Date(r.period_end).toLocaleDateString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
