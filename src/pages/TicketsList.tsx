// src/pages/TicketsList.tsx
// ALSHAM 360° PRIMA — Tickets de Suporte (lista real, multi-tenant)
import React, { useMemo, useState } from 'react'
import { Headphones, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface Ticket {
  id: string
  subject: string
  status: string
  priority: string
  category: string | null
  channel: string | null
  requester_name: string | null
  created_at: string
}

type Filter = 'all' | 'open' | 'pending' | 'resolved'

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

const priorityColor = (p: string) => {
  switch (p) {
    case 'urgent': return 'text-[var(--accent-alert)]'
    case 'high': return 'text-[var(--accent-warm)]'
    case 'low': return 'text-[var(--text-secondary)]'
    default: return 'text-[var(--accent-2)]'
  }
}

export default function TicketsList() {
  const { data = [], isLoading, error, refetch } = useOrgData<Ticket>('support_tickets', {
    orderBy: { column: 'created_at', ascending: false },
    limit: 2000,
  })
  const [filter, setFilter] = useState<Filter>('all')

  const counts = useMemo(() => ({
    all: data.length,
    open: data.filter((t) => t.status === 'open').length,
    pending: data.filter((t) => t.status === 'pending').length,
    resolved: data.filter((t) => t.status === 'resolved' || t.status === 'closed').length,
  }), [data])

  const visible = useMemo(() => {
    if (filter === 'all') return data
    if (filter === 'resolved') return data.filter((t) => t.status === 'resolved' || t.status === 'closed')
    return data.filter((t) => t.status === filter)
  }, [data, filter])

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Tickets de Suporte" description="Fila de atendimento e chamados dos clientes da organização" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Headphones className="h-5 w-5" />} label="Total" value={counts.all} />
        <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="Abertos" value={counts.open} />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Pendentes" value={counts.pending} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Resolvidos" value={counts.resolved} />
      </div>

      {data.length === 0 ? (
        <EmptyState
          title="Nenhum ticket registrado"
          description="Quando chamados de suporte forem abertos, eles aparecerão aqui na fila de atendimento."
          icon={<Headphones className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardContent className="p-4 space-y-4">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
              <TabsList>
                <TabsTrigger value="all">Todos ({counts.all})</TabsTrigger>
                <TabsTrigger value="open">Abertos ({counts.open})</TabsTrigger>
                <TabsTrigger value="pending">Pendentes ({counts.pending})</TabsTrigger>
                <TabsTrigger value="resolved">Resolvidos ({counts.resolved})</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assunto</TableHead>
                    <TableHead>Solicitante</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aberto em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium text-[var(--text-primary)]">{t.subject}</TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{t.requester_name ?? '—'}</TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{t.channel ?? '—'}</TableCell>
                      <TableCell><span className={`text-sm font-medium ${priorityColor(t.priority)}`}>{t.priority}</span></TableCell>
                      <TableCell><Badge variant="outline">{t.status}</Badge></TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{new Date(t.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    </TableRow>
                  ))}
                  {visible.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-[var(--text-secondary)]">
                        Nenhum ticket neste filtro.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
