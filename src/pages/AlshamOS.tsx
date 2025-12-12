// src/pages/AlshamOS.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';
import RealmSelector from '@/components/RealmSelector';
import GenesisVault from './realms/GenesisVault';
import NexusField from './realms/NexusField';
import PrismChamber from './realms/PrismChamber';
import TheThrone from './realms/TheThrone';
import Oraculum from '@/components/Oraculum';
import { useExecutiveMetrics } from '@/hooks/useExecutiveMetrics';

type Realm = 'genesis' | 'nexus' | 'prism' | 'throne';

export default function AlshamOS() {
  const [currentRealm, setCurrentRealm] = useState<Realm>('throne');
  const [oraculumActive, setOraculumActive] = useState(false);
  const { metrics } = useExecutiveMetrics();

  const realmComponents = {
    genesis: <GenesisVault />,
    nexus: <NexusField />,
    prism: <PrismChamber />,
    throne: <TheThrone />,
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Ambiente Sonoro Binaural por Era */}
      <AmbientSoundEngine era={metrics?.marketSentiment > 90 ? 'ascension' : 'expansion'} />

      {/* Selector de Reinos */}
      <RealmSelector current={currentRealm} onChange={setCurrentRealm} />

      {/* Oraculum Flutuante */}
      <Oraculum active={oraculumActive} onClose={() => setOraculumActive(false)} />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentRealm}
          initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
          animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0%)' }}
          exit={{ opacity: 0, clipPath: 'inset(0 0% 0 100%)' }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {realmComponents[currentRealm]}
        </motion.div>
      </AnimatePresence>

      {/* Botão do Oraculum */}
      <motion.button
        onClick={() => setOraculumActive(true)}
        className="fixed bottom-12 right-12 w-32 h-32 rounded-full 
          bg-gradient-to-br from-emerald-600 to-teal-800 
          shadow-2xl shadow-emerald-500/50 flex items-center justify-center
          hover:scale-110 transition-all z-50"
        whileHover={{ rotate: 360 }}
      >
        <BrainCircuit className="w-20 h-20" />
      </motion.button>
    </div>
  );
}
