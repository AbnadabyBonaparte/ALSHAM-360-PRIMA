// src/pages/UsersList.tsx
// ALSHAM 360° PRIMA — Usuários da organização (real, multi-tenant)
import React, { useMemo } from 'react'
import { Users, Shield } from 'lucide-react'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface UserProfile {
  id: string
  user_id: string
  full_name: string | null
  role: string
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

export default function UsersList() {
  const { data = [], isLoading, error, refetch } = useOrgData<UserProfile>('user_profiles', {
    orderBy: { column: 'created_at', ascending: false },
    limit: 200,
  })

  const admins = useMemo(
    () => data.filter((u) => ['owner', 'admin'].includes(u.role)).length,
    [data],
  )

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Usuários" description="Membros da sua organização" />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard icon={<Users className="h-5 w-5" />} label="Usuários" value={data.length} />
        <StatCard icon={<Shield className="h-5 w-5" />} label="Administradores" value={admins} />
      </div>

      {data.length === 0 ? (
        <EmptyState
          title="Nenhum usuário"
          description="Convide membros para sua organização e eles aparecerão aqui."
          icon={<Users className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Desde</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium text-[var(--text-primary)]">
                        {u.full_name ?? <span className="font-mono text-xs">{u.user_id}</span>}
                      </TableCell>
                      <TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
                      <TableCell className="text-[var(--text-secondary)]">
                        {new Date(u.created_at).toLocaleDateString('pt-BR')}
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
