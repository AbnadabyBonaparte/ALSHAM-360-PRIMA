// src/pages/AccountsList.tsx
// ALSHAM 360° PRIMA — Contas/Empresas (lista real, multi-tenant)
import React, { useMemo, useState } from 'react'
import { Building2, TrendingUp, Layers } from 'lucide-react'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface Account {
  id: string
  name: string
  domain: string | null
  industry: string | null
  size: string | null
  revenue: number | null
  location: string | null
  status: string
  created_at: string
}

const currency = (v: number) =>
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

export default function AccountsList() {
  const { data = [], isLoading, error, refetch } = useOrgData<Account>('accounts', {
    orderBy: { column: 'created_at', ascending: false },
    limit: 200,
  })
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return data
    return data.filter((a) => [a.name, a.industry, a.location].some((v) => v?.toLowerCase().includes(term)))
  }, [data, search])

  const totalRevenue = useMemo(() => data.reduce((s, a) => s + (a.revenue ?? 0), 0), [data])

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Contas / Empresas" description="Organizações e contas do seu portfólio" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Building2 className="h-5 w-5" />} label="Total de contas" value={data.length} />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Receita agregada" value={currency(totalRevenue)} />
        <StatCard icon={<Layers className="h-5 w-5" />} label="Exibidas" value={filtered.length} />
      </div>

      {data.length === 0 ? (
        <EmptyState
          title="Nenhuma conta ainda"
          description="Cadastre empresas/contas e elas aparecerão aqui."
          icon={<Building2 className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardContent className="p-4 space-y-4">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, setor ou localização..."
              className="max-w-sm bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text-primary)]"
            />
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Setor</TableHead>
                    <TableHead>Porte</TableHead>
                    <TableHead>Receita</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium text-[var(--text-primary)]">{a.name}</TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{a.industry ?? '—'}</TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{a.size ?? '—'}</TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{a.revenue != null ? currency(a.revenue) : '—'}</TableCell>
                      <TableCell><Badge variant="outline">{a.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-[var(--text-secondary)] py-8">
                        Nenhuma conta corresponde à busca.
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
