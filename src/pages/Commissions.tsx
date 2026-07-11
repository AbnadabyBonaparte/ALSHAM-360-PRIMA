// src/pages/Commissions.tsx
// ALSHAM 360° PRIMA — Comissões (estimativa real sobre oportunidades ganhas, multi-tenant)
import React, { useMemo, useState } from 'react'
import { DollarSign, Trophy, Users, Percent } from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface Opportunity {
  id: string
  title: string
  value: number
  currency: string
  stage: string
  owner_id: string
  expected_close_date: string | null
}

interface Profile {
  user_id: string
  full_name: string | null
}

const isWon = (stage: string) => /won|ganho|fechad/i.test(stage)
const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

const RATES = ['3', '5', '8', '10']

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

export default function Commissions() {
  const opps = useOrgData<Opportunity>('opportunities', { limit: 5000 })
  const profiles = useOrgData<Profile>('user_profiles', { columns: 'user_id, full_name', limit: 1000 })
  const [rate, setRate] = useState('5')

  const rateNum = Number(rate) / 100

  const nameOf = useMemo(() => {
    const m = new Map<string, string>()
    for (const p of profiles.data ?? []) if (p.user_id) m.set(p.user_id, p.full_name ?? p.user_id.slice(0, 8))
    return m
  }, [profiles.data])

  const won = useMemo(() => (opps.data ?? []).filter((o) => isWon(o.stage)), [opps.data])

  const byOwner = useMemo(() => {
    const map = new Map<string, { deals: number; revenue: number }>()
    for (const o of won) {
      const cur = map.get(o.owner_id) ?? { deals: 0, revenue: 0 }
      cur.deals += 1
      cur.revenue += o.value ?? 0
      map.set(o.owner_id, cur)
    }
    return Array.from(map.entries())
      .map(([owner_id, v]) => ({
        owner_id,
        name: nameOf.get(owner_id) ?? owner_id.slice(0, 8),
        deals: v.deals,
        revenue: v.revenue,
        commission: v.revenue * rateNum,
      }))
      .sort((a, b) => b.commission - a.commission)
  }, [won, nameOf, rateNum])

  const totalRevenue = useMemo(() => won.reduce((s, o) => s + (o.value ?? 0), 0), [won])
  const totalCommission = totalRevenue * rateNum

  const isLoading = opps.isLoading || profiles.isLoading
  const error = opps.error || profiles.error

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={(error as Error).message} onRetry={() => { opps.refetch(); profiles.refetch() }} />

  const tooltipStyle = {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text-primary)',
  }

  const ratePicker = (
    <Select value={rate} onValueChange={setRate}>
      <SelectTrigger className="w-40 bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text-primary)]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {RATES.map((r) => (
          <SelectItem key={r} value={r}>Comissão {r}%</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  return (
    <div className="p-1 space-y-6">
      <PageHeader
        title="Comissões"
        description="Estimativa de comissões sobre oportunidades ganhas, por responsável"
        actions={won.length > 0 ? ratePicker : undefined}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Trophy className="h-5 w-5" />} label="Negócios ganhos" value={won.length} />
        <StatCard icon={<DollarSign className="h-5 w-5" />} label="Receita ganha" value={money(totalRevenue)} />
        <StatCard icon={<Percent className="h-5 w-5" />} label={`Comissão (${rate}%)`} value={money(totalCommission)} />
        <StatCard icon={<Users className="h-5 w-5" />} label="Vendedores" value={byOwner.length} />
      </div>

      {won.length === 0 ? (
        <EmptyState
          title="Nenhuma oportunidade ganha"
          description="Quando oportunidades forem marcadas como ganhas, as comissões estimadas por vendedor aparecerão aqui."
          icon={<DollarSign className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <>
          <Card className="bg-[var(--surface)] border-[var(--border)]">
            <CardHeader>
              <CardTitle className="text-base text-[var(--text-primary)]">Comissão por vendedor</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={byOwner.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--surface-strong)' }} formatter={(v: number) => [money(v), 'Comissão']} />
                  <Bar dataKey="commission" fill="var(--accent-1)" radius={[4, 4, 0, 0]} />
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
                      <TableHead>Vendedor</TableHead>
                      <TableHead className="text-right">Negócios ganhos</TableHead>
                      <TableHead className="text-right">Receita</TableHead>
                      <TableHead className="text-right">Comissão ({rate}%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {byOwner.map((r) => (
                      <TableRow key={r.owner_id}>
                        <TableCell className="font-medium text-[var(--text-primary)]">{r.name}</TableCell>
                        <TableCell className="text-right text-[var(--text-secondary)]">{r.deals}</TableCell>
                        <TableCell className="text-right text-[var(--text-secondary)]">{money(r.revenue)}</TableCell>
                        <TableCell className="text-right font-medium text-[var(--accent-1)]">{money(r.commission)}</TableCell>
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
