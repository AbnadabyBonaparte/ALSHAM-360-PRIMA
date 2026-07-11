// src/pages/CohortAnalysis.tsx
// ALSHAM 360° PRIMA — Cohort Analysis (coortes reais de leads por mês de entrada, multi-tenant)
import React, { useMemo } from 'react'
import { Users, TrendingUp, Layers, Percent } from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface Lead { id: string; status: string; stage: string; created_at: string }

// Estágios/status considerados "convertidos" (qualificado ou adiante).
const CONVERTED = ['qualified', 'qualificado', 'won', 'ganho', 'customer', 'cliente', 'converted', 'convertido']
const isConverted = (l: Lead) =>
  CONVERTED.includes((l.status || '').toLowerCase()) || CONVERTED.includes((l.stage || '').toLowerCase())

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

export default function CohortAnalysis() {
  const { data = [], isLoading, error, refetch } = useOrgData<Lead>('leads_crm', {
    columns: 'id, status, stage, created_at',
    limit: 5000,
  })

  const cohorts = useMemo(() => {
    const map = new Map<string, { total: number; converted: number }>()
    for (const l of data) {
      if (!l.created_at) continue
      const key = monthKey(l.created_at)
      const cur = map.get(key) ?? { total: 0, converted: 0 }
      cur.total += 1
      if (isConverted(l)) cur.converted += 1
      map.set(key, cur)
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, v]) => ({
        key,
        month: monthLabel(key),
        total: v.total,
        converted: v.converted,
        rate: v.total ? Math.round((v.converted / v.total) * 100) : 0,
      }))
  }, [data])

  const overallRate = useMemo(() => {
    const converted = data.filter(isConverted).length
    return data.length ? Math.round((converted / data.length) * 100) : 0
  }, [data])

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
      <PageHeader title="Cohort Analysis" description="Coortes mensais de leads por data de entrada e sua taxa de conversão real" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5" />} label="Leads analisados" value={data.length} />
        <StatCard icon={<Layers className="h-5 w-5" />} label="Coortes" value={cohorts.length} />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Convertidos" value={data.filter(isConverted).length} />
        <StatCard icon={<Percent className="h-5 w-5" />} label="Conversão global" value={`${overallRate}%`} />
      </div>

      {cohorts.length === 0 ? (
        <EmptyState
          title="Sem coortes para exibir"
          description="Assim que houver leads registrados, suas coortes mensais aparecerão aqui."
          icon={<Layers className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <>
          <Card className="bg-[var(--surface)] border-[var(--border)]">
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)] text-base">Entrada de leads por coorte</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={cohorts}>
                  <defs>
                    <linearGradient id="cohortFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-1)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--accent-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--surface-strong)' }} />
                  <Area type="monotone" dataKey="total" stroke="var(--accent-1)" fill="url(#cohortFill)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-[var(--surface)] border-[var(--border)]">
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Coorte (mês de entrada)</TableHead>
                      <TableHead className="text-right">Leads</TableHead>
                      <TableHead className="text-right">Convertidos</TableHead>
                      <TableHead className="text-right">Taxa de conversão</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cohorts.map((c) => (
                      <TableRow key={c.key}>
                        <TableCell className="font-medium text-[var(--text-primary)]">{c.month}</TableCell>
                        <TableCell className="text-right text-[var(--text-secondary)]">{c.total}</TableCell>
                        <TableCell className="text-right text-[var(--text-secondary)]">{c.converted}</TableCell>
                        <TableCell className="text-right font-semibold text-[var(--accent-1)]">{c.rate}%</TableCell>
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
