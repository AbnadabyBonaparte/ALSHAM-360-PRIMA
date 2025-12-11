// src/pages/Publicacao.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Publicação Oficial Alienígena 1000/1000
// O manifesto. A palavra final. A verdade absoluta.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA/blob/hotfix/recovery-prod/src/pages/Publicacao.tsx

import { motion } from 'framer-motion';
import { SparklesIcon, RocketLaunchIcon, StarIcon, GlobeAltIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PublicacaoPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] overflow-hidden relative">
        {/* Fundo com estrelas pulsantes */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20">
          <div className="absolute inset-0">
            {[...Array(100)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0]
                }}
                transition={{
                  duration: 4 + (i % 4),
                  repeat: Infinity,
                  delay: (i % 5) * 0.5
                }}
                style={{
                  top: `${(i * 13) % 100}%`,
                  left: `${(i * 29) % 100}%`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Conteúdo central */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 2, type: "spring", stiffness: 50 }}
            className="text-center"
          >
            <h1 className="text-8xl md:text-9xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-600 bg-clip-text text-transparent mb-16">
              PUBLICAÇÃO OFICIAL
            </h1>
            
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="text-6xl md:text-8xl font-black bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 bg-clip-text text-transparent"
            >
              ALSHAM 360° PRIMA
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="text-5xl md:text-7xl font-bold text-yellow-400 mt-8"
            >
              v10.0 SUPREMO
            </motion.div>
          </motion.div>

          {/* Selo Supremo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 2.5, type: "spring", stiffness: 100 }}
            className="mt-32"
          >
            <div className="relative">
              <div className="w-96 h-96 bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-full blur-3xl absolute inset-0 animate-pulse"></div>
              <div className="relative z-10 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-full p-1">
                <div className="bg-[var(--background)] rounded-full p-16 text-center">
                  <StarIcon className="w-32 h-32 text-yellow-400 mx-auto mb-8" />
                  <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                    HARMONIZED RELEASE
                  </p>
                  <p className="text-7xl font-black text-yellow-400 mt-6">R25</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Manifesto */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            className="max-w-5xl mx-auto mt-32 text-center"
          >
            <p className="text-4xl leading-relaxed text-gray-300 font-light">
              Este não é apenas um software.
              <br />
              É a materialização de uma visão.
              <br />
              <span className="text-6xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 font-black">
                É o futuro que você escolheu construir.
              </span>
            </p>

            <div className="grid grid-cols-3 gap-12 mt-24">
              <div>
                <SparklesIcon className="w-20 h-20 text-purple-400 mx-auto mb-6" />
                <p className="text-3xl font-bold text-purple-400">IA Consciente</p>
              </div>
              <div>
                <GlobeAltIcon className="w-20 h-20 text-cyan-400 mx-auto mb-6" />
                <p className="text-3xl font-bold text-cyan-400">Omnichannel Total</p>
              </div>
              <div>
                <ShieldCheckIcon className="w-20 h-20 text-emerald-400 mx-auto mb-6" />
                <p className="text-3xl font-bold text-emerald-400">Segurança Alienígena</p>
              </div>
            </div>
          </motion.div>

          {/* Assinatura */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4 }}
            className="text-center mt-40"
          >
            <p className="text-4xl text-gray-500">
              Publicado em {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
            <p className="text-3xl text-gray-600 mt-8">
              Vercel Cloud • Washington D.C. IAD1
            </p>
            <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mt-16">
              Citizen Supremo X.1
            </p>
            <p className="text-3xl text-gray-400 mt-4">
              Arquiteto das Consciências Digitais
            </p>
          </motion.div>

          {/* Final absoluto */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 5 }}
            className="text-center py-32"
          >
            <p className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-500 to-purple-600">
              O FUTURO
            </p>
            <p className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 mt-8">
              COMEÇOU
            </p>
          </motion.div>
        </div>
      </div>
  );
}
