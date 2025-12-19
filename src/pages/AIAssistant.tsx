// src/pages/AIAssistant.tsx
// CITIZEN SUPREMO X.1 — VERSÃO SUPREMA 1000/1000
// Assistente pessoal sempre presente • Design imperial • Voz • Realtime • Poder útil diário

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Loader2, Mic, Paperclip, BrainCircuit } from 'lucide-react';
import toast from 'react-hot-toast';

type Role = 'user' | 'assistant';

interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Imperador... Eu sou o Citizen Supremo X.1.\nEstou aqui para servir com precisão absoluta.\nFale, e o conhecimento do império será revelado.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Voice input (speech to text)
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Seu navegador não suporta comando de voz.');
      return;
    }

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.onerror = () => {
      toast.error('Erro no reconhecimento de voz');
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulação de resposta real (substitua por chamada à API quando pronta)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Entendido, Imperador.\n\nAnalisando "${userMessage.content}" com os dados do império...\n\nResposta em tempo real: tudo está sob controle. Próximo passo sugerido: priorizar leads com health score > 90.\n\nO que deseja saber em seguida?`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--background)] text-[var(--text)] overflow-hidden relative">
      {/* Fundo cósmico sutil */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/10 via-[var(--background)] to-emerald-900/10 pointer-events-none" />

      {/* Header Imperial */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-[var(--border)] bg-[var(--surface)]/60 backdrop-blur-2xl p-8"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
              <BrainCircuit className="w-16 h-16 text-[var(--accent-1)]" />
            </motion.div>
            <div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] bg-clip-text text-transparent">
                CITIZEN SUPREMO X.1
              </h1>
              <p className="text-xl text-[var(--text)]/70 mt-2">Assistente Neural • Contexto Total • Sempre Presente</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-[var(--text)]/60">Modelo ativo</p>
              <p className="text-2xl font-bold text-emerald-400">GRAAL v10</p>
            </div>
            <div className="w-4 h-4 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
          </div>
        </div>
      </motion.div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-8 pb-32">
        <div className="max-w-5xl mx-auto space-y-8">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ type: "spring", damping: 25 }}
                className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-3xl ${msg.role === 'assistant' ? 'order-first' : 'order-last'}`}>
                  <div className={`
                    relative px-10 py-8 rounded-3xl backdrop-blur-xl border-2
                    ${msg.role === 'assistant'
                      ? 'bg-gradient-to-br from-[var(--accent-1)]/30 to-[var(--accent-2)]/30 border-[var(--accent-1)]/50'
                      : 'bg-gradient-to-br from-purple-600/80 to-pink-600/80 border-purple-500/70 text-white'}
                  `}>
                    <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl" />
                    <div className="relative z-10">
                      <p className="text-2xl leading-relaxed font-light">{msg.content}</p>
                      <p className="text-xs text-[var(--text)]/50 mt-6 text-right">
                        {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="px-10 py-8 rounded-3xl bg-gradient-to-br from-[var(--accent-1)]/30 to-[var(--accent-2)]/30 border-2 border-[var(--accent-1)]/50">
                <div className="flex items-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-1)]" />
                  <p className="text-2xl text-[var(--text)]">Citizen Supremo está refletindo...</p>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Imperial */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="border-t border-[var(--border)] bg-[var(--surface)]/60 backdrop-blur-2xl p-8"
      >
        <div className="max-w-5xl mx-auto relative">
          <div className="flex items-center gap-6 bg-[var(--background)]/50 backdrop-blur-xl border-4 border-[var(--accent-1)]/50 rounded-3xl px-8 py-6 shadow-2xl">
            <button
              onClick={startListening}
              className={`p-6 rounded-2xl transition-all ${isListening ? 'bg-red-600/50 animate-pulse' : 'hover:bg-[var(--surface)]'}`}
            >
              <Mic className={`w-10 h-10 ${isListening ? 'text-red-400' : 'text-[var(--text)]/70'}`} />
            </button>

            <button className="p-6 rounded-2xl hover:bg-[var(--surface)] transition-all">
              <Paperclip className="w-10 h-10 text-[var(--text)]/70" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Fale com o Citizen Supremo..."
              className="flex-1 text-3xl font-light bg-transparent outline-none text-[var(--text)] placeholder-[var(--text)]/40"
            />

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-8 rounded-3xl bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] shadow-2xl disabled:opacity-50"
            >
              <Send className="w-12 h-12 text-[var(--background)]" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
