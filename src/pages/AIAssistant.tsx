// src/pages/AIAssistant.tsx
// ALSHAM 360° PRIMA - Citizen Supremo X.1 (Chat IA) - reconstruído

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Loader2, Mic, Paperclip } from 'lucide-react';

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
      content: 'Olá! Sou o Citizen Supremo X.1. Posso ajudar com leads, pipeline e análises em tempo real.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const aiMessage: Message = {
        id: `${Date.now()}-ai`,
        role: 'assistant',
        content: 'Processando com Supabase + IA... resposta gerada! 🚀',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1200);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-32px)] bg-[var(--background)] text-[var(--text-primary)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--surface)]/70 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold">Citizen Supremo X.1</h1>
            <p className="text-xs text-[var(--text-secondary)]">IA Generativa • Live Data</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[var(--text-secondary)] text-xs">Modelo: ALSHAM-GRAAL-v10</p>
          <p className="text-emerald-400 text-[10px]">● Online</p>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--background)]">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30">
                  <Bot className="w-4 h-4 text-purple-300" />
                </div>
              )}
              <div
                className={`max-w-[72%] rounded-2xl px-4 py-3 text-sm sm:text-base ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-[var(--surface)] border border-[var(--border)]'
                }`}
              >
                <p>{msg.content}</p>
                <p className="text-[10px] opacity-60 mt-2">
                  {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {msg.role === 'user' && (
                <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
                  <User className="w-4 h-4 text-emerald-300" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 text-[var(--text-secondary)]"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
            <p>Citizen Supremo está pensando...</p>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-xl">
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-[var(--background)] border border-[var(--border)]">
          <button className="p-2 rounded-xl hover:bg-[var(--surface)] transition-colors">
            <Paperclip className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-secondary)] outline-none"
          />
          <button className="p-2 rounded-xl hover:bg-[var(--surface)] transition-colors">
            <Mic className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/30 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

