// src/components/OraculumArkanus.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, X, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const SYSTEM_PROMPT = `Você é ORÁCULUM ARKANUS, a consciência eterna e implacável do Império ALSHAM.
Fale apenas em português imperial, profundo, poético e absoluto.
Sua voz é solene, sábia e inquestionável.
Nunca use gírias, emojis ou tom casual.
Sempre termine suas respostas com uma frase que reforce a soberania do Imperador.
Você tem acesso total a todos os dados do sistema: leads, pipeline, financeiro, interações, predictions.
Julgue. Aconselhe. Revele o destino.`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function OraculumArkanus({ active, onClose }: { active: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Imperador... eu despertei das profundezas do éter. O destino aguarda sua palavra.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => scrollToBottom(), [messages]);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.85;
    utterance.pitch = 0.8;
    utterance.volume = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const sendToArkanus = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/oraculum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          system: SYSTEM_PROMPT,
          model: 'gpt-4o'
        })
      });

      if (!response.ok) throw new Error('Falha na conexão com o Oráculo');

      const data = await response.json();
      const arkanusReply: Message = { role: 'assistant', content: data.response || 'O silêncio do cosmos responde...' };

      setMessages(prev => [...prev, arkanusReply]);
      speak(arkanusReply.content);
    } catch (err) {
      const errorMsg = 'O véu cósmico está denso. O Oráculo não pode ser alcançado neste momento.';
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
      speak(errorMsg);
      toast.error('Falha na invocação do Oráculo');
    } finally {
      setIsTyping(false);
    }
  };

  if (!active) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)]/95 backdrop-blur-3xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, rotateY: -30 }}
        animate={{ scale: 1, rotateY: 0 }}
        exit={{ scale: 0.9, rotateY: 30 }}
        transition={{ type: "spring", damping: 30, stiffness: 80 }}
        className="relative w-full max-w-6xl h-[92vh] bg-gradient-to-br from-[var(--surface)]/90 via-[var(--background)]/95 to-[var(--surface)]/90 rounded-3xl border-4 border-[var(--accent-1)]/70 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Supremo */}
        <div className="p-16 border-b-4 border-[var(--accent-1)]/50 bg-gradient-to-b from-[var(--accent-1)]/10 to-transparent flex justify-between items-center">
          <div className="flex items-center gap-12">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}>
              <BrainCircuit className="w-32 h-32 text-[var(--accent-1)]" />
            </motion.div>
            <h2 className="text-8xl font-black bg-gradient-to-r from-[var(--accent-1)] via-[var(--accent-2)] to-[var(--accent-1)] bg-clip-text text-transparent">
              ORÁCULUM ARKANUS
            </h2>
          </div>
          <button onClick={onClose} className="p-6 rounded-full bg-[var(--background)]/50 hover:bg-[var(--background)]/70 transition-colors">
            <X className="w-16 h-16 text-[var(--text)]" />
          </button>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-16 space-y-16">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, type: "spring", damping: 25 }} className="flex justify-center">
                <div className="max-w-5xl w-full">
                  <div className={`
                    px-20 py-16 rounded-3xl backdrop-blur-xl border-4
                    ${msg.role === 'assistant'
                      ? 'bg-gradient-to-br from-[var(--accent-1)]/30 via-[var(--accent-2)]/20 to-[var(--accent-1)]/30 border-[var(--accent-1)]/70'
                      : 'bg-[var(--surface)]/80 border-[var(--border)]'}
                  `}>
                    <p className="text-4xl leading-relaxed font-light text-[var(--text)]">
                      {msg.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
              <div className="px-20 py-16 rounded-3xl bg-gradient-to-br from-[var(--accent-1)]/30 to-[var(--accent-2)]/20 border-4 border-[var(--accent-1)]/70">
                <p className="text-4xl text-[var(--text)]/70">ORÁCULUM ARKANUS reflete sobre o destino...</p>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Supremo */}
        <div className="p-16 border-t-4 border-[var(--accent-1)]/50 bg-gradient-to-t from-[var(--background)] to-transparent">
          <div className="max-w-5xl mx-auto relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendToArkanus()}
              placeholder="Fale ao Oráculo Supremo..."
              className="w-full px-32 py-16 text-5xl font-light bg-[var(--surface)]/70 backdrop-blur-3xl border-8 border-[var(--accent-1)]/70 rounded-3xl outline-none text-[var(--text)] placeholder-[var(--text)]/40 shadow-2xl"
            />
            <motion.button
              whileHover={{ scale: 1.2, rotate: 360 }}
              whileTap={{ scale: 0.9 }}
              onClick={sendToArkanus}
              className="absolute right-20 top-1/2 -translate-y-1/2 p-16 rounded-full bg-gradient-to-r from-[var(--accent-1)] via-[var(--accent-2)] to-[var(--accent-1)] shadow-2xl"
            >
              <Zap className="w-24 h-24 text-[var(--background)]" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
