// src/pages/Leaderboards.tsx
// ALSHAM 360° PRIMA — Leaderboards (ranking real por pontos, multi-tenant)
import React, { useMemo } from 'react'
import { Trophy, Medal, Star } from 'lucide-react'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

export default function Leaderboards() {
  const { data = [], isLoading, error, refetch } = useOrgData<PointsRow>('gamification_points', {
    orderBy: { column: 'created_at', ascending: false },
    limit: 1000,
  })

  const ranking = useMemo(() => {
    const totals = new Map<string, number>()
    for (const row of data) {
      totals.set(row.user_id, (totals.get(row.user_id) ?? 0) + (row.points ?? 0))
    }
    return Array.from(totals.entries())
      .map(([user_id, points]) => ({ user_id, points }))
      .sort((a, b) => b.points - a.points)
  }, [data])

  const totalPoints = useMemo(() => data.reduce((s, r) => s + (r.points ?? 0), 0), [data])

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Leaderboards" description="Ranking de pontos da sua organização" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Trophy className="h-5 w-5" />} label="Participantes" value={ranking.length} />
        <StatCard icon={<Star className="h-5 w-5" />} label="Pontos distribuídos" value={totalPoints.toLocaleString('pt-BR')} />
        <StatCard icon={<Medal className="h-5 w-5" />} label="Eventos de pontos" value={data.length} />
      </div>

      {ranking.length === 0 ? (
        <EmptyState
          title="Nenhuma pontuação ainda"
          description="Quando os usuários acumularem pontos, o ranking aparecerá aqui."
          icon={<Trophy className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead className="text-right">Pontos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ranking.map((r, i) => (
                    <TableRow key={r.user_id}>
                      <TableCell>
                        {i < 3 ? (
                          <Badge variant="secondary">{i + 1}º</Badge>
                        ) : (
                          <span className="text-[var(--text-secondary)]">{i + 1}º</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-[var(--text-primary)]">{r.user_id}</TableCell>
                      <TableCell className="text-right font-bold text-[var(--accent-1)]">
                        {r.points.toLocaleString('pt-BR')}
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
