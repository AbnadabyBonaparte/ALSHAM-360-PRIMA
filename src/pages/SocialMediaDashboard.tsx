// src/pages/SocialMediaDashboard.tsx
// ALSHAM 360° PRIMA — Redes Sociais Dashboard (campanhas sociais reais, multi-tenant)
import React, { useMemo } from 'react'
import { Share2, DollarSign, PlayCircle, Layers } from 'lucide-react'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
} from 'recharts'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface Campaign {
  id: string
  name: string
  type: string
  status: string
  budget: number
  spent: number
  start_date: string
}

const isSocial = (t: string) => /social|redes|instagram|facebook|linkedin|tiktok|twitter|x\b|ads/i.test(t)
const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

const CHART_COLORS = ['var(--accent-1)', 'var(--accent-2)', 'var(--accent-3)', 'var(--accent-warm)', 'var(--accent-alert)']

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

export default function SocialMediaDashboard() {
  const { data = [], isLoading, error, refetch } = useOrgData<Campaign>('campaigns', {
    orderBy: { column: 'start_date', ascending: false },
    limit: 2000,
  })

  const social = useMemo(() => data.filter((c) => isSocial(c.type)), [data])

  const active = useMemo(() => social.filter((c) => c.status === 'active').length, [social])
  const totalSpent = useMemo(() => social.reduce((s, c) => s + (c.spent ?? 0), 0), [social])

  const byType = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of social) {
      const k = c.type || 'Outros'
      map.set(k, (map.get(k) ?? 0) + (c.spent ?? 0))
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [social])

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
      <PageHeader title="Redes Sociais" description="Campanhas de mídia social e investimento por canal da organização" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Share2 className="h-5 w-5" />} label="Campanhas sociais" value={social.length} />
        <StatCard icon={<PlayCircle className="h-5 w-5" />} label="Ativas" value={active} />
        <StatCard icon={<Layers className="h-5 w-5" />} label="Canais" value={byType.length} />
        <StatCard icon={<DollarSign className="h-5 w-5" />} label="Investimento" value={money(totalSpent)} />
      </div>

      {social.length === 0 ? (
        <EmptyState
          title="Nenhuma campanha social"
          description="Crie campanhas de redes sociais para acompanhar investimento por canal e status aqui."
          icon={<Share2 className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="bg-[var(--surface)] border-[var(--border)]">
            <CardHeader>
              <CardTitle className="text-base text-[var(--text-primary)]">Investimento por canal</CardTitle>
            </CardHeader>
            <CardContent>
              {byType.every((t) => t.value === 0) ? (
                <p className="py-12 text-center text-sm text-[var(--text-secondary)]">Sem investimento registrado nas campanhas.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={byType} dataKey="value" nameKey="name" outerRadius={90} label>
                      {byType.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => money(v)} />
                    <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[var(--surface)] border-[var(--border)]">
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campanha</TableHead>
                      <TableHead>Canal</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Investido</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {social.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium text-[var(--text-primary)]">{c.name}</TableCell>
                        <TableCell className="text-[var(--text-secondary)]">{c.type}</TableCell>
                        <TableCell><Badge variant="outline">{c.status}</Badge></TableCell>
                        <TableCell className="text-right text-[var(--text-secondary)]">{money(c.spent ?? 0)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
