// src/pages/TeamsList.tsx
// ALSHAM 360° PRIMA — Equipes (agrupamento real de membros por função, multi-tenant)
import React, { useMemo, useState } from 'react'
import { Users, Shield, UserCheck, Search } from 'lucide-react'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface Profile {
  id: string
  user_id: string
  full_name: string | null
  role: string
  avatar_url: string | null
  created_at: string
}

const initials = (name: string) =>
  name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]?.toUpperCase()).join('') || '?'

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

export default function TeamsList() {
  const { data = [], isLoading, error, refetch } = useOrgData<Profile>('user_profiles', {
    columns: 'id, user_id, full_name, role, avatar_url, created_at',
    orderBy: { column: 'created_at', ascending: true },
    limit: 2000,
  })
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return data
    return data.filter((p) => (p.full_name ?? '').toLowerCase().includes(term) || (p.role ?? '').toLowerCase().includes(term))
  }, [data, search])

  const groups = useMemo(() => {
    const map = new Map<string, Profile[]>()
    for (const p of filtered) {
      const k = p.role || 'sem_funcao'
      const arr = map.get(k) ?? []
      arr.push(p)
      map.set(k, arr)
    }
    return Array.from(map.entries())
      .map(([role, members]) => ({ role, members }))
      .sort((a, b) => b.members.length - a.members.length)
  }, [filtered])

  const rolesCount = useMemo(() => new Set(data.map((p) => p.role || 'sem_funcao')).size, [data])

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Equipes" description="Membros da organização agrupados por função" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Users className="h-5 w-5" />} label="Membros" value={data.length} />
        <StatCard icon={<Shield className="h-5 w-5" />} label="Funções distintas" value={rolesCount} />
        <StatCard icon={<UserCheck className="h-5 w-5" />} label="Exibidos" value={filtered.length} />
      </div>

      {data.length === 0 ? (
        <EmptyState
          title="Nenhum membro na organização"
          description="Convide pessoas para a sua organização e elas aparecerão organizadas por equipe aqui."
          icon={<Users className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou função..."
              className="pl-9 bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text-primary)]"
            />
          </div>

          {groups.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--text-secondary)]">Nenhum membro corresponde à busca.</p>
          ) : (
            <div className="space-y-6">
              {groups.map((g) => (
                <Card key={g.role} className="bg-[var(--surface)] border-[var(--border)]">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-[var(--text-primary)] text-base capitalize">{g.role.replace(/_/g, ' ')}</CardTitle>
                    <Badge variant="secondary">{g.members.length} membro(s)</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {g.members.map((m) => (
                        <div key={m.id} className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-[var(--surface)] text-[var(--accent-1)] text-sm">
                              {initials(m.full_name ?? '')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-[var(--text-primary)]">{m.full_name ?? 'Sem nome'}</p>
                            <p className="truncate font-mono text-xs text-[var(--text-secondary)]">{m.user_id}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
