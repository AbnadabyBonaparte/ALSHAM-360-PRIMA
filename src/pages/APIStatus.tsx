// src/pages/APIStatus.tsx
// ALSHAM 360° PRIMA — API Status
// CANÔNICO • TOKEN-FIRST • MULTI-TENANT READY • SAFE-UI (sem Sidebar/Layout aqui)
// Importante: NÃO renderiza LayoutSupremo aqui. O shell é responsabilidade do ProtectedLayout.

import React, { useCallback, useEffect, useMemo, useRef, useState, Suspense, lazy } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  Activity,
  Zap,
  RefreshCw,
  ArrowLeft,
  Settings2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

// Lazy components (resiliente a default/named export)
const NeuralGraph = lazy(async () => {
  const m = await import('@/components/visualizations/NeuralGraph')
  return { default: (m as any).NeuralGraph ?? (m as any).default }
})
const ReplayDebugger = lazy(async () => {
  const m = await import('@/components/dev/ReplayDebugger')
  return { default: (m as any).ReplayDebugger ?? (m as any).default }
})

enum HealthStatus {
  operational = 'operational',
  degraded = 'degraded',
  critical = 'critical',
}

interface SystemHealth {
  status: HealthStatus
  latency_ms: number
  error_rate: number // ex: 0.012 = 1.2%
  active_incidents: number
  last_updated: string
}

interface FailureItem {
  id: string
  title: string
  detail: string
  ts: string
}

const BOOT_STEPS: string[] = [
  'Inicializando observabilidade…',
  'Validando integrações críticas…',
  'Sincronizando telemetria…',
  'Carregando painel de status…',
  'Pronto.',
]

// Error Boundary para visualizações (fail-soft)
class MeshBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error('APIStatus mesh render error:', error)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full items-center justify-center p-8 text-center">
          <div className="max-w-md">
            <p
              className="text-sm"
              style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 70%, transparent)' }}
            >
              Falha ao renderizar a visualização.
            </p>
            <p
              className="mt-2 text-xs"
              style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 55%, transparent)' }}
            >
              Atualize a página ou desative componentes gráficos pesados.
            </p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// Long press (a11y + touch + mouse)
function LongPressButton({
  onLongPress,
  children,
  className = '',
  ms = 1600,
  ariaLabel,
  disabled = false,
  style,
}: {
  onLongPress: () => void
  children: React.ReactNode
  className?: string
  ms?: number
  ariaLabel?: string
  disabled?: boolean
  style?: React.CSSProperties
}) {
  const [pressing, setPressing] = useState(false)
  const [progress, setProgress] = useState(0)
  const firedRef = useRef(false)

  const stop = useCallback(() => {
    setPressing(false)
    setProgress(0)
    firedRef.current = false
  }, [])

  useEffect(() => {
    if (!pressing || disabled) return

    const start = performance.now()
    let raf = 0

    const step = (t: number) => {
      const p = Math.min(1, (t - start) / ms)
      setProgress(p)

      if (p < 1) {
        raf = requestAnimationFrame(step)
        return
      }

      if (!firedRef.current) {
        firedRef.current = true
        onLongPress()
      }
      stop()
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [pressing, ms, onLongPress, stop, disabled])

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      onMouseDown={() => setPressing(true)}
      onMouseUp={stop}
      onMouseLeave={stop}
      onTouchStart={() => setPressing(true)}
      onTouchEnd={stop}
      onTouchCancel={stop}
      onBlur={stop}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') setPressing(true)
      }}
      onKeyUp={e => {
        if (e.key === 'Enter' || e.key === ' ') stop()
      }}
      className={`relative overflow-hidden touch-manipulation ${className} ${disabled ? 'opacity-60' : ''}`}
      style={style}
    >
      {children}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0"
        style={{
          width: `${Math.round(progress * 100)}%`,
          opacity: 0.75,
          background: 'color-mix(in oklab, var(--accent-1, #a855f7) 25%, transparent)',
          transition: pressing ? 'none' : 'width 120ms ease',
        }}
      />
    </button>
  )
}

function statusMeta(status: HealthStatus) {
  switch (status) {
    case HealthStatus.operational:
      return { label: 'Operacional', icon: CheckCircle2, tone: 'var(--accent-2, #22c55e)' }
    case HealthStatus.degraded:
      return { label: 'Degradado', icon: ShieldCheck, tone: 'var(--accent-1, #a855f7)' }
    case HealthStatus.critical:
    default:
      return { label: 'Crítico', icon: AlertTriangle, tone: '#ef4444' }
  }
}

