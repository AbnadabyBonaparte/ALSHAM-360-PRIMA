// src/pages/AccountDetails.tsx
// ALSHAM 360° PRIMA — Detalhes da Conta (conta + contatos vinculados, multi-tenant)
import React, { useMemo, useState } from 'react'
import { Building2, Globe, MapPin, DollarSign, Users } from 'lucide-react'
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

interface Account {
  id: string
  name: string
  domain: string | null
  industry: string | null
  size: string | null
  revenue: number | null
  location: string | null
  website: string | null
  description: string | null
  status: string
  created_at: string
}

interface Contact {
  id: string
  account_id: string | null
  name: string
  email: string | null
  position: string | null
  relationship_status: string
}

const money = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

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

export default function AccountDetails() {
  const accounts = useOrgData<Account>('accounts', {
    orderBy: { column: 'created_at', ascending: false },
    limit: 500,
  })
  const contacts = useOrgData<Contact>('contacts', { limit: 1000 })

  const [selectedId, setSelectedId] = useState<string>(initialId)

  const account = useMemo(
    () => (accounts.data ?? []).find((a) => a.id === selectedId) ?? null,
    [accounts.data, selectedId],
  )
  const relatedContacts = useMemo(
    () => (account ? (contacts.data ?? []).filter((c) => c.account_id === account.id) : []),
    [contacts.data, account],
  )

  const isLoading = accounts.isLoading || contacts.isLoading
  const error = accounts.error || contacts.error

  if (isLoading) return <PageSkeleton />
  if (error) {
    return (
      <ErrorState
        message={(error as Error).message}
        onRetry={() => {
          accounts.refetch()
          contacts.refetch()
        }}
      />
    )
  }

  const accountList = accounts.data ?? []

  const picker = (
    <Select value={selectedId} onValueChange={setSelectedId}>
      <SelectTrigger className="w-64 bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text-primary)]">
        <SelectValue placeholder="Selecione uma conta" />
      </SelectTrigger>
      <SelectContent>
        {accountList.map((a) => (
          <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  return (
    <div className="p-1 space-y-6">
      <PageHeader
        title="Detalhes da Conta"
        description="Perfil da empresa e contatos vinculados"
        actions={accountList.length > 0 ? picker : undefined}
      />

      {accountList.length === 0 ? (
        <EmptyState
          title="Nenhuma conta cadastrada"
          description="Adicione contas/empresas ao CRM para visualizar seus detalhes aqui."
          icon={<Building2 className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : !account ? (
        <EmptyState
          title="Selecione uma conta"
          description="Escolha uma conta no seletor acima para ver os detalhes completos."
          icon={<Building2 className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <div className="space-y-6">
          <Card className="bg-[var(--surface)] border-[var(--border)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[var(--text-primary)]">
                {account.name}
                <Badge variant="outline">{account.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <InfoRow icon={<Building2 className="h-4 w-4" />} label="Indústria" value={account.industry ?? '—'} />
                <InfoRow icon={<Users className="h-4 w-4" />} label="Porte" value={account.size ?? '—'} />
                <InfoRow icon={<DollarSign className="h-4 w-4" />} label="Receita" value={account.revenue != null ? money(account.revenue) : '—'} />
                <InfoRow icon={<Globe className="h-4 w-4" />} label="Website" value={account.website ?? account.domain ?? '—'} />
                <InfoRow icon={<MapPin className="h-4 w-4" />} label="Localização" value={account.location ?? '—'} />
                <InfoRow icon={<Building2 className="h-4 w-4" />} label="Desde" value={new Date(account.created_at).toLocaleDateString('pt-BR')} />
              </div>
              {account.description && (
                <p className="text-sm text-[var(--text-secondary)] border-t border-[var(--border)] pt-4">
                  {account.description}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[var(--surface)] border-[var(--border)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-[var(--text-primary)]">
                <Users className="h-4 w-4 text-[var(--accent-1)]" /> Contatos vinculados
                <Badge variant="secondary" className="ml-1">{relatedContacts.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {relatedContacts.length === 0 ? (
                <p className="py-6 text-center text-sm text-[var(--text-secondary)]">
                  Nenhum contato vinculado a esta conta.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Relacionamento</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relatedContacts.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium text-[var(--text-primary)]">{c.name}</TableCell>
                          <TableCell className="text-[var(--text-secondary)]">{c.position ?? '—'}</TableCell>
                          <TableCell className="text-[var(--text-secondary)]">{c.email ?? '—'}</TableCell>
                          <TableCell><Badge variant="outline">{c.relationship_status}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
