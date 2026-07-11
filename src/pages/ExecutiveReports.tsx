// src/pages/ExecutiveReports.tsx
// ALSHAM 360° PRIMA — Executive Reports (snapshot executivo real multi-tabela, multi-tenant)
import React, { useMemo } from 'react'
import { Users, Briefcase, DollarSign, Building2, Percent, Megaphone } from 'lucide-react'
import {
  ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, PageHeader } from '@/components/PageStates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Lead { id: string; status: string; stage: string }
interface Opportunity { id: string; value: number; stage: string; probability: number }
interface Campaign { id: string; spent: number }
interface Account { id: string }

const money = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

const WON = ['won', 'ganho', 'ganha', 'closed_won', 'fechado', 'fechado_ganho']
const QUALIFIED = ['qualified', 'qualificado', 'won', 'ganho', 'customer', 'cliente', 'converted', 'convertido']
const isWon = (s: string) => WON.includes((s || '').toLowerCase())

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

export default function ExecutiveReports() {
  const leads = useOrgData<Lead>('leads_crm', { columns: 'id, status, stage', limit: 5000 })
  const opps = useOrgData<Opportunity>('opportunities', { columns: 'id, value, stage, probability', limit: 5000 })
  const campaigns = useOrgData<Campaign>('campaigns', { columns: 'id, spent', limit: 2000 })
  const accounts = useOrgData<Account>('accounts', { columns: 'id', limit: 5000 })

  const metrics = useMemo(() => {
    const leadRows = leads.data ?? []
    const oppRows = opps.data ?? []
    const qualified = leadRows.filter(
      (l) => QUALIFIED.includes((l.status || '').toLowerCase()) || QUALIFIED.includes((l.stage || '').toLowerCase()),
    ).length
    const wonOpps = oppRows.filter((o) => isWon(o.stage))
    const wonRevenue = wonOpps.reduce((s, o) => s + (o.value ?? 0), 0)
    const pipeline = oppRows.reduce((s, o) => s + (o.value ?? 0), 0)
    const weighted = oppRows.reduce((s, o) => s + (o.value ?? 0) * ((o.probability ?? 0) / 100), 0)
    const spent = (campaigns.data ?? []).reduce((s, c) => s + (c.spent ?? 0), 0)
    const winRate = oppRows.length ? Math.round((wonOpps.length / oppRows.length) * 100) : 0
    const convRate = leadRows.length ? Math.round((qualified / leadRows.length) * 100) : 0
    const avgDeal = wonOpps.length ? Math.round(wonRevenue / wonOpps.length) : 0
    const roi = spent > 0 ? Math.round(((wonRevenue - spent) / spent) * 100) : null
    return {
      leads: leadRows.length, qualified, opps: oppRows.length, wonCount: wonOpps.length,
      wonRevenue, pipeline, weighted, spent, winRate, convRate, avgDeal, roi,
      accounts: (accounts.data ?? []).length,
    }
  }, [leads.data, opps.data, campaigns.data, accounts.data])

  const isLoading = leads.isLoading || opps.isLoading || campaigns.isLoading || accounts.isLoading
  const error = leads.error || opps.error || campaigns.error || accounts.error

  if (isLoading) return <PageSkeleton />
  if (error) {
    return (
      <ErrorState
        message={(error as Error).message}
        onRetry={() => { leads.refetch(); opps.refetch(); campaigns.refetch(); accounts.refetch() }}
      />
    )
  }

  const funnelData = [
    { name: 'Leads', value: metrics.leads },
    { name: 'Qualificados', value: metrics.qualified },
    { name: 'Oportunidades', value: metrics.opps },
    { name: 'Ganhos', value: metrics.wonCount },
  ]
  const gauges = [
    { name: 'Win rate', value: metrics.winRate, fill: 'var(--accent-1)' },
    { name: 'Conversão', value: metrics.convRate, fill: 'var(--accent-2)' },
  ]

  const tooltipStyle = {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text-primary)',
  }

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Executive Reports" description="Snapshot executivo consolidado a partir dos dados reais da organização" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<DollarSign className="h-5 w-5" />} label="Receita ganha" value={money(metrics.wonRevenue)} />
        <StatCard icon={<Briefcase className="h-5 w-5" />} label="Pipeline" value={money(metrics.pipeline)} />
        <StatCard icon={<Percent className="h-5 w-5" />} label="Ticket médio" value={money(metrics.avgDeal)} />
        <StatCard icon={<DollarSign className="h-5 w-5" />} label="ROI marketing" value={metrics.roi === null ? '—' : `${metrics.roi}%`} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5" />} label="Leads" value={metrics.leads} />
        <StatCard icon={<Building2 className="h-5 w-5" />} label="Contas" value={metrics.accounts} />
        <StatCard icon={<Briefcase className="h-5 w-5" />} label="Forecast ponderado" value={money(metrics.weighted)} />
        <StatCard icon={<Megaphone className="h-5 w-5" />} label="Investido em mkt" value={money(metrics.spent)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardHeader>
            <CardTitle className="text-[var(--text-primary)] text-base">Funil comercial</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" allowDecimals={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--surface-strong)' }} />
                <Bar dataKey="value" fill="var(--accent-1)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardHeader>
            <CardTitle className="text-[var(--text-primary)] text-base">Taxas de eficiência</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RadialBarChart innerRadius="30%" outerRadius="100%" data={gauges} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background dataKey="value" cornerRadius={8} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v}%`} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 text-xs text-[var(--text-secondary)]">
              <span><span className="text-[var(--accent-1)] font-semibold">{metrics.winRate}%</span> win rate</span>
              <span><span className="text-[var(--accent-2)] font-semibold">{metrics.convRate}%</span> conversão de leads</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
