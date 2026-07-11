// src/pages/MarketingAttribution.tsx
// ALSHAM 360° PRIMA — Atribuição de Marketing (leads por origem × campanhas reais, multi-tenant)
import React, { useMemo } from 'react'
import { Target, Users, Megaphone, DollarSign } from 'lucide-react'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface Lead { id: string; source: string | null; campaign_id: string | null }
interface Opportunity { id: string; value: number; campaign_id: string | null }
interface Campaign { id: string; name: string }

const money = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

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

export default function MarketingAttribution() {
  const leads = useOrgData<Lead>('leads_crm', { columns: 'id, source, campaign_id', limit: 5000 })
  const opps = useOrgData<Opportunity>('opportunities', { columns: 'id, value, campaign_id', limit: 5000 })
  const campaigns = useOrgData<Campaign>('campaigns', { columns: 'id, name', limit: 2000 })

  const bySource = useMemo(() => {
    const map = new Map<string, number>()
    for (const l of leads.data ?? []) {
      const k = l.source || 'Direto / Sem origem'
      map.set(k, (map.get(k) ?? 0) + 1)
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [leads.data])

  const byCampaign = useMemo(() => {
    const nameOf = new Map((campaigns.data ?? []).map((c) => [c.id, c.name]))
    const leadCount = new Map<string, number>()
    for (const l of leads.data ?? []) {
      if (l.campaign_id) leadCount.set(l.campaign_id, (leadCount.get(l.campaign_id) ?? 0) + 1)
    }
    const oppValue = new Map<string, number>()
    for (const o of opps.data ?? []) {
      if (o.campaign_id) oppValue.set(o.campaign_id, (oppValue.get(o.campaign_id) ?? 0) + (o.value ?? 0))
    }
    const ids = new Set<string>([...leadCount.keys(), ...oppValue.keys()])
    return Array.from(ids)
      .map((id) => ({
        id,
        name: nameOf.get(id) ?? 'Campanha removida',
        leads: leadCount.get(id) ?? 0,
        pipeline: oppValue.get(id) ?? 0,
      }))
      .sort((a, b) => b.pipeline - a.pipeline)
  }, [leads.data, opps.data, campaigns.data])

  const attributedLeads = useMemo(() => (leads.data ?? []).filter((l) => !!l.campaign_id).length, [leads.data])
  const attributedPipeline = useMemo(() => byCampaign.reduce((s, c) => s + c.pipeline, 0), [byCampaign])

  const isLoading = leads.isLoading || opps.isLoading || campaigns.isLoading
  const error = leads.error || opps.error || campaigns.error

  if (isLoading) return <PageSkeleton />
  if (error) {
    return (
      <ErrorState
        message={(error as Error).message}
        onRetry={() => { leads.refetch(); opps.refetch(); campaigns.refetch() }}
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
      <PageHeader title="Atribuição de Marketing" description="De onde vêm os leads e quanto de pipeline cada canal e campanha realmente gera" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5" />} label="Leads totais" value={(leads.data ?? []).length} />
        <StatCard icon={<Target className="h-5 w-5" />} label="Leads atribuídos" value={attributedLeads} />
        <StatCard icon={<Megaphone className="h-5 w-5" />} label="Canais de origem" value={bySource.length} />
        <StatCard icon={<DollarSign className="h-5 w-5" />} label="Pipeline atribuído" value={money(attributedPipeline)} />
      </div>

      {(leads.data ?? []).length === 0 && byCampaign.length === 0 ? (
        <EmptyState
          title="Sem dados de atribuição"
          description="Registre a origem dos leads e vincule-os a campanhas para visualizar a atribuição."
          icon={<Target className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="bg-[var(--surface)] border-[var(--border)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)] text-base">Leads por origem</CardTitle>
              </CardHeader>
              <CardContent>
                {bySource.length === 0 ? (
                  <p className="py-12 text-center text-sm text-[var(--text-secondary)]">Sem origens registradas.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={bySource} dataKey="value" nameKey="name" outerRadius={90} label>
                        {bySource.map((_, i) => (
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

            <Card className="bg-[var(--surface)] border-[var(--border)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)] text-base">Pipeline por campanha</CardTitle>
              </CardHeader>
              <CardContent>
                {byCampaign.length === 0 ? (
                  <p className="py-12 text-center text-sm text-[var(--text-secondary)]">Nenhuma campanha atribuída.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={byCampaign.slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                      <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} tickFormatter={(v) => money(Number(v))} width={80} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--surface-strong)' }} formatter={(v: number) => money(Number(v))} />
                      <Bar dataKey="pipeline" fill="var(--accent-2)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {byCampaign.length > 0 && (
            <Card className="bg-[var(--surface)] border-[var(--border)]">
              <CardContent className="p-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campanha</TableHead>
                        <TableHead className="text-right">Leads gerados</TableHead>
                        <TableHead className="text-right">Pipeline gerado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {byCampaign.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium text-[var(--text-primary)]">{c.name}</TableCell>
                          <TableCell className="text-right text-[var(--text-secondary)]">{c.leads}</TableCell>
                          <TableCell className="text-right font-semibold text-[var(--accent-1)]">{money(c.pipeline)}</TableCell>
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
