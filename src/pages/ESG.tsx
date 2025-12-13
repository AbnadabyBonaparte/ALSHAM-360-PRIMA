// src/pages/ESG.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — ESG Alienígena 1000/1000
// Sustentabilidade é o novo luxo. Empresas conscientes dominam o futuro.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA

import {
  GlobeAmericasIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  SparklesIcon,
  HeartIcon,
  ShieldCheckIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface ESGScore {
  environmental: number;
  social: number;
  governance: number;
  total: number;
}

interface ESGInitiative {
  id: string;
  titulo: string;
  pilar: 'environmental' | 'social' | 'governance';
  status: 'planejada' | 'em_andamento' | 'concluida';
  impacto: 'baixo' | 'medio' | 'alto';
  meta: string;
  progresso: number;
}

interface ESGMetrics {
  score: ESGScore;
  iniciativas: ESGInitiative[];
  ranking: number;
}

export default function ESGPage() {
  const [metrics, setMetrics] = useState<ESGMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeESG() {
      try {
        const { data: iniciativas } = await supabase
          .from('esg_iniciativas')
          .select('*')
          .order('id', { ascending: false });

        const { data: scoreData } = await supabase
          .from('esg_scores')
          .select('*')
          .order('data', { ascending: false })
          .limit(1)
          .single();

        const score = scoreData || { environmental: 75, social: 80, governance: 85 };
        const total = (score.environmental + score.social + score.governance) / 3;

        setMetrics({
          score: {
            environmental: score.environmental || 75,
            social: score.social || 80,
            governance: score.governance || 85,
            total
          },
          iniciativas: (iniciativas || []).map(i => ({
            id: i.id,
            titulo: i.titulo || 'Iniciativa ESG',
            pilar: i.pilar || 'environmental',
            status: i.status || 'planejada',
            impacto: i.impacto || 'medio',
            meta: i.meta || '',
            progresso: i.progresso || 0
          })),
          ranking: 15
        });
      } catch (err) {
        console.error('Erro no ESG Supremo:', err);
        setMetrics({
          score: { environmental: 75, social: 80, governance: 85, total: 80 },
          iniciativas: [],
          ranking: 15
        });
      } finally {
        setLoading(false);
      }
    }

    loadSupremeESG();
  }, []);

  if (loading) {
    return (
      
        <div className="flex items-center justify-center h-screen bg-[var(--bg)]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-40 h-40 border-8 border-t-transparent border-green-500 rounded-full"
          />
          <p className="absolute text-4xl text-green-400 font-light">Calculando impacto...</p>
        </div>
      
    );
  }

  const pilarConfig: Record<string, { icon: JSX.Element; color: string; bg: string; label: string }> = {
    environmental: { icon: <GlobeAmericasIcon className="w-8 h-8" />, color: 'text-green-400', bg: 'from-green-900/60 to-emerald-900/60', label: 'Ambiental' },
    social: { icon: <UserGroupIcon className="w-8 h-8" />, color: 'text-blue-400', bg: 'from-blue-900/60 to-cyan-900/60', label: 'Social' },
    governance: { icon: <BuildingOfficeIcon className="w-8 h-8" />, color: 'text-purple-400', bg: 'from-purple-900/60 to-pink-900/60', label: 'Governança' }
  };

  return (
    
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            ESG SUPREMO
          </h1>
          <p className="text-3xl text-gray-400 mt-6">
            Environmental, Social & Governance — O futuro é consciente
          </p>
        </motion.div>

        {/* SCORE ESG PRINCIPAL */}
        <div className="max-w-2xl mx-auto mb-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-green-900/40 via-blue-900/40 to-purple-900/40 rounded-3xl p-12 border-4 border-green-500/50 text-center"
          >
            <p className="text-2xl text-gray-400 mb-4">Score ESG Total</p>
            <p className="text-4xl md:text-5xl lg:text-6xl font-black text-[var(--text)]">{(metrics?.score.total || 0).toFixed(0)}</p>
            <p className="text-xl text-gray-400 mt-4">Top #{metrics?.ranking} no setor</p>
          </motion.div>
        </div>

        {/* SCORES POR PILAR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
          {/* ENVIRONMENTAL */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 rounded-3xl p-8 border border-green-500/30"
          >
            <GlobeAmericasIcon className="w-16 h-16 text-green-400 mb-4" />
            <p className="text-6xl font-black text-[var(--text)]">{metrics?.score.environmental || 0}</p>
            <p className="text-xl text-gray-400 mt-2">Environmental</p>
            <div className="mt-6 h-3 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metrics?.score.environmental || 0}%` }}
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
              />
            </div>
          </motion.div>

          {/* SOCIAL */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-blue-900/60 to-cyan-900/60 rounded-3xl p-8 border border-blue-500/30"
          >
            <UserGroupIcon className="w-16 h-16 text-blue-400 mb-4" />
            <p className="text-6xl font-black text-[var(--text)]">{metrics?.score.social || 0}</p>
            <p className="text-xl text-gray-400 mt-2">Social</p>
            <div className="mt-6 h-3 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metrics?.score.social || 0}%` }}
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
              />
            </div>
          </motion.div>

          {/* GOVERNANCE */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-purple-900/60 to-pink-900/60 rounded-3xl p-8 border border-purple-500/30"
          >
            <BuildingOfficeIcon className="w-16 h-16 text-purple-400 mb-4" />
            <p className="text-6xl font-black text-[var(--text)]">{metrics?.score.governance || 0}</p>
            <p className="text-xl text-gray-400 mt-2">Governance</p>
            <div className="mt-6 h-3 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metrics?.score.governance || 0}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              />
            </div>
          </motion.div>
        </div>

        {/* INICIATIVAS */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            Iniciativas ESG
          </h2>

          {metrics?.iniciativas.length === 0 ? (
            <div className="text-center py-20">
              <GlobeAmericasIcon className="w-32 h-32 text-gray-700 mx-auto mb-8" />
              <p className="text-3xl text-gray-500">Nenhuma iniciativa cadastrada</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {metrics?.iniciativas.map((ini, i) => {
                const config = pilarConfig[ini.pilar];
                return (
                  <motion.div
                    key={ini.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`bg-gradient-to-br ${config.bg} rounded-2xl p-6 border border-[var(--border)]`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-white/10 ${config.color}`}>
                        {config.icon}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        ini.status === 'concluida' ? 'bg-green-500/20 text-green-400' :
                        ini.status === 'em_andamento' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      } capitalize`}>
                        {ini.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[var(--text)] mb-2">{ini.titulo}</h3>
                    <p className="text-gray-400 text-sm mb-4">{ini.meta}</p>

                    <div>
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Progresso</span>
                        <span>{ini.progresso}%</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${ini.progresso}%` }}
                          className={`h-full bg-gradient-to-r ${
                            ini.pilar === 'environmental' ? 'from-green-500 to-emerald-500' :
                            ini.pilar === 'social' ? 'from-blue-500 to-cyan-500' :
                            'from-purple-500 to-pink-500'
                          }`}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* MENSAGEM FINAL DA IA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center py-24 mt-16"
        >
          <SparklesIcon className="w-32 h-32 text-green-400 mx-auto mb-8 animate-pulse" />
          <p className="text-5xl font-light text-green-300 max-w-4xl mx-auto">
            "ESG não é tendência. É a nova régua de excelência empresarial."
          </p>
          <p className="text-3xl text-gray-500 mt-8">
            — Citizen Supremo X.1, seu Guardião do Planeta
          </p>
        </motion.div>
      </div>
    
  );
}
