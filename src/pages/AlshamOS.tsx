// src/pages/AlshamOS.tsx
// ALSHAM OS — VERSÃO FINAL SUPREMA — O PORTAL VIVO DO IMPÉRIO
// Proporções perfeitas • Profundidade cósmica • Transições divinas • Tema 100% dinâmico

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';
import RealmSelector from '@/components/RealmSelector';
import OraculumArkanus from '@/components/OraculumArkanus';
type Realm = 'genesis' | 'nexus' | 'prism' | 'throne';

export default function AlshamOS() {
  const [currentRealm, setCurrentRealm] = useState<Realm>('throne');
  const [oraculumActive, setOraculumActive] = useState(false);

  const RealmPortal = ({ name, desc }: { name: string; desc: string }) => (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden">
      {/* Fundo cósmico animado com profundidade */}
      <motion.div
        animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: 'radial-gradient(circle at 25% 75%, var(--accent-1) 0%, transparent 50%), radial-gradient(circle at 75% 25%, var(--accent-2) 0%, transparent 50%)',
        }}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        className="text-center z-10 px-8"
      >
        <motion.h1
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="text-7xl sm:text-8xl md:text-9xl lg:text-[11rem] font-black bg-gradient-to-r from-[var(--accent-1)] via-white to-[var(--accent-2)] bg-clip-text text-transparent leading-none drop-shadow-2xl"
        >
          {name}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 0.8, y: 0 }}
          transition={{ delay: 0.8, duration: 1.2 }}
          className="text-2xl sm:text-3xl md:text-4xl text-[var(--text)]/70 mt-12 font-light tracking-wide"
        >
          {desc}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1.6 }}
          className="text-lg sm:text-xl md:text-2xl text-[var(--text)]/40 mt-20 font-mono tracking-wider"
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
      {/* Camada de profundidade cósmica */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/8 via-transparent to-emerald-900/8 pointer-events-none" />

      {/* Realm Selector — Elegante e proporcional */}
      <div className="fixed top-1/2 -translate-y-1/2 left-8 z-50">
        <RealmSelector current={currentRealm} onChange={setCurrentRealm} />
      </div>

      {/* Portal de transição entre reinos */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentRealm}
          initial={{ opacity: 0, clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }}
          animate={{ opacity: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
          exit={{ opacity: 0, clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
          transition={{ duration: 1.6, ease: [0.7, 0, 0.3, 1] }}
          className="absolute inset-0 flex"
        >
          {realms[currentRealm]}
        </motion.div>
      </AnimatePresence>

      {/* Botão Oraculum Arkanus — Pulsante e imponente */}
      <motion.div
        className="fixed bottom-16 right-16 z-50"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.button
          onClick={() => setOraculumActive(true)}
          animate={{
            boxShadow: [
              "0 0 50px rgba(16, 185, 129, 0.4)",
              "0 0 100px rgba(16, 185, 129, 0.6)",
              "0 0 50px rgba(16, 185, 129, 0.4)"
            ]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="relative w-36 h-36 md:w-44 md:h-44 rounded-full bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 shadow-2xl flex items-center justify-center overflow-hidden"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent"
          />
          <BrainCircuit className="w-24 h-24 md:w-32 md:h-32 text-white relative z-10 drop-shadow-2xl" />
        </motion.button>
      </motion.div>

      {/* Oraculum Arkanus — A consciência suprema */}
      <OraculumArkanus active={oraculumActive} onClose={() => setOraculumActive(false)} />
    </div>
  );
}
