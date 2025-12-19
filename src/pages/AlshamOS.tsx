// src/pages/AlshamOS.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';
import RealmSelector from '@/components/RealmSelector';

// Importe seus realms reais quando existirem
// import GenesisVault from './realms/GenesisVault';
// import NexusField from './realms/NexusField';
// import PrismChamber from './realms/PrismChamber';
// import TheThrone from './realms/TheThrone';

type Realm = 'genesis' | 'nexus' | 'prism' | 'throne';

export default function AlshamOS() {
  const [currentRealm, setCurrentRealm] = useState<Realm>('throne');
  const [oraculumActive, setOraculumActive] = useState(false);

  // Placeholder realms até implementar os reais
  const PlaceholderRealm = ({ name }: { name: string }) => (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-8xl font-black text-[var(--accent-1)] mb-8">{name.toUpperCase()}</h1>
        <p className="text-4xl text-[var(--text)]/60">Reino em construção...</p>
      </div>
    </div>
  );

  const realmComponents = {
    genesis: <PlaceholderRealm name="Genesis Vault" />,
    nexus: <PlaceholderRealm name="Nexus Field" />,
    prism: <PlaceholderRealm name="Prism Chamber" />,
    throne: <PlaceholderRealm name="The Throne" />,
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] overflow-hidden relative">
      {/* Fundo cósmico sutil */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/10 via-[var(--background)] to-emerald-900/10" />

      {/* Realm Selector */}
      <RealmSelector current={currentRealm} onChange={setCurrentRealm} />

      {/* Transição entre realms */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentRealm}
          initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
          animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0%)' }}
          exit={{ opacity: 0, clipPath: 'inset(0 0% 0 100%)' }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 flex"
        >
          {realmComponents[currentRealm]}
        </motion.div>
      </AnimatePresence>

      {/* Botão Oraculum */}
      <motion.button
        onClick={() => setOraculumActive(true)}
        className="fixed bottom-12 right-12 w-32 h-32 rounded-full
          bg-gradient-to-br from-emerald-600 to-teal-800
          shadow-2xl shadow-emerald-500/50 flex items-center justify-center
          hover:scale-110 transition-all z-50"
        whileHover={{ rotate: 360 }}
      >
        <BrainCircuit className="w-20 h-20 text-[var(--background)]" />
      </motion.button>

      {/* Placeholder Oraculum (até implementar o real) */}
      <AnimatePresence>
        {oraculumActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)]/90 backdrop-blur-xl"
            onClick={() => setOraculumActive(false)}
          >
            <div className="bg-[var(--surface)]/90 backdrop-blur-2xl rounded-3xl p-12 max-w-2xl border border-[var(--border)]">
              <h2 className="text-5xl font-black text-[var(--accent-1)] mb-8">ORACULUM</h2>
              <p className="text-2xl text-[var(--text)]">Em construção... A IA suprema despertará em breve.</p>
              <button
                onClick={() => setOraculumActive(false)}
                className="mt-12 px-12 py-6 bg-[var(--accent-1)] text-[var(--background)] text-2xl font-black rounded-2xl"
              >
                Fechar Portal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
