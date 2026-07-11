// src/pages/NotificationsCenter.tsx
// ALSHAM 360° PRIMA — Central de Notificações (real, multi-tenant)
import React, { useMemo } from 'react'
import { Bell, BellRing, CheckCircle2 } from 'lucide-react'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
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

export default function NotificationsCenter() {
  const { data = [], isLoading, error, refetch } = useOrgData<Notification>('notifications', {
    orderBy: { column: 'created_at', ascending: false },
    limit: 200,
  })

  const unread = useMemo(() => data.filter((n) => !n.read).length, [data])

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Notificações" description="Eventos e alertas da sua organização" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Bell className="h-5 w-5" />} label="Total" value={data.length} />
        <StatCard icon={<BellRing className="h-5 w-5" />} label="Não lidas" value={unread} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Lidas" value={data.length - unread} />
      </div>

      {data.length === 0 ? (
        <EmptyState
          title="Nenhuma notificação"
          description="Alertas e eventos da organização aparecerão aqui."
          icon={<Bell className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <div className="space-y-3">
          {data.map((n) => (
            <Card
              key={n.id}
              className={`border-[var(--border)] ${n.read ? 'bg-[var(--surface)]' : 'bg-[var(--surface-strong)]'}`}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className="grid h-9 w-9 shrink-0 place-content-center rounded-lg bg-[var(--surface-strong)] text-[var(--accent-2)]">
                  <Bell className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-[var(--text-primary)] truncate">{n.title}</p>
                    <Badge variant="outline" className="text-[10px]">{n.type}</Badge>
                    {!n.read && <Badge variant="secondary" className="text-[10px]">Nova</Badge>}
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">{n.message}</p>
                </div>
                <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap">
                  {new Date(n.created_at).toLocaleDateString('pt-BR')}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
