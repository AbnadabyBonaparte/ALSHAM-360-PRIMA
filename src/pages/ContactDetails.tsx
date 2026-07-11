// src/pages/ContactDetails.tsx
// ALSHAM 360° PRIMA — Detalhes do Contato (contato + oportunidades/predições relacionadas, multi-tenant)
import React, { useMemo, useState } from 'react'
import { UserCircle, Mail, Phone, Briefcase, Brain, Star } from 'lucide-react'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface Contact {
  id: string
  lead_id: string | null
  account_id: string | null
  name: string
  email: string | null
  phone: string | null
  position: string | null
  is_decision_maker: boolean
  influence_level: string
  relationship_status: string
  notes: string | null
  created_at: string
}

interface Opportunity {
  id: string
  lead_id: string
  title: string
  value: number
  currency: string
  stage: string
  probability: number
}

interface Prediction {
  id: string
  lead_id: string
  prediction_type: string
  confidence: number
  created_at: string
}

const money = (v: number, c = 'BRL') =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: c, maximumFractionDigits: 0 })

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

export default function ContactDetails() {
  const contacts = useOrgData<Contact>('contacts', {
    orderBy: { column: 'created_at', ascending: false },
    limit: 500,
  })
  const opportunities = useOrgData<Opportunity>('opportunities', { limit: 1000 })
  const predictions = useOrgData<Prediction>('ai_predictions', { limit: 1000 })

  const [selectedId, setSelectedId] = useState<string>(initialId)

  const contact = useMemo(
    () => (contacts.data ?? []).find((c) => c.id === selectedId) ?? null,
    [contacts.data, selectedId],
  )

  const relatedOpps = useMemo(
    () => (contact?.lead_id ? (opportunities.data ?? []).filter((o) => o.lead_id === contact.lead_id) : []),
    [opportunities.data, contact],
  )
  const relatedPredictions = useMemo(
    () => (contact?.lead_id ? (predictions.data ?? []).filter((p) => p.lead_id === contact.lead_id) : []),
    [predictions.data, contact],
  )

  const isLoading = contacts.isLoading || opportunities.isLoading || predictions.isLoading
  const error = contacts.error || opportunities.error || predictions.error

  if (isLoading) return <PageSkeleton />
  if (error) {
    return (
      <ErrorState
        message={(error as Error).message}
        onRetry={() => {
          contacts.refetch()
          opportunities.refetch()
          predictions.refetch()
        }}
      />
    )
  }

  const contactList = contacts.data ?? []

  const picker = (
    <Select value={selectedId} onValueChange={setSelectedId}>
      <SelectTrigger className="w-64 bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text-primary)]">
        <SelectValue placeholder="Selecione um contato" />
      </SelectTrigger>
      <SelectContent>
        {contactList.map((c) => (
          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  return (
    <div className="p-1 space-y-6">
      <PageHeader
        title="Detalhes do Contato"
        description="Visão 360° do contato e seus relacionamentos"
        actions={contactList.length > 0 ? picker : undefined}
      />

      {contactList.length === 0 ? (
        <EmptyState
          title="Nenhum contato cadastrado"
          description="Adicione contatos ao CRM para visualizar seus detalhes aqui."
          icon={<UserCircle className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : !contact ? (
        <EmptyState
          title="Selecione um contato"
          description="Escolha um contato no seletor acima para ver os detalhes completos."
          icon={<UserCircle className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <div className="space-y-6">
          <Card className="bg-[var(--surface)] border-[var(--border)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[var(--text-primary)]">
                {contact.name}
                {contact.is_decision_maker && <Badge variant="secondary" className="text-[10px]">Decisor</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <InfoRow icon={<Briefcase className="h-4 w-4" />} label="Cargo" value={contact.position ?? '—'} />
              <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={contact.email ?? '—'} />
              <InfoRow icon={<Phone className="h-4 w-4" />} label="Telefone" value={contact.phone ?? '—'} />
              <InfoRow icon={<Star className="h-4 w-4" />} label="Influência" value={contact.influence_level} />
              <InfoRow icon={<UserCircle className="h-4 w-4" />} label="Relacionamento" value={<Badge variant="outline">{contact.relationship_status}</Badge>} />
              <InfoRow icon={<UserCircle className="h-4 w-4" />} label="Desde" value={new Date(contact.created_at).toLocaleDateString('pt-BR')} />
            </CardContent>
          </Card>

          <Card className="bg-[var(--surface)] border-[var(--border)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-[var(--text-primary)]">
                <Briefcase className="h-4 w-4 text-[var(--accent-1)]" /> Oportunidades relacionadas
                <Badge variant="secondary" className="ml-1">{relatedOpps.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {relatedOpps.length === 0 ? (
                <p className="py-6 text-center text-sm text-[var(--text-secondary)]">
                  Nenhuma oportunidade vinculada a este contato.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Oportunidade</TableHead>
                        <TableHead>Estágio</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Prob.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relatedOpps.map((o) => (
                        <TableRow key={o.id}>
                          <TableCell className="font-medium text-[var(--text-primary)]">{o.title}</TableCell>
                          <TableCell><Badge variant="outline">{o.stage}</Badge></TableCell>
                          <TableCell className="text-[var(--text-secondary)]">{money(o.value, o.currency)}</TableCell>
                          <TableCell className="text-[var(--text-secondary)]">{o.probability}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[var(--surface)] border-[var(--border)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-[var(--text-primary)]">
                <Brain className="h-4 w-4 text-[var(--accent-2)]" /> Predições de IA
                <Badge variant="secondary" className="ml-1">{relatedPredictions.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {relatedPredictions.length === 0 ? (
                <p className="py-6 text-center text-sm text-[var(--text-secondary)]">
                  Nenhuma predição de IA para este contato.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedPredictions.map((p) => (
                    <div key={p.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] p-4 space-y-1">
                      <Badge variant="outline">{p.prediction_type}</Badge>
                      <p className="text-lg font-bold text-[var(--accent-2)]">{Math.round((p.confidence ?? 0) * 100)}%</p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {new Date(p.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
