// src/pages/APIStatus.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createSupremePage } from '@/components/SupremePageFactory'
import { supremeConfigs } from './supremeConfigs'
import { NeuralGraph } from '@/components/visualizations/NeuralGraph'
import { GlitchText } from '@/components/effects/GlitchText'
import { ReplayDebugger } from '@/components/dev/ReplayDebugger'
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime'
import { useAnalytics } from '@/hooks/useAnalytics'
import { AlertTriangle, Activity, Zap, DollarSign, RefreshCw } from 'lucide-react'
import debounce from 'lodash/debounce'
import useSound from 'use-sound'

// Enum e tipagem rigorosa
enum HealthStatus {
  operational = 'operational',
  degraded = 'degraded',
  critical = 'critical',
}

interface SystemHealth {
  status: HealthStatus
  latency_ms: number
  error_rate: number // fração (ex: 0.02 = 2%)
  active_incidents: number
  last_updated: string
}

// Boot sequence
const BOOT_STEPS = [
  'Initializing Neural Mesh…',
  'Handshaking Stripe…',
  'Syncing OpenAI…',
  'Calibrating Telemetry…',
  'Finalizing HUD…',
]

// Loading skeletons
const LoadingBar = () => <div className="h-4 w-20 rounded bg-[var(--surface-3)] animate-pulse" />

const MetricSkeleton = () => (
  <div className="flex flex-col">
    <div className="h-3 w-16 rounded bg-[var(--surface-3)] animate-pulse mb-2" />
    <div className="h-8 w-24 rounded bg-[var(--surface-3)] animate-pulse" />
  </div>
)

// ErrorBoundary local para o Mesh
class MeshBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('Mesh render error:', error)
  }

  render() {
    return this.state.hasError ? (
      <div className="h-full flex items-center justify-center text-[var(--text-secondary)] p-6 text-center">
        Falha ao renderizar o Integration Mesh. Tente recarregar.
      </div>
    ) : (
      this.props.children
    )
  }
}

