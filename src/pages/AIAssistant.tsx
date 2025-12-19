// src/pages/AIAssistant.tsx
// CITIZEN SUPREMO X.1 — AIAssistant (Auditado • Token-first • Robust • Zero-risk)
// Assistente pessoal sempre presente • Voz (STT) • Chat • UI premium baseada em CSS vars

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, Paperclip, BrainCircuit, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

type Role = 'user' | 'assistant'

interface Message {
  id: string
  role: Role
  content: string
  timestamp: Date
}

/**
 * SpeechRecognition typing (evita ts-ignore)
 * Compatível com Chrome (webkitSpeechRecognition) e implementações padrão.
 */
type SpeechRecognitionConstructor = new () => SpeechRecognition

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

function uid(prefix = 'm') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function formatTime(d: Date) {
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Imperador... Eu sou o Citizen Supremo X.1.\nEstou aqui para servir com precisão absoluta.\nFale, e o conhecimento do império será revelado.',
      timestamp: new Date(),
    },
  ])

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const canSend = useMemo(() => Boolean(input.trim()) && !isLoading, [input, isLoading])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // cleanup: encerra reconhecimento ao desmontar
    return () => {
      try {
        recognitionRef.current?.abort()
      } catch {
        // no-op
      } finally {
        recognitionRef.current = null
      }
    }
  }, [])

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      toast.error('Seu navegador não suporta comando de voz.')
      return
    }

    try {
      // evita múltiplas instâncias concorrentes
      recognitionRef.current?.abort()
    } catch {
      // no-op
    }

    const recognition = new SR()
    recognitionRef.current = recognition

    recognition.lang = 'pt-BR'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? ''
      if (transcript.trim()) setInput(transcript.trim())
    }

    recognition.onerror = () => {
      toast.error('Erro no reconhecimento de voz')
      setIsListening(false)
    }

    try {
      recognition.start()
    } catch {
      // alguns browsers lançam erro se chamar start repetidamente
      toast.error('Não foi possível iniciar o microfone agora.')
      setIsListening(false)
    }
  }

  const simulateResponse = (userText: string) => {
    // Simulação segura (substitua por API quando pronta)
    window.setTimeout(() => {
      const aiResponse: Message = {
        id: uid('a'),
        role: 'assistant',
        content:
          `Entendido, Imperador.\n\nAnalisando "${userText}" com os dados do império...\n\n` +
          `Resposta em tempo real: tudo está sob controle.\n` +
          `Próximo passo sugerido: priorizar leads com health score > 90.\n\n` +
          `O que deseja saber em seguida?`,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
    }, 1200)
  }

  const handleSend = async () => {
    if (!canSend) return

    const text = input.trim()
    const userMessage: Message = {
      id: uid('u'),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // futura integração: chamar API (Edge Function / endpoint) aqui
    simulateResponse(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter envia; Shift+Enter quebra linha
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      className="relative flex min-h-[calc(100vh-0px)] flex-col overflow-hidden"
      style={{
        background: 'var(--background)',
        color: 'var(--foreground, var(--text))',
      }}
    >
      {/* Fundo sutil (token-first) */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(1200px 800px at 15% 10%, color-mix(in oklab, var(--accent-1, #a855f7) 20%, transparent) 0%, transparent 60%),' +
            'radial-gradient(1200px 800px at 85% 0%, color-mix(in oklab, var(--accent-2, #22c55e) 16%, transparent) 0%, transparent 55%),' +
            'linear-gradient(135deg, color-mix(in oklab, var(--background) 92%, black) 0%, var(--background) 55%, color-mix(in oklab, var(--background) 88%, black) 100%)',
          opacity: 1,
        }}
      />

      {/* Header */}
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
              <BrainCircuit
                className="h-8 w-8 md:h-10 md:w-10"
                style={{ color: 'var(--accent-1, #a855f7)' }}
              />
            </motion.div>

            <div className="min-w-0">
              <h1
                className="truncate text-2xl font-black md:text-4xl"
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, var(--accent-1, #a855f7), var(--accent-2, #22c55e))',
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
                Modelo ativo
              </p>
              <p className="text-lg font-bold md:text-xl" style={{ color: 'var(--accent-2, #22c55e)' }}>
                GRAAL v10
              </p>
            </div>

            <div
              aria-label="Status online"
              className="h-3 w-3 rounded-full"
              style={{
                background: 'var(--accent-2, #22c55e)',
                boxShadow:
                  '0 0 0 6px color-mix(in oklab, var(--accent-2, #22c55e) 12%, transparent), 0 0 28px color-mix(in oklab, var(--accent-2, #22c55e) 35%, transparent)',
                animation: 'pulse 1.6s ease-in-out infinite',
              }}
            />
          </div>
        </div>
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
                          : 'linear-gradient(135deg, color-mix(in oklab, var(--accent-2, #22c55e) 16%, transparent), color-mix(in oklab, var(--surface, var(--background)) 65%, transparent))',
                        boxShadow:
                          '0 14px 40px color-mix(in oklab, black 35%, transparent)',
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
                        <p
                          className="whitespace-pre-wrap text-base leading-relaxed md:text-lg"
                          style={{ color: 'var(--foreground, var(--text))' }}
                        >
                          {msg.content}
                        </p>

                        <p
                          className="mt-4 text-xs"
                          style={{
                            color: 'color-mix(in oklab, var(--foreground, #fff) 45%, transparent)',
                          }}
                        >
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

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
                <p
                  className="text-sm md:text-base"
                  style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 78%, transparent)' }}
                >
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
              boxShadow:
                '0 18px 55px color-mix(in oklab, black 32%, transparent)',
            }}
          >
            <button
              type="button"
              onClick={startListening}
              aria-label={isListening ? 'Parar comando de voz' : 'Iniciar comando de voz'}
              className="rounded-2xl p-3 transition"
              style={{
                background: isListening
                  ? 'color-mix(in oklab, var(--accent-2, #22c55e) 20%, transparent)'
                  : 'transparent',
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
              onClick={() => toast('Anexos: em breve (wire pronto).', { icon: '📎' })}
              className="rounded-2xl p-3 transition"
              style={{
                border: '1px solid color-mix(in oklab, var(--foreground, #fff) 10%, transparent)',
              }}
            >
              <Paperclip
                className="h-6 w-6"
                style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 70%, transparent)' }}
              />
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
                background:
                  'linear-gradient(90deg, var(--accent-1, #a855f7), var(--accent-2, #22c55e))',
                boxShadow:
                  '0 16px 45px color-mix(in oklab, var(--accent-1, #a855f7) 18%, transparent)',
                border: '1px solid color-mix(in oklab, white 10%, transparent)',
              }}
            >
              <Send className="h-6 w-6" style={{ color: 'var(--background)' }} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
