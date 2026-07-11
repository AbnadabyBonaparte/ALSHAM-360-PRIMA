// src/pages/KnowledgeBaseList.tsx
// ALSHAM 360° PRIMA — Base de Conhecimento (artigos reais, multi-tenant)
import React, { useMemo, useState } from 'react'
import { BookOpen, Eye, FileText, CheckCircle2 } from 'lucide-react'
import { useOrgData } from '@/hooks/useOrgData'
import { PageSkeleton, ErrorState, EmptyState, PageHeader } from '@/components/PageStates'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface Article {
  id: string
  title: string
  category: string | null
  status: string
  views: number
  updated_at: string
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

export default function KnowledgeBaseList() {
  const { data = [], isLoading, error, refetch } = useOrgData<Article>('kb_articles', {
    orderBy: { column: 'updated_at', ascending: false },
    limit: 2000,
  })
  const [q, setQ] = useState('')

  const published = useMemo(() => data.filter((a) => a.status === 'published').length, [data])
  const totalViews = useMemo(() => data.reduce((s, a) => s + (a.views ?? 0), 0), [data])
  const categories = useMemo(() => new Set(data.map((a) => a.category ?? 'Sem categoria')).size, [data])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return data
    return data.filter(
      (a) => a.title.toLowerCase().includes(term) || (a.category ?? '').toLowerCase().includes(term),
    )
  }, [data, q])

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />

  return (
    <div className="p-1 space-y-6">
      <PageHeader title="Base de Conhecimento" description="Artigos e documentação de suporte da organização" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<FileText className="h-5 w-5" />} label="Artigos" value={data.length} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Publicados" value={published} />
        <StatCard icon={<BookOpen className="h-5 w-5" />} label="Categorias" value={categories} />
        <StatCard icon={<Eye className="h-5 w-5" />} label="Visualizações" value={totalViews.toLocaleString('pt-BR')} />
      </div>

      {data.length === 0 ? (
        <EmptyState
          title="Nenhum artigo publicado"
          description="Crie artigos na base de conhecimento para que sua equipe e clientes encontrem respostas aqui."
          icon={<BookOpen className="h-7 w-7 text-[var(--text-secondary)]" />}
        />
      ) : (
        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardContent className="p-4 space-y-4">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por título ou categoria..."
              className="max-w-sm bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text-primary)]"
            />
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead>Atualizado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium text-[var(--text-primary)]">{a.title}</TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{a.category ?? '—'}</TableCell>
                      <TableCell><Badge variant="outline">{a.status}</Badge></TableCell>
                      <TableCell className="text-right text-[var(--text-secondary)]">{(a.views ?? 0).toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{new Date(a.updated_at).toLocaleDateString('pt-BR')}</TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-[var(--text-secondary)]">
                        Nenhum artigo corresponde à busca.
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
