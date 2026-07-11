// src/pages/DataPrivacy.tsx
// ALSHAM 360° PRIMA — Privacidade de Dados (consentimento LGPD real dos leads, multi-tenant)
import React, { useMemo, useState } from 'react'
import { ShieldCheck, ShieldAlert, Percent, Search } from 'lucide-react'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
} from 'recharts'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface Lead {
  id: string
  name: string
  email: string | null
  consent: boolean
  consent_at: string | null
  canal_captura: string | null
  origem_captura: string | null
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

export default function DataPrivacy() {
  const { data = [], isLoading, error, refetch } = useOrgData<Lead>('leads_crm', {
    columns: 'id, name, email, consent, consent_at, canal_captura, origem_captura',
    orderBy: { column: 'created_at', ascending: false },
    limit: 5000,
  })
  const [search, setSearch] = useState('')

  const withConsent = useMemo(() => data.filter((l) => l.consent === true).length, [data])
  const withoutConsent = data.length - withConsent
  const consentRate = data.length ? Math.round((withConsent / data.length) * 100) : 0

  const chartData = useMemo(
    () => [
      { name: 'Com consentimento', value: withConsent },
      { name: 'Sem consentimento', value: withoutConsent },
    ],
    [withConsent, withoutConsent],
  )

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return data
    return data.filter((l) =>
      [l.name, l.email, l.canal_captura, l.origem_captura].some((v) => v?.toLowerCase().includes(term)),
    )
  }, [data, search])

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />

  const tooltipStyle = {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text-primary)',
  }

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Privacidade de Dados" description="Rastreamento de consentimento (LGPD) e origem de captura dos leads da organização" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<ShieldCheck className="h-5 w-5" />} label="Com consentimento" value={withConsent} />
        <StatCard icon={<ShieldAlert className="h-5 w-5" />} label="Sem consentimento" value={withoutConsent} />
        <StatCard icon={<Percent className="h-5 w-5" />} label="Taxa de consentimento" value={`${consentRate}%`} />
        <StatCard icon={<ShieldCheck className="h-5 w-5" />} label="Leads totais" value={data.length} />
      </div>

      {data.length === 0 ? (
        <EmptyState
          title="Nenhum lead para auditar"
          description="Quando houver leads registrados, o status de consentimento e a origem de captura aparecerão aqui."
          icon={<ShieldCheck className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <>
          <Card className="bg-[var(--surface)] border-[var(--border)]">
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)] text-base">Distribuição de consentimento</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={90} label>
                    <Cell fill="var(--accent-1)" />
                    <Cell fill="var(--accent-alert)" />
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-[var(--surface)] border-[var(--border)]">
            <CardContent className="p-4 space-y-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome, e-mail ou origem..."
                  className="pl-9 bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text-primary)]"
                />
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead</TableHead>
                      <TableHead>Consentimento</TableHead>
                      <TableHead>Data do consentimento</TableHead>
                      <TableHead>Canal</TableHead>
                      <TableHead>Origem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="font-medium text-[var(--text-primary)]">{l.name}</TableCell>
                        <TableCell>
                          {l.consent ? (
                            <Badge variant="outline" className="text-[var(--accent-1)]">Concedido</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[var(--accent-alert)]">Pendente</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-[var(--text-secondary)]">
                          {l.consent_at ? new Date(l.consent_at).toLocaleDateString('pt-BR') : '—'}
                        </TableCell>
                        <TableCell className="text-[var(--text-secondary)]">{l.canal_captura ?? '—'}</TableCell>
                        <TableCell className="text-[var(--text-secondary)]">{l.origem_captura ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-[var(--text-secondary)]">
                          Nenhum lead corresponde à busca.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
