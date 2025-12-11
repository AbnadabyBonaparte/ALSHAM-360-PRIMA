// src/pages/AIAssistant.tsx

import { SparklesIcon, PaperAirplaneIcon, MicrophoneIcon, StopIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';
import { useEffect, useState, useRef } from 'react';)

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
<div className="h-screen flex flex-col bg-[var(--background)]/30">
        {/* Header Supremo */}
        <div className="border-b border-[var(--border)] bg-gradient-to-r from-purple-900/30 via-pink-900/20 to-purple-900/30 backdrop-blur-2xl">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <SparklesIcon className="w-14 h-14 text-purple-400 animate-pulse" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  Citizen Supremo X.1
                </h1>
                <p className="text-green-400 text-lg">● Online • {orgName}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-400">Modelo: ALSHAM-GRAAL-v10</p>
              <p className="text-cyan-400 text-sm">Conexão 100% real-time</p>)
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

{/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-8 pb-32">
          <div className="max-w-5xl mx-auto space-y-6">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-3xl rounded-3xl px-8 py-6 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-[var(--text-primary)]'
                    : 'bg-gradient-to-r from-purple-900/70 to-pink-900/70 border border-purple-500/40 text-[var(--text-primary)]'
                }`}>
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs opacity-60 mt-3">
                    {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>)
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

{/* Input */}
        <div className="border-t border-[var(--border)] bg-gradient-to-t from-black/80 to-transparent backdrop-blur-2xl">
          <div className="max-w-5xl mx-auto p-6">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 px-6 py-5">
              <button
                onClick={() => setIsListening(!isListening)}
                className={`p-4 rounded-2xl transition-all ${isListening ? 'bg-red-600/40 border-red-500' : 'bg-white/10 hover:bg-white/20'} border`}
              >
                {isListening ? <StopIcon className="w-8 h-8 text-red-400" /> : <MicrophoneIcon className="w-8 h-8 text-primary" />}
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Fale com seu AI Supremo..."
                className="flex-1 bg-transparent outline-none text-[var(--text-primary)] text-lg placeholder-gray-500")
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
<PaperAirplaneIcon className="w-8 h-8 text-[var(--text-primary)] -rotate-45" />
              </button>
            </div>
          </div>
        </div>
      </div>
    
  );)
}
