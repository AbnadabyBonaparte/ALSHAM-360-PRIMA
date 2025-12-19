// src/pages/AdsManager.tsx
// ALSHAM 360° PRIMA — Ads Manager
// CANÔNICO • TOKEN-FIRST • MULTI-TENANT READY • SAFE-UI (sem Sidebar/Layout aqui)
// Importante: NÃO renderiza LayoutSupremo aqui. O shell é responsabilidade do ProtectedLayout.

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
import { supabase } from '@/lib/supabase'

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
  if (!Number.isFinite(roas)) return 'color-mix(in oklab, var(--foreground, #fff) 70%, transparent)'
  if (roas >= 2) return 'var(--accent-2, #22c55e)'
  if (roas >= 1) return 'color-mix(in oklab, var(--accent-2, #22c55e) 70%, var(--accent-1, #a855f7))'
  return 'color-mix(in oklab, #ef4444 85%, white)'
}

function statusMeta(status: AdStatus) {
  switch (status) {
    case 'ativo':
      return { label: 'Ativo', dot: 'var(--accent-2, #22c55e)' }
    case 'pausado':
      return { label: 'Pausado', dot: 'var(--accent-1, #a855f7)' }
    case 'encerrado':
    default:
      return { label: 'Encerrado', dot: 'color-mix(in oklab, var(--foreground, #fff) 45%, transparent)' }
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
    <div
      className="flex items-center gap-4 rounded-2xl border p-4"
      style={{
        borderColor: 'color-mix(in oklab, var(--foreground, #fff) 10%, transparent)',
        background: 'color-mix(in oklab, var(--surface, var(--background)) 70%, transparent)',
        backdropFilter: 'blur(18px)',
      }}
    >
      <div
        className="rounded-2xl p-3"
        style={{
          background:
            'linear-gradient(135deg, color-mix(in oklab, var(--accent-1, #a855f7) 16%, transparent), color-mix(in oklab, var(--accent-2, #22c55e) 12%, transparent))',
          border: '1px solid color-mix(in oklab, var(--foreground, #fff) 10%, transparent)',
        }}
      >
        <Icon className="h-6 w-6" style={{ color: accent ?? 'var(--accent-1, #a855f7)' }} />
      </div>

      <div className="min-w-0">
        <p className="text-xs" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 60%, transparent)' }}>
          {label}
        </p>
        <p className="truncate text-xl font-black" style={{ color: 'var(--foreground, var(--text))' }}>
          {value}
        </p>
        {hint ? (
          <p className="mt-1 text-[11px]" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 50%, transparent)' }}>
            {hint}
          </p>
        ) : null}
      </div>
    </div>
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
    <div
      className="inline-flex items-center gap-2 rounded-full border px-3 py-2"
      style={{
        borderColor: 'color-mix(in oklab, var(--foreground, #fff) 12%, transparent)',
        background: 'color-mix(in oklab, var(--background) 55%, transparent)',
      }}
    >
      <span className="text-[11px] font-semibold" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 60%, transparent)' }}>
        {label}
      </span>
      <span className="text-[11px] font-black" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 80%, transparent)' }}>
        {value}
      </span>
    </div>
  )
}

function TableHeadCell({ children, align = 'right' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      className={`py-3 px-4 text-xs font-semibold ${align === 'left' ? 'text-left' : 'text-right'}`}
      style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 55%, transparent)' }}
    >
      {children}
    </th>
  )
}

