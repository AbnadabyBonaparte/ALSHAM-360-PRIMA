// src/pages/AnalyticsDashboard.tsx
// ALSHAM 360° PRIMA — Analytics Dashboard (agregação multi-tabela real, multi-tenant)
import React, { useMemo } from 'react'
import { Users, Briefcase, Megaphone, DollarSign } from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, PageHeader } from '@/components/PageStates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Lead { id: string; status: string }
interface Opportunity { id: string; value: number; stage: string }
interface Campaign { id: string; budget: number; spent: number }

const money = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

const CHART_COLORS = [
  'var(--accent-1)',
  'var(--accent-2)',
  'var(--accent-3)',
  'var(--accent-warm)',
  'var(--accent-alert)',
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

export default function AnalyticsDashboard() {
  const leads = useOrgData<Lead>('leads_crm', { columns: 'id, status', limit: 5000 })
  const opps = useOrgData<Opportunity>('opportunities', { columns: 'id, value, stage', limit: 5000 })
  const campaigns = useOrgData<Campaign>('campaigns', { columns: 'id, budget, spent', limit: 2000 })

  const leadsByStatus = useMemo(() => {
    const map = new Map<string, number>()
    for (const l of leads.data ?? []) {
      const k = l.status || 'sem_status'
      map.set(k, (map.get(k) ?? 0) + 1)
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [leads.data])

  const oppsByStage = useMemo(() => {
    const map = new Map<string, number>()
    for (const o of opps.data ?? []) {
      const k = o.stage || 'sem_estagio'
      map.set(k, (map.get(k) ?? 0) + 1)
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [opps.data])

  const pipelineValue = useMemo(
    () => (opps.data ?? []).reduce((s, o) => s + (o.value ?? 0), 0),
    [opps.data],
  )
  const totalSpent = useMemo(
    () => (campaigns.data ?? []).reduce((s, c) => s + (c.spent ?? 0), 0),
    [campaigns.data],
  )

  const isLoading = leads.isLoading || opps.isLoading || campaigns.isLoading
  const error = leads.error || opps.error || campaigns.error

  if (isLoading) return <PageSkeleton />
  if (error) {
    return (
      <ErrorState
        message={(error as Error).message}
        onRetry={() => {
          leads.refetch()
          opps.refetch()
          campaigns.refetch()
        }}
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
      <PageHeader title="Analytics Dashboard" description="Visão consolidada de leads, oportunidades e campanhas" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5" />} label="Leads" value={(leads.data ?? []).length} />
        <StatCard icon={<Briefcase className="h-5 w-5" />} label="Oportunidades" value={(opps.data ?? []).length} />
        <StatCard icon={<Megaphone className="h-5 w-5" />} label="Campanhas" value={(campaigns.data ?? []).length} />
        <StatCard icon={<DollarSign className="h-5 w-5" />} label="Pipeline" value={money(pipelineValue)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardHeader>
            <CardTitle className="text-[var(--text-primary)] text-base">Leads por status</CardTitle>
          </CardHeader>
          <CardContent>
            {leadsByStatus.length === 0 ? (
              <p className="py-12 text-center text-sm text-[var(--text-secondary)]">Nenhum lead para exibir.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={leadsByStatus}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--surface-strong)' }} />
                  <Bar dataKey="value" fill="var(--accent-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardHeader>
            <CardTitle className="text-[var(--text-primary)] text-base">Oportunidades por estágio</CardTitle>
          </CardHeader>
          <CardContent>
            {oppsByStage.length === 0 ? (
              <p className="py-12 text-center text-sm text-[var(--text-secondary)]">Nenhuma oportunidade para exibir.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={oppsByStage} dataKey="value" nameKey="name" outerRadius={90} label>
                    {oppsByStage.map((_, i) => (
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

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard icon={<DollarSign className="h-5 w-5" />} label="Investido em campanhas" value={money(totalSpent)} />
        <StatCard icon={<Briefcase className="h-5 w-5" />} label="Estágios com oportunidades" value={oppsByStage.length} />
      </div>
    </div>
  )
}