// LongPressButton com acessibilidade completa (teclado + screen reader)
function LongPressButton({
  onLongPress,
  className = '',
  children,
  ms = 1600,
  ariaLabel,
}: {
  onLongPress: () => void
  className?: string
  children: React.ReactNode
  ms?: number
  ariaLabel?: string
}) {
  const [pressing, setPressing] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!pressing) {
      setProgress(0)
      return
    }
    let start = performance.now()
    let raf: number
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / ms)
      setProgress(p)
      if (p < 1) raf = requestAnimationFrame(step)
      else onLongPress()
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [pressing, ms, onLongPress])

  return (
    <button
      onMouseDown={() => setPressing(true)}
      onMouseUp={() => setPressing(false)}
      onMouseLeave={() => setPressing(false)}
      onTouchStart={() => setPressing(true)}
      onTouchEnd={() => setPressing(false)}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          setPressing(true)
        }
      }}
      onKeyUp={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          setPressing(false)
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-live="polite"
      className={`relative overflow-hidden ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden
        className="absolute left-0 top-0 h-full bg-[var(--status-crit)]/30 transition-[width]"
        style={{ width: `${progress * 100}%` }}
      />
    </button>
  )
}

// MetricTicker memoizado
const MetricTicker = React.memo(
  ({
    icon,
    label,
    value,
    trend,
    isCurrency = false,
    'data-testid': testId,
  }: {
    icon: React.ReactNode
    label: string
    value: string
    trend: 'good' | 'warning' | 'critical' | 'up'
    isCurrency?: boolean
    'data-testid'?: string
  }) => (
    <div className="flex flex-col" data-testid={testId}>
      <span className="text-[10px] uppercase text-[var(--text-secondary)] flex items-center gap-2">
        {icon}
        {label}
      </span>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-2xl font-mono font-medium text-[var(--text-primary)]">
          {isCurrency ? '$' : ''}
          {value}
        </span>
        <span
          className={`text-xs ${
            trend === 'good' || trend === 'up'
              ? 'text-[var(--status-ok)]'
              : trend === 'warning'
              ? 'text-[var(--status-warn)]'
              : 'text-[var(--status-crit)]'
          }`}
        >
          {trend === 'up' ? '▲' : trend === 'stable' ? '—' : '▼'}
        </span>
      </div>
    </div>
  )
)

const APIStatusPage = () => {
  const { logEvent } = useAnalytics()
  const { data: healthData, status: realtimeStatus, error: supabaseError } = useSupabaseRealtime<SystemHealth>('system_health', {
    order: { column: 'last_updated', ascending: false },
    limit: 1,
  })

  const [health, setHealth] = useState<SystemHealth>({
    status: HealthStatus.operational,
    latency_ms: 45,
    error_rate: 0.02,
    active_incidents: 0,
    last_updated: new Date().toISOString(),
  })

  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [isReplayOpen, setIsReplayOpen] = useState(false)
  const [showDegradationBanner, setShowDegradationBanner] = useState(false)
  const [bootStep, setBootStep] = useState(0)
  const [cleared, setCleared] = useState(false)

  const bootDone = bootStep >= BOOT_STEPS.length
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  // Sons sutis (volume baixo + safe SSR)
  const allowAudio = typeof window !== 'undefined' && !prefersReducedMotion
  const [playAlert] = useSound('/sounds/glitch-alert.mp3', { volume: 0.18, soundEnabled: allowAudio })
  const [playHover] = useSound('/sounds/tech-hover.mp3', { volume: 0.08, soundEnabled: allowAudio })

  // Boot sequence
  useEffect(() => {
    if (healthData) {
      setBootStep(BOOT_STEPS.length)
      return
    }
    if (bootStep < BOOT_STEPS.length) {
      const id = setTimeout(() => setBootStep(s => s + 1), 180)
      return () => clearTimeout(id)
    }
  }, [bootStep, healthData])

  // Atualiza health
  useEffect(() => {
    if (healthData?.length) {
      setHealth(healthData[0])
      setShowDegradationBanner(false)
    }
  }, [healthData])

  useEffect(() => {
    setShowDegradationBanner(realtimeStatus !== 'connected' || !!supabaseError)
  }, [realtimeStatus, supabaseError])

  // Alerta sonoro crítico
  useEffect(() => {
    if (health.status === HealthStatus.critical) playAlert()
  }, [health.status, playAlert])

  // Telemetria de abertura
  useEffect(() => {
    logEvent('APIStatus_Opened', { ts: Date.now(), realtimeStatus })
  }, [logEvent, realtimeStatus])

  // Telemetria de status realtime
  useEffect(() => {
    logEvent('Realtime_Status', { status: realtimeStatus })
  }, [realtimeStatus, logEvent])

  // Telemetria de performance do Mesh
  useEffect(() => {
    const t0 = performance.now()
    const id = requestAnimationFrame(() => {
      logEvent('Mesh_RenderTime', { ms: performance.now() - t0 })
    })
    return () => cancelAnimationFrame(id)
  }, [selectedNode, logEvent])

  // Telemetria de render do Replay
  useEffect(() => {
    if (!isReplayOpen) return
    const t0 = performance.now()
    const id = requestAnimationFrame(() => {
      logEvent('Replay_RenderTime', { ms: performance.now() - t0 })
    })
    return () => cancelAnimationFrame(id)
  }, [isReplayOpen, logEvent])

  const handleNodeSelect = useCallback(
    (node: string) => {
      setSelectedNode(node)
      logEvent('Node_Selected', { node })
    },
    [logEvent]
  )

  const handleReplayOpen = useCallback(() => {
    setIsReplayOpen(true)
    logEvent('Replay_Opened', { node: selectedNode })
  }, [selectedNode, logEvent])

  // CLEAR ALL com long-press
  const handleClearAllConfirmed = useCallback(() => {
    logEvent('ClearAll_LongPress_Confirmed')
    setCleared(true)
    setTimeout(() => setCleared(false), 400)
  }, [logEvent])

  // Custo dinâmico
  const costPerMin = useMemo(() => {
    if (!healthData) return null
    const base = 3.75
    const factor = Math.max(1, health.latency_ms / 100) + health.active_incidents * 0.15
    return (base * factor).toFixed(2)
  }, [healthData, health])

  // Normalização do error_rate
  const errorRatePct = health.error_rate * 100
  const errorRateDisplay = `${errorRatePct.toFixed(2)}%`
  const trendError: 'good' | 'warning' | 'critical' =
    errorRatePct < 0.5 ? 'good' : errorRatePct < 2 ? 'warning' : 'critical'

  const trendLatency =
    health.latency_ms < 100 ? 'good' : health.latency_ms < 300 ? 'warning' : 'critical'

  // Formatação de números
  const nf = useMemo(() => new Intl.NumberFormat('en-US'), [])

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] overflow-hidden font-sans relative" data-theme="glass-dark">
      {/* Background NeuralGraph */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <NeuralGraph active={health.status === HealthStatus.operational} />
      </div>

      {/* Banner de degradação */}
      {showDegradationBanner && (
        <div role="alert" className="relative z-20 m-4 p-3 text-sm bg-[var(--status-warn)]/10 border border-[var(--status-warn)] rounded-lg text-center">
          Conexão degradada ao Realtime — exibindo dados parciais ou desatualizados.
        </div>
      )}

      {/* Header HUD */}
      <header className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center p-6 backdrop-blur-md border-b border-[var(--border)]">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter flex items-center gap-4">
            {health.status === HealthStatus.critical ? (
              <GlitchText text="THE SYNAPSE" className="text-[var(--status-crit)]" />
            ) : (
              <span className="bg-gradient-to-r from-[var(--color-primary-from)] to-[var(--color-primary-to)] bg-clip-text text-transparent">
                THE SYNAPSE
              </span>
            )}
            <div
              className={`w-4 h-4 rounded-full shadow-lg ${
                prefersReducedMotion
                  ? ''
                  : 'animate-pulse'
              } ${
                health.status === HealthStatus.operational
                  ? 'bg-[var(--status-ok)] shadow-[0_0_0_6px_rgba(34,197,94,0.15)]'
                  : health.status === HealthStatus.degraded
                  ? 'bg-[var(--status-warn)] shadow-[0_0_0_6px_rgba(234,179,8,0.15)]'
                  : 'bg-[var(--status-crit)] shadow-[0_0_0_6px_rgba(239,68,68,0.2)]'
              }`}
            />
          </h1>
          <p className="text-sm uppercase tracking-widest text-[var(--text-secondary)] mt-1 md:mt-0">
            Real-time Infrastructure Monitor
          </p>
        </div>

        {/* Métricas com boot sequence */}
        <div className="flex flex-wrap gap-8 mt-4 md:mt-0">
          {!healthData || !bootDone ? (
            <div role="status" aria-live="polite" className="font-mono text-xs bg-[var(--surface-glass)] px-4 py-3 rounded-lg border border-[var(--border)]">
              <span className="opacity-70">
                {BOOT_STEPS[Math.min(bootStep, BOOT_STEPS.length - 1)]}
              </span>
            </div>
          ) : (
            <>
              <MetricTicker icon={<Zap />} label="Latency" value={`${health.latency_ms}ms`} trend={trendLatency} data-testid="latency-metric" />
              <MetricTicker icon={<Activity />} label="Error Rate" value={errorRateDisplay} trend={trendError} data-testid="error-metric" />
              <MetricTicker icon={<DollarSign />} label={costPerMin ? "Cost/min" : "Cost/min (est.)"} value={costPerMin ?? 'Calculating…'} trend="up" isCurrency data-testid="cost-metric" />
              <MetricTicker icon={<AlertTriangle />} label="Active Incidents" value={health.active_incidents.toString()} trend={health.active_incidents === 0 ? 'good' : 'critical'} data-testid="incidents-metric" />
            </>
          )}
        </div>
      </header>

      {/* Main Grid */}
      <main className="relative z-10 grid grid-cols-12 gap-6 p-6 h-[calc(100vh-140px)]">
        {/* Integration Mesh */}
        <section className="col-span-12 md:col-span-8 bg-[var(--surface-glass)] rounded-2xl border border-[var(--border)] p-6 relative overflow-hidden group">
          <div className="absolute top-4 left-4 z-20">
            <h2 className="text-xl font-bold flex items-center gap-2">
              Integration Mesh
              <RefreshCw className={`w-4 h-4 text-[var(--text-secondary)] ${prefersReducedMotion ? '' : 'animate-spin-slow'}`} />
            </h2>
          </div>

          <MeshBoundary>
            <div className="w-full h-full flex items-center justify-center">
              <NeuralGraph selectedNode={selectedNode} onNodeSelect={handleNodeSelect} className="w-full h-full" />
            </div>
          </MeshBoundary>

          {/* Node Details Card */}
          <AnimatePresence initial={false}>
            {selectedNode && (
              <motion.div
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
                className="absolute bottom-6 right-6 w-80 bg-black/80 backdrop-blur-xl border border-[var(--border)] p-5 rounded-xl shadow-2xl"
              >
                <h3 className="text-lg font-bold text-white mb-3">{selectedNode}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Uptime</span>
                    <span className="text-[var(--status-ok)]">99.98%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Avg Latency</span>
                    <span className="text-[var(--status-warn)]">82ms</span>
                  </div>
                  <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[var(--status-ok)] to-[var(--status-ok)] w-[98%]" />
                  </div>
                  <button
                    onClick={handleReplayOpen}
                    onMouseEnter={() => playHover()}
                    className="w-full py-3 bg-gradient-to-r from-[var(--color-primary-from)] to-[var(--color-primary-to)] text-black font-bold rounded-lg hover:brightness-110 transition-all shadow-lg"
                    data-testid="replay-open-btn"
                  >
                    Deep Inspect & Replay
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Right Column */}
        <section className="col-span-12 md:col-span-4 flex flex-col gap-6">
          {/* Webhook Reliability */}
          <div className="flex-1 bg-[var(--surface-glass)] rounded-2xl border border-[var(--border)] p-6 flex flex-col justify-between">
            <h3 className="text-sm uppercase tracking-widest text-[var(--text-secondary)] mb-4">Webhook Reliability</h3>
            <div className="flex items-end justify-between mb-4">
              <div className="text-5xl font-mono font-bold text-[var(--status-ok)]">99.9%</div>
              <div className="text-xs text-right text-[var(--text-muted)]">
                IN: {new Intl.NumberFormat('en-US').format(14203)}/min<br />
                OUT: {new Intl.NumberFormat('en-US').format(2401)}/min
              </div>
            </div>
            <div className="flex gap-1 h-12 items-end">
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-[var(--status-ok)]/70 rounded-sm"
                  style={{ height: `${Math.sin(i * 0.3) * 50 + 50}%` }}
                />
              ))}
            </div>
          </div>

          {/* Live Failures Feed */}
          <div className="flex-1 bg-[var(--surface-glass)] rounded-2xl border border-[var(--border)] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[var(--border)] bg-[var(--status-crit)]/10 flex justify-between items-center">
              <h3 className="text-[var(--status-crit)] font-bold flex items-center gap-3">
                <span className="animate-ping w-3 h-3 rounded-full bg-[var(--status-crit)]"></span>
                LIVE FAILURES
              </h3>
              <LongPressButton
                onLongPress={handleClearAllConfirmed}
                className="text-xs px-2 py-1 rounded text-[var(--status-crit)] hover:text-white border border-transparent hover:border-[var(--status-crit)]/40 transition"
                ariaLabel="Pressione e segure para limpar todas as falhas"
              >
                CLEAR ALL (hold)
              </LongPressButton>
            </div>
            <div
              id="live-failures"
              role="status"
              aria-live="polite"
              aria-busy={realtimeStatus === 'connecting'}
              className="flex-1 overflow-y-auto font-mono text-xs p-4 space-y-3"
              data-testid="live-failures"
            >
              <AnimatePresence initial={false}>
                {!cleared && (
                  <motion.div
                    key="failure-item-1"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{
                      opacity: 0,
                      scale: 0.92,
                      filter: 'blur(2px)',
                      transition: { duration: 0.22 },
                    }}
                    className="p-4 bg-[var(--status-crit)]/20 border-l-4 border-[var(--status-crit)] hover:bg-[var(--status-crit)]/40 cursor-pointer transition-colors group rounded-lg"
                  >
                    <div className="flex justify-between text-[var(--status-crit)] mb-2">
                      <span className="font-bold">POST /stripe/webhook</span>
                      <span>500 Internal Server Error</span>
                    </div>
                    <div className="text-[var(--text-muted)] truncate group-hover:whitespace-normal">
                      Error: Database connection timeout in 'api_integrations' table...
                    </div>
                    <div className="mt-3 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onMouseEnter={() => playHover()}
                        className="bg-[var(--status-crit)]/30 px-3 py-1 rounded text-[var(--status-crit)] hover:bg-[var(--status-crit)] hover:text-white transition"
                      >
                        Fix with AI
                      </button>
                      <button
                        onMouseEnter={() => playHover()}
                        className="bg-white/10 px-3 py-1 rounded hover:bg-white/20 transition"
                      >
                        Trace
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>

      {/* Replay Debugger */}
      <ReplayDebugger isOpen={isReplayOpen} onClose={() => setIsReplayOpen(false)} />
    </div>
  )
}

export default createSupremePage(supremeConfigs['APIStatus'], APIStatusPage)
