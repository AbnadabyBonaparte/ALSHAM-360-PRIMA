// src/components/CitizenOrb.tsx
// CITIZEN SUPREMO X.1 — ORB FLUTUANTE GLOBAL
// Vive em todas as páginas • Pulsante • Inteligente • Sempre pronto

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, X, Send, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CitizenOrb() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  const quickResponses = [
    'Explique essa página',
    'Dê um insight rápido',
    'Me ajude com essa tarefa',
    'Qual o próximo passo?'
  ];

  const handleQuick = (text: string) => {
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Entendido! Aqui vai uma orientação rápida baseada no contexto atual...' }]);
    }, 800);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Processando sua solicitação com os dados reais do império...' }]);
    }, 1000);
  };

  return (
    <>
      {/* Orb Pulsante */}
      <motion.div
        className="fixed bottom-8 left-8 z-50"
        animate={{
          boxShadow: [
            "0 0 30px rgba(16, 185, 129, 0.3)",
            "0 0 60px rgba(16, 185, 129, 0.5)",
            "0 0 30px rgba(16, 185, 129, 0.3)"
          ]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <motion.button
          onClick={() => setOpen(!open)}
          className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 shadow-2xl flex items-center justify-center overflow-hidden"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent"
          />
          <BrainCircuit className="w-12 h-12 text-white relative z-10" />
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl"
          />
        </motion.button>
      </motion.div>

      {/* Mini Chat Flutuante */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-32 left-8 z-50 w-96 bg-[var(--surface)]/90 backdrop-blur-2xl rounded-3xl border border-[var(--border)] shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Sparkles className="w-8 h-8 text-[var(--accent-1)]" />
                <h3 className="text-2xl font-black text-[var(--text)]">Citizen Supremo X.1</h3>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 hover:bg-[var(--background)]/50 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {messages.map((msg, i) => (
                <div key={i} className={`text-sm ${msg.role === 'assistant' ? 'text-[var(--text)]/80' : 'text-[var(--accent-1)]'}`}>
                  {msg.content}
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                {quickResponses.map((text) => (
                  <button
                    key={text}
                    onClick={() => handleQuick(text)}
                    className="text-xs py-3 px-4 bg-[var(--background)]/50 rounded-xl hover:bg-[var(--accent-1)]/20 transition-colors text-left"
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-[var(--border)]">
              <div className="flex items-center gap-4">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Pergunte qualquer coisa..."
                  className="flex-1 bg-transparent text-lg outline-none text-[var(--text)] placeholder-[var(--text)]/40"
                />
                <button onClick={handleSend} className="p-3 rounded-xl bg-[var(--accent-1)]/70 hover:bg-[var(--accent-1)] transition-colors">
                  <Send className="w-6 h-6 text-[var(--background)]" />
                </button>
              </div>
              <button
                onClick={() => navigate('/app/ai-assistant')}
                className="mt-4 text-sm text-[var(--accent-1)] hover:underline text-center w-full"
              >
                Abrir chat completo →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
