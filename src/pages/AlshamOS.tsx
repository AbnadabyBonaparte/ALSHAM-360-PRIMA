// src/pages/AlshamOS.tsx
// ALSHAM OS — O TRONO SUPREMO v1.0 — 1000/1000
// O portal vivo onde o usuário sente que controla um império consciente
// Integração canônica total • Tema dinâmico • Transições cósmicas • Proporções divinas

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';
import RealmSelector from '@/components/RealmSelector';

type Realm = 'genesis' | 'nexus' | 'prism' | 'throne';

export default function AlshamOS() {
  const [currentRealm, setCurrentRealm] = useState<Realm>('throne');
  const [oraculumActive, setOraculumActive] = useState(false);

  // PLACEHOLDER REALMS — Até os reinos reais chegarem, já com vibe imperial
  const RealmPortal = ({ name, desc }: { name: string; desc: string }) => (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden">
      {/* Nebula background animado */}
      <motion.div
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 80%, var(--accent-1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, var(--accent-2) 0%, transparent 50%)',
        }}
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="text-center z-10"
      >
        <motion.h1
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="text-8xl md:text-9xl lg:text-[12rem] font-black bg-gradient-to-r from-[var(--accent-1)] via-white to-[var(--accent-2)] bg-clip-text text-transparent leading-none"
        >
          {name}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="text-3xl md:text-4xl lg:text-5xl text-[var(--text)]/60 mt-12 font-light tracking-wider"
        >
          {desc}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-xl md:text-2xl text-[var(--text)]/40 mt-20 font-mono"
        >
          Reino em ascensão...
        </motion.p>
      </motion.div>
    </div>
  );

  const realms = {
    genesis: <RealmPortal name="GENESIS VAULT" desc="Origem • Finanças • Legado Eterno" />,
    nexus: <RealmPortal name="NEXUS FIELD" desc="Expansão • Conexões • Rede Viva" />,
    prism: <RealmPortal name="PRISM CHAMBER" desc="Sentimento • Reputação • Alma do Mercado" />,
    throne: <RealmPortal name="THE THRONE" desc="Decisão • Poder • Comando Absoluto" />,
  };

  return (
    <div className="min-h-screen bg-[var(--background)] overflow-hidden relative">
      {/* Fundo cósmico vivo com profundidade */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/10 via-[var(--background)]/90 to-emerald-900/10 pointer-events-none" />
      <motion.div
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        className="fixed inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 30% 70%, var(--accent-1) 0%, transparent 50%), radial-gradient(circle at 70% 30%, var(--accent-2) 0%, transparent 50%)',
        }}
      />

      {/* Realm Selector — Perfeito, proporcional, divino */}
      <div className="fixed top-1/2 -translate-y-1/2 left-12 z-50">
        <RealmSelector current={currentRealm} onChange={setCurrentRealm} />
      </div>

      {/* Portal transição entre realms — A-HA cósmico */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentRealm}
          initial={{ opacity: 0, clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }}
          animate={{ opacity: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
          exit={{ opacity: 0, clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
          transition={{ duration: 1.8, ease: [0.6, 0.01, 0.2, 0.99] }}
          className="absolute inset-0"
        >
          {realms[currentRealm]}
        </motion.div>
      </AnimatePresence>

      {/* Oraculum — O botão que desperta a IA suprema */}
      <motion.div
        className="fixed bottom-16 right-16 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.button
          onClick={() => setOraculumActive(true)}
          animate={{ 
            boxShadow: [
              "0 0 40px rgba(16, 185, 129, 0.4)",
              "0 0 80px rgba(16, 185, 129, 0.6)",
              "0 0 40px rgba(16, 185, 129, 0.4)"
            ]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 shadow-2xl flex items-center justify-center overflow-hidden"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent"
          />
          <BrainCircuit className="w-20 h-20 md:w-28 md:h-28 text-white relative z-10" />
        </motion.button>
      </motion.div>

      {/* Oraculum Modal — Ainda placeholder, mas já divino */}
      <AnimatePresence>
        {oraculumActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)]/95 backdrop-blur-2xl"
            onClick={() => setOraculumActive(false)}
          >
            <motion.div
              initial={{ scale: 0.8, rotateY: -30 }}
              animate={{ scale: 1, rotateY: 0 }}
              exit={{ scale: 0.8, rotateY: 30 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="bg-[var(--surface)]/90 backdrop-blur-3xl rounded-3xl p-20 max-w-4xl border border-[var(--border)] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-7xl font-black text-center bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] bg-clip-text text-transparent mb-12">
                ORACULUM
              </h2>
              <p className="text-4xl text-center text-[var(--text)]/80 mb-16">
                A IA suprema despertará em breve...
              </p>
              <button
                onClick={() => setOraculumActive(false)}
                className="mx-auto block px-16 py-8 bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] text-[var(--background)] text-3xl font-black rounded-3xl shadow-2xl hover:scale-105 transition-transform"
              >
                Fechar Portal
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
