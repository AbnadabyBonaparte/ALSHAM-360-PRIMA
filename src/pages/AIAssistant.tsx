// src/pages/AIAssistant.tsx

import React, { useState, useEffect, useRef, Suspense, lazy, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'
import { useAnalytics } from '@/hooks/useAnalytics'
import { SplitPane } from '@/components/ui/split-pane'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mic, Send, Paperclip, Sparkles, Terminal, Layout } from 'lucide-react'
import { Typewriter } from 'react-simple-typewriter'

// Lazy-load dos módulos pesados
const Canvas = lazy(() => import('@react-three/fiber').then(mod => ({ default: mod.Canvas })))
const OrbitControls = lazy(() => import('@react-three/drei').then(mod => ({ default: mod.OrbitControls })))
const Sphere = lazy(() => import('@react-three/drei').then(mod => ({ default: mod.Sphere })))
const MeshDistortMaterial = lazy(() => import('@react-three/drei').then(mod => ({ default: mod.MeshDistortMaterial })))

const SandpackProvider = lazy(() => import('@codesandbox/sandpack-react').then(mod => ({ default: mod.SandpackProvider })))
const SandpackPreview = lazy(() => import('@codesandbox/sandpack-react').then(mod => ({ default: mod.SandpackPreview })))
const SandpackCodeEditor = lazy(() => import('@codesandbox/sandpack-react').then(mod => ({ default: mod.SandpackCodeEditor })))

// Tema Sandpack custom ALSHAM
const alshamSandpackTheme = {
  colors: {
    surface1: '#0a0a0a',
    surface2: '#121212',
    surface3: '#1e1e1e',
    clickable: '#808080',
    base: '#e0e0e0',
    disabled: '#444444',
    hover: '#ffffff',
    accent: 'var(--color-primary)',
  },
  syntax: {
    keyword: '#ff79c6',
    property: '#8be9fd',
    plain: '#f8f8f2',
    static: '#bd93f9',
    string: '#f1fa8c',
    definition: '#50fa7b',
  },
  font: {
    body: 'Inter, sans-serif',
    mono: 'Fira Code, monospace',
    size: '13px',
    lineHeight: '20px',
  },
}

// Constantes fora do componente (micro-perf + lint clean)
const CHAIN_STEPS = [
  'Conectando ao Data Lake (Snowflake)...',
  'Analisando coortes de vendas Q3-Q4...',
  'Detectando anomalias regionais...',
  'Compilando componentes React...',
]

const GENERATED_CODE = `export default function App() {
  return (
    <div className="p-10 bg-black text-white h-screen flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        Sales Dashboard
      </h1>
      <p className="mt-4 text-gray-400">Dados processados em tempo real pela Alsham AI</p>
      <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-2xl">
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">Receita: $1.2M 🚀</div>
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">Churn: 0.8% 📉</div>
      </div>
    </div>
  );
}`

// Error Boundary
class SafeBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('ErrorBoundary caught:', error)
  }

  render() {
    return this.state.hasError ? (
      <div className="h-full flex items-center justify-center text-[var(--text-tertiary)] p-6 text-center">
        Falha ao renderizar este painel. Tente recarregar.
      </div>
    ) : (
      this.props.children
    )
  }
}

