// src/pages/PerformanceOverview.tsx
// ALSHAM 360° PRIMA — Performance da Equipe (agregação real de pontos + negócios, multi-tenant)
import React, { useMemo } from 'react'
import { Award, DollarSign, Trophy, Users } from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface PointsRow { user_id: string; points: number }
interface Opportunity { owner_id: string; value: number; stage: string }
interface Profile { user_id: string; full_name: string | null; role: string }

const isWon = (stage: string) => /won|ganho|fechad/i.test(stage)
const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

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

export default function PerformanceOverview() {
  const points = useOrgData<PointsRow>('gamification_points', { columns: 'user_id, points', limit: 5000 })
  const opps = useOrgData<Opportunity>('opportunities', { columns: 'owner_id, value, stage', limit: 5000 })
  const profiles = useOrgData<Profile>('user_profiles', { columns: 'user_id, full_name, role', limit: 1000 })

  const rows = useMemo(() => {
    const map = new Map<string, { name: string; role: string; points: number; deals: number; revenue: number }>()
    const ensure = (id: string) => {
      if (!map.has(id)) map.set(id, { name: id.slice(0, 8), role: '—', points: 0, deals: 0, revenue: 0 })
      return map.get(id)!
    }
    for (const p of profiles.data ?? []) {
      if (!p.user_id) continue
      const r = ensure(p.user_id)
      r.name = p.full_name ?? r.name
      r.role = p.role ?? '—'
    }
    for (const pt of points.data ?? []) {
      if (!pt.user_id) continue
      ensure(pt.user_id).points += pt.points ?? 0
    }
    for (const o of opps.data ?? []) {
      if (!o.owner_id || !isWon(o.stage)) continue
      const r = ensure(o.owner_id)
      r.deals += 1
      r.revenue += o.value ?? 0
    }
    return Array.from(map.entries())
      .map(([user_id, v]) => ({ user_id, ...v }))
      .sort((a, b) => b.points - a.points || b.revenue - a.revenue)
  }, [points.data, opps.data, profiles.data])

  const totalRevenue = useMemo(() => rows.reduce((s, r) => s + r.revenue, 0), [rows])
  const totalPoints = useMemo(() => rows.reduce((s, r) => s + r.points, 0), [rows])
  const totalDeals = useMemo(() => rows.reduce((s, r) => s + r.deals, 0), [rows])

  const isLoading = points.isLoading || opps.isLoading || profiles.isLoading
  const error = points.error || opps.error || profiles.error

  if (isLoading) return <PageSkeleton />
  if (error) {
    return (
      <ErrorState
        message={(error as Error).message}
        onRetry={() => { points.refetch(); opps.refetch(); profiles.refetch() }}
      />
    )
  }

  const hasData = rows.some((r) => r.points > 0 || r.deals > 0)

  const tooltipStyle = {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text-primary)',
  }

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Performance da Equipe" description="Avaliação consolidada por pessoa: pontos de gamificação e negócios ganhos" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5" />} label="Pessoas avaliadas" value={rows.length} />
        <StatCard icon={<Award className="h-5 w-5" />} label="Pontos totais" value={totalPoints.toLocaleString('pt-BR')} />
        <StatCard icon={<Trophy className="h-5 w-5" />} label="Negócios ganhos" value={totalDeals} />
        <StatCard icon={<DollarSign className="h-5 w-5" />} label="Receita ganha" value={money(totalRevenue)} />
      </div>

      {!hasData ? (
        <EmptyState
          title="Sem dados de performance"
          description="Quando houver pontos de gamificação e oportunidades ganhas, o ranking de performance da equipe aparecerá aqui."
          icon={<Award className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <>
          <Card className="bg-[var(--surface)] border-[var(--border)]">
            <CardHeader>
              <CardTitle className="text-base text-[var(--text-primary)]">Pontuação por pessoa</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={rows.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--surface-strong)' }} />
                  <Bar dataKey="points" name="Pontos" fill="var(--accent-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-[var(--surface)] border-[var(--border)]">
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pessoa</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead className="text-right">Pontos</TableHead>
                      <TableHead className="text-right">Negócios</TableHead>
                      <TableHead className="text-right">Receita</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.user_id}>
                        <TableCell className="font-medium text-[var(--text-primary)]">{r.name}</TableCell>
                        <TableCell className="text-[var(--text-secondary)]">{r.role}</TableCell>
                        <TableCell className="text-right text-[var(--text-secondary)]">{r.points.toLocaleString('pt-BR')}</TableCell>
                        <TableCell className="text-right text-[var(--text-secondary)]">{r.deals}</TableCell>
                        <TableCell className="text-right text-[var(--text-secondary)]">{money(r.revenue)}</TableCell>
                      </TableRow>
                    ))}
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
