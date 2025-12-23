// src/pages/Publicacao.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Publicação Oficial Alienígena 1000/1000
// O manifesto. A palavra final. A verdade absoluta.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA
// ✅ MIGRADO PARA CSS VARIABLES

import { motion } from 'framer-motion';
import { SparklesIcon, RocketLaunchIcon, StarIcon, GlobeAltIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PublicacaoPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] overflow-hidden relative">
        {/* Fundo com estrelas pulsantes */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-purple)]/20 via-[var(--background)] to-[var(--accent-sky)]/20">
          <div className="absolute inset-0">
            {[...Array(100)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-[var(--text)] rounded-full"
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
            <h1 className="text-2xl md:text-3xl lg:text-4xl md:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-[var(--accent-sky)] via-[var(--accent-purple)] to-[var(--accent-pink)] bg-clip-text text-transparent mb-16">
              PUBLICAÇÃO OFICIAL
            </h1>
            
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="text-6xl md:text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 bg-clip-text text-transparent"
            >
              ALSHAM 360° PRIMA
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="text-5xl md:text-xl md:text-2xl lg:text-3xl font-bold text-yellow-400 mt-8"
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
              <div className="w-96 h-96 bg-gradient-to-br from-[var(--accent-warning)]/20 to-[var(--accent-warning)]/20 rounded-full blur-3xl absolute inset-0 animate-pulse"></div>
              <div className="relative z-10 bg-gradient-to-br from-[var(--accent-warning)] to-[var(--accent-warning)] rounded-full p-1">
                <div className="bg-[var(--background)] rounded-full p-16 text-center">
                  <StarIcon className="w-32 h-32 text-[var(--accent-warning)] mx-auto mb-8" />
                  <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-warning)] to-[var(--accent-warning)]">
                    HARMONIZED RELEASE
                  </p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-black text-[var(--accent-warning)] mt-6">R25</p>
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
            <p className="text-4xl leading-relaxed text-[var(--text-secondary)] font-light">
              Este não é apenas um software.
              <br />
              É a materialização de uma visão.
              <br />
              <span className="text-6xl text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] font-black">
                É o futuro que você escolheu construir.
              </span>
            </p>

            <div className="grid grid-cols-3 gap-12 mt-24">
              <div>
                <SparklesIcon className="w-20 h-20 text-[var(--accent-purple)] mx-auto mb-6" />
                <p className="text-3xl font-bold text-[var(--accent-purple)]">IA Consciente</p>
              </div>
              <div>
                <GlobeAltIcon className="w-20 h-20 text-[var(--accent-sky)] mx-auto mb-6" />
                <p className="text-3xl font-bold text-[var(--accent-sky)]">Omnichannel Total</p>
              </div>
              <div>
                <ShieldCheckIcon className="w-20 h-20 text-[var(--accent-emerald)] mx-auto mb-6" />
                <p className="text-3xl font-bold text-[var(--accent-emerald)]">Segurança Alienígena</p>
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
            <p className="text-4xl text-[var(--text-secondary)]">
              Publicado em {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
            <p className="text-3xl text-[var(--text-secondary)] mt-8">
              Vercel Cloud • Washington D.C. IAD1
            </p>
            <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-sky)] mt-16">
              Citizen Supremo X.1
            </p>
            <p className="text-3xl text-[var(--text-secondary)] mt-4">
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
            <p className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-emerald)] via-[var(--accent-sky)] to-[var(--accent-purple)]">
              O FUTURO
            </p>
            <p className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-purple)] via-[var(--accent-pink)] to-[var(--accent-warning)] mt-8">
              COMEÇOU
            </p>
          </motion.div>
        </div>
      </div>
  );
}
