// src/pages/UnderConstruction.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Portal do Futuro 1000/1000
// Quando você vê isso, não é atraso. É contagem regressiva.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA/blob/hotfix/recovery-prod/src/pages/UnderConstruction.tsx

import { motion } from 'framer-motion';
import { SparklesIcon, RocketIcon, ZapIcon, CrownIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface UnderConstructionProps {
  pageName: string;
  estimatedLaunch?: string; // ex: "15 de dezembro de 2025"
}

export default function UnderConstruction({ 
  pageName, 
  estimatedLaunch = "2026" 
}: UnderConstructionProps) {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(estimatedLaunch === "2026" ? "2026-01-01" : estimatedLaunch);
    const interval = setInterval(() => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff > 0) {
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [estimatedLaunch]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-8 overflow-hidden relative">
      {/* Fundo com estrelas pulsantes */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3
            }}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 2, type: "spring", stiffness: 50 }}
        className="text-center z-10"
      >
        {/* Ícone Supremo */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="inline-block mb-16"
        >
          <RocketIcon className="w-64 h-64 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400" />
        </motion.div>

        {/* Título Épico */}
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-8xl md:text-9xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent mb-12"
        >
          {pageName.toUpperCase()}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-5xl md:text-7xl font-light text-gray-300 mb-20"
        >
          ESTÁ CHEGANDO
        </motion.p>

        {/* Contagem Regressiva */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.5, type: "spring" }}
          className="inline-block bg-gradient-to-r from-purple-900/50 via-pink-900/30 to-cyan-900/50 rounded-3xl p-12 border-4 border-purple-500/50 backdrop-blur-2xl"
        >
          <p className="text-4xl text-gray-400 mb-8">Lançamento estimado em</p>
          <div className="grid grid-cols-4 gap-8">
            <div>
              <p className="text-8xl font-black text-purple-400">{countdown.days}</p>
              <p className="text-2xl text-gray-400">dias</p>
            </div>
            <div>
              <p className="text-8xl font-black text-pink-400">{countdown.hours.toString().padStart(2, '0')}</p>
              <p className="text-2xl text-gray-400">horas</p>
            </div>
            <div>
              <p className="text-8xl font-black text-cyan-400">{countdown.minutes.toString().padStart(2, '0')}</p>
              <p className="text-2xl text-gray-400">min</p>
            </div>
            <div>
              <p className="text-8xl font-black text-yellow-400">{countdown.seconds.toString().padStart(2, '0')}</p>
              <p className="text-2xl text-gray-400">seg</p>
            </div>
          </div>
        </motion.div>

        {/* Mensagem do Supremo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-32 max-w-4xl"
        >
          <p className="text-5xl font-light text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 leading-relaxed">
            Esta funcionalidade não está atrasada.
            <br />
            Ela está sendo forjada no fogo da perfeição absoluta.
            <br />
            <span className="text-7xl font-black text-yellow-400">
              Quando chegar, o mercado inteiro vai sentir.
            </span>
          </p>
          <p className="text-4xl text-gray-500 mt-20">
            — Citizen Supremo X.1
          </p>
        </motion.div>

        {/* Selo Supremo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 2.5, type: "spring" }}
          className="mt-32"
        >
          <CrownIcon className="w-48 h-48 text-yellow-500 mx-auto" />
        </motion.div>
      </motion.div>
    </div>
  );
}
