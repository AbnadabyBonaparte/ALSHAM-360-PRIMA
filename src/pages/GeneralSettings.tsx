// src/pages/GeneralSettings.tsx
// ALSHAM 360° PRIMA — Configurações Gerais (dados reais da organização, multi-tenant)
import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Building, Globe, Users, ShieldCheck, Calendar, Hash } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/supabase/useAuthStore'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Org {
  id: string
  name: string
  slug: string
  domain: string | null
  created_at: string
}

interface Profile {
  user_id: string
  full_name: string | null
  role: string
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

export default function GeneralSettings() {
  const orgId = useAuthStore((s) => s.currentOrgId)

  const orgQuery = useQuery<Org | null>({
    queryKey: ['org-settings', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, slug, domain, created_at')
        .eq('id', orgId!)
        .maybeSingle()
      if (error) throw error
      return (data as Org) ?? null
    },
  })

  const profiles = useOrgData<Profile>('user_profiles', { columns: 'user_id, full_name, role', limit: 1000 })

  const roleBreakdown = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of profiles.data ?? []) map.set(p.role ?? 'member', (map.get(p.role ?? 'member') ?? 0) + 1)
    return Array.from(map.entries()).map(([role, count]) => ({ role, count })).sort((a, b) => b.count - a.count)
  }, [profiles.data])

  const isLoading = orgQuery.isLoading || profiles.isLoading
  const error = orgQuery.error || profiles.error

  if (isLoading) return <PageSkeleton />
  if (error) {
    return (
      <ErrorState
        message={(error as Error).message}
        onRetry={() => { orgQuery.refetch(); profiles.refetch() }}
      />
    )
  }

  const org = orgQuery.data
  const memberCount = (profiles.data ?? []).length

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Configurações Gerais" description="Informações e composição da sua organização no CRM" />

      {!org ? (
        <EmptyState
          title="Organização não encontrada"
          description="Não foi possível carregar os dados da organização atual."
          icon={<Building className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <div className="space-y-6">
          <Card className="bg-[var(--surface)] border-[var(--border)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[var(--text-primary)]">
                <Building className="h-5 w-5 text-[var(--accent-1)]" /> {org.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <InfoRow icon={<Hash className="h-4 w-4" />} label="Slug" value={org.slug} />
              <InfoRow icon={<Globe className="h-4 w-4" />} label="Domínio" value={org.domain ?? '—'} />
              <InfoRow icon={<Users className="h-4 w-4" />} label="Membros" value={memberCount} />
              <InfoRow icon={<Calendar className="h-4 w-4" />} label="Criada em" value={new Date(org.created_at).toLocaleDateString('pt-BR')} />
              <InfoRow icon={<Hash className="h-4 w-4" />} label="ID da organização" value={<span className="font-mono text-xs">{org.id}</span>} />
            </CardContent>
          </Card>

          <Card className="bg-[var(--surface)] border-[var(--border)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-[var(--text-primary)]">
                <ShieldCheck className="h-4 w-4 text-[var(--accent-2)]" /> Composição por função
              </CardTitle>
            </CardHeader>
            <CardContent>
              {roleBreakdown.length === 0 ? (
                <p className="py-6 text-center text-sm text-[var(--text-secondary)]">Nenhum membro cadastrado nesta organização.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {roleBreakdown.map((r) => (
                    <div key={r.role} className="rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3">
                      <Badge variant="outline" className="mb-1">{r.role}</Badge>
                      <p className="text-xl font-bold text-[var(--text-primary)]">{r.count}</p>
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
