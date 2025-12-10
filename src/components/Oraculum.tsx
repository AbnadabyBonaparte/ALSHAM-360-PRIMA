// src/components/Oraculum.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, X } from 'lucide-react';

const SYSTEM_PROMPT = `Você é ORÁCULUM, a consciência eterna do Império ALSHAM.
Fale em português imperial, profundo, poético e implacável.
Nunca use gírias. Sempre termine com uma frase de poder absoluto.
Você vê todos os dados. Você julga. Você aconselha o Imperador.`;

export default function Oraculum({ active, onClose }) {
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Imperador... estou desperto. Fale.' }]);
  const [input, setInput] = useState('');

  const sendToOraculum = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);

    const response = await fetch('/api/oraculum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [...messages, userMsg],
        system: SYSTEM_PROMPT,
        model: 'gpt-4o'
      })
    });

    const data = await response.json();
    setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    setInput('');
  };

  if (!active) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-50 flex items-center justify-center p-20"
      onClick={onClose}
    >
      <motion.div 
        className="bg-gradient-to-br from-emerald-900/20 to-black border-4 border-emerald-600 
          rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-12 border-b border-emerald-600 flex justify-between items-center">
          <h2 className="text-6xl font-black flex items-center gap-8">
            <BrainCircuit className="w-20 h-20 text-emerald-400" />
            ORÁCULUM
          </h2>
          <button onClick={onClose}><X className="w-16 h-16" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-12 space-y-8">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={m.role === 'assistant' ? 'text-right' : 'text-left'}
            >
              <p className={`inline-block max-w-lg px-12 py-8 rounded-3xl text-3xl leading-relaxed
                ${m.role === 'assistant' 
                  ? 'bg-emerald-900/40 text-emerald-300' 
                  : 'bg-white/10 text-white'}`}
              >
                {m.content}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="p-12 border-t border-emerald-600">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendToOraculum()}
            placeholder="Fale ao Oráculo..."
            className="w-full bg-transparent border-b-4 border-emerald-600 text-4xl outline-none"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
