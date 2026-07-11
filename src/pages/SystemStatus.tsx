// src/pages/SystemStatus.tsx
// ALSHAM 360° PRIMA — System Status (saúde de dados da organização, contagens reais, multi-tenant)
import React, { useMemo } from 'react'
import { Database, Activity, CheckCircle2, Boxes } from 'lucide-react'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, PageHeader } from '@/components/PageStates'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface Row { id: string; created_at: string }

const opts = { columns: 'id, created_at', limit: 10000 } as const

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

export default function SystemStatus() {
  const leads = useOrgData<Row>('leads_crm', opts)
  const contacts = useOrgData<Row>('contacts', opts)
  const accounts = useOrgData<Row>('accounts', opts)
  const opportunities = useOrgData<Row>('opportunities', opts)
  const campaigns = useOrgData<Row>('campaigns', opts)
  const automations = useOrgData<Row>('automations', opts)
  const notifications = useOrgData<Row>('notifications', opts)
  const tickets = useOrgData<Row>('support_tickets', opts)
  const articles = useOrgData<Row>('kb_articles', opts)
  const goals = useOrgData<Row>('goals', opts)

  const modules = useMemo(() => ([
    { key: 'Leads', q: leads },
    { key: 'Contatos', q: contacts },
    { key: 'Contas', q: accounts },
    { key: 'Oportunidades', q: opportunities },
    { key: 'Campanhas', q: campaigns },
    { key: 'Automações', q: automations },
    { key: 'Notificações', q: notifications },
    { key: 'Tickets de Suporte', q: tickets },
    { key: 'Base de Conhecimento', q: articles },
    { key: 'Metas', q: goals },
  ]), [leads, contacts, accounts, opportunities, campaigns, automations, notifications, tickets, articles, goals])

  const isLoading = modules.some((m) => m.q.isLoading)
  const error = modules.find((m) => m.q.error)?.q.error

  const summary = useMemo(() => modules.map((m) => {
    const rows = m.q.data ?? []
    let latest: number | null = null
    for (const r of rows) {
      const t = r.created_at ? new Date(r.created_at).getTime() : NaN
      if (!Number.isNaN(t)) latest = latest === null ? t : Math.max(latest, t)
    }
    return { key: m.key, count: rows.length, latest }
  }), [modules])

  const totalRecords = useMemo(() => summary.reduce((s, m) => s + m.count, 0), [summary])
  const activeModules = useMemo(() => summary.filter((m) => m.count > 0).length, [summary])

  if (isLoading) return <PageSkeleton />
  if (error) {
    return (
      <ErrorState
        message={(error as Error).message}
        onRetry={() => modules.forEach((m) => m.q.refetch())}
      />
    )
  }

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="System Status" description="Saúde e volume de dados da sua organização por módulo do CRM" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Boxes className="h-5 w-5" />} label="Módulos monitorados" value={summary.length} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Módulos com dados" value={activeModules} />
        <StatCard icon={<Database className="h-5 w-5" />} label="Registros totais" value={totalRecords.toLocaleString('pt-BR')} />
        <StatCard icon={<Activity className="h-5 w-5" />} label="Operacional" value={`${Math.round((activeModules / summary.length) * 100)}%`} />
      </div>

      <Card className="bg-[var(--surface)] border-[var(--border)]">
        <CardContent className="p-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Módulo</TableHead>
                  <TableHead className="text-right">Registros</TableHead>
                  <TableHead>Último registro</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.map((m) => (
                  <TableRow key={m.key}>
                    <TableCell className="font-medium text-[var(--text-primary)]">{m.key}</TableCell>
                    <TableCell className="text-right text-[var(--text-secondary)]">{m.count.toLocaleString('pt-BR')}</TableCell>
                    <TableCell className="text-[var(--text-secondary)]">
                      {m.latest ? new Date(m.latest).toLocaleDateString('pt-BR') : '—'}
                    </TableCell>
                    <TableCell>
                      {m.count > 0 ? (
                        <Badge variant="outline" className="text-[var(--accent-1)]">Ativo</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[var(--text-secondary)]">Vazio</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
