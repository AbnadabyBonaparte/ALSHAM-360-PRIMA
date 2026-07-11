// src/pages/AuditLogs.tsx
// ALSHAM 360° PRIMA — Logs de Auditoria (leitura real, multi-tenant)
import React, { useMemo, useState } from 'react'
import { ScrollText, Activity, Database } from 'lucide-react'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface AuditRow {
  id: string
  user_id: string
  action: string
  table_name: string
  record_id: string
  ip_address: string | null
  created_at: string
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

export default function AuditLogs() {
  const { data = [], isLoading, error, refetch } = useOrgData<AuditRow>('audit_log', {
    orderBy: { column: 'created_at', ascending: false },
    limit: 500,
  })
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return data
    return data.filter((r) =>
      [r.action, r.table_name, r.user_id, r.record_id].some((v) => v?.toLowerCase().includes(term)),
    )
  }, [data, search])

  const tablesTouched = useMemo(() => new Set(data.map((r) => r.table_name)).size, [data])

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Logs de Auditoria" description="Histórico de alterações registradas na sua organização" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<ScrollText className="h-5 w-5" />} label="Registros" value={data.length} />
        <StatCard icon={<Database className="h-5 w-5" />} label="Tabelas afetadas" value={tablesTouched} />
        <StatCard icon={<Activity className="h-5 w-5" />} label="Exibidos" value={filtered.length} />
      </div>

      {data.length === 0 ? (
        <EmptyState
          title="Nenhum registro de auditoria"
          description="As ações realizadas no CRM serão registradas e listadas aqui."
          icon={<ScrollText className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardContent className="p-4 space-y-4">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por ação, tabela ou usuário..."
              className="max-w-sm bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text-primary)]"
            />
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ação</TableHead>
                    <TableHead>Tabela</TableHead>
                    <TableHead>Registro</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell><Badge variant="outline">{r.action}</Badge></TableCell>
                      <TableCell className="font-medium text-[var(--text-primary)]">{r.table_name}</TableCell>
                      <TableCell className="font-mono text-xs text-[var(--text-secondary)]">{r.record_id}</TableCell>
                      <TableCell className="font-mono text-xs text-[var(--text-secondary)]">{r.user_id}</TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{r.ip_address ?? '—'}</TableCell>
                      <TableCell className="text-[var(--text-secondary)]">
                        {new Date(r.created_at).toLocaleString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-[var(--text-secondary)] py-8">
                        Nenhum registro corresponde à busca.
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
