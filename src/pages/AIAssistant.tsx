// src/pages/AIAssistant.tsx
// ALSHAM 360° PRIMA — AI Assistant
// CANÔNICO • TOKEN-FIRST • MULTI-TENANT READY • VOZ OPT-IN
// Importante: NÃO renderiza LayoutSupremo aqui. O shell é responsabilidade do ProtectedLayout.
// ✅ MIGRADO PARA CSS VARIABLES (chat interface customizada mantida)

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, Paperclip, BrainCircuit, Loader2, Volume2, X, ArrowLeft, Settings2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/supabase/useAuthStore'

type Role = 'user' | 'assistant'

interface Message {
  id: string
  role: Role
  content: string
  timestamp: string
  org_id?: string | null
  user_id?: string | null
}

type SpeechRecognitionConstructor = new () => SpeechRecognition

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

function uid(prefix = 'm') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`
}

function nowIso() {
  return new Date().toISOString()
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

const TABLE = 'ai_chat_history'
const LS_TTS_ENABLED = 'alsham.aiassistant.ttsEnabled'

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Olá. Sou o Assistente AI do ALSHAM 360° PRIMA.\n' +
    'Posso ajudar com análises, próximos passos e respostas rápidas com base no seu contexto.\n' +
    'Como posso ajudar agora?',
  timestamp: nowIso(),
  org_id: null,
  user_id: null,
}

export default function AIAssistant() {
  const navigate = useNavigate()

  // Auth/org canônico via store (sem inventar hooks)
  const { user, currentOrgId, loading, loadingAuth, loadingOrgs, isAuthenticated, init } = useAuthStore(state => ({
    user: (state as any).user ?? null,
    currentOrgId: (state as any).currentOrgId ?? null,
    loading: (state as any).loading ?? false,
    loadingAuth: (state as any).loadingAuth ?? false,
    loadingOrgs: (state as any).loadingOrgs ?? false,
    isAuthenticated: (state as any).isAuthenticated ?? false,
    init: (state as any).init as () => Promise<void>,
  }))

  const orgId = currentOrgId ?? null
  const userId = user?.id ?? null

  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')

  // TTS opt-in (persistido)
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LS_TTS_ENABLED) === '1'
    } catch {
      return false
    }
  })

  const [showPrefs, setShowPrefs] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const canSend = useMemo(() => Boolean(input.trim()) && !isLoading, [input, isLoading])

  // init guard
  useEffect(() => {
    init().catch(() => toast.error('Não foi possível inicializar o contexto de autenticação.'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Gate de auth (o shell geralmente já faz isso, mas mantemos fail-safe)
  useEffect(() => {
    if (loadingAuth) return
    if (!isAuthenticated) navigate('/precondition/BK_LOGIN', { replace: true })
  }, [isAuthenticated, loadingAuth, navigate])

  // Persist toggle
  useEffect(() => {
    try {
      localStorage.setItem(LS_TTS_ENABLED, ttsEnabled ? '1' : '0')
    } catch {
      // no-op
    }
  }, [ttsEnabled])

  // Autofocus suave (enterprise UX)
  useEffect(() => {
    const t = window.setTimeout(() => textareaRef.current?.focus(), 140)
    return () => window.clearTimeout(t)
  }, [])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent, scrollToBottom])

  // Auto-grow textarea (máx ~6 linhas)
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = '0px'
    const next = Math.min(el.scrollHeight, 6 * 28)
    el.style.height = `${Math.max(next, 28)}px`
  }, [input])

  // Cleanup STT/TTS/stream
  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort()
      } catch {
        // no-op
      } finally {
        recognitionRef.current = null
      }

      try {
        abortControllerRef.current?.abort()
      } catch {
        // no-op
      } finally {
        abortControllerRef.current = null
      }

      try {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel()
      } catch {
        // no-op
      }
    }
  }, [])

  // Load history + realtime (fail-soft)
  useEffect(() => {
    let isMounted = true
    let channel: any = null

    const loadHistory = async () => {
      if (!orgId) return
      try {
        const { data, error } = await supabase
          .from(TABLE)
          .select('*')
          .eq('org_id', orgId)
          .order('timestamp', { ascending: true })
          .limit(200)

        if (!isMounted) return
        if (error) return

        if (Array.isArray(data) && data.length) {
          const merged: Message[] = [
            WELCOME,
            ...data.map((m: any) => ({
              id: String(m.id ?? uid('h')),
              role: (m.role === 'user' ? 'user' : 'assistant') as Role,
              content: String(m.content ?? ''),
              timestamp: String(m.timestamp ?? nowIso()),
              org_id: m.org_id ?? orgId,
              user_id: m.user_id ?? null,
            })),
          ]

          const seen = new Set<string>()
          const uniq = merged.filter(m => {
            if (seen.has(m.id)) return false
            seen.add(m.id)
            return true
          })

          setMessages(uniq)
        }
      } catch {
        // fail-soft
      }
    }

    const subscribeRealtime = async () => {
      if (!orgId) return
      try {
        channel = supabase
          .channel('ai_chat_history_realtime')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: TABLE, filter: `org_id=eq.${orgId}` },
            (payload: any) => {
              if (!isMounted) return
              const n = payload?.new
              if (!n) return

              const normalized: Message = {
                id: String(n.id ?? uid('rt')),
                role: (n.role === 'user' ? 'user' : 'assistant') as Role,
                content: String(n.content ?? ''),
                timestamp: String(n.timestamp ?? nowIso()),
                org_id: n.org_id ?? orgId,
                user_id: n.user_id ?? null,
              }

              setMessages(prev => {
                if (prev.some(p => p.id === normalized.id)) return prev
                return [...prev, normalized]
              })
            }
          )
          .subscribe()
      } catch {
        // fail-soft
      }
    }

    loadHistory()
    subscribeRealtime()

    return () => {
      isMounted = false
      try {
        if (channel) supabase.removeChannel(channel)
      } catch {
        // no-op
      }
    }
  }, [orgId])

  // STT
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      toast.error('Seu navegador não suporta comando de voz.')
      return
    }

    try {
      recognitionRef.current?.abort()
    } catch {
      // no-op
    }

    const recognition = new SR()
    recognitionRef.current = recognition

    recognition.lang = 'pt-BR'
    recognition.continuous = false
    recognition.interimResults = true

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = Array.from(e.results)
        .map(r => r[0]?.transcript ?? '')
        .join('')
        .trim()
      if (transcript) setInput(transcript)
    }

    recognition.onerror = () => {
      toast.error('Erro no reconhecimento de voz')
      setIsListening(false)
    }

    try {
      recognition.start()
    } catch {
      toast.error('Não foi possível iniciar o microfone agora.')
      setIsListening(false)
    }
  }, [])

  // TTS (opt-in)
  const stopSpeaking = useCallback(() => {
    try {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    } catch {
      // no-op
    } finally {
      setIsSpeaking(false)
    }
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (!ttsEnabled) return
      if (!text?.trim()) return
      if (!('speechSynthesis' in window)) return

      try {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'pt-BR'
        utterance.rate = 0.98
        utterance.pitch = 1
        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)
        window.speechSynthesis.speak(utterance)
      } catch {
        setIsSpeaking(false)
      }
    },
    [ttsEnabled]
  )

  // Falar on-demand (mesmo com TTS desativado)
  const speakOnce = useCallback((text: string) => {
    if (!text?.trim()) return
    if (!('speechSynthesis' in window)) return

    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'pt-BR'
      utterance.rate = 0.98
      utterance.pitch = 1
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    } catch {
      setIsSpeaking(false)
    }
  }, [])

  // Persist fail-soft
  const tryInsert = useCallback(
    async (msg: Message) => {
      if (!orgId) return
      try {
        await supabase.from(TABLE).insert({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          org_id: orgId,
          user_id: msg.user_id ?? null,
        })
      } catch {
        // fail-soft
      }
    },
    [orgId]
  )

  // Streaming opcional (fallback automático)
  const callAssistant = useCallback(
    async (prompt: string) => {
      const endpoint = '/api/graal-v10'

      abortControllerRef.current?.abort()
      const controller = new AbortController()
      abortControllerRef.current = controller

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, org_id: orgId }),
          signal: controller.signal,
        })

        if (!response.ok || !response.body) throw new Error('no-stream')

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        let acc = ''
        setStreamingContent('')

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          acc += chunk
          setStreamingContent(acc)
        }

        return acc.trim()
      } catch (err: any) {
        if (err?.name === 'AbortError') throw err

        return (
          `Entendido.\n\n` +
          `Analisando: "${prompt}".\n\n` +
          `Sugestão operacional: descreva seu objetivo (ex.: "aumentar conversão", "qualificar leads", "reduzir churn") e eu retorno com um plano prático.`
        )
      } finally {
        setStreamingContent('')
      }
    },
    [orgId]
  )

  const handleSend = useCallback(async () => {
    if (!canSend) return

    if (loading || loadingOrgs) {
      toast('Carregando contexto…', { icon: '⏳' })
      return
    }

    const localOnly = !orgId
    const text = input.trim()

    const userMsg: Message = {
      id: uid('u'),
      role: 'user',
      content: text,
      timestamp: nowIso(),
      org_id: orgId,
      user_id: userId,
    }

    setMessages(prev => (prev.some(m => m.id === userMsg.id) ? prev : [...prev, userMsg]))
    setInput('')
    setIsLoading(true)

    if (!localOnly) await tryInsert(userMsg)

    try {
      const aiText = await callAssistant(text)

      const aiMsg: Message = {
        id: uid('a'),
        role: 'assistant',
        content: aiText,
        timestamp: nowIso(),
        org_id: orgId,
        user_id: null,
      }

      setMessages(prev => (prev.some(m => m.id === aiMsg.id) ? prev : [...prev, aiMsg]))
      if (!localOnly) await tryInsert(aiMsg)

      // Só fala automaticamente se o usuário habilitou voz
      speak(aiText)
    } catch (err: any) {
      if (err?.name !== 'AbortError') toast.error('Erro na comunicação com o assistente.')
    } finally {
      setIsLoading(false)
    }
  }, [canSend, input, loading, loadingOrgs, orgId, userId, tryInsert, callAssistant, speak])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  // Quick prompts (enterprise)
  const applyPrompt = useCallback((text: string) => {
    setInput(text)
    window.setTimeout(() => textareaRef.current?.focus(), 0)
  }, [])

  const openOrgSelector = () => navigate('/select-organization')
  const goBack = () => navigate(-1)

  // Conteúdo interno (o shell/Sidebar é externo)
  return (
    <div className="relative w-full">
      {/* Fundo token-first (somente dentro do content area) */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[32px]"
        style={{
          background:
            'radial-gradient(1400px 900px at 15% 10%, color-mix(in oklab, var(--accent-1, #a855f7) 18%, transparent) 0%, transparent 60%),' +
            'radial-gradient(1200px 800px at 85% 5%, color-mix(in oklab, var(--accent-2, #22c55e) 14%, transparent) 0%, transparent 55%),' +
            'linear-gradient(135deg, color-mix(in oklab, var(--background) 92%, black) 0%, var(--background) 55%, color-mix(in oklab, var(--background) 88%, black) 100%)',
          opacity: 0.9,
        }}
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-6 md:px-8 md:py-8">
        {/* Top Bar */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goBack}
              className="rounded-xl border p-2 transition hover:opacity-90"
              style={{
                borderColor: 'color-mix(in oklab, var(--foreground, #fff) 14%, transparent)',
                background: 'color-mix(in oklab, var(--surface, var(--background)) 70%, transparent)',
              }}
              aria-label="Voltar"
            >
              <ArrowLeft className="h-5 w-5" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 80%, transparent)' }} />
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
                AI Assistant
              </h1>
              <p className="mt-1 text-xs md:text-sm" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 65%, transparent)' }}>
                Suporte operacional • Contexto por organização • Histórico e tempo real (quando disponível)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[11px]" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 55%, transparent)' }}>
                Contexto
              </p>
              <p className="text-sm font-semibold" style={{ color: 'var(--accent-2, #22c55e)' }}>
                {orgId ? 'ORG OK' : 'ORG AUSENTE'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowPrefs(v => !v)}
              className="rounded-xl border p-2 transition hover:opacity-90"
              style={{
                borderColor: 'color-mix(in oklab, var(--foreground, #fff) 14%, transparent)',
                background: 'color-mix(in oklab, var(--surface, var(--background)) 70%, transparent)',
              }}
              aria-label="Preferências"
            >
              <Settings2 className="h-5 w-5" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 80%, transparent)' }} />
            </button>
          </div>
        </div>

        {/* Preferências */}
        <AnimatePresence>
          {showPrefs && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 overflow-hidden rounded-3xl border"
              style={{
                borderColor: 'color-mix(in oklab, var(--foreground, #fff) 12%, transparent)',
                background: 'color-mix(in oklab, var(--surface, var(--background)) 70%, transparent)',
              }}
            >
              <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between md:p-5">
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground, var(--text))' }}>
                    Preferências do Assistente
                  </p>
                  <p className="text-xs" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 60%, transparent)' }}>
                    Leitura em voz alta é opcional. Quando ativada, o assistente pode ler respostas automaticamente.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTtsEnabled(v => !v)}
                    className="rounded-xl border px-4 py-2 text-sm font-semibold transition hover:opacity-90"
                    style={{
                      borderColor: 'color-mix(in oklab, var(--foreground, #fff) 14%, transparent)',
                      background: ttsEnabled
                        ? 'linear-gradient(90deg, color-mix(in oklab, var(--accent-2, #22c55e) 28%, transparent), color-mix(in oklab, var(--accent-1, #a855f7) 18%, transparent))'
                        : 'color-mix(in oklab, var(--background) 55%, transparent)',
                    }}
                  >
                    Voz: {ttsEnabled ? 'Ativada' : 'Desativada'}
                  </button>

                  {!orgId && !loading && !loadingOrgs && (
                    <button
                      type="button"
                      onClick={openOrgSelector}
                      className="rounded-xl border px-4 py-2 text-sm font-semibold transition hover:opacity-90"
                      style={{
                        borderColor: 'color-mix(in oklab, var(--foreground, #fff) 14%, transparent)',
                        background:
                          'linear-gradient(90deg, color-mix(in oklab, var(--accent-1, #a855f7) 18%, transparent), color-mix(in oklab, var(--accent-2, #22c55e) 14%, transparent))',
                      }}
                    >
                      Selecionar organização
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat container */}
        <div className="relative overflow-hidden rounded-3xl border" style={{ borderColor: 'color-mix(in oklab, var(--foreground, #fff) 10%, transparent)' }}>
          <div className="max-h-[62vh] overflow-y-auto px-4 py-5 md:px-6 md:py-6">
            <div className="space-y-5 md:space-y-6">
              <AnimatePresence initial={false}>
                {messages.map(msg => {
                  const isAssistant = msg.role === 'assistant'
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 12, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ type: 'spring', damping: 24, stiffness: 260 }}
                      className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className="w-full max-w-3xl">
                        <div
                          className="relative overflow-hidden rounded-3xl border p-5 md:p-6"
                          style={{
                            borderColor: isAssistant
                              ? 'color-mix(in oklab, var(--accent-1, #a855f7) 35%, transparent)'
                              : 'color-mix(in oklab, var(--accent-2, #22c55e) 30%, transparent)',
                            background: isAssistant
                              ? 'linear-gradient(135deg, color-mix(in oklab, var(--accent-1, #a855f7) 14%, transparent), color-mix(in oklab, var(--surface, var(--background)) 70%, transparent))'
                              : 'linear-gradient(135deg, color-mix(in oklab, var(--accent-2, #22c55e) 12%, transparent), color-mix(in oklab, var(--surface, var(--background)) 70%, transparent))',
                            boxShadow: '0 14px 40px color-mix(in oklab, black 35%, transparent)',
                          }}
                        >
                          <p className="whitespace-pre-wrap text-base leading-relaxed md:text-lg" style={{ color: 'var(--foreground, var(--text))' }}>
                            {msg.content}
                          </p>

                          <div className="mt-4 flex items-center justify-between gap-3">
                            <p className="text-xs" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 45%, transparent)' }}>
                              {formatTime(msg.timestamp)}
                            </p>

                            {isAssistant && (
                              <div className="flex items-center gap-2">
                                {isSpeaking ? (
                                  <button
                                    type="button"
                                    aria-label="Parar fala"
                                    onClick={stopSpeaking}
                                    className="rounded-xl border p-2 transition"
                                    style={{ borderColor: 'color-mix(in oklab, var(--foreground, #fff) 14%, transparent)' }}
                                  >
                                    <X className="h-4 w-4" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 70%, transparent)' }} />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    aria-label="Ouvir resposta"
                                    onClick={() => speakOnce(msg.content)}
                                    className="rounded-xl border p-2 transition"
                                    style={{ borderColor: 'color-mix(in oklab, var(--foreground, #fff) 14%, transparent)' }}
                                  >
                                    <Volume2 className="h-4 w-4" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 70%, transparent)' }} />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              {!!streamingContent && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div
                    className="relative max-w-3xl overflow-hidden rounded-3xl border p-5 md:p-6"
                    style={{
                      borderColor: 'color-mix(in oklab, var(--accent-1, #a855f7) 35%, transparent)',
                      background:
                        'linear-gradient(135deg, color-mix(in oklab, var(--accent-1, #a855f7) 14%, transparent), color-mix(in oklab, var(--surface, var(--background)) 70%, transparent))',
                    }}
                  >
                    <p className="whitespace-pre-wrap text-base leading-relaxed md:text-lg" style={{ color: 'var(--foreground, var(--text))' }}>
                      {streamingContent}
                    </p>
                  </div>
                </motion.div>
              )}

              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div
                    className="flex items-center gap-3 rounded-3xl border px-5 py-4"
                    style={{
                      borderColor: 'color-mix(in oklab, var(--accent-1, #a855f7) 35%, transparent)',
                      background:
                        'linear-gradient(135deg, color-mix(in oklab, var(--accent-1, #a855f7) 14%, transparent), color-mix(in oklab, var(--surface, var(--background)) 70%, transparent))',
                    }}
                  >
                    <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--accent-1, #a855f7)' }} />
                    <p className="text-sm md:text-base" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 78%, transparent)' }}>
                      Processando…
                    </p>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick prompts */}
          <div className="border-t px-4 pb-3 pt-4 md:px-6" style={{ borderColor: 'color-mix(in oklab, var(--foreground, #fff) 10%, transparent)' }}>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Resumir pipeline', text: 'Resuma o pipeline de vendas e indique gargalos.' },
                { label: 'Priorizar leads', text: 'Priorize os leads com maior probabilidade de conversão e explique o critério.' },
                { label: 'Próximos passos', text: 'Gere próximos passos operacionais para hoje, com checklist.' },
                { label: 'Diagnóstico', text: 'Faça um diagnóstico rápido de conversão e sugira 3 melhorias.' },
              ].map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPrompt(p.text)}
                  className="rounded-full border px-3 py-1 text-xs font-semibold transition hover:opacity-90 md:text-sm"
                  style={{
                    borderColor: 'color-mix(in oklab, var(--foreground, #fff) 14%, transparent)',
                    background: 'color-mix(in oklab, var(--surface, var(--background)) 70%, transparent)',
                    color: 'color-mix(in oklab, var(--foreground, #fff) 80%, transparent)',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div
            className="border-t p-4 md:p-5"
            style={{
              borderColor: 'var(--border, color-mix(in oklab, var(--foreground, #fff) 10%, transparent))',
              background: 'color-mix(in oklab, var(--surface, var(--background)) 70%, transparent)',
              backdropFilter: 'blur(18px)',
            }}
          >
            <div
              className="flex items-end gap-3 rounded-3xl border p-4 md:gap-4 md:p-5"
              style={{
                borderColor: 'color-mix(in oklab, var(--accent-1, #a855f7) 28%, transparent)',
                background: 'color-mix(in oklab, var(--background) 55%, transparent)',
                boxShadow: '0 18px 55px color-mix(in oklab, black 32%, transparent)',
              }}
            >
              <button
                type="button"
                onClick={startListening}
                aria-label={isListening ? 'Microfone ativo' : 'Iniciar comando de voz'}
                className="rounded-2xl p-3 transition"
                style={{
                  background: isListening ? 'color-mix(in oklab, var(--accent-2, #22c55e) 20%, transparent)' : 'transparent',
                  border: '1px solid color-mix(in oklab, var(--foreground, #fff) 10%, transparent)',
                }}
              >
                <Mic
                  className="h-6 w-6"
                  style={{
                    color: isListening ? 'var(--accent-2, #22c55e)' : 'color-mix(in oklab, var(--foreground, #fff) 70%, transparent)',
                  }}
                />
              </button>

              <button
                type="button"
                aria-label="Anexar arquivo (placeholder)"
                onClick={() => toast('Anexos: em breve.', { icon: '📎' })}
                className="rounded-2xl p-3 transition"
                style={{
                  border: '1px solid color-mix(in oklab, var(--foreground, #fff) 10%, transparent)',
                }}
              >
                <Paperclip className="h-6 w-6" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 70%, transparent)' }} />
              </button>

              <div className="flex-1">
                <label className="sr-only" htmlFor="aiassistant-input">
                  Mensagem para o assistente
                </label>

                <textarea
                  ref={textareaRef}
                  id="aiassistant-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua solicitação… (Enter envia, Shift+Enter quebra linha)"
                  rows={1}
                  className="w-full resize-none bg-transparent text-base outline-none md:text-lg"
                  style={{
                    color: 'var(--foreground, var(--text))',
                    caretColor: 'var(--accent-1, #a855f7)',
                    lineHeight: '28px',
                  }}
                />

                <p className="mt-1 text-xs" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 45%, transparent)' }}>
                  Enter envia • Shift+Enter quebra linha
                </p>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSend}
                disabled={!canSend}
                aria-label="Enviar mensagem"
                className="rounded-3xl p-4 disabled:opacity-50"
                style={{
                  background: 'linear-gradient(90deg, var(--accent-1, #a855f7), var(--accent-2, #22c55e))',
                  boxShadow: '0 16px 45px color-mix(in oklab, var(--accent-1, #a855f7) 18%, transparent)',
                  border: '1px solid color-mix(in oklab, white 10%, transparent)',
                }}
              >
                <Send className="h-6 w-6" style={{ color: 'var(--background)' }} />
              </motion.button>
            </div>
          </div>
        </div>

        {!orgId && !loading && !loadingOrgs && (
          <div className="mt-4 text-xs" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 55%, transparent)' }}>
            Observação: sem organização selecionada, o assistente opera em modo local (sem histórico/realtime).
          </div>
        )}
      </div>
    </div>
  )
}