export default function AIAssistantPage() {
  const { setTheme } = useTheme() // só o que usamos
  const { logEvent } = useAnalytics()
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [thinkingState, setThinkingState] = useState<'idle' | 'listening' | 'thinking' | 'generating'>('idle')
  const [inputValue, setInputValue] = useState('')
  const [mode, setMode] = useState<'chat' | 'code' | 'app' | 'doc'>('chat')
  const [artifactView, setArtifactView] = useState<'preview' | 'code'>('preview')
  const [response, setResponse] = useState('')
  const [isSending, setIsSending] = useState(false)

  const prefersReducedMotion = useReducedMotion() ?? false

  // Telemetria de abertura
  useEffect(() => {
    if (typeof window === 'undefined') return

    const nextTheme = 'glass-dark'
    setTheme(nextTheme)

    logEvent('AIAssistant_Opened', {
      theme: nextTheme,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      ua: navigator.userAgent,
      reducedMotion: prefersReducedMotion,
    })
  }, [logEvent, setTheme, prefersReducedMotion])

  // Auto-scroll suave (respeita reduced-motion)
  useEffect(() => {
    if (!scrollRef.current) return

    const behavior = prefersReducedMotion ? 'auto' : 'smooth'
    scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior })
  }, [response, prefersReducedMotion])

  // Autosize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [inputValue])

  // Hotkey ⌘/Ctrl + K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        logEvent('AIAssistant_CommandPalette_Opened')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [logEvent])

  // Telemetria de troca de view
  useEffect(() => {
    logEvent('AIAssistant_Artifact_View_Changed', { artifactView })
  }, [artifactView, logEvent])

  const handleSend = useCallback(() => {
    if (isSending || !inputValue.trim()) return

    setIsSending(true)
    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now()

    logEvent('AIAssistant_Sent', {
      chars: inputValue.length,
      hasAttachment: false,
    })

    setThinkingState('thinking')
    setMode('chat')
    setResponse('')

    setTimeout(() => {
      setThinkingState('generating')
      setMode('app')
      setResponse(
        'Analisei seus dados. Aqui está o Dashboard interativo que você pediu. Note que a região Sul está com performance 15% acima da média.'
      )

      const latency = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime
      logEvent('AIAssistant_Artifact_Generated', {
        type: 'app',
        timeSavedSec: 12,
        confidence: 0.91,
      })
      logEvent('AIAssistant_Latency', { ms: latency })

      setThinkingState('idle')
      setIsSending(false)
    }, 2500)
  }, [isSending, inputValue, logEvent])

  return (
    <div className="h-screen w-screen bg-[var(--background)] text-[var(--text-primary)] overflow-hidden flex flex-col font-sans selection:bg-[var(--color-primary)] selection:text-white">
      {/* Header */}
      <div className="h-[140px] relative shrink-0 border-b border-[var(--border)] bg-[var(--surface-1)]">
        <Suspense fallback={<div className="absolute inset-0 bg-black/40 flex items-center justify-center">Carregando esfera...</div>}>
          <SafeBoundary>
            <div className="absolute inset-0 z-0 opacity-80">
              <Canvas camera={{ position: [0, 0, 4.5], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#bd93f9" />
                <Sphere args={[1, 64, 64]}>
                  <MeshDistortMaterial
                    color={thinkingState === 'listening' ? '#ff5555' : 'var(--color-primary)'}
                    distort={thinkingState === 'thinking' ? 0.8 : 0.3}
                    speed={thinkingState === 'thinking' ? 4 : 1.5}
                    metalness={0.6}
                    roughness={0.2}
                  />
                </Sphere>
                <OrbitControls
                  enableZoom={false}
                  enablePan={false}
                  autoRotate={!prefersReducedMotion}
                  autoRotateSpeed={1}
                />
              </Canvas>
            </div>
          </SafeBoundary>
        </Suspense>

        <div className="absolute inset-0 z-10 flex items-center justify-between px-8 pointer-events-none">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
              Synth Core v2.0
            </h2>
            <p className="text-xs text-[var(--text-tertiary)] font-mono mt-1">
              LATENCY: 12ms • CONTEXT: 148k TOKENS
            </p>
          </div>
          <div className="flex gap-2 pointer-events-auto">
            {['Strategist', 'Coder', 'Analyst'].map(m => (
              <Badge key={m} variant="outline" className="bg-black/20 backdrop-blur-md cursor-pointer hover:bg-[var(--color-primary)] hover:border-transparent transition-all">
                {m}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <SplitPane
        initialSizes={[35, 65]}
        minSize={350}
        className="flex-1 overflow-hidden"
        resizerClassName="w-[1px] bg-[var(--border)] hover:bg-[var(--color-primary)] transition-colors cursor-col-resize"
      >
        {/* Chat Stream */}
        <div className="h-full flex flex-col bg-[var(--surface-1)]/50 backdrop-blur-sm relative">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            {/* Mensagem do usuário */}
            <div className="flex justify-end">
              <div className="max-w-[90%] bg-[var(--surface-3)] rounded-2xl rounded-tr-sm px-5 py-3 text-sm leading-relaxed shadow-sm border border-[var(--border)]">
                <p>Preciso analisar a performance de vendas. Crie um app React agora.</p>
              </div>
            </div>

            {/* Chain-of-Thought */}
            <AnimatePresence>
              {(thinkingState === 'thinking' || thinkingState === 'generating') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4 }}
                  className="overflow-hidden"
                >
                  <div className="border-l-2 border-[var(--color-primary)] pl-4 ml-2 space-y-2 py-2">
                    {CHAIN_STEPS.map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={prefersReducedMotion ? { duration: 0 } : { delay: i * 0.3 }}
                        className="flex items-center gap-2 text-xs font-mono text-[var(--text-tertiary)]"
                      >
                        {i === CHAIN_STEPS.length - 1 ? <span className="animate-spin">⟳</span> : <span>✓</span>}
                        {step}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Resposta com a11y reforçada */}
            {response && (
              <div className="flex justify-start">
                <div className="max-w-[95%]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                      AI
                    </div>
                    <span className="text-xs font-medium text-[var(--text-secondary)]">Synth Core</span>
                  </div>
                  <div
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    aria-busy={thinkingState === 'thinking' || thinkingState === 'generating'}
                    className="text-[var(--text-primary)] text-sm leading-relaxed"
                  >
                    <Typewriter words={[response]} cursor cursorStyle="|" typeSpeed={20} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl">
            <div className="relative flex items-end gap-2 bg-[var(--surface-2)] rounded-xl p-2 shadow-inner border border-[var(--border)] focus-within:border-[var(--color-primary)] focus-within:ring-1 focus-within:ring-[var(--color-primary)]/30 transition-all">
              <Button
                size="icon"
                variant="ghost"
                className={`rounded-lg h-10 w-10 shrink-0 text-[var(--text-secondary)] hover:text-[var(--color-primary)] ${thinkingState === 'listening' ? 'animate-pulse text-red-500' : ''}`}
                onMouseDown={() => setThinkingState('listening')}
                onMouseUp={() => setThinkingState('idle')}
                aria-label="Gravar áudio"
              >
                <Mic className="w-5 h-5" />
              </Button>

              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Comande a IA..."
                className="flex-1 bg-transparent outline-none text-sm min-h-[40px] max-h-[120px] py-2.5 resize-none placeholder:text-[var(--text-tertiary)] focus:ring-0"
                rows={1}
                aria-label="Campo de entrada para comando da IA"
              />

              <Button size="icon" variant="ghost" className="rounded-lg h-10 w-10 shrink-0 text-[var(--text-secondary)]" aria-label="Anexar arquivo">
                <Paperclip className="w-5 h-5" />
              </Button>

              <Button
                onClick={handleSend}
                size="icon"
                disabled={isSending}
                className="rounded-lg h-10 w-10 shrink-0 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-lg shadow-[var(--color-primary)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Enviar mensagem"
                data-testid="send-button"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-[10px] text-center mt-2 text-[var(--text-tertiary)] opacity-60">
              Pressione ⌘ + K para comandos • Enter para enviar
            </div>
          </div>
        </div>

        {/* Fabrication Hall */}
        <div className="h-full bg-[#050505] relative flex flex-col">
          <div className="h-10 border-b border-white/10 flex items-center justify-between px-4 bg-black/40">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[var(--text-secondary)]" />
              <span className="text-xs font-mono text-[var(--text-secondary)]">dashboard_v1.tsx</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className={`h-6 text-[10px] uppercase tracking-wider ${artifactView === 'preview' ? 'bg-[var(--color-primary)]/20' : ''}`}
                onClick={() => setArtifactView('preview')}
                aria-label="Visualizar preview"
                data-testid="artifact-preview-button"
              >
                Preview
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className={`h-6 text-[10px] uppercase tracking-wider ${artifactView === 'code' ? 'bg-[var(--color-primary)]/20' : ''}`}
                onClick={() => setArtifactView('code')}
                aria-label="Visualizar código"
                data-testid="artifact-code-button"
              >
                Code
              </Button>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {mode === 'app' ? (
                <motion.div
                  key="sandpack"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5 }}
                  className="h-full"
                >
                  <Suspense fallback={<div className="h-full flex items-center justify-center text-[var(--text-tertiary)]">Carregando Sandpack...</div>}>
                    <SafeBoundary>
                      <SandpackProvider
                        template="react-ts"
                        theme={alshamSandpackTheme}
                        files={{ '/App.tsx': GENERATED_CODE }}
                        options={{ externalResources: ['https://cdn.tailwindcss.com'] }}
                      >
                        <div className="h-full grid grid-rows-2 md:grid-rows-1 md:grid-cols-2">
                          {artifactView === 'code' ? (
                            <SandpackCodeEditor showTabs={false} showLineNumbers style={{ height: '100%' }} />
                          ) : (
                            <SandpackPreview showNavigator={false} style={{ height: '100%' }} />
                          )}
                        </div>
                      </SandpackProvider>
                    </SafeBoundary>
                  </Suspense>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4 }}
                  className="h-full flex flex-col items-center justify-center text-[var(--text-tertiary)]"
                >
                  <div className="w-24 h-24 rounded-full bg-[var(--surface-2)] flex items-center justify-center mb-4 animate-pulse">
                    <Layout className="w-10 h-10 opacity-50" />
                  </div>
                  <p>Aguardando geração de artefatos...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </SplitPane>
    </div>
  )
}