function ProgressBar({ value, tone }: { value: number; tone: string }) {
  const pct = clamp(value, 0, 100)
  return (
    <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: 'color-mix(in oklab, var(--foreground, #fff) 8%, transparent)' }}>
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
    <div className="relative w-full">
      {/* Background interno token-first (somente no content area) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[32px]"
        style={{
          background:
            'radial-gradient(1200px 760px at 14% 10%, color-mix(in oklab, var(--accent-1, #a855f7) 12%, transparent) 0%, transparent 60%),' +
            'radial-gradient(1100px 720px at 86% 8%, color-mix(in oklab, var(--accent-2, #22c55e) 10%, transparent) 0%, transparent 55%),' +
            'linear-gradient(135deg, color-mix(in oklab, var(--background) 92%, black) 0%, var(--background) 55%, color-mix(in oklab, var(--background) 88%, black) 100%)',
          opacity: 0.9,
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 py-6 md:px-8 md:py-8">
        {/* Header */}
        <div
          className="mb-6 rounded-3xl border p-6 md:p-8"
          style={{
            borderColor: 'color-mix(in oklab, var(--foreground, #fff) 10%, transparent)',
            background: 'color-mix(in oklab, var(--surface, var(--background)) 72%, transparent)',
            backdropFilter: 'blur(18px)',
          }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <h1
                className="truncate text-2xl md:text-4xl font-black"
                style={{
                  backgroundImage: 'linear-gradient(90deg, var(--accent-1, #a855f7), var(--accent-2, #22c55e))',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Ads Manager
              </h1>
              <p className="mt-2 text-sm md:text-base" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 65%, transparent)' }}>
                Acompanhe investimento, eficiência e retorno por campanha. Dados carregados via Supabase.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Pill label="Campanhas" value={String(metrics?.totalAds ?? '—')} />
              <Pill label="Ativas" value={String(metrics?.adsAtivos ?? '—')} />
              <button
                type="button"
                onClick={refreshNow}
                disabled={loading || refreshing}
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition hover:opacity-90 disabled:opacity-60"
                style={{
                  borderColor: 'color-mix(in oklab, var(--foreground, #fff) 14%, transparent)',
                  background: 'color-mix(in oklab, var(--background) 55%, transparent)',
                  color: 'color-mix(in oklab, var(--foreground, #fff) 80%, transparent)',
                }}
                aria-label="Atualizar dados"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>
          </div>

          {/* KPI row */}
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-4">
            <StatCard
              icon={Wallet}
              label="Investimento total"
              value={formatCurrencyBRL(metrics?.gastoTotal ?? 0)}
              hint="soma das campanhas"
              accent="color-mix(in oklab, #ef4444 85%, white)"
            />
            <StatCard
              icon={CircleDollarSign}
              label="Receita estimada"
              value={formatCurrencyBRL(metrics?.receitaGerada ?? 0)}
              hint="baseada em conversões"
              accent="var(--accent-2, #22c55e)"
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
        </div>

        {/* Controls */}
        <div
          className="mb-6 rounded-3xl border p-5 md:p-6"
          style={{
            borderColor: 'color-mix(in oklab, var(--foreground, #fff) 10%, transparent)',
            background: 'color-mix(in oklab, var(--surface, var(--background)) 70%, transparent)',
            backdropFilter: 'blur(18px)',
          }}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-3">
              <div
                className="flex w-full items-center gap-2 rounded-2xl border px-3 py-2"
                style={{
                  borderColor: 'color-mix(in oklab, var(--foreground, #fff) 12%, transparent)',
                  background: 'color-mix(in oklab, var(--background) 55%, transparent)',
                }}
              >
                <Search className="h-4 w-4" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 60%, transparent)' }} />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Buscar por nome ou plataforma…"
                  className="w-full bg-transparent text-sm outline-none"
                  style={{ color: 'var(--foreground, var(--text))' }}
                  aria-label="Buscar campanhas"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setStatusFilter('todos')
                  setPlatformFilter('todas')
                  setSortBy('roas')
                  setSortDir('desc')
                  toast.success('Filtros redefinidos.')
                }}
                className="inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition hover:opacity-90"
                style={{
                  borderColor: 'color-mix(in oklab, var(--foreground, #fff) 12%, transparent)',
                  background: 'color-mix(in oklab, var(--background) 55%, transparent)',
                  color: 'color-mix(in oklab, var(--foreground, #fff) 80%, transparent)',
                }}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Reset
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 55%, transparent)' }} />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{
                    borderColor: 'color-mix(in oklab, var(--foreground, #fff) 12%, transparent)',
                    background: 'color-mix(in oklab, var(--background) 55%, transparent)',
                    color: 'color-mix(in oklab, var(--foreground, #fff) 80%, transparent)',
                  }}
                  aria-label="Filtrar por status"
                >
                  <option value="todos">Status: todos</option>
                  <option value="ativo">Ativo</option>
                  <option value="pausado">Pausado</option>
                  <option value="encerrado">Encerrado</option>
                </select>
              </div>

              <select
                value={platformFilter}
                onChange={e => setPlatformFilter(e.target.value)}
                className="rounded-xl border px-3 py-2 text-sm outline-none"
                style={{
                  borderColor: 'color-mix(in oklab, var(--foreground, #fff) 12%, transparent)',
                  background: 'color-mix(in oklab, var(--background) 55%, transparent)',
                  color: 'color-mix(in oklab, var(--foreground, #fff) 80%, transparent)',
                }}
                aria-label="Filtrar por plataforma"
              >
                {platforms.map(p => (
                  <option key={p} value={p}>
                    Plataforma: {p}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{
                    borderColor: 'color-mix(in oklab, var(--foreground, #fff) 12%, transparent)',
                    background: 'color-mix(in oklab, var(--background) 55%, transparent)',
                    color: 'color-mix(in oklab, var(--foreground, #fff) 80%, transparent)',
                  }}
                  aria-label="Ordenar por"
                >
                  <option value="roas">Ordenar: ROAS</option>
                  <option value="gasto">Ordenar: Gasto</option>
                  <option value="conversoes">Ordenar: Conversões</option>
                  <option value="cliques">Ordenar: Cliques</option>
                </select>

                <button
                  type="button"
                  onClick={() => setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))}
                  className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition hover:opacity-90"
                  style={{
                    borderColor: 'color-mix(in oklab, var(--foreground, #fff) 12%, transparent)',
                    background: 'color-mix(in oklab, var(--background) 55%, transparent)',
                    color: 'color-mix(in oklab, var(--foreground, #fff) 80%, transparent)',
                  }}
                  aria-label="Alternar direção de ordenação"
                >
                  <ArrowTrendingUpIconCompat dir={sortDir} />
                  {sortDir === 'asc' ? 'Asc' : 'Desc'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 gap-6">
          {/* Table */}
          <div
            className="overflow-hidden rounded-3xl border"
            style={{
              borderColor: 'color-mix(in oklab, var(--foreground, #fff) 10%, transparent)',
              background: 'color-mix(in oklab, var(--surface, var(--background)) 70%, transparent)',
              backdropFilter: 'blur(18px)',
            }}
          >
            <div className="flex items-center justify-between gap-3 border-b p-5 md:p-6" style={{ borderColor: 'color-mix(in oklab, var(--foreground, #fff) 8%, transparent)' }}>
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5" style={{ color: 'var(--accent-1, #a855f7)' }} />
                <div>
                  <h2 className="text-base md:text-lg font-black" style={{ color: 'var(--foreground, var(--text))' }}>
                    Campanhas
                  </h2>
                  <p className="text-xs" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 60%, transparent)' }}>
                    Indicadores por campanha. Ajuste filtros para análise.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Pill label="Mostrando" value={String(filtered.length)} />
                <Pill label="Fonte" value="Supabase" />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-3 p-10">
                <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--accent-1, #a855f7)' }} />
                <p className="text-sm" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 65%, transparent)' }}>
                  Carregando campanhas…
                </p>
              </div>
            ) : empty ? (
              <div className="p-10 text-center">
                <div
                  className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border"
                  style={{
                    borderColor: 'color-mix(in oklab, var(--foreground, #fff) 10%, transparent)',
                    background: 'color-mix(in oklab, var(--background) 55%, transparent)',
                  }}
                >
                  <Sparkles className="h-6 w-6" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 75%, transparent)' }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 80%, transparent)' }}>
                  Nenhuma campanha encontrada.
                </p>
                <p className="mt-1 text-xs" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 55%, transparent)' }}>
                  Crie registros em <span className="font-semibold">ads_campaigns</span> para visualizar métricas aqui.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[980px] w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'color-mix(in oklab, var(--foreground, #fff) 8%, transparent)' }}>
                      <TableHeadCell align="left">Campanha</TableHeadCell>
                      <TableHeadCell>Plataforma</TableHeadCell>
                      <TableHeadCell>Status</TableHeadCell>
                      <TableHeadCell>Gasto</TableHeadCell>
                      <TableHeadCell>Impressões</TableHeadCell>
                      <TableHeadCell>Cliques</TableHeadCell>
                      <TableHeadCell>Conversões</TableHeadCell>
                      <TableHeadCell>CPC</TableHeadCell>
                      <TableHeadCell>CPA</TableHeadCell>
                      <TableHeadCell>ROAS</TableHeadCell>
                    </tr>
                  </thead>

                  <tbody>
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
                            className="border-b transition-colors hover:bg-white/5"
                            style={{ borderColor: 'color-mix(in oklab, var(--foreground, #fff) 6%, transparent)' }}
                          >
                            <td className="py-4 px-4 text-left">
                              <div className="flex items-center gap-3">
                                <span
                                  aria-hidden="true"
                                  className="h-2.5 w-2.5 rounded-full"
                                  style={{ background: st.dot, boxShadow: `0 0 0 6px color-mix(in oklab, ${st.dot} 15%, transparent)` }}
                                />
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold" style={{ color: 'var(--foreground, var(--text))' }}>
                                    {ad.nome}
                                  </p>
                                  <p className="mt-0.5 text-[11px]" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 55%, transparent)' }}>
                                    Orçamento/dia: {formatCurrencyBRL(ad.orcamento_diario)}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-4 text-right">
                              <span className="text-xs font-semibold" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 70%, transparent)' }}>
                                {ad.plataforma}
                              </span>
                            </td>

                            <td className="py-4 px-4 text-right">
                              <span
                                className="inline-flex items-center justify-end rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                                style={{
                                  borderColor: `color-mix(in oklab, ${st.dot} 28%, transparent)`,
                                  background: `color-mix(in oklab, ${st.dot} 10%, transparent)`,
                                  color: `color-mix(in oklab, ${st.dot} 85%, white)`,
                                }}
                              >
                                {st.label}
                              </span>
                            </td>

                            <td className="py-4 px-4 text-right text-xs font-semibold" style={{ color: 'color-mix(in oklab, #ef4444 85%, white)' }}>
                              {formatCurrencyBRL(ad.gasto_total)}
                            </td>

                            <td className="py-4 px-4 text-right text-xs" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 75%, transparent)' }}>
                              {formatNumberBR(ad.impressoes)}
                            </td>

                            <td className="py-4 px-4 text-right text-xs" style={{ color: 'color-mix(in oklab, var(--accent-2, #22c55e) 75%, var(--foreground, #fff))' }}>
                              {formatNumberBR(ad.cliques)}
                            </td>

                            <td className="py-4 px-4 text-right text-xs" style={{ color: 'var(--accent-2, #22c55e)' }}>
                              {formatNumberBR(ad.conversoes)}
                            </td>

                            <td className="py-4 px-4 text-right text-xs" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 75%, transparent)' }}>
                              {formatCurrencyBRL(ad.cpc)}
                            </td>

                            <td className="py-4 px-4 text-right text-xs" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 75%, transparent)' }}>
                              {formatCurrencyBRL(ad.cpa)}
                            </td>

                            <td className="py-4 px-4 text-right">
                              <div className="flex flex-col items-end gap-2">
                                <span className="text-xs font-black" style={{ color: roasTone }}>
                                  {formatRatioX(ad.roas)}
                                </span>
                                <div className="w-28">
                                  <ProgressBar value={score} tone={roasTone} />
                                </div>
                                <span className="text-[10px] font-semibold" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 55%, transparent)' }}>
                                  Score {score}/100
                                </span>
                              </div>
                            </td>
                          </motion.tr>
                        )
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Guidance / Notes */}
          <div
            className="rounded-3xl border p-5 md:p-6"
            style={{
              borderColor: 'color-mix(in oklab, var(--foreground, #fff) 10%, transparent)',
              background: 'color-mix(in oklab, var(--surface, var(--background)) 70%, transparent)',
              backdropFilter: 'blur(18px)',
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border"
                style={{
                  borderColor: 'color-mix(in oklab, var(--foreground, #fff) 10%, transparent)',
                  background: 'color-mix(in oklab, var(--background) 55%, transparent)',
                }}
              >
                <BadgeCheck className="h-5 w-5" style={{ color: 'var(--accent-2, #22c55e)' }} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground, var(--text))' }}>
                  Leitura recomendada
                </p>
                <ul className="mt-2 space-y-1 text-xs" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 62%, transparent)' }}>
                  <li>• ROAS ≥ 1,0 indica retorno; ≥ 2,0 indica boa eficiência (contexto por margem).</li>
                  <li>• CPC alto pode ser aceitável se a taxa de conversão e LTV suportarem.</li>
                  <li>• Use filtros para comparar campanhas por plataforma e status, evitando ruído.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Compat: Não usamos Heroicons (canon #3 / consistência). Este pequeno componente evita dependência.
 * Ícone simples para direção de ordenação.
 */
function ArrowTrendingUpIconCompat({ dir }: { dir: 'asc' | 'desc' }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-4 w-4 items-center justify-center"
      style={{ transform: dir === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)' }}
    >
      <TrendingUp className="h-4 w-4" />
    </span>
  )
}
