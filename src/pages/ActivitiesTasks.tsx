// src/pages/ActivitiesTasks.tsx
// ALSHAM 360° PRIMA — Atividades / Tarefas (follow-ups reais de contatos, multi-tenant)
import React, { useMemo, useState } from 'react'
import { CheckSquare, Clock, AlertTriangle, CalendarCheck } from 'lucide-react'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface Contact {
  id: string
  name: string
  email: string | null
  relationship_status: string
  last_contact: string | null
  next_followup: string | null
}

type Filter = 'all' | 'overdue' | 'upcoming'

const startOfToday = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

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

export default function ActivitiesTasks() {
  const { data = [], isLoading, error, refetch } = useOrgData<Contact>('contacts', {
    columns: 'id, name, email, relationship_status, last_contact, next_followup',
    limit: 5000,
  })
  const [filter, setFilter] = useState<Filter>('all')

  const tasks = useMemo(() => {
    return data
      .filter((c) => !!c.next_followup)
      .map((c) => ({ ...c, ts: new Date(c.next_followup as string).getTime() }))
      .sort((a, b) => a.ts - b.ts)
  }, [data])

  const today = startOfToday()
  const overdue = useMemo(() => tasks.filter((t) => t.ts < today), [tasks, today])
  const upcoming = useMemo(() => tasks.filter((t) => t.ts >= today), [tasks, today])

  const visible = useMemo(() => {
    if (filter === 'overdue') return overdue
    if (filter === 'upcoming') return upcoming
    return tasks
  }, [filter, tasks, overdue, upcoming])

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Atividades / Tarefas" description="Follow-ups agendados com seus contatos, priorizados por data" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<CheckSquare className="h-5 w-5" />} label="Tarefas agendadas" value={tasks.length} />
        <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="Atrasadas" value={overdue.length} />
        <StatCard icon={<CalendarCheck className="h-5 w-5" />} label="Próximas" value={upcoming.length} />
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          title="Nenhuma tarefa agendada"
          description="Defina a data de próximo follow-up nos seus contatos para que as tarefas apareçam aqui."
          icon={<CheckSquare className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardContent className="p-4 space-y-4">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
              <TabsList>
                <TabsTrigger value="all">Todas ({tasks.length})</TabsTrigger>
                <TabsTrigger value="overdue">Atrasadas ({overdue.length})</TabsTrigger>
                <TabsTrigger value="upcoming">Próximas ({upcoming.length})</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contato</TableHead>
                    <TableHead>Relacionamento</TableHead>
                    <TableHead>Último contato</TableHead>
                    <TableHead>Próximo follow-up</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((t) => {
                    const isOverdue = t.ts < today
                    return (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium text-[var(--text-primary)]">{t.name}</TableCell>
                        <TableCell><Badge variant="outline">{t.relationship_status}</Badge></TableCell>
                        <TableCell className="text-[var(--text-secondary)]">
                          {t.last_contact ? new Date(t.last_contact).toLocaleDateString('pt-BR') : '—'}
                        </TableCell>
                        <TableCell className="text-[var(--text-secondary)]">
                          {new Date(t.next_followup as string).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          {isOverdue ? (
                            <Badge variant="outline" className="text-[var(--accent-alert)]">
                              <Clock className="mr-1 h-3 w-3" /> Atrasada
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[var(--accent-1)]">Em dia</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {visible.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-[var(--text-secondary)]">
                        Nenhuma tarefa neste filtro.
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
