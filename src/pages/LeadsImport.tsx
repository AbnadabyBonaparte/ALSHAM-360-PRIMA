// src/pages/LeadsImport.tsx
// ALSHAM 360° PRIMA — Importação de Leads (CSV -> leads_crm, multi-tenant)
import React, { useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Upload, FileText, CheckCircle2, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/supabase/useAuthStore'
import { useToast } from '@/hooks/use-toast'
import { PageHeader, EmptyState } from '@/components/PageStates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface ParsedLead {
  name: string
  email: string | null
  phone: string | null
  company: string | null
  position: string | null
  source: string | null
}

// Parser CSV mínimo, tolerante a aspas e vírgulas dentro de campos.
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let field = ''
  let row: string[] = []
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ } else { inQuotes = false }
      } else {
        field += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field); field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.some((c) => c.trim() !== '')) rows.push(row)
      row = []
    } else {
      field += char
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field)
    if (row.some((c) => c.trim() !== '')) rows.push(row)
  }
  return rows
}

const HEADER_MAP: Record<string, keyof ParsedLead> = {
  nome: 'name', name: 'name',
  email: 'email', 'e-mail': 'email',
  telefone: 'phone', phone: 'phone', celular: 'phone',
  empresa: 'company', company: 'company',
  cargo: 'position', position: 'position',
  origem: 'source', source: 'source', fonte: 'source',
}

function mapRows(rows: string[][]): ParsedLead[] {
  if (rows.length < 2) return []
  const header = rows[0].map((h) => h.trim().toLowerCase())
  const idx: Partial<Record<keyof ParsedLead, number>> = {}
  header.forEach((h, i) => {
    const key = HEADER_MAP[h]
    if (key) idx[key] = i
  })
  const pick = (row: string[], key: keyof ParsedLead) => {
    const i = idx[key]
    if (i == null) return null
    const v = (row[i] ?? '').trim()
    return v === '' ? null : v
  }
  return rows.slice(1)
    .map((row) => ({
      name: pick(row, 'name') ?? '',
      email: pick(row, 'email'),
      phone: pick(row, 'phone'),
      company: pick(row, 'company'),
      position: pick(row, 'position'),
      source: pick(row, 'source'),
    }))
    .filter((l) => l.name.trim() !== '')
}

export default function LeadsImport() {
  const orgId = useAuthStore((s) => s.currentOrgId)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)

  const [fileName, setFileName] = useState<string | null>(null)
  const [parsed, setParsed] = useState<ParsedLead[]>([])
  const [importing, setImporting] = useState(false)
  const [imported, setImported] = useState(0)

  const preview = useMemo(() => parsed.slice(0, 20), [parsed])

  const handleFile = async (file: File) => {
    try {
      const text = await file.text()
      const leads = mapRows(parseCsv(text))
      setFileName(file.name)
      setParsed(leads)
      setImported(0)
      if (leads.length === 0) {
        toast({
          title: 'Nenhum lead reconhecido',
          description: 'Verifique se o CSV tem cabeçalho com uma coluna "nome" ou "name".',
        })
      }
    } catch {
      toast({ title: 'Falha ao ler arquivo', description: 'Não foi possível processar o CSV selecionado.' })
    }
  }

  const reset = () => {
    setFileName(null)
    setParsed([])
    setImported(0)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleImport = async () => {
    if (!orgId) {
      toast({ title: 'Organização não selecionada', description: 'Selecione uma organização antes de importar.' })
      return
    }
    if (parsed.length === 0) return
    setImporting(true)
    try {
      const payload = parsed.map((l) => ({
        org_id: orgId,
        name: l.name,
        email: l.email,
        phone: l.phone,
        company: l.company,
        position: l.position,
        source: l.source,
      }))
      const { error: insertError } = await supabase.from('leads_crm').insert(payload)
      if (insertError) throw insertError
      setImported(parsed.length)
      await queryClient.invalidateQueries({ queryKey: ['org-data', 'leads_crm'] })
      toast({ title: 'Importação concluída', description: `${parsed.length} lead(s) importado(s) com sucesso.` })
    } catch (err) {
      toast({
        title: 'Não foi possível importar',
        description: err instanceof Error ? err.message : 'Erro inesperado durante a importação.',
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Importação de Leads" description="Envie um arquivo CSV para adicionar leads em massa" />

      <Card className="bg-[var(--surface)] border-[var(--border)]">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-strong)] p-10 text-center">
            <div className="grid h-14 w-14 place-content-center rounded-full bg-[var(--surface)] text-[var(--accent-1)]">
              <Upload className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {fileName ? fileName : 'Selecione um arquivo CSV'}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Colunas aceitas: nome, email, telefone, empresa, cargo, origem
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => inputRef.current?.click()} className="gap-2">
                <FileText className="h-4 w-4" /> Escolher arquivo
              </Button>
              {parsed.length > 0 && (
                <Button variant="ghost" onClick={reset} className="gap-2">
                  <Trash2 className="h-4 w-4" /> Limpar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {parsed.length === 0 ? (
        <EmptyState
          title="Nenhum lead carregado"
          description="Após escolher um CSV válido, os leads reconhecidos aparecerão aqui para conferência antes da importação."
          icon={<Upload className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base text-[var(--text-primary)]">
              Pré-visualização
              <Badge variant="secondary">{parsed.length} lead(s)</Badge>
              {imported > 0 && (
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" /> {imported} importado(s)
                </Badge>
              )}
            </CardTitle>
            <Button onClick={handleImport} disabled={importing || imported > 0} className="gap-2">
              <Upload className="h-4 w-4" />
              {importing ? 'Importando...' : `Importar ${parsed.length}`}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Origem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.map((l, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-[var(--text-primary)]">{l.name}</TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{l.email ?? '—'}</TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{l.phone ?? '—'}</TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{l.company ?? '—'}</TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{l.position ?? '—'}</TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{l.source ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {parsed.length > preview.length && (
                <p className="pt-3 text-center text-xs text-[var(--text-secondary)]">
                  Mostrando {preview.length} de {parsed.length} leads.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
