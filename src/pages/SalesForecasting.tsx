// src/pages/SalesForecasting.tsx
// ALSHAM 360° PRIMA — Forecasting de Vendas (projeção real sobre opportunities, multi-tenant)
import React, { useMemo } from 'react'
import { TrendingUp, DollarSign, Target, CalendarClock } from 'lucide-react'
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface Opportunity {
  id: string
  value: number
  stage: string
  probability: number
  expected_close_date: string | null
}

const money = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

const monthKey = (iso: string) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
const monthLabel = (key: string) => {
  const [y, m] = key.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
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

export default function SalesForecasting() {
  const { data = [], isLoading, error, refetch } = useOrgData<Opportunity>('opportunities', {
    columns: 'id, value, stage, probability, expected_close_date',
    limit: 5000,
  })

  const dated = useMemo(() => data.filter((o) => !!o.expected_close_date), [data])

  const byMonth = useMemo(() => {
    const map = new Map<string, { total: number; weighted: number; count: number }>()
    for (const o of dated) {
      const key = monthKey(o.expected_close_date as string)
      const cur = map.get(key) ?? { total: 0, weighted: 0, count: 0 }
      cur.total += o.value ?? 0
      cur.weighted += (o.value ?? 0) * ((o.probability ?? 0) / 100)
      cur.count += 1
      map.set(key, cur)
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, v]) => ({
        month: monthLabel(key),
        rawKey: key,
        total: Math.round(v.total),
        weighted: Math.round(v.weighted),
        count: v.count,
      }))
  }, [dated])

  const pipelineTotal = useMemo(() => data.reduce((s, o) => s + (o.value ?? 0), 0), [data])
  const weightedTotal = useMemo(
    () => data.reduce((s, o) => s + (o.value ?? 0) * ((o.probability ?? 0) / 100), 0),
    [data],
  )
  const avgProbability = useMemo(
    () => (data.length ? Math.round(data.reduce((s, o) => s + (o.probability ?? 0), 0) / data.length) : 0),
    [data],
  )

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
      <PageHeader title="Forecasting de Vendas" description="Projeção de receita por período de fechamento previsto, ponderada pela probabilidade real de cada negócio" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<DollarSign className="h-5 w-5" />} label="Pipeline total" value={money(pipelineTotal)} />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Forecast ponderado" value={money(weightedTotal)} />
        <StatCard icon={<Target className="h-5 w-5" />} label="Probabilidade média" value={`${avgProbability}%`} />
        <StatCard icon={<CalendarClock className="h-5 w-5" />} label="Com data de fechamento" value={dated.length} />
      </div>

      {byMonth.length === 0 ? (
        <EmptyState
          title="Sem previsões de fechamento"
          description="Defina a data de fechamento previsto nas oportunidades para gerar o forecast por período."
          icon={<TrendingUp className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <>
          <Card className="bg-[var(--surface)] border-[var(--border)]">
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)] text-base">Projeção por mês de fechamento</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={byMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} tickFormatter={(v) => money(Number(v))} width={90} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--surface-strong)' }} formatter={(v: number) => money(Number(v))} />
                  <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                  <Bar name="Pipeline" dataKey="total" fill="var(--accent-2)" radius={[4, 4, 0, 0]} />
                  <Line name="Forecast ponderado" type="monotone" dataKey="weighted" stroke="var(--accent-1)" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-[var(--surface)] border-[var(--border)]">
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Período</TableHead>
                      <TableHead className="text-right">Negócios</TableHead>
                      <TableHead className="text-right">Pipeline</TableHead>
                      <TableHead className="text-right">Forecast ponderado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {byMonth.map((m) => (
                      <TableRow key={m.rawKey}>
                        <TableCell className="font-medium text-[var(--text-primary)]">{m.month}</TableCell>
                        <TableCell className="text-right text-[var(--text-secondary)]">{m.count}</TableCell>
                        <TableCell className="text-right text-[var(--text-secondary)]">{money(m.total)}</TableCell>
                        <TableCell className="text-right font-semibold text-[var(--accent-1)]">{money(m.weighted)}</TableCell>
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
