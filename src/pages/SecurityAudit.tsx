// src/pages/SecurityAudit.tsx
// ALSHAM 360° PRIMA — Segurança Avançada (log de segurança real, multi-tenant)
import React, { useMemo, useState } from 'react'
import { Shield, ShieldAlert, MapPin } from 'lucide-react'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface SecurityRow {
  id: string
  user_id: string
  action: string
  resource_type: string
  resource_id: string
  ip_address: string
  risk_level: string
  created_at: string
}

const riskVariant = (level: string): 'secondary' | 'outline' | 'destructive' => {
  const l = (level || '').toLowerCase()
  if (l === 'high' || l === 'critical' || l === 'alto') return 'destructive'
  if (l === 'medium' || l === 'medio' || l === 'médio') return 'secondary'
  return 'outline'
}

const StatCard = ({ icon, label, value, accent = 'var(--accent-1)' }: { icon: React.ReactNode; label: string; value: string | number; accent?: string }) => (
  <Card className="bg-[var(--surface)] border-[var(--border)]">
    <CardContent className="p-5 flex items-center gap-4">
      <div className="grid h-11 w-11 place-content-center rounded-xl bg-[var(--surface-strong)]" style={{ color: accent }}>{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">{label}</p>
        <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
      </div>
    </CardContent>
  </Card>
)

export default function SecurityAudit() {
  const { data = [], isLoading, error, refetch } = useOrgData<SecurityRow>('security_audit_log', {
    orderBy: { column: 'created_at', ascending: false },
    limit: 500,
  })
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return data
    return data.filter((r) =>
      [r.action, r.resource_type, r.ip_address, r.user_id].some((v) => v?.toLowerCase().includes(term)),
    )
  }, [data, search])

  const highRisk = useMemo(
    () => data.filter((r) => ['high', 'critical', 'alto'].includes((r.risk_level || '').toLowerCase())).length,
    [data],
  )

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Segurança Avançada" description="Eventos de segurança e acessos monitorados" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Shield className="h-5 w-5" />} label="Eventos" value={data.length} />
        <StatCard icon={<ShieldAlert className="h-5 w-5" />} label="Alto risco" value={highRisk} accent="var(--accent-alert)" />
        <StatCard icon={<MapPin className="h-5 w-5" />} label="IPs distintos" value={new Set(data.map((r) => r.ip_address)).size} />
      </div>

      {data.length === 0 ? (
        <EmptyState
          title="Nenhum evento de segurança"
          description="Acessos e ações sensíveis serão auditados e listados aqui."
          icon={<Shield className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardContent className="p-4 space-y-4">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por ação, recurso ou IP..."
              className="max-w-sm bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text-primary)]"
            />
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ação</TableHead>
                    <TableHead>Recurso</TableHead>
                    <TableHead>Risco</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium text-[var(--text-primary)]">{r.action}</TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{r.resource_type}</TableCell>
                      <TableCell><Badge variant={riskVariant(r.risk_level)}>{r.risk_level}</Badge></TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{r.ip_address}</TableCell>
                      <TableCell className="font-mono text-xs text-[var(--text-secondary)]">{r.user_id}</TableCell>
                      <TableCell className="text-[var(--text-secondary)]">
                        {new Date(r.created_at).toLocaleString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-[var(--text-secondary)] py-8">
                        Nenhum evento corresponde à busca.
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
