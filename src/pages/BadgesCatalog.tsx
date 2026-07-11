// src/pages/BadgesCatalog.tsx
// ALSHAM 360° PRIMA — Badges e Conquistas (catálogo real, multi-tenant)
import { Award } from 'lucide-react'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface BadgeRow {
  id: string
  name: string
  description: string
  icon: string
  points_required: number
  created_at: string
}

export default function BadgesCatalog() {
  const { data = [], isLoading, error, refetch } = useOrgData<BadgeRow>('gamification_badges', {
    orderBy: { column: 'points_required', ascending: true },
    limit: 200,
  })

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Badges e Conquistas" description="Catálogo de conquistas disponíveis" />

      {data.length === 0 ? (
        <EmptyState
          title="Nenhum badge configurado"
          description="Configure badges de gamificação e eles aparecerão aqui."
          icon={<Award className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((b) => (
            <Card key={b.id} className="bg-[var(--surface)] border-[var(--border)]">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-content-center rounded-xl bg-[var(--surface-strong)] text-2xl">
                  {b.icon || <Award className="h-6 w-6 text-[var(--accent-1)]" />}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--text-primary)]">{b.name}</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-2">{b.description}</p>
                  <Badge variant="outline" className="mt-2">{b.points_required} pts</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
