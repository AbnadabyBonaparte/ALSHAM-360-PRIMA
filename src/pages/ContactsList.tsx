// src/pages/ContactsList.tsx
// ALSHAM 360° PRIMA — Contatos (lista real, multi-tenant)
import React, { useMemo, useState } from 'react'
import { Users, Star, UserCheck } from 'lucide-react'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface Contact {
  id: string
  name: string
  email: string | null
  phone: string | null
  position: string | null
  is_decision_maker: boolean
  influence_level: string
  relationship_status: string
  last_contact: string | null
  created_at: string
}

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <Card className="bg-[var(--surface)] border-[var(--border)]">
    <CardContent className="p-5 flex items-center gap-4">
      <div className="grid h-11 w-11 place-content-center rounded-xl bg-[var(--surface-strong)] text-[var(--accent-1)]">
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">{label}</p>
        <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
      </div>
    </CardContent>
  </Card>
)

export default function ContactsList() {
  const { data = [], isLoading, error, refetch } = useOrgData<Contact>('contacts', {
    orderBy: { column: 'created_at', ascending: false },
    limit: 200,
  })
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return data
    return data.filter((c) =>
      [c.name, c.email, c.position].some((v) => v?.toLowerCase().includes(term)),
    )
  }, [data, search])

  const decisionMakers = useMemo(() => data.filter((c) => c.is_decision_maker).length, [data])

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Contatos" description="Pessoas e tomadores de decisão da sua organização" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Users className="h-5 w-5" />} label="Total de contatos" value={data.length} />
        <StatCard icon={<UserCheck className="h-5 w-5" />} label="Tomadores de decisão" value={decisionMakers} />
        <StatCard icon={<Star className="h-5 w-5" />} label="Exibidos" value={filtered.length} />
      </div>

      {data.length === 0 ? (
        <EmptyState
          title="Nenhum contato ainda"
          description="Quando você adicionar contatos ao CRM, eles aparecerão aqui."
          icon={<Users className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardContent className="p-4 space-y-4">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, email ou cargo..."
              className="max-w-sm bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text-primary)]"
            />
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Relacionamento</TableHead>
                    <TableHead>Influência</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium text-[var(--text-primary)]">
                        <span className="flex items-center gap-2">
                          {c.name}
                          {c.is_decision_maker && (
                            <Badge variant="secondary" className="text-[10px]">Decisor</Badge>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{c.position ?? '—'}</TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{c.email ?? '—'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{c.relationship_status}</Badge>
                      </TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{c.influence_level}</TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-[var(--text-secondary)] py-8">
                        Nenhum contato corresponde à busca.
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
