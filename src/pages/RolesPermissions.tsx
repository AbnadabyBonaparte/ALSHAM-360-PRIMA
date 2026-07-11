// src/pages/RolesPermissions.tsx
// ALSHAM 360° PRIMA — Funções e Permissões (real, multi-tenant)
import React, { useMemo } from 'react'
import { ShieldCheck, KeyRound } from 'lucide-react'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface UserRole {
  id: string
  user_id: string
  role_name: string
  permissions: Record<string, unknown> | null
  assigned_at: string
  expires_at: string | null
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

export default function RolesPermissions() {
  const { data = [], isLoading, error, refetch } = useOrgData<UserRole>('user_roles', {
    orderBy: { column: 'assigned_at', ascending: false },
    limit: 200,
  })

  const distinctRoles = useMemo(() => new Set(data.map((r) => r.role_name)).size, [data])

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Funções e Permissões" description="Atribuições de papéis por usuário" />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard icon={<KeyRound className="h-5 w-5" />} label="Atribuições" value={data.length} />
        <StatCard icon={<ShieldCheck className="h-5 w-5" />} label="Funções distintas" value={distinctRoles} />
      </div>

      {data.length === 0 ? (
        <EmptyState
          title="Nenhuma função atribuída"
          description="Atribua papéis e permissões aos usuários para vê-los aqui."
          icon={<ShieldCheck className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Permissões</TableHead>
                    <TableHead>Expira em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs text-[var(--text-primary)]">{r.user_id}</TableCell>
                      <TableCell><Badge variant="outline">{r.role_name}</Badge></TableCell>
                      <TableCell className="text-[var(--text-secondary)]">
                        {r.permissions ? Object.keys(r.permissions).length : 0} chave(s)
                      </TableCell>
                      <TableCell className="text-[var(--text-secondary)]">
                        {r.expires_at ? new Date(r.expires_at).toLocaleDateString('pt-BR') : 'Sem expiração'}
                      </TableCell>
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
