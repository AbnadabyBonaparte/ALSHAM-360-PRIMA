// src/pages/CampaignsList.tsx
// ALSHAM 360° PRIMA — Campanhas (lista real, multi-tenant)
import React, { useMemo } from 'react'
import { Megaphone, DollarSign, Flame } from 'lucide-react'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface Campaign {
  id: string
  name: string
  type: string
  status: string
  budget: number
  spent: number
  start_date: string
  end_date: string | null
  created_at: string
}

const money = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

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

export default function CampaignsList() {
  const { data = [], isLoading, error, refetch } = useOrgData<Campaign>('campaigns', {
    orderBy: { column: 'start_date', ascending: false },
    limit: 200,
  })

  const totalBudget = useMemo(() => data.reduce((s, c) => s + (c.budget ?? 0), 0), [data])
  const totalSpent = useMemo(() => data.reduce((s, c) => s + (c.spent ?? 0), 0), [data])

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Campanhas" description="Campanhas de marketing e seus investimentos" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Megaphone className="h-5 w-5" />} label="Campanhas" value={data.length} />
        <StatCard icon={<DollarSign className="h-5 w-5" />} label="Orçamento total" value={money(totalBudget)} />
        <StatCard icon={<Flame className="h-5 w-5" />} label="Investido" value={money(totalSpent)} />
      </div>

      {data.length === 0 ? (
        <EmptyState
          title="Nenhuma campanha ainda"
          description="Crie campanhas para acompanhar orçamento e desempenho aqui."
          icon={<Megaphone className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campanha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Consumo do orçamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((c) => {
                    const pct = c.budget > 0 ? Math.min(100, Math.round((c.spent / c.budget) * 100)) : 0
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium text-[var(--text-primary)]">{c.name}</TableCell>
                        <TableCell className="text-[var(--text-secondary)]">{c.type}</TableCell>
                        <TableCell><Badge variant="outline">{c.status}</Badge></TableCell>
                        <TableCell className="min-w-[180px]">
                          <div className="flex items-center gap-3">
                            <Progress value={pct} className="h-2 flex-1" />
                            <span className="text-xs text-[var(--text-secondary)] w-28 text-right">
                              {money(c.spent)} / {money(c.budget)}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
