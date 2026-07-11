// src/pages/CustomReports.tsx
// ALSHAM 360° PRIMA — Relatórios Personalizados (agregação multi-tabela real, multi-tenant)
import React, { useMemo, useState } from 'react'
import { FileBarChart, Users, Briefcase, Megaphone, Building2, UserSquare2 } from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface Lead { id: string; status: string; source: string | null }
interface Opportunity { id: string; value: number; stage: string }
interface Campaign { id: string; status: string }
interface Account { id: string; industry: string | null }
interface Contact { id: string; relationship_status: string }

type Dimension = 'leads' | 'opportunities' | 'campaigns' | 'accounts' | 'contacts'

const money = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

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

function groupCount<T>(rows: T[], keyFn: (r: T) => string) {
  const map = new Map<string, number>()
  for (const r of rows) {
    const k = keyFn(r) || '—'
    map.set(k, (map.get(k) ?? 0) + 1)
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export default function CustomReports() {
  const leads = useOrgData<Lead>('leads_crm', { columns: 'id, status, source', limit: 5000 })
  const opps = useOrgData<Opportunity>('opportunities', { columns: 'id, value, stage', limit: 5000 })
  const campaigns = useOrgData<Campaign>('campaigns', { columns: 'id, status', limit: 2000 })
  const accounts = useOrgData<Account>('accounts', { columns: 'id, industry', limit: 5000 })
  const contacts = useOrgData<Contact>('contacts', { columns: 'id, relationship_status', limit: 5000 })

  const [dimension, setDimension] = useState<Dimension>('leads')

  const report = useMemo(() => {
    switch (dimension) {
      case 'leads':
        return { title: 'Leads por status', rows: groupCount(leads.data ?? [], (l) => l.status) }
      case 'opportunities':
        return { title: 'Oportunidades por estágio', rows: groupCount(opps.data ?? [], (o) => o.stage) }
      case 'campaigns':
        return { title: 'Campanhas por status', rows: groupCount(campaigns.data ?? [], (c) => c.status) }
      case 'accounts':
        return { title: 'Contas por segmento', rows: groupCount(accounts.data ?? [], (a) => a.industry ?? 'Sem segmento') }
      case 'contacts':
        return { title: 'Contatos por relacionamento', rows: groupCount(contacts.data ?? [], (c) => c.relationship_status) }
    }
  }, [dimension, leads.data, opps.data, campaigns.data, accounts.data, contacts.data])

  const pipelineValue = useMemo(() => (opps.data ?? []).reduce((s, o) => s + (o.value ?? 0), 0), [opps.data])

  const isLoading = leads.isLoading || opps.isLoading || campaigns.isLoading || accounts.isLoading || contacts.isLoading
  const error = leads.error || opps.error || campaigns.error || accounts.error || contacts.error

  if (isLoading) return <PageSkeleton />
  if (error) {
    return (
      <ErrorState
        message={(error as Error).message}
        onRetry={() => {
          leads.refetch(); opps.refetch(); campaigns.refetch(); accounts.refetch(); contacts.refetch()
        }}
      />
    )
  }

  const totalRecords =
    (leads.data ?? []).length + (opps.data ?? []).length + (campaigns.data ?? []).length +
    (accounts.data ?? []).length + (contacts.data ?? []).length
  const totalInReport = (report?.rows ?? []).reduce((s, r) => s + r.value, 0)

  const tooltipStyle = {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text-primary)',
  }

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Relatórios Personalizados" description="Monte cortes de dados por dimensão sobre os registros reais da sua organização" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5" />} label="Leads" value={(leads.data ?? []).length} />
        <StatCard icon={<Briefcase className="h-5 w-5" />} label="Oportunidades" value={(opps.data ?? []).length} />
        <StatCard icon={<Megaphone className="h-5 w-5" />} label="Campanhas" value={(campaigns.data ?? []).length} />
        <StatCard icon={<Building2 className="h-5 w-5" />} label="Pipeline" value={money(pipelineValue)} />
      </div>

      <Card className="bg-[var(--surface)] border-[var(--border)]">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-[var(--text-primary)] text-base">{report?.title}</CardTitle>
          <Select value={dimension} onValueChange={(v) => setDimension(v as Dimension)}>
            <SelectTrigger className="w-56 bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text-primary)]">
              <SelectValue placeholder="Dimensão" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="leads">Leads por status</SelectItem>
              <SelectItem value="opportunities">Oportunidades por estágio</SelectItem>
              <SelectItem value="campaigns">Campanhas por status</SelectItem>
              <SelectItem value="accounts">Contas por segmento</SelectItem>
              <SelectItem value="contacts">Contatos por relacionamento</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="space-y-6">
          {totalRecords === 0 || (report?.rows ?? []).length === 0 ? (
            <EmptyState
              title="Sem dados para este relatório"
              description="Assim que houver registros nesta dimensão, o corte aparecerá aqui."
              icon={<FileBarChart className="h-7 w-7 text-[var(--text-secondary)]" />}
            />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={report?.rows}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--surface-strong)' }} />
                  <Bar dataKey="value" fill="var(--accent-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Registros</TableHead>
                      <TableHead className="text-right">Participação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(report?.rows ?? []).map((r) => (
                      <TableRow key={r.name}>
                        <TableCell className="font-medium text-[var(--text-primary)]">{r.name}</TableCell>
                        <TableCell className="text-right text-[var(--text-secondary)]">{r.value}</TableCell>
                        <TableCell className="text-right text-[var(--text-secondary)]">
                          {totalInReport ? ((r.value / totalInReport) * 100).toFixed(1) : '0.0'}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard icon={<Building2 className="h-5 w-5" />} label="Contas" value={(accounts.data ?? []).length} />
        <StatCard icon={<UserSquare2 className="h-5 w-5" />} label="Contatos" value={(contacts.data ?? []).length} />
      </div>
    </div>
  )
}
