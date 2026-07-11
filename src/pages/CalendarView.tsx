// src/pages/CalendarView.tsx
// ALSHAM 360° PRIMA — Calendário (agenda real de fechamentos e follow-ups, multi-tenant)
import React, { useMemo } from 'react'
import { CalendarClock, Target, UserRound, CalendarDays } from 'lucide-react'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Opportunity { id: string; title: string; value: number; expected_close_date: string | null }
interface Contact { id: string; name: string; next_followup: string | null }

type EventKind = 'close' | 'followup'
interface AgendaEvent {
  id: string
  kind: EventKind
  label: string
  date: string
  meta: string
}

const money = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

const dayKey = (iso: string) => new Date(iso).toISOString().slice(0, 10)
const dayLabel = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

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

export default function CalendarView() {
  const opps = useOrgData<Opportunity>('opportunities', {
    columns: 'id, title, value, expected_close_date',
    limit: 5000,
  })
  const contacts = useOrgData<Contact>('contacts', {
    columns: 'id, name, next_followup',
    limit: 5000,
  })

  const events = useMemo<AgendaEvent[]>(() => {
    const list: AgendaEvent[] = []
    for (const o of opps.data ?? []) {
      if (o.expected_close_date) {
        list.push({
          id: `opp-${o.id}`,
          kind: 'close',
          label: o.title,
          date: o.expected_close_date,
          meta: money(o.value ?? 0),
        })
      }
    }
    for (const c of contacts.data ?? []) {
      if (c.next_followup) {
        list.push({
          id: `contact-${c.id}`,
          kind: 'followup',
          label: c.name,
          date: c.next_followup,
          meta: 'Follow-up agendado',
        })
      }
    }
    return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [opps.data, contacts.data])

  const grouped = useMemo(() => {
    const map = new Map<string, AgendaEvent[]>()
    for (const e of events) {
      const k = dayKey(e.date)
      const arr = map.get(k) ?? []
      arr.push(e)
      map.set(k, arr)
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [events])

  const upcoming = useMemo(() => {
    const now = Date.now()
    return events.filter((e) => new Date(e.date).getTime() >= now).length
  }, [events])

  const isLoading = opps.isLoading || contacts.isLoading
  const error = opps.error || contacts.error

  if (isLoading) return <PageSkeleton />
  if (error) {
    return (
      <ErrorState
        message={(error as Error).message}
        onRetry={() => { opps.refetch(); contacts.refetch() }}
      />
    )
  }

  const closeCount = events.filter((e) => e.kind === 'close').length
  const followupCount = events.filter((e) => e.kind === 'followup').length

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Calendário" description="Agenda de fechamentos previstos de oportunidades e follow-ups de contatos" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<CalendarDays className="h-5 w-5" />} label="Eventos" value={events.length} />
        <StatCard icon={<Target className="h-5 w-5" />} label="Fechamentos" value={closeCount} />
        <StatCard icon={<UserRound className="h-5 w-5" />} label="Follow-ups" value={followupCount} />
      </div>

      {events.length === 0 ? (
        <EmptyState
          title="Nenhum evento agendado"
          description="Defina datas de fechamento em oportunidades e follow-ups em contatos para preencher a agenda."
          icon={<CalendarClock className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <>
          <p className="text-sm text-[var(--text-secondary)]">
            {upcoming} evento(s) futuro(s) de um total de {events.length}.
          </p>
          <div className="space-y-4">
            {grouped.map(([day, dayEvents]) => (
              <Card key={day} className="bg-[var(--surface)] border-[var(--border)]">
                <CardHeader>
                  <CardTitle className="text-[var(--text-primary)] text-base capitalize">{dayLabel(day)}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {dayEvents.map((e) => (
                    <div key={e.id} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="grid h-9 w-9 shrink-0 place-content-center rounded-lg bg-[var(--surface)] text-[var(--accent-1)]">
                          {e.kind === 'close' ? <Target className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-[var(--text-primary)]">{e.label}</p>
                          <p className="truncate text-xs text-[var(--text-secondary)]">{e.meta}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{e.kind === 'close' ? 'Fechamento' : 'Follow-up'}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
