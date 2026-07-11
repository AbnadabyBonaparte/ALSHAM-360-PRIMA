// src/pages/TicketDetails.tsx
// ALSHAM 360° PRIMA — Detalhes do Ticket (registro real + relacionados, multi-tenant)
import React, { useMemo, useState } from 'react'
import { Headphones, Mail, Tag, Flag, Clock, CheckCircle2 } from 'lucide-react'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

interface Ticket {
  id: string
  subject: string
  description: string | null
  status: string
  priority: string
  category: string | null
  channel: string | null
  requester_name: string | null
  requester_email: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
}

function initialId(): string {
  if (typeof window === 'undefined') return ''
  return new URLSearchParams(window.location.search).get('id') ?? ''
}

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 text-[var(--accent-1)]">{icon}</div>
    <div>
      <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">{label}</p>
      <p className="text-sm text-[var(--text-primary)]">{value}</p>
    </div>
  </div>
)

export default function TicketDetails() {
  const { data = [], isLoading, error, refetch } = useOrgData<Ticket>('support_tickets', {
    orderBy: { column: 'created_at', ascending: false },
    limit: 2000,
  })
  const [selectedId, setSelectedId] = useState<string>(initialId)

  const ticket = useMemo(
    () => data.find((t) => t.id === selectedId) ?? null,
    [data, selectedId],
  )

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />

  const picker = (
    <Select value={selectedId} onValueChange={setSelectedId}>
      <SelectTrigger className="w-72 bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text-primary)]">
        <SelectValue placeholder="Selecione um ticket" />
      </SelectTrigger>
      <SelectContent>
        {data.map((t) => (
          <SelectItem key={t.id} value={t.id}>{t.subject}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  return (
    <div className="p-1 space-y-6">
      <PageHeader
        title="Detalhes do Ticket"
        description="Informações completas do chamado de suporte"
        actions={data.length > 0 ? picker : undefined}
      />

      {data.length === 0 ? (
        <EmptyState
          title="Nenhum ticket registrado"
          description="Quando chamados de suporte forem abertos, você poderá visualizar os detalhes aqui."
          icon={<Headphones className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : !ticket ? (
        <EmptyState
          title="Selecione um ticket"
          description="Escolha um chamado no seletor acima para ver os detalhes completos."
          icon={<Headphones className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <div className="space-y-6">
          <Card className="bg-[var(--surface)] border-[var(--border)]">
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2 text-[var(--text-primary)]">
                {ticket.subject}
                <Badge variant="outline">{ticket.status}</Badge>
                <Badge variant="secondary" className="text-[10px]">{ticket.priority}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <InfoRow icon={<Headphones className="h-4 w-4" />} label="Solicitante" value={ticket.requester_name ?? '—'} />
              <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={ticket.requester_email ?? '—'} />
              <InfoRow icon={<Tag className="h-4 w-4" />} label="Categoria" value={ticket.category ?? '—'} />
              <InfoRow icon={<Flag className="h-4 w-4" />} label="Canal" value={ticket.channel ?? '—'} />
              <InfoRow icon={<Clock className="h-4 w-4" />} label="Aberto em" value={new Date(ticket.created_at).toLocaleString('pt-BR')} />
              <InfoRow
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="Resolvido em"
                value={ticket.resolved_at ? new Date(ticket.resolved_at).toLocaleString('pt-BR') : '—'}
              />
            </CardContent>
          </Card>

          <Card className="bg-[var(--surface)] border-[var(--border)]">
            <CardHeader>
              <CardTitle className="text-base text-[var(--text-primary)]">Descrição</CardTitle>
            </CardHeader>
            <CardContent>
              {ticket.description ? (
                <p className="whitespace-pre-wrap text-sm text-[var(--text-secondary)]">{ticket.description}</p>
              ) : (
                <p className="py-6 text-center text-sm text-[var(--text-secondary)]">Sem descrição registrada para este ticket.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
