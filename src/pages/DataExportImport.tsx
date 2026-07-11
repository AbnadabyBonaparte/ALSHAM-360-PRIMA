// src/pages/DataExportImport.tsx
// ALSHAM 360° PRIMA — Data Export/Import (exportação real de dados org-scoped para CSV, multi-tenant)
import React, { useMemo, useState } from 'react'
import { Download, Database, Users, Briefcase, Building2, UserSquare2 } from 'lucide-react'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type Row = Record<string, unknown>

interface Dataset {
  key: string
  label: string
  icon: React.ReactNode
  columns: string[]
  rows: Row[]
}

function toCsvValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value)
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

function buildCsv(columns: string[], rows: Row[]): string {
  const header = columns.join(',')
  const body = rows.map((r) => columns.map((c) => toCsvValue(r[c])).join(',')).join('\n')
  return `${header}\n${body}`
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function DataExportImport() {
  const leads = useOrgData<Row>('leads_crm', { columns: 'id, name, email, phone, company, status, stage, score, source, created_at', limit: 10000 })
  const contacts = useOrgData<Row>('contacts', { columns: 'id, name, email, phone, position, relationship_status, created_at', limit: 10000 })
  const opps = useOrgData<Row>('opportunities', { columns: 'id, title, value, currency, stage, probability, expected_close_date, created_at', limit: 10000 })
  const accounts = useOrgData<Row>('accounts', { columns: 'id, name, domain, industry, size, status, created_at', limit: 10000 })

  const [exported, setExported] = useState<string | null>(null)

  const datasets = useMemo<Dataset[]>(() => [
    {
      key: 'leads_crm',
      label: 'Leads',
      icon: <Users className="h-5 w-5" />,
      columns: ['id', 'name', 'email', 'phone', 'company', 'status', 'stage', 'score', 'source', 'created_at'],
      rows: leads.data ?? [],
    },
    {
      key: 'contacts',
      label: 'Contatos',
      icon: <UserSquare2 className="h-5 w-5" />,
      columns: ['id', 'name', 'email', 'phone', 'position', 'relationship_status', 'created_at'],
      rows: contacts.data ?? [],
    },
    {
      key: 'opportunities',
      label: 'Oportunidades',
      icon: <Briefcase className="h-5 w-5" />,
      columns: ['id', 'title', 'value', 'currency', 'stage', 'probability', 'expected_close_date', 'created_at'],
      rows: opps.data ?? [],
    },
    {
      key: 'accounts',
      label: 'Contas',
      icon: <Building2 className="h-5 w-5" />,
      columns: ['id', 'name', 'domain', 'industry', 'size', 'status', 'created_at'],
      rows: accounts.data ?? [],
    },
  ], [leads.data, contacts.data, opps.data, accounts.data])

  const isLoading = leads.isLoading || contacts.isLoading || opps.isLoading || accounts.isLoading
  const error = leads.error || contacts.error || opps.error || accounts.error

  if (isLoading) return <PageSkeleton />
  if (error) {
    return (
      <ErrorState
        message={(error as Error).message}
        onRetry={() => { leads.refetch(); contacts.refetch(); opps.refetch(); accounts.refetch() }}
      />
    )
  }

  const totalRecords = datasets.reduce((s, d) => s + d.rows.length, 0)

  const handleExport = (d: Dataset) => {
    const csv = buildCsv(d.columns, d.rows)
    const stamp = new Date().toISOString().slice(0, 10)
    downloadCsv(`${d.key}_${stamp}.csv`, csv)
    setExported(d.label)
  }

  return (
    <div className="p-1 space-y-6">
      <PageHeader
        title="Data Export/Import"
        description="Exporte os dados reais da sua organização em CSV (UTF-8). Cada exportação respeita o isolamento por organização."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="grid h-11 w-11 place-content-center rounded-xl bg-[var(--surface-strong)] text-[var(--accent-1)]"><Database className="h-5 w-5" /></div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">Registros exportáveis</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{totalRecords.toLocaleString('pt-BR')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="grid h-11 w-11 place-content-center rounded-xl bg-[var(--surface-strong)] text-[var(--accent-1)]"><Download className="h-5 w-5" /></div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">Última exportação</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{exported ?? '—'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {totalRecords === 0 ? (
        <EmptyState
          title="Nada para exportar ainda"
          description="Assim que houver leads, contatos, oportunidades ou contas na organização, você poderá exportá-los aqui."
          icon={<Database className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {datasets.map((d) => (
            <Card key={d.key} className="bg-[var(--surface)] border-[var(--border)]">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-[var(--text-primary)] text-base">
                  <span className="text-[var(--accent-1)]">{d.icon}</span>
                  {d.label}
                </CardTitle>
                <Badge variant="secondary">{d.rows.length.toLocaleString('pt-BR')} registro(s)</Badge>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4">
                <p className="text-sm text-[var(--text-secondary)]">
                  {d.columns.length} colunas • formato CSV
                </p>
                <Button
                  variant="outline"
                  className="gap-2"
                  disabled={d.rows.length === 0}
                  onClick={() => handleExport(d)}
                >
                  <Download className="h-4 w-4" />
                  Exportar CSV
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
