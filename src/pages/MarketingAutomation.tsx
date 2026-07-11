// src/pages/MarketingAutomation.tsx
// ALSHAM 360° PRIMA — Automação de Marketing (automações de marketing reais, multi-tenant)
import React, { useMemo } from 'react'
import { Zap, PlayCircle, PauseCircle, Layers } from 'lucide-react'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface Automation {
  id: string
  name: string
  description: string | null
  trigger_type: string
  status: string
  actions: unknown[] | null
  created_at: string
}

const isMarketing = (t: string) => /market|email|campaign|campanha|form|lead|nurtur|social/i.test(t)

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

export default function MarketingAutomation() {
  const { data = [], isLoading, error, refetch } = useOrgData<Automation>('automations', {
    orderBy: { column: 'created_at', ascending: false },
    limit: 2000,
  })

  const flows = useMemo(() => data.filter((a) => isMarketing(a.trigger_type)), [data])
  const active = useMemo(() => flows.filter((a) => a.status === 'active').length, [flows])
  const paused = useMemo(() => flows.filter((a) => a.status !== 'active').length, [flows])
  const triggers = useMemo(() => new Set(flows.map((a) => a.trigger_type)).size, [flows])

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Automação de Marketing" description="Fluxos automatizados de marketing (email, campanhas, formulários, nutrição)" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Zap className="h-5 w-5" />} label="Fluxos de marketing" value={flows.length} />
        <StatCard icon={<PlayCircle className="h-5 w-5" />} label="Ativos" value={active} />
        <StatCard icon={<PauseCircle className="h-5 w-5" />} label="Pausados" value={paused} />
        <StatCard icon={<Layers className="h-5 w-5" />} label="Tipos de gatilho" value={triggers} />
      </div>

      {flows.length === 0 ? (
        <EmptyState
          title="Nenhuma automação de marketing"
          description="Crie fluxos automatizados com gatilhos de marketing (email, campanhas, formulários) para vê-los aqui."
          icon={<Zap className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Automação</TableHead>
                    <TableHead>Gatilho</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criada em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flows.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium text-[var(--text-primary)]">
                        {a.name}
                        {a.description && <p className="text-xs text-[var(--text-secondary)]">{a.description}</p>}
                      </TableCell>
                      <TableCell><Badge variant="outline">{a.trigger_type}</Badge></TableCell>
                      <TableCell className="text-right text-[var(--text-secondary)]">{Array.isArray(a.actions) ? a.actions.length : 0}</TableCell>
                      <TableCell>
                        {a.status === 'active' ? (
                          <Badge variant="outline" className="text-[var(--accent-1)]">ativo</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[var(--text-secondary)]">{a.status}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{new Date(a.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
