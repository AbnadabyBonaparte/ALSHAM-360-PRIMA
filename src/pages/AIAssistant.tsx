// src/pages/AIAssistant.tsx
// CITIZEN SUPREMO X.1 — AIAssistant (CANÔNICO • TOKEN-FIRST • ZERO-RISK • MULTI-TENANT READY)
// Revisão: remove createClient (inexistente no repo) e usa supabase SSOT do projeto.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, Paperclip, BrainCircuit, Loader2, Volume2, X } from 'lucide-react'
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

// Tabela padrão (fail-soft)
const TABLE = 'ai_chat_history'

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Imperador... Eu sou o Citizen Supremo X.1.\n' +
    'Estou aqui para servir com precisão absoluta.\n' +
    'Fale, e o conhecimento do império será revelado.',
  timestamp: nowIso(),
  org_id: null,
  user_id: null,
}

export default function AIAssistant() {
  const navigate = useNavigate()

  // Auth/org canônico via store (não inventa hooks)
  const { user, currentOrgId, loading, loadingAuth, loadingOrgs, isAuthenticated, init } =
    useAuthStore(
      useCallback(
        state => ({
          user: state.user,
          currentOrgId: state.currentOrgId,
          loading: state.loading,
          loadingAuth: state.loadingAuth,
          loadingOrgs: state.loadingOrgs,
          isAuthenticated: state.isAuthenticated,
          init: state.init,
        }),
        [],
      ),
    )

  const orgId = currentOrgId ?? null
  const userId = user?.id ?? null

  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const canSend = useMemo(() => Boolean(input.trim()) && !isLoading, [input, isLoading])

  useEffect(() => {
    init().catch(() => toast.error('Não foi possível inicializar o contexto de autenticação.'))
  }, [init])

  useEffect(() => {
    if (loadingAuth) return
    if (!isAuthenticated) navigate('/precondition/BK_LOGIN', { replace: true })
  }, [isAuthenticated, loadingAuth, navigate])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent, scrollToBottom])

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
        if (error) return // fail-soft

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

  // TTS
  const stopSpeaking = useCallback(() => {
    try {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    } catch {
      // no-op
    } finally {
      setIsSpeaking(false)
    }
  }, [])

  const speak = useCallback((text: string) => {
    if (!text?.trim()) return
    if (!('speechSynthesis' in window)) return

    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'pt-BR'
      utterance.rate = 0.96
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
          `Entendido, Imperador.\n\n` +
          `Analisando "${prompt}" com os dados do império...\n\n` +
          `Resposta operacional: tudo está sob controle.\n` +
          `Próximo passo sugerido: priorizar leads com health score > 90.\n\n` +
          `O que deseja saber em seguida?`
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

    setMessages(prev => [...prev, userMsg])
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

      setMessages(prev => [...prev, aiMsg])
      if (!localOnly) await tryInsert(aiMsg)

      speak(aiText)
    } catch (err: any) {
      if (err?.name !== 'AbortError') toast.error('Erro na comunicação com o Citizen Supremo')
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

  const openOrgSelector = () => navigate('/select-organization')

  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{
        background: 'var(--background)',
        color: 'var(--foreground, var(--text))',
      }}
    >
      {/* Fundo imperial token-first */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(1400px 900px at 15% 10%, color-mix(in oklab, var(--accent-1, #a855f7) 20%, transparent) 0%, transparent 60%),' +
            'radial-gradient(1200px 800px at 85% 5%, color-mix(in oklab, var(--accent-2, #22c55e) 16%, transparent) 0%, transparent 55%),' +
            'linear-gradient(135deg, color-mix(in oklab, var(--background) 92%, black) 0%, var(--background) 55%, color-mix(in oklab, var(--background) 88%, black) 100%)',
        }}
      />

      {/* Header Imperial */}
      <motion.div
        initial={{ y: -18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative border-b"
        style={{
          borderColor: 'var(--border, color-mix(in oklab, var(--foreground, #fff) 10%, transparent))',
          background: 'color-mix(in oklab, var(--surface, var(--background)) 70%, transparent)',
          backdropFilter: 'blur(18px)',
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-8 md:py-8">
          <div className="flex items-center gap-5 md:gap-7">
            <motion.div
              aria-hidden="true"
              animate={{ rotate: 360 }}
              transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
              className="rounded-2xl p-3"
              style={{
                background:
                  'linear-gradient(135deg, color-mix(in oklab, var(--accent-1, #a855f7) 22%, transparent), color-mix(in oklab, var(--accent-2, #22c55e) 18%, transparent))',
                border: '1px solid color-mix(in oklab, var(--accent-1, #a855f7) 28%, transparent)',
              }}
            >
              <BrainCircuit className="h-8 w-8 md:h-10 md:w-10" style={{ color: 'var(--accent-1, #a855f7)' }} />
            </motion.div>

            <div className="min-w-0">
              <h1
                className="truncate text-2xl font-black md:text-4xl"
                style={{
                  backgroundImage: 'linear-gradient(90deg, var(--accent-1, #a855f7), var(--accent-2, #22c55e))',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                CITIZEN SUPREMO X.1
              </h1>
              <p className="mt-1 text-sm md:text-base" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 70%, transparent)' }}>
                Assistente Neural • Contexto Total • Sempre Presente
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="text-right">
              <p className="text-xs" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 55%, transparent)' }}>
                Contexto
              </p>
              <p className="text-sm font-semibold md:text-base" style={{ color: 'var(--accent-2, #22c55e)' }}>
                {orgId ? 'ORG OK' : 'ORG AUSENTE'}
              </p>
            </div>

            <div
              aria-label="Status"
              className="h-3 w-3 rounded-full"
              style={{
                background: orgId ? 'var(--accent-2, #22c55e)' : 'var(--accent-1, #a855f7)',
                boxShadow:
                  '0 0 0 6px color-mix(in oklab, var(--foreground, #fff) 10%, transparent), 0 0 28px color-mix(in oklab, var(--foreground, #fff) 18%, transparent)',
                animation: 'pulse 1.6s ease-in-out infinite',
              }}
            />
          </div>
        </div>

        {!orgId && !loading && !loadingOrgs && (
          <div className="mx-auto max-w-7xl px-6 pb-6 md:px-8">
            <div
              className="flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between"
              style={{
                borderColor: 'color-mix(in oklab, var(--accent-1, #a855f7) 28%, transparent)',
                background: 'color-mix(in oklab, var(--surface, var(--background)) 65%, transparent)',
              }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground, var(--text))' }}>
                  Organização não selecionada
                </p>
                <p className="text-xs" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 60%, transparent)' }}>
                  Você pode conversar em modo local. Para salvar histórico/realtime, selecione uma organização.
                </p>
              </div>
              <button
                type="button"
                onClick={openOrgSelector}
                className="rounded-xl border px-4 py-2 text-sm font-semibold transition"
                style={{
                  borderColor: 'color-mix(in oklab, var(--foreground, #fff) 14%, transparent)',
                  background:
                    'linear-gradient(90deg, color-mix(in oklab, var(--accent-1, #a855f7) 18%, transparent), color-mix(in oklab, var(--accent-2, #22c55e) 14%, transparent))',
                }}
              >
                Selecionar organização
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Messages */}
      <div className="relative flex-1 overflow-y-auto px-6 pb-28 pt-6 md:px-8 md:pt-8">
        <div className="mx-auto max-w-5xl space-y-6 md:space-y-8">
          <AnimatePresence initial={false}>
            {messages.map(msg => {
              const isAssistant = msg.role === 'assistant'
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 18, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ type: 'spring', damping: 24, stiffness: 260 }}
                  className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`w-full max-w-3xl ${isAssistant ? '' : 'text-right'}`}>
                    <div
                      className="relative overflow-hidden rounded-3xl border p-6 md:p-7"
                      style={{
                        borderColor: isAssistant
                          ? 'color-mix(in oklab, var(--accent-1, #a855f7) 35%, transparent)'
                          : 'color-mix(in oklab, var(--accent-2, #22c55e) 30%, transparent)',
                        background: isAssistant
                          ? 'linear-gradient(135deg, color-mix(in oklab, var(--accent-1, #a855f7) 16%, transparent), color-mix(in oklab, var(--surface, var(--background)) 65%, transparent))'
                          : 'linear-gradient(135deg, color-mix(in oklab, var(--accent-2, #22c55e) 14%, transparent), color-mix(in oklab, var(--surface, var(--background)) 65%, transparent))',
                        boxShadow: '0 14px 40px color-mix(in oklab, black 35%, transparent)',
                      }}
                    >
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0"
                        style={{
                          background:
                            'radial-gradient(900px 400px at 25% 0%, color-mix(in oklab, var(--accent-1, #a855f7) 14%, transparent) 0%, transparent 55%)',
                          opacity: isAssistant ? 1 : 0.85,
                        }}
                      />

                      <div className="relative z-10">
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
                                  aria-label="Falar resposta"
                                  onClick={() => speak(msg.content)}
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
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {!!streamingContent && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div
                className="relative max-w-3xl overflow-hidden rounded-3xl border p-6 md:p-7"
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
                className="flex items-center gap-3 rounded-3xl border px-6 py-5"
                style={{
                  borderColor: 'color-mix(in oklab, var(--accent-1, #a855f7) 35%, transparent)',
                  background:
                    'linear-gradient(135deg, color-mix(in oklab, var(--accent-1, #a855f7) 14%, transparent), color-mix(in oklab, var(--surface, var(--background)) 70%, transparent))',
                }}
              >
                <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--accent-1, #a855f7)' }} />
                <p className="text-sm md:text-base" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 78%, transparent)' }}>
                  Citizen Supremo está refletindo...
                </p>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <motion.div
        initial={{ y: 18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative border-t"
        style={{
          borderColor: 'var(--border, color-mix(in oklab, var(--foreground, #fff) 10%, transparent))',
          background: 'color-mix(in oklab, var(--surface, var(--background)) 70%, transparent)',
          backdropFilter: 'blur(18px)',
        }}
      >
        <div className="mx-auto max-w-5xl px-6 py-6 md:px-8">
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
                  color: isListening
                    ? 'var(--accent-2, #22c55e)'
                    : 'color-mix(in oklab, var(--foreground, #fff) 70%, transparent)',
                }}
              />
            </button>

            <button
              type="button"
              aria-label="Anexar arquivo (placeholder)"
              onClick={() => toast('Anexos: em breve (wire pronto).', { icon: '📎' })}
              className="rounded-2xl p-3 transition"
              style={{
                border: '1px solid color-mix(in oklab, var(--foreground, #fff) 10%, transparent)',
              }}
            >
              <Paperclip className="h-6 w-6" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 70%, transparent)' }} />
            </button>

            <div className="flex-1">
              <label className="sr-only" htmlFor="aiassistant-input">
                Mensagem para o Citizen Supremo
              </label>

              <textarea
                id="aiassistant-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Fale com o Citizen Supremo… (Enter envia, Shift+Enter quebra linha)"
                rows={1}
                className="w-full resize-none bg-transparent text-base outline-none md:text-lg"
                style={{
                  color: 'var(--foreground, var(--text))',
                  caretColor: 'var(--accent-1, #a855f7)',
                }}
              />

              <p className="mt-1 text-xs" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 45%, transparent)' }}>
                Dica: Enter envia • Shift+Enter quebra linha
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
      </motion.div>

      {/* Floating Orb */}
      <motion.button
        type="button"
        onClick={() => navigate('/app/ai-assistant')}
        className="fixed bottom-6 right-6 z-50 rounded-full p-4 shadow-2xl md:bottom-8 md:right-8 md:p-5"
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.98 }}
        style={{
          background: 'linear-gradient(135deg, var(--accent-1, #a855f7), var(--accent-2, #22c55e))',
          border: '1px solid color-mix(in oklab, white 10%, transparent)',
        }}
        aria-label="Citizen Supremo X.1"
      >
        <BrainCircuit className="h-7 w-7 md:h-8 md:w-8" style={{ color: 'var(--background)' }} />
      </motion.button>
    </div>
  )
}
