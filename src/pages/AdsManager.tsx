// src/pages/AdsManager.tsx
// ALSHAM 360° PRIMA — Ads Manager
// CANÔNICO • TOKEN-FIRST • MULTI-TENANT READY • SAFE-UI (sem Sidebar/Layout aqui)
// Importante: NÃO renderiza LayoutSupremo aqui. O shell é responsabilidade do ProtectedLayout.
// ✅ MIGRADO PARA SHADCN/UI + CSS VARIABLES

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  BadgeCheck,
  CircleDollarSign,
  Filter,
  Loader2,
  MousePointerClick,
  RefreshCw,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'

type AdStatus = 'ativo' | 'pausado' | 'encerrado'

interface Ad {
  id: string
  nome: string
  plataforma: string
  status: AdStatus
  orcamento_diario: number
  gasto_total: number
  impressoes: number
  cliques: number
  conversoes: number
  cpc: number
  cpa: number
  roas: number
}

interface AdsMetrics {
  gastoTotal: number
  receitaGerada: number
  roasGeral: number
  totalAds: number
  adsAtivos: number
  cpcMedio: number
  cpaMedio: number
  ads: Ad[]
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function formatCurrencyBRL(v: number) {
  if (!Number.isFinite(v)) return '—'
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatNumberBR(v: number) {
  if (!Number.isFinite(v)) return '—'
  return v.toLocaleString('pt-BR')
}

function formatRatioX(v: number) {
  if (!Number.isFinite(v)) return '—'
  return `${v.toFixed(2)}x`
}

function formatPct(v: number) {
  if (!Number.isFinite(v)) return '—'
  return `${(v * 100).toFixed(1)}%`
}

function toneForRoas(roas: number) {
  if (!Number.isFinite(roas)) return 'var(--text-secondary)'
  if (roas >= 2) return 'var(--accent-emerald)'
  if (roas >= 1) return 'var(--accent-warning)'
  return 'var(--accent-alert)'
}

function statusMeta(status: AdStatus) {
  switch (status) {
    case 'ativo':
      return { label: 'Ativo', color: 'var(--accent-emerald)' }
    case 'pausado':
      return { label: 'Pausado', color: 'var(--accent-warning)' }
    case 'encerrado':
    default:
      return { label: 'Encerrado', color: 'var(--text-secondary)' }
  }
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  label: string
  value: string
  hint?: string
  accent?: string
}) {
  return (
    <Card className="bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)]">
      <CardContent className="flex items-center gap-4 p-4">
        <div className="rounded-2xl p-3 bg-gradient-to-br from-[var(--accent-1)]/20 to-[var(--accent-2)]/20 border border-[var(--border)]">
          <Icon className="h-6 w-6" style={{ color: accent ?? 'var(--accent-1)' }} />
        </div>

        <div className="min-w-0">
          <p className="text-xs text-[var(--text-secondary)]">
            {label}
          </p>
          <p className="truncate text-xl font-black text-[var(--text-primary)]">
            {value}
          </p>
          {hint ? (
            <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
              {hint}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

function Pill({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <Badge variant="outline" className="inline-flex items-center gap-2 rounded-full border-[var(--border)] bg-[var(--surface)]/60 px-3 py-2">
      <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
        {label}
      </span>
      <span className="text-[11px] font-black text-[var(--text-primary)]">
        {value}
      </span>
    </Badge>
  )
}

function ProgressBar({ value, tone }: { value: number; tone: string }) {
  const pct = clamp(value, 0, 100)
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface)]">
      <div
        className="h-full rounded-full"
        style={{
          width: `${Math.max(2, Math.round(pct))}%`,
          background: `linear-gradient(90deg, ${tone}, color-mix(in oklab, ${tone} 60%, white))`,
        }}
      />
    </div>
  )
}

export default function AdsManager() {
  const [metrics, setMetrics] = useState<AdsMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // UI state (client-only)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<AdStatus | 'todos'>('todos')
  const [platformFilter, setPlatformFilter] = useState<string>('todas')
  const [sortBy, setSortBy] = useState<'roas' | 'gasto' | 'conversoes' | 'cliques'>('roas')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const fetchAds = useCallback(async () => {
    const { data, error } = await supabase.from('ads_campaigns').select('*').order('id', { ascending: false })
    if (error) throw error
    return data ?? []
  }, [])

  const computeMetrics = useCallback((adsRaw: any[]): AdsMetrics => {
    const gastoTotal = adsRaw.reduce((s, a) => s + (Number(a.gasto_total) || 0), 0)
    const totalCliques = adsRaw.reduce((s, a) => s + (Number(a.cliques) || 0), 0)
    const totalConversoes = adsRaw.reduce((s, a) => s + (Number(a.conversoes) || 0), 0)

    // Valor por conversão: usa campo se existir, senão fallback conservador
    const receitaGerada = adsRaw.reduce((s, a) => {
      const conv = Number(a.conversoes) || 0
      const valor = Number(a.valor_conversao)
      const perConv = Number.isFinite(valor) && valor > 0 ? valor : 100
      return s + conv * perConv
    }, 0)

    const ads: Ad[] = adsRaw.map(a => {
      const gasto = Number(a.gasto_total) || 0
      const cliques = Number(a.cliques) || 0
      const conv = Number(a.conversoes) || 0
      const valor = Number(a.valor_conversao)
      const perConv = Number.isFinite(valor) && valor > 0 ? valor : 100
      const receita = conv * perConv

      return {
        id: String(a.id),
        nome: String(a.nome || 'Campanha'),
        plataforma: String(a.plataforma || 'unknown'),
        status: (a.status as AdStatus) || 'pausado',
        orcamento_diario: Number(a.orcamento_diario) || 0,
        gasto_total: gasto,
        impressoes: Number(a.impressoes) || 0,
        cliques,
        conversoes: conv,
        cpc: cliques > 0 ? gasto / cliques : 0,
        cpa: conv > 0 ? gasto / conv : 0,
        roas: gasto > 0 ? receita / gasto : 0,
      }
    })

    return {
      gastoTotal,
      receitaGerada,
      roasGeral: gastoTotal > 0 ? receitaGerada / gastoTotal : 0,
      totalAds: ads.length,
      adsAtivos: ads.filter(a => a.status === 'ativo').length,
      cpcMedio: totalCliques > 0 ? gastoTotal / totalCliques : 0,
      cpaMedio: totalConversoes > 0 ? gastoTotal / totalConversoes : 0,
      ads,
    }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const adsRaw = await fetchAds()
      setMetrics(computeMetrics(adsRaw))
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('AdsManager load error:', err)
      toast.error('Não foi possível carregar as campanhas.')
      setMetrics({
        gastoTotal: 0,
        receitaGerada: 0,
        roasGeral: 0,
        totalAds: 0,
        adsAtivos: 0,
        cpcMedio: 0,
        cpaMedio: 0,
        ads: [],
      })
    } finally {
      setLoading(false)
    }
  }, [computeMetrics, fetchAds])

  useEffect(() => {
    void load()
  }, [load])

  const refreshNow = useCallback(async () => {
    setRefreshing(true)
    try {
      await load()
      toast.success('Atualizado.')
    } finally {
      setRefreshing(false)
    }
  }, [load])

  const platforms = useMemo(() => {
    const set = new Set<string>()
    ;(metrics?.ads ?? []).forEach(a => set.add(a.plataforma))
    const arr = Array.from(set).sort((a, b) => a.localeCompare(b))
    return ['todas', ...arr]
  }, [metrics?.ads])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = (metrics?.ads ?? []).filter(a => {
      const okQuery = !q || a.nome.toLowerCase().includes(q) || a.plataforma.toLowerCase().includes(q)
      const okStatus = statusFilter === 'todos' || a.status === statusFilter
      const okPlat = platformFilter === 'todas' || a.plataforma === platformFilter
      return okQuery && okStatus && okPlat
    })

    const dir = sortDir === 'asc' ? 1 : -1
    const sorted = [...base].sort((a, b) => {
      const va =
        sortBy === 'roas' ? a.roas :
        sortBy === 'gasto' ? a.gasto_total :
        sortBy === 'conversoes' ? a.conversoes :
        a.cliques
      const vb =
        sortBy === 'roas' ? b.roas :
        sortBy === 'gasto' ? b.gasto_total :
        sortBy === 'conversoes' ? b.conversoes :
        b.cliques
      return (va - vb) * dir
    })

    return sorted
  }, [metrics?.ads, platformFilter, query, sortBy, sortDir, statusFilter])

  const empty = !loading && (metrics?.ads?.length ?? 0) === 0

  return (
    <div className="relative w-full min-h-screen bg-[var(--background)]">
      {/* Background interno token-first (somente no content area) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[32px]"
        style={{
          background:
            'radial-gradient(1200px 760px at 14% 10%, color-mix(in oklab, var(--accent-1) 12%, transparent) 0%, transparent 60%),' +
            'radial-gradient(1100px 720px at 86% 8%, color-mix(in oklab, var(--accent-2) 10%, transparent) 0%, transparent 55%),' +
            'linear-gradient(135deg, color-mix(in oklab, var(--background) 92%, black) 0%, var(--background) 55%, color-mix(in oklab, var(--background) 88%, black) 100%)',
          opacity: 0.9,
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 py-6 md:px-8 md:py-8">
        {/* Header */}
        <Card className="mb-6 bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)]">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <h1 className="truncate text-2xl md:text-4xl font-black bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] bg-clip-text text-transparent">
                  Ads Manager
                </h1>
                <p className="mt-2 text-sm md:text-base text-[var(--text-secondary)]">
                  Acompanhe investimento, eficiência e retorno por campanha. Dados carregados via Supabase.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Pill label="Campanhas" value={String(metrics?.totalAds ?? '—')} />
                <Pill label="Ativas" value={String(metrics?.adsAtivos ?? '—')} />
                <Button
                  variant="outline"
                  onClick={refreshNow}
                  disabled={loading || refreshing}
                  className="inline-flex items-center gap-2 rounded-xl border-[var(--border)] bg-[var(--surface)]/60 px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface)]"
                  aria-label="Atualizar dados"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </div>

            {/* KPI row */}
            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-4">
              <StatCard
                icon={Wallet}
                label="Investimento total"
                value={formatCurrencyBRL(metrics?.gastoTotal ?? 0)}
                hint="soma das campanhas"
                accent="var(--accent-alert)"
              />
              <StatCard
                icon={CircleDollarSign}
                label="Receita estimada"
                value={formatCurrencyBRL(metrics?.receitaGerada ?? 0)}
                hint="baseada em conversões"
                accent="var(--accent-emerald)"
              />
              <StatCard
                icon={TrendingUp}
                label="ROAS geral"
                value={formatRatioX(metrics?.roasGeral ?? 0)}
                hint="receita / investimento"
                accent={toneForRoas(metrics?.roasGeral ?? 0)}
              />
              <StatCard
                icon={MousePointerClick}
                label="CPC / CPA médios"
                value={`${formatCurrencyBRL(metrics?.cpcMedio ?? 0)} • ${formatCurrencyBRL(metrics?.cpaMedio ?? 0)}`}
                hint="indicadores médios"
              />
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card className="mb-6 bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)]">
          <CardContent className="p-5 md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 items-center gap-3">
                <div className="flex w-full items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 px-3 py-2">
                  <Search className="h-4 w-4 text-[var(--text-secondary)]" />
                  <Input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Buscar por nome ou plataforma…"
                    className="w-full bg-transparent text-sm outline-none border-none text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                    aria-label="Buscar campanhas"
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery('')
                    setStatusFilter('todos')
                    setPlatformFilter('todas')
                    setSortBy('roas')
                    setSortDir('desc')
                    toast.success('Filtros redefinidos.')
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl border-[var(--border)] bg-[var(--surface)]/60 px-3 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface)]"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Reset
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-[var(--text-secondary)]" />
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                    <SelectTrigger className="rounded-xl border-[var(--border)] bg-[var(--surface)]/60 text-[var(--text-primary)] w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--surface)] border-[var(--border)]">
                      <SelectItem value="todos">Status: todos</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="pausado">Pausado</SelectItem>
                      <SelectItem value="encerrado">Encerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                  <SelectTrigger className="rounded-xl border-[var(--border)] bg-[var(--surface)]/60 text-[var(--text-primary)] w-[160px]">
                    <SelectValue placeholder="Plataforma" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--surface)] border-[var(--border)]">
                    {platforms.map(p => (
                      <SelectItem key={p} value={p}>
                        Plataforma: {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                    <SelectTrigger className="rounded-xl border-[var(--border)] bg-[var(--surface)]/60 text-[var(--text-primary)] w-[150px]">
                      <SelectValue placeholder="Ordenar" />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--surface)] border-[var(--border)]">
                      <SelectItem value="roas">Ordenar: ROAS</SelectItem>
                      <SelectItem value="gasto">Ordenar: Gasto</SelectItem>
                      <SelectItem value="conversoes">Ordenar: Conversões</SelectItem>
                      <SelectItem value="cliques">Ordenar: Cliques</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={() => setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))}
                    className="inline-flex items-center gap-2 rounded-xl border-[var(--border)] bg-[var(--surface)]/60 px-3 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface)]"
                    aria-label="Alternar direção de ordenação"
                  >
                    <TrendingUp className={`h-4 w-4 ${sortDir === 'asc' ? 'rotate-180' : ''}`} />
                    {sortDir === 'asc' ? 'Asc' : 'Desc'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Body */}
        <div className="grid grid-cols-1 gap-6">
          {/* Table */}
          <Card className="overflow-hidden bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)]">
            <CardHeader className="border-b border-[var(--border)] p-5 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-[var(--accent-1)]" />
                  <div>
                    <CardTitle className="text-base md:text-lg font-black text-[var(--text-primary)]">
                      Campanhas
                    </CardTitle>
                    <CardDescription className="text-xs text-[var(--text-secondary)]">
                      Indicadores por campanha. Ajuste filtros para análise.
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Pill label="Mostrando" value={String(filtered.length)} />
                  <Pill label="Fonte" value="Supabase" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center gap-3 p-10">
                  <Loader2 className="h-5 w-5 animate-spin text-[var(--accent-1)]" />
                  <p className="text-sm text-[var(--text-secondary)]">
                    Carregando campanhas…
                  </p>
                </div>
              ) : empty ? (
                <div className="p-10 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60">
                    <Sparkles className="h-6 w-6 text-[var(--text-secondary)]" />
                  </div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    Nenhuma campanha encontrada.
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    Crie registros em <span className="font-semibold">ads_campaigns</span> para visualizar métricas aqui.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="min-w-[980px] w-full">
                    <TableHeader>
                      <TableRow className="border-b border-[var(--border)]">
                        <TableHead className="text-left text-xs font-semibold text-[var(--text-secondary)]">Campanha</TableHead>
                        <TableHead className="text-right text-xs font-semibold text-[var(--text-secondary)]">Plataforma</TableHead>
                        <TableHead className="text-right text-xs font-semibold text-[var(--text-secondary)]">Status</TableHead>
                        <TableHead className="text-right text-xs font-semibold text-[var(--text-secondary)]">Gasto</TableHead>
                        <TableHead className="text-right text-xs font-semibold text-[var(--text-secondary)]">Impressões</TableHead>
                        <TableHead className="text-right text-xs font-semibold text-[var(--text-secondary)]">Cliques</TableHead>
                        <TableHead className="text-right text-xs font-semibold text-[var(--text-secondary)]">Conversões</TableHead>
                        <TableHead className="text-right text-xs font-semibold text-[var(--text-secondary)]">CPC</TableHead>
                        <TableHead className="text-right text-xs font-semibold text-[var(--text-secondary)]">CPA</TableHead>
                        <TableHead className="text-right text-xs font-semibold text-[var(--text-secondary)]">ROAS</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      <AnimatePresence initial={false}>
                        {filtered.map((ad, idx) => {
                          const st = statusMeta(ad.status)
                          const roasTone = toneForRoas(ad.roas)

                          // Score simples (0–100) para orientar leitura rápida
                          const roasScore = clamp(ad.roas * 40, 0, 100)
                          const clickScore = clamp(ad.cliques > 0 ? Math.log10(ad.cliques + 1) * 25 : 0, 0, 100)
                          const convScore = clamp(ad.conversoes > 0 ? Math.log10(ad.conversoes + 1) * 40 : 0, 0, 100)
                          const score = Math.round(clamp((roasScore * 0.55) + (convScore * 0.3) + (clickScore * 0.15), 0, 100))

                          return (
                            <motion.tr
                              key={ad.id}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 6 }}
                              transition={{ duration: 0.18, delay: Math.min(0.25, idx * 0.015) }}
                              className="border-b border-[var(--border)] transition-colors hover:bg-[var(--surface)]/40"
                            >
                              <TableCell className="py-4 px-4 text-left">
                                <div className="flex items-center gap-3">
                                  <span
                                    aria-hidden="true"
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{ background: st.color, boxShadow: `0 0 0 6px color-mix(in oklab, ${st.color} 15%, transparent)` }}
                                  />
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                                      {ad.nome}
                                    </p>
                                    <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
                                      Orçamento/dia: {formatCurrencyBRL(ad.orcamento_diario)}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>

                              <TableCell className="py-4 px-4 text-right">
                                <span className="text-xs font-semibold text-[var(--text-secondary)]">
                                  {ad.plataforma}
                                </span>
                              </TableCell>

                              <TableCell className="py-4 px-4 text-right">
                                <Badge
                                  variant="outline"
                                  className="inline-flex items-center justify-end rounded-full px-2.5 py-1 text-[11px] font-semibold"
                                  style={{
                                    borderColor: `color-mix(in oklab, ${st.color} 28%, transparent)`,
                                    background: `color-mix(in oklab, ${st.color} 10%, transparent)`,
                                    color: st.color,
                                  }}
                                >
                                  {st.label}
                                </Badge>
                              </TableCell>

                              <TableCell className="py-4 px-4 text-right text-xs font-semibold text-[var(--accent-alert)]">
                                {formatCurrencyBRL(ad.gasto_total)}
                              </TableCell>

                              <TableCell className="py-4 px-4 text-right text-xs text-[var(--text-secondary)]">
                                {formatNumberBR(ad.impressoes)}
                              </TableCell>

                              <TableCell className="py-4 px-4 text-right text-xs text-[var(--accent-emerald)]">
                                {formatNumberBR(ad.cliques)}
                              </TableCell>

                              <TableCell className="py-4 px-4 text-right text-xs text-[var(--accent-emerald)]">
                                {formatNumberBR(ad.conversoes)}
                              </TableCell>

                              <TableCell className="py-4 px-4 text-right text-xs text-[var(--text-secondary)]">
                                {formatCurrencyBRL(ad.cpc)}
                              </TableCell>

                              <TableCell className="py-4 px-4 text-right text-xs text-[var(--text-secondary)]">
                                {formatCurrencyBRL(ad.cpa)}
                              </TableCell>

                              <TableCell className="py-4 px-4 text-right">
                                <div className="flex flex-col items-end gap-2">
                                  <span className="text-xs font-black" style={{ color: roasTone }}>
                                    {formatRatioX(ad.roas)}
                                  </span>
                                  <div className="w-28">
                                    <ProgressBar value={score} tone={roasTone} />
                                  </div>
                                  <span className="text-[10px] font-semibold text-[var(--text-secondary)]">
                                    Score {score}/100
                                  </span>
                                </div>
                              </TableCell>
                            </motion.tr>
                          )
                        })}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Guidance / Notes */}
          <Card className="bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)]">
            <CardContent className="p-5 md:p-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60">
                  <BadgeCheck className="h-5 w-5 text-[var(--accent-emerald)]" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    Leitura recomendada
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-[var(--text-secondary)]">
                    <li>• ROAS ≥ 1,0 indica retorno; ≥ 2,0 indica boa eficiência (contexto por margem).</li>
                    <li>• CPC alto pode ser aceitável se a taxa de conversão e LTV suportarem.</li>
                    <li>• Use filtros para comparar campanhas por plataforma e status, evitando ruído.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