function formatPct(v: number) {
  if (!Number.isFinite(v)) return '—'
  const pct = v * 100
  return `${pct.toFixed(2)}%`
}

function formatIsoTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  label: string
  value: string
  hint?: string
}) {
  return (
    <div
      className="flex items-center gap-4 rounded-2xl border p-4"
      style={{
        borderColor: 'color-mix(in oklab, var(--foreground, #fff) 10%, transparent)',
        background: 'color-mix(in oklab, var(--surface, var(--background)) 70%, transparent)',
      }}
    >
      <div
        className="rounded-2xl p-3"
        style={{
          background:
            'linear-gradient(135deg, color-mix(in oklab, var(--accent-1, #a855f7) 18%, transparent), color-mix(in oklab, var(--accent-2, #22c55e) 14%, transparent))',
          border: '1px solid color-mix(in oklab, var(--foreground, #fff) 10%, transparent)',
        }}
      >
        <Icon className="h-6 w-6" style={{ color: 'var(--accent-1, #a855f7)' }} />
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

export default function APIStatus() {
  const navigate = useNavigate()

  const [health, setHealth] = useState<SystemHealth>({
    status: HealthStatus.operational,
    latency_ms: 48,
    error_rate: 0.0012,
    active_incidents: 0,
    last_updated: new Date().toISOString(),
  })

  const [bootStep, setBootStep] = useState(0)
  const [showPrefs, setShowPrefs] = useState(false)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [replayOpen, setReplayOpen] = useState(false)

  const [failures, setFailures] = useState<FailureItem[]>([
    {
      id: 'f1',
      title: 'POST /stripe/webhook → 500',
      detail: 'Database connection timeout',
      ts: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    },
  ])

  const bootDone = bootStep >= BOOT_STEPS.length - 1

  // Boot sequence
  useEffect(() => {
    if (bootDone) return
    const timer = window.setTimeout(() => setBootStep(prev => Math.min(prev + 1, BOOT_STEPS.length - 1)), 520)
    return () => window.clearTimeout(timer)
  }, [bootDone])

  // Simulação de dados (substituir por Realtime/Supabase quando pronto)
  // Melhoria: pausa updates quando a aba está oculta (evita render desnecessário em background)
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'hidden') return

      setHealth(prev => {
        const latency = Math.floor(40 + Math.random() * 55)
        const error = Math.random() * 0.01
        const incidents = Math.random() > 0.965 ? 1 : 0

        const status =
          incidents > 0 || error > 0.008
            ? HealthStatus.critical
            : latency > 85 || error > 0.004
              ? HealthStatus.degraded
              : HealthStatus.operational

        return {
          ...prev,
          status,
          latency_ms: latency,
          error_rate: error,
          active_incidents: incidents,
          last_updated: new Date().toISOString(),
        }
      })
    }, 2800)

    return () => window.clearInterval(interval)
  }, [])

  const status = useMemo(() => statusMeta(health.status), [health.status])
  const StatusIcon = status.icon

  const goBack = useCallback(() => navigate(-1), [navigate])

  const refreshNow = useCallback(() => {
    toast.success('Atualização solicitada.')
    // Hook para futuramente: refetch real de métricas
    setHealth(prev => ({ ...prev, last_updated: new Date().toISOString() }))
  }, [])

  const clearFailures = useCallback(() => {
    setFailures([])
    toast.success('Registro de falhas limpo.')
  }, [])

  return (
    <div className="relative w-full">
      {/* Fundo token-first (somente no content area) */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[32px]"
        style={{
          background:
            'radial-gradient(1400px 900px at 18% 10%, color-mix(in oklab, var(--accent-1, #a855f7) 16%, transparent) 0%, transparent 60%),' +
            'radial-gradient(1200px 800px at 86% 6%, color-mix(in oklab, var(--accent-2, #22c55e) 12%, transparent) 0%, transparent 55%),' +
            'linear-gradient(135deg, color-mix(in oklab, var(--background) 92%, black) 0%, var(--background) 55%, color-mix(in oklab, var(--background) 88%, black) 100%)',
          opacity: 0.9,
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 py-6 md:px-8 md:py-8">
        {/* Header / Toolbar */}
        <div
          className="mb-6 rounded-3xl border p-5 md:p-6"
          style={{
            borderColor: 'color-mix(in oklab, var(--foreground, #fff) 10%, transparent)',
            background: 'color-mix(in oklab, var(--surface, var(--background)) 72%, transparent)',
            backdropFilter: 'blur(18px)',
          }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={goBack}
                className="rounded-xl border p-2 transition hover:opacity-90"
                style={{
                  borderColor: 'color-mix(in oklab, var(--foreground, #fff) 14%, transparent)',
                  background: 'color-mix(in oklab, var(--background) 55%, transparent)',
                }}
                aria-label="Voltar"
              >
                <ArrowLeft
                  className="h-5 w-5"
                  style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 80%, transparent)' }}
                />
              </button>

              <div className="min-w-0">
                <h1
                  className="truncate text-xl font-black md:text-3xl"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, var(--accent-1, #a855f7), var(--accent-2, #22c55e))',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  API Status
                </h1>
                <p
                  className="mt-1 text-xs md:text-sm"
                  style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 65%, transparent)' }}
                >
                  Observabilidade • Integrações • Saúde do sistema (simulado até o Realtime estar conectado)
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div
                className="flex items-center gap-2 rounded-full border px-3 py-2"
                style={{
                  borderColor: 'color-mix(in oklab, var(--foreground, #fff) 12%, transparent)',
                  background: 'color-mix(in oklab, var(--background) 55%, transparent)',
                }}
              >
                <StatusIcon className="h-4 w-4" style={{ color: status.tone }} />
                <span
                  className="text-xs font-semibold"
                  style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 80%, transparent)' }}
                >
                  {bootDone ? status.label : 'Inicializando'}
                </span>
              </div>

              <button
                type="button"
                onClick={refreshNow}
                className="rounded-xl border p-2 transition hover:opacity-90"
                style={{
                  borderColor: 'color-mix(in oklab, var(--foreground, #fff) 14%, transparent)',
                  background: 'color-mix(in oklab, var(--background) 55%, transparent)',
                }}
                aria-label="Atualizar"
              >
                <RefreshCw
                  className="h-5 w-5"
                  style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 80%, transparent)' }}
                />
              </button>

              <button
                type="button"
                onClick={() => setShowPrefs(v => !v)}
                className="rounded-xl border p-2 transition hover:opacity-90"
                style={{
                  borderColor: 'color-mix(in oklab, var(--foreground, #fff) 14%, transparent)',
                  background: 'color-mix(in oklab, var(--background) 55%, transparent)',
                }}
                aria-label="Preferências"
              >
                <Settings2
                  className="h-5 w-5"
                  style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 80%, transparent)' }}
                />
              </button>
            </div>
          </div>

          {/* Boot line */}
          {!bootDone ? (
            <div className="mt-4">
              <p className="text-sm" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 62%, transparent)' }}>
                {BOOT_STEPS[bootStep]}
              </p>
              <div
                className="mt-3 h-2 w-full overflow-hidden rounded-full"
                style={{ background: 'color-mix(in oklab, var(--foreground, #fff) 8%, transparent)' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.round(((bootStep + 1) / BOOT_STEPS.length) * 100)}%`,
                    background: 'linear-gradient(90deg, var(--accent-1, #a855f7), var(--accent-2, #22c55e))',
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
              <MetricCard icon={Zap} label="Latência" value={`${health.latency_ms}ms`} hint="p50 (simulado)" />
              <MetricCard icon={Activity} label="Erro" value={formatPct(health.error_rate)} hint="últimos 5 min (simulado)" />
              <MetricCard
                icon={AlertTriangle}
                label="Incidentes"
                value={`${health.active_incidents}`}
                hint={`Atualizado às ${formatIsoTime(health.last_updated)}`}
              />
            </div>
          )}
        </div>

        {/* Preferences */}
        <AnimatePresence>
          {showPrefs && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 overflow-hidden rounded-3xl border"
              style={{
                borderColor: 'color-mix(in oklab, var(--foreground, #fff) 10%, transparent)',
                background: 'color-mix(in oklab, var(--surface, var(--background)) 72%, transparent)',
              }}
            >
              <div className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground, var(--text))' }}>
                    Preferências do painel
                  </p>
                  <p className="text-xs" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 60%, transparent)' }}>
                    Este painel está em modo simulado. Quando o Realtime estiver conectado, os controles serão habilitados aqui.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toast('Em breve: alternar fontes de dados (Realtime/Mock).')}
                    className="rounded-xl border px-4 py-2 text-sm font-semibold transition hover:opacity-90"
                    style={{
                      borderColor: 'color-mix(in oklab, var(--foreground, #fff) 14%, transparent)',
                      background: 'color-mix(in oklab, var(--background) 55%, transparent)',
                    }}
                  >
                    Fonte: Mock
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Integration Mesh */}
          <div
            className="relative overflow-hidden rounded-3xl border lg:col-span-7"
            style={{
              borderColor: 'color-mix(in oklab, var(--foreground, #fff) 10%, transparent)',
              background: 'color-mix(in oklab, var(--surface, var(--background)) 70%, transparent)',
              backdropFilter: 'blur(18px)',
            }}
          >
            <div
              className="flex items-center justify-between gap-3 border-b p-5 md:p-6"
              style={{ borderColor: 'color-mix(in oklab, var(--foreground, #fff) 8%, transparent)' }}
            >
              <div>
                <h2 className="text-lg font-black md:text-2xl" style={{ color: 'var(--foreground, var(--text))' }}>
                  Integration Mesh
                </h2>
                <p
                  className="mt-1 text-xs md:text-sm"
                  style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 60%, transparent)' }}
                >
                  Visualização de integrações e dependências (fail-soft)
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedNode ? (
                  <div
                    className="rounded-full border px-3 py-2 text-xs font-semibold"
                    style={{
                      borderColor: 'color-mix(in oklab, var(--foreground, #fff) 12%, transparent)',
                      background: 'color-mix(in oklab, var(--background) 55%, transparent)',
                      color: 'color-mix(in oklab, var(--foreground, #fff) 80%, transparent)',
                    }}
                  >
                    Selecionado: {selectedNode}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="h-[420px] p-5 md:p-6">
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 60%, transparent)' }}>
                      Carregando visualização…
                    </p>
                  </div>
                }
              >
                <MeshBoundary>
                  <NeuralGraph selectedNode={selectedNode} onNodeSelect={setSelectedNode} />
                </MeshBoundary>
              </Suspense>
            </div>

            {/* Node details */}
            <AnimatePresence>
              {selectedNode && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 14 }}
                  className="absolute bottom-5 right-5 w-[340px] rounded-2xl border p-4 md:bottom-6 md:right-6 md:w-[380px] md:p-5"
                  style={{
                    borderColor: 'color-mix(in oklab, var(--foreground, #fff) 12%, transparent)',
                    background: 'color-mix(in oklab, var(--surface, var(--background)) 82%, transparent)',
                    backdropFilter: 'blur(18px)',
                  }}
                >
                  <p className="text-sm font-black" style={{ color: 'var(--foreground, var(--text))' }}>
                    {selectedNode}
                  </p>
                  <p
                    className="mt-2 text-xs"
                    style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 60%, transparent)' }}
                  >
                    Uptime: 99.98% • Latência média: 82ms (simulado)
                  </p>

                  <button
                    type="button"
                    onClick={() => setReplayOpen(true)}
                    className="mt-4 w-full rounded-2xl px-4 py-3 text-sm font-black transition hover:opacity-95"
                    style={{
                      background: 'linear-gradient(90deg, var(--accent-1, #a855f7), var(--accent-2, #22c55e))',
                      color: 'var(--background)',
                      border: '1px solid color-mix(in oklab, white 10%, transparent)',
                    }}
                  >
                    Deep Inspect & Replay
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedNode(null)}
                    className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition hover:opacity-90"
                    style={{
                      borderColor: 'color-mix(in oklab, var(--foreground, #fff) 12%, transparent)',
                      background: 'color-mix(in oklab, var(--background) 55%, transparent)',
                      color: 'color-mix(in oklab, var(--foreground, #fff) 80%, transparent)',
                    }}
                  >
                    Limpar seleção
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Failures + Reliability */}
          <div className="lg:col-span-5">
            <div className="grid grid-cols-1 gap-6">
              {/* Failures */}
              <div
                className="rounded-3xl border p-5 md:p-6"
                style={{
                  borderColor: 'color-mix(in oklab, var(--foreground, #fff) 10%, transparent)',
                  background: 'color-mix(in oklab, var(--surface, var(--background)) 70%, transparent)',
                  backdropFilter: 'blur(18px)',
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6" style={{ color: '#ef4444' }} />
                    <div>
                      <p className="text-sm font-black md:text-lg" style={{ color: 'var(--foreground, var(--text))' }}>
                        Falhas recentes
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 60%, transparent)' }}
                      >
                        Registro operacional (simulado)
                      </p>
                    </div>
                  </div>

                  <LongPressButton
                    onLongPress={clearFailures}
                    ariaLabel="Pressione e segure para limpar o registro de falhas"
                    disabled={failures.length === 0}
                    className="rounded-2xl border px-4 py-2 text-xs font-black transition hover:opacity-90"
                    style={{
                      borderColor: 'color-mix(in oklab, #ef4444 30%, transparent)',
                      background: 'color-mix(in oklab, #ef4444 16%, transparent)',
                      color: '#fecaca',
                    }}
                  >
                    Limpar (segure)
                  </LongPressButton>
                </div>

                <div className="mt-4 space-y-3">
                  {failures.length === 0 ? (
                    <div
                      className="rounded-2xl border p-4"
                      style={{
                        borderColor: 'color-mix(in oklab, var(--foreground, #fff) 10%, transparent)',
                        background: 'color-mix(in oklab, var(--background) 55%, transparent)',
                      }}
                    >
                      <p className="text-sm font-semibold" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 80%, transparent)' }}>
                        Nenhuma falha registrada.
                      </p>
                      <p className="mt-1 text-xs" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 55%, transparent)' }}>
                        Quando o Realtime estiver ativo, este bloco refletirá incidentes reais.
                      </p>
                    </div>
                  ) : (
                    failures.map(f => (
                      <div
                        key={f.id}
                        className="rounded-2xl border p-4"
                        style={{
                          borderColor: 'color-mix(in oklab, #ef4444 30%, transparent)',
                          background: 'color-mix(in oklab, #ef4444 10%, transparent)',
                        }}
                      >
                        <p className="text-sm font-black" style={{ color: 'color-mix(in oklab, #fecaca 85%, white)' }}>
                          {f.title}
                        </p>
                        <p className="mt-1 text-xs" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 65%, transparent)' }}>
                          {f.detail}
                        </p>
                        <p className="mt-2 text-[11px]" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 50%, transparent)' }}>
                          {formatIsoTime(f.ts)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Reliability */}
              <div
                className="rounded-3xl border p-5 md:p-6"
                style={{
                  borderColor: 'color-mix(in oklab, var(--foreground, #fff) 10%, transparent)',
                  background: 'color-mix(in oklab, var(--surface, var(--background)) 70%, transparent)',
                  backdropFilter: 'blur(18px)',
                }}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6" style={{ color: 'var(--accent-2, #22c55e)' }} />
                  <div>
                    <p className="text-sm font-black md:text-lg" style={{ color: 'var(--foreground, var(--text))' }}>
                      Confiabilidade de Webhooks
                    </p>
                    <p className="text-xs" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 60%, transparent)' }}>
                      SLA e taxa de sucesso (simulado)
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {[
                    { label: 'Sucesso', value: 0.9992, tone: 'var(--accent-2, #22c55e)' },
                    { label: 'Retries', value: 0.017, tone: 'var(--accent-1, #a855f7)' },
                    { label: 'Dead-letter', value: 0.001, tone: '#ef4444' },
                  ].map(row => (
                    <div key={row.label}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 65%, transparent)' }}>
                          {row.label}
                        </span>
                        <span className="text-xs font-black" style={{ color: row.tone }}>
                          {formatPct(row.value)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full" style={{ background: 'color-mix(in oklab, var(--foreground, #fff) 8%, transparent)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.max(2, Math.min(100, Math.round(row.value * 100)))}%`,
                            background: `linear-gradient(90deg, ${row.tone}, color-mix(in oklab, ${row.tone} 60%, white))`,
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => toast('Em breve: abrir relatório detalhado de webhooks.')}
                    className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition hover:opacity-90"
                    style={{
                      borderColor: 'color-mix(in oklab, var(--foreground, #fff) 12%, transparent)',
                      background: 'color-mix(in oklab, var(--background) 55%, transparent)',
                      color: 'color-mix(in oklab, var(--foreground, #fff) 80%, transparent)',
                    }}
                  >
                    Ver relatório detalhado
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Replay Debugger */}
        <Suspense fallback={null}>
          <ReplayDebugger isOpen={replayOpen} onClose={() => setReplayOpen(false)} />
        </Suspense>
      </div>
    </div>
  )
}
