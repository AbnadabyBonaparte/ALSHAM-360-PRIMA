// src/pages/OpportunitiesList.tsx
// ALSHAM 360° PRIMA — Oportunidades (lista real, multi-tenant)
import React, { useMemo } from 'react'
import { Briefcase, DollarSign, Target } from 'lucide-react'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface Opportunity {
  id: string
  title: string
  value: number
  currency: string
  stage: string
  probability: number
  expected_close_date: string | null
  created_at: string
}

const money = (v: number, c = 'BRL') =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: c, maximumFractionDigits: 0 })

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

export default function OpportunitiesList() {
  const { data = [], isLoading, error, refetch } = useOrgData<Opportunity>('opportunities', {
    orderBy: { column: 'created_at', ascending: false },
    limit: 200,
  })

  const pipelineValue = useMemo(() => data.reduce((s, o) => s + (o.value ?? 0), 0), [data])
  const weighted = useMemo(
    () => data.reduce((s, o) => s + (o.value ?? 0) * ((o.probability ?? 0) / 100), 0),
    [data],
  )

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Oportunidades" description="Negócios em andamento no seu pipeline" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Briefcase className="h-5 w-5" />} label="Oportunidades" value={data.length} />
        <StatCard icon={<DollarSign className="h-5 w-5" />} label="Valor total" value={money(pipelineValue)} />
        <StatCard icon={<Target className="h-5 w-5" />} label="Valor ponderado" value={money(weighted)} />
      </div>

      {data.length === 0 ? (
        <EmptyState
          title="Nenhuma oportunidade ainda"
          description="Converta leads em oportunidades e acompanhe-as por aqui."
          icon={<Briefcase className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Oportunidade</TableHead>
                    <TableHead>Estágio</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Probabilidade</TableHead>
                    <TableHead>Fechamento previsto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium text-[var(--text-primary)]">{o.title}</TableCell>
                      <TableCell><Badge variant="outline">{o.stage}</Badge></TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{money(o.value, o.currency)}</TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{o.probability}%</TableCell>
                      <TableCell className="text-[var(--text-secondary)]">
                        {o.expected_close_date ? new Date(o.expected_close_date).toLocaleDateString('pt-BR') : '—'}
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
