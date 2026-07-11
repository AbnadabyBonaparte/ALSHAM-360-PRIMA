// src/pages/EmailMarketingDashboard.tsx
// ALSHAM 360° PRIMA — Email Marketing Dashboard (campanhas de email reais, multi-tenant)
import React, { useMemo } from 'react'
import { Mail, DollarSign, PlayCircle, CheckCircle2 } from 'lucide-react'
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

interface Campaign {
  id: string
  name: string
  type: string
  status: string
  budget: number
  spent: number
  start_date: string
  end_date: string | null
}

const isEmail = (t: string) => /email|e-mail|mail|newsletter/i.test(t)
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

export default function EmailMarketingDashboard() {
  const { data = [], isLoading, error, refetch } = useOrgData<Campaign>('campaigns', {
    orderBy: { column: 'start_date', ascending: false },
    limit: 2000,
  })

  const emails = useMemo(() => data.filter((c) => isEmail(c.type)), [data])

  const active = useMemo(() => emails.filter((c) => c.status === 'active').length, [emails])
  const completed = useMemo(() => emails.filter((c) => c.status === 'completed').length, [emails])
  const totalBudget = useMemo(() => emails.reduce((s, c) => s + (c.budget ?? 0), 0), [emails])
  const totalSpent = useMemo(() => emails.reduce((s, c) => s + (c.spent ?? 0), 0), [emails])

  const chart = useMemo(
    () => emails.slice(0, 10).map((c) => ({ name: c.name, orçamento: c.budget ?? 0, gasto: c.spent ?? 0 })),
    [emails],
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
      <PageHeader title="Email Marketing" description="Desempenho e investimento das campanhas de email da organização" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Mail className="h-5 w-5" />} label="Campanhas de email" value={emails.length} />
        <StatCard icon={<PlayCircle className="h-5 w-5" />} label="Ativas" value={active} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Concluídas" value={completed} />
        <StatCard icon={<DollarSign className="h-5 w-5" />} label="Investimento" value={money(totalSpent)} />
      </div>

      {emails.length === 0 ? (
        <EmptyState
          title="Nenhuma campanha de email"
          description="Crie campanhas do tipo email para acompanhar orçamento, investimento e status aqui."
          icon={<Mail className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <>
          <Card className="bg-[var(--surface)] border-[var(--border)]">
            <CardHeader>
              <CardTitle className="text-base text-[var(--text-primary)]">Orçamento vs. investimento</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--surface-strong)' }} formatter={(v: number) => money(v)} />
                  <Bar dataKey="orçamento" fill="var(--accent-2)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gasto" fill="var(--accent-1)" radius={[4, 4, 0, 0]} />
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
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Orçamento</TableHead>
                      <TableHead className="text-right">Investido</TableHead>
                      <TableHead>Início</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emails.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium text-[var(--text-primary)]">{c.name}</TableCell>
                        <TableCell><Badge variant="outline">{c.status}</Badge></TableCell>
                        <TableCell className="text-right text-[var(--text-secondary)]">{money(c.budget ?? 0)}</TableCell>
                        <TableCell className="text-right text-[var(--text-secondary)]">{money(c.spent ?? 0)}</TableCell>
                        <TableCell className="text-[var(--text-secondary)]">{new Date(c.start_date).toLocaleDateString('pt-BR')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-[var(--text-secondary)]">
            Total de orçamento planejado: {money(totalBudget)} · investido: {money(totalSpent)}.
          </p>
        </>
      )}
    </div>
  )
}
