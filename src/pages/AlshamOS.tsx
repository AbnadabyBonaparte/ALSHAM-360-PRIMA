// src/pages/AlshamOS.tsx
// ALSHAM OS — VERSÃO CANÔNICA FINAL — PROPORCIONAL E IMORTAL
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';
import RealmSelector from '@/components/RealmSelector';

type Realm = 'genesis' | 'nexus' | 'prism' | 'throne';

export default function AlshamOS() {
  const [currentRealm, setCurrentRealm] = useState<Realm>('throne');
  const [oraculumActive, setOraculumActive] = useState(false);

  // Placeholder realms até os reais
  const PlaceholderRealm = ({ name }: { name: string }) => (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-7xl md:text-9xl font-black bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] bg-clip-text text-transparent"
        >
          {name.toUpperCase()}
        </motion.h1>
        <p className="text-3xl md:text-4xl text-[var(--text)]/60 mt-12 font-light">
          Reino em construção...
        </p>
      </div>
    </div>
  );

  const realmComponents: Record<Realm, JSX.Element> = {
    genesis: <PlaceholderRealm name="Genesis Vault" />,
    nexus: <PlaceholderRealm name="Nexus Field" />,
    prism: <PlaceholderRealm name="Prism Chamber" />,
    throne: <PlaceholderRealm name="The Throne" />,
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] overflow-hidden relative">
      {/* Fundo cósmico sutil com profundidade */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/5 via-[var(--background)] to-emerald-900/5 pointer-events-none" />
      <motion.div
        animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 80%, var(--accent-1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, var(--accent-2) 0%, transparent 50%)'
        }}
      />

      {/* Realm Selector — Proporcional e elegante */}
      <div className="fixed top-1/2 -translate-y-1/2 left-8 z-50">
        <RealmSelector current={currentRealm} onChange={setCurrentRealm} />
      </div>

      {/* Transição entre realms */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentRealm}
          initial={{ opacity: 0, clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }}
          animate={{ opacity: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
          exit={{ opacity: 0, clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
          transition={{ duration: 1.4, ease: [0.6, -0.05, 0.01, 0.99] }}
          className="absolute inset-0 flex"
        >
          {realmComponents[currentRealm]}
        </motion.div>
      </AnimatePresence>

      {/* Botão Oraculum — Pulsante e proporcional */}
      <motion.button
        onClick={() => setOraculumActive(true)}
        className="fixed bottom-12 right-12 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 blur-xl opacity-60"
          />
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 shadow-2xl flex items-center justify-center">
            <BrainCircuit className="w-12 h-12 md:w-20 md:h-20 text-[var(--background)]" />
          </div>
        </div>
      </motion.button>

      {/* Oraculum Placeholder */}
      <AnimatePresence>
        {oraculumActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)]/90 backdrop-blur-xl"
            onClick={() => setOraculumActive(false)}
          >
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="bg-[var(--surface)]/90 backdrop-blur-2xl rounded-3xl p-16 max-w-2xl border border-[var(--border)] shadow-2xl"
            >
              <h2 className="text-6xl font-black text-[var(--accent-1)] mb-8 text-center">ORACULUM</h2>
              <p className="text-3xl text-[var(--text)] text-center">A IA suprema despertará em breve...</p>
              <button
                onClick={() => setOraculumActive(false)}
                className="mt-12 mx-auto block px-12 py-6 bg-[var(--accent-1)] text-[var(--background)] text-2xl font-black rounded-2xl"
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
