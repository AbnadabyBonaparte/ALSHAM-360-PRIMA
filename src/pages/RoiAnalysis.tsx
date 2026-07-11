// src/pages/RoiAnalysis.tsx
// ALSHAM 360° PRIMA — Análise de ROI (campanhas × oportunidades reais, multi-tenant)
import React, { useMemo } from 'react'
import { DollarSign, TrendingUp, Megaphone, Percent } from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface Campaign { id: string; name: string; budget: number; spent: number }
interface Opportunity { id: string; value: number; stage: string; campaign_id: string | null }

const money = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

// Estágios que representam receita realizada.
const WON_STAGES = ['won', 'ganho', 'ganha', 'closed_won', 'fechado', 'fechado_ganho']
const isWon = (stage: string) => WON_STAGES.includes((stage || '').toLowerCase())

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

export default function RoiAnalysis() {
  const campaigns = useOrgData<Campaign>('campaigns', { columns: 'id, name, budget, spent', limit: 2000 })
  const opps = useOrgData<Opportunity>('opportunities', { columns: 'id, value, stage, campaign_id', limit: 5000 })

  const rows = useMemo(() => {
    const revenueWon = new Map<string, number>()
    const pipelineByCamp = new Map<string, number>()
    for (const o of opps.data ?? []) {
      if (!o.campaign_id) continue
      pipelineByCamp.set(o.campaign_id, (pipelineByCamp.get(o.campaign_id) ?? 0) + (o.value ?? 0))
      if (isWon(o.stage)) revenueWon.set(o.campaign_id, (revenueWon.get(o.campaign_id) ?? 0) + (o.value ?? 0))
    }
    return (campaigns.data ?? [])
      .map((c) => {
        const spent = c.spent ?? 0
        const revenue = revenueWon.get(c.id) ?? 0
        const pipeline = pipelineByCamp.get(c.id) ?? 0
        const roi = spent > 0 ? ((revenue - spent) / spent) * 100 : null
        return { id: c.id, name: c.name, budget: c.budget ?? 0, spent, revenue, pipeline, roi }
      })
      .sort((a, b) => (b.roi ?? -Infinity) - (a.roi ?? -Infinity))
  }, [campaigns.data, opps.data])

  const totals = useMemo(() => {
    const spent = rows.reduce((s, r) => s + r.spent, 0)
    const revenue = rows.reduce((s, r) => s + r.revenue, 0)
    const roi = spent > 0 ? ((revenue - spent) / spent) * 100 : null
    return { spent, revenue, roi }
  }, [rows])

  const chartData = useMemo(
    () => rows.slice(0, 8).map((r) => ({ name: r.name, Investido: Math.round(r.spent), Receita: Math.round(r.revenue) })),
    [rows],
  )

  const isLoading = campaigns.isLoading || opps.isLoading
  const error = campaigns.error || opps.error

  if (isLoading) return <PageSkeleton />
  if (error) {
    return (
      <ErrorState
        message={(error as Error).message}
        onRetry={() => { campaigns.refetch(); opps.refetch() }}
      />
    )
  }

  const tooltipStyle = {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text-primary)',
  }

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Análise de ROI" description="Retorno de cada campanha: receita ganha em oportunidades vinculadas versus o investido" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<DollarSign className="h-5 w-5" />} label="Investido" value={money(totals.spent)} />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Receita ganha" value={money(totals.revenue)} />
        <StatCard icon={<Percent className="h-5 w-5" />} label="ROI global" value={totals.roi === null ? '—' : `${totals.roi.toFixed(0)}%`} />
        <StatCard icon={<Megaphone className="h-5 w-5" />} label="Campanhas" value={rows.length} />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="Nenhuma campanha para analisar"
          description="Crie campanhas e vincule oportunidades a elas para medir o retorno do investimento."
          icon={<Megaphone className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <>
          <Card className="bg-[var(--surface)] border-[var(--border)]">
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)] text-base">Investido vs. receita ganha (top 8)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} tickFormatter={(v) => money(Number(v))} width={90} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--surface-strong)' }} formatter={(v: number) => money(Number(v))} />
                  <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                  <Bar dataKey="Investido" fill="var(--accent-alert)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Receita" fill="var(--accent-1)" radius={[4, 4, 0, 0]} />
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
                      <TableHead>Campanha</TableHead>
                      <TableHead className="text-right">Investido</TableHead>
                      <TableHead className="text-right">Pipeline</TableHead>
                      <TableHead className="text-right">Receita ganha</TableHead>
                      <TableHead className="text-right">ROI</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium text-[var(--text-primary)]">{r.name}</TableCell>
                        <TableCell className="text-right text-[var(--text-secondary)]">{money(r.spent)}</TableCell>
                        <TableCell className="text-right text-[var(--text-secondary)]">{money(r.pipeline)}</TableCell>
                        <TableCell className="text-right text-[var(--text-secondary)]">{money(r.revenue)}</TableCell>
                        <TableCell className="text-right">
                          {r.roi === null ? (
                            <span className="text-[var(--text-secondary)]">—</span>
                          ) : (
                            <Badge
                              variant="outline"
                              className={r.roi >= 0 ? 'text-[var(--accent-1)]' : 'text-[var(--accent-alert)]'}
                            >
                              {r.roi.toFixed(0)}%
                            </Badge>
                          )}
                        </TableCell>
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
