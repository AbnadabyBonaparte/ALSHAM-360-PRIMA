// src/pages/TeamGoals.tsx
// ALSHAM 360° PRIMA — Metas de Equipe (metas por time reais, multi-tenant)
import React, { useMemo } from 'react'
import { Users, Target, CheckCircle2, AlertTriangle } from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface Goal {
  id: string
  title: string
  category: string
  team: string | null
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

export default function TeamGoals() {
  const { data = [], isLoading, error, refetch } = useOrgData<Goal>('goals', {
    orderBy: { column: 'due_date', ascending: true },
    limit: 2000,
  })

  const goals = useMemo(() => data.filter((g) => g.category === 'team'), [data])

  const completed = useMemo(() => goals.filter((g) => g.status === 'completed').length, [goals])
  const atRisk = useMemo(() => goals.filter((g) => g.status === 'at_risk').length, [goals])

  const byTeam = useMemo(() => {
    const map = new Map<string, { total: number; sum: number }>()
    for (const g of goals) {
      const k = g.team ?? 'Sem time'
      const cur = map.get(k) ?? { total: 0, sum: 0 }
      cur.total += 1
      cur.sum += pct(g)
      map.set(k, cur)
    }
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, progresso: Math.round(v.sum / v.total) }))
      .sort((a, b) => b.progresso - a.progresso)
  }, [goals])

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />

  const tooltipStyle = {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text-primary)',
  }

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Metas de Equipe" description="Objetivos por time e progresso consolidado da organização" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Target className="h-5 w-5" />} label="Metas de equipe" value={goals.length} />
        <StatCard icon={<Users className="h-5 w-5" />} label="Times com metas" value={byTeam.length} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Concluídas" value={completed} />
        <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="Em risco" value={atRisk} />
      </div>

      {goals.length === 0 ? (
        <EmptyState
          title="Nenhuma meta de equipe"
          description="Defina metas por time (receita, novos clientes, etc.) para acompanhar o progresso consolidado aqui."
          icon={<Target className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <>
          {byTeam.length > 0 && (
            <Card className="bg-[var(--surface)] border-[var(--border)]">
              <CardHeader>
                <CardTitle className="text-base text-[var(--text-primary)]">Progresso médio por time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={byTeam}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--surface-strong)' }} formatter={(v) => [`${v}%`, 'Progresso']} />
                    <Bar dataKey="progresso" fill="var(--accent-1)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <Card className="bg-[var(--surface)] border-[var(--border)]">
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Meta</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Progresso</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Prazo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {goals.map((g) => {
                      const progress = pct(g)
                      return (
                        <TableRow key={g.id}>
                          <TableCell className="font-medium text-[var(--text-primary)]">{g.title}</TableCell>
                          <TableCell className="text-[var(--text-secondary)]">{g.team ?? '—'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-24 overflow-hidden rounded-full bg-[var(--surface-strong)]">
                                <div className="h-full rounded-full bg-[var(--accent-1)]" style={{ width: `${progress}%` }} />
                              </div>
                              <span className="text-xs text-[var(--text-secondary)]">{progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="outline">{g.status}</Badge></TableCell>
                          <TableCell className="text-[var(--text-secondary)]">
                            {g.due_date ? new Date(g.due_date).toLocaleDateString('pt-BR') : '—'}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
