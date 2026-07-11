// src/pages/WorkflowsList.tsx
// ALSHAM 360° PRIMA — Lista de Workflows (automations reais, multi-tenant)
import React, { useMemo, useState } from 'react'
import { Workflow, Zap, CheckCircle2 } from 'lucide-react'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface Automation {
  id: string
  name: string
  description: string | null
  trigger_type: string
  actions: unknown[] | null
  status: string
  created_at: string
}

const statusVariant = (status: string): 'secondary' | 'outline' => {
  const s = (status || '').toLowerCase()
  return s === 'active' || s === 'ativo' || s === 'enabled' ? 'secondary' : 'outline'
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

export default function WorkflowsList() {
  const { data = [], isLoading, error, refetch } = useOrgData<Automation>('automations', {
    orderBy: { column: 'created_at', ascending: false },
    limit: 300,
  })
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return data
    return data.filter((a) =>
      [a.name, a.description, a.trigger_type].some((v) => v?.toLowerCase().includes(term)),
    )
  }, [data, search])

  const active = useMemo(
    () => data.filter((a) => ['active', 'ativo', 'enabled'].includes((a.status || '').toLowerCase())).length,
    [data],
  )

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Workflows" description="Automações configuradas na sua organização" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Workflow className="h-5 w-5" />} label="Workflows" value={data.length} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Ativos" value={active} />
        <StatCard icon={<Zap className="h-5 w-5" />} label="Gatilhos distintos" value={new Set(data.map((a) => a.trigger_type)).size} />
      </div>

      {data.length === 0 ? (
        <EmptyState
          title="Nenhum workflow ainda"
          description="Automações criadas aparecerão aqui com seus gatilhos e status."
          icon={<Workflow className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardContent className="p-4 space-y-4">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou gatilho..."
              className="max-w-sm bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text-primary)]"
            />
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Workflow</TableHead>
                    <TableHead>Gatilho</TableHead>
                    <TableHead>Ações</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium text-[var(--text-primary)]">
                        <div>{a.name}</div>
                        {a.description && (
                          <div className="text-xs text-[var(--text-secondary)]">{a.description}</div>
                        )}
                      </TableCell>
                      <TableCell><Badge variant="outline">{a.trigger_type}</Badge></TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{Array.isArray(a.actions) ? a.actions.length : 0}</TableCell>
                      <TableCell><Badge variant={statusVariant(a.status)}>{a.status}</Badge></TableCell>
                      <TableCell className="text-[var(--text-secondary)]">
                        {new Date(a.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-[var(--text-secondary)] py-8">
                        Nenhum workflow corresponde à busca.
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
