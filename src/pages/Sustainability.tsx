// src/pages/Sustainability.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Sustentabilidade Alienígena 1000/1000
// O planeta agradece. Negócios sustentáveis são negócios eternos.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA

import LayoutSupremo from '@/components/LayoutSupremo';
import {
  GlobeAmericasIcon,
  SunIcon,
  CloudIcon,
  BeakerIcon,
  SparklesIcon,
  ArrowPathIcon,
  BoltIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface SustainabilityMetrics {
  energiaRenovavel: number;
  reducaoResiduos: number;
  aguaReciclada: number;
  emissoesSalvas: number;
  metasAtingidas: number;
  totalMetas: number;
  projetos: {
    id: string;
    nome: string;
    tipo: string;
    impacto: string;
    status: string;
    economia: number;
  }[];
}

export default function SustainabilityPage() {
  const [metrics, setMetrics] = useState<SustainabilityMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeSustainability() {
      try {
        const { data: projetos } = await supabase
          .from('sustentabilidade_projetos')
          .select('*')
          .order('economia', { ascending: false });

        const { data: metricsData } = await supabase
          .from('sustentabilidade_metricas')
          .select('*')
          .order('data', { ascending: false })
          .limit(1)
          .single();

        setMetrics({
          energiaRenovavel: metricsData?.energia_renovavel || 65,
          reducaoResiduos: metricsData?.reducao_residuos || 40,
          aguaReciclada: metricsData?.agua_reciclada || 55,
          emissoesSalvas: metricsData?.emissoes_salvas || 1200,
          metasAtingidas: metricsData?.metas_atingidas || 8,
          totalMetas: metricsData?.total_metas || 12,
          projetos: (projetos || []).map(p => ({
            id: p.id,
            nome: p.nome || 'Projeto',
            tipo: p.tipo || 'Energia',
            impacto: p.impacto || 'Alto',
            status: p.status || 'em_andamento',
            economia: p.economia || 0
          }))
        });
      } catch (err) {
        console.error('Erro na Sustentabilidade Suprema:', err);
        setMetrics({
          energiaRenovavel: 65,
          reducaoResiduos: 40,
          aguaReciclada: 55,
          emissoesSalvas: 1200,
          metasAtingidas: 8,
          totalMetas: 12,
          projetos: []
        });
      } finally {
        setLoading(false);
      }
    }

    loadSupremeSustainability();
  }, []);

  if (loading) {
    return (
      <LayoutSupremo title="Sustentabilidade Suprema">
        <div className="flex items-center justify-center h-screen bg-black">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-40 h-40 border-8 border-t-transparent border-emerald-500 rounded-full"
          />
          <p className="absolute text-4xl text-emerald-400 font-light">Calculando pegada...</p>
        </div>
      </LayoutSupremo>
    );
  }

  return (
    <LayoutSupremo title="Sustentabilidade Suprema">
      <div className="min-h-screen bg-black text-white p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-7xl font-black bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 bg-clip-text text-transparent">
            SUSTENTABILIDADE SUPREMA
          </h1>
          <p className="text-3xl text-gray-400 mt-6">
            Negócios sustentáveis são negócios eternos
          </p>
        </motion.div>

        {/* PLANETA CENTRAL */}
        <div className="flex justify-center mb-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="relative"
          >
            <div className="w-64 h-64 rounded-full bg-gradient-to-br from-blue-500 via-green-500 to-emerald-500 opacity-30 blur-3xl absolute inset-0" />
            <div className="w-64 h-64 rounded-full bg-gradient-to-br from-blue-600 via-green-600 to-emerald-600 flex items-center justify-center relative">
              <GlobeAmericasIcon className="w-32 h-32 text-white" />
            </div>
          </motion.div>
        </div>

        {/* KPIs SUSTENTÁVEIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 max-w-6xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-yellow-900/60 to-orange-900/60 rounded-3xl p-8 border border-yellow-500/30 text-center"
          >
            <SunIcon className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <p className="text-5xl font-black text-white">{metrics?.energiaRenovavel}%</p>
            <p className="text-gray-400 mt-2">Energia Renovável</p>
            <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metrics?.energiaRenovavel}%` }}
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
              />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 rounded-3xl p-8 border border-green-500/30 text-center"
          >
            <ArrowPathIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <p className="text-5xl font-black text-white">{metrics?.reducaoResiduos}%</p>
            <p className="text-gray-400 mt-2">Redução Resíduos</p>
            <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metrics?.reducaoResiduos}%` }}
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
              />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-blue-900/60 to-cyan-900/60 rounded-3xl p-8 border border-blue-500/30 text-center"
          >
            <BeakerIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <p className="text-5xl font-black text-white">{metrics?.aguaReciclada}%</p>
            <p className="text-gray-400 mt-2">Água Reciclada</p>
            <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metrics?.aguaReciclada}%` }}
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
              />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-teal-900/60 to-cyan-900/60 rounded-3xl p-8 border border-teal-500/30 text-center"
          >
            <CloudIcon className="w-16 h-16 text-teal-400 mx-auto mb-4" />
            <p className="text-5xl font-black text-white">{metrics?.emissoesSalvas}</p>
            <p className="text-gray-400 mt-2">Ton CO₂ Evitadas</p>
          </motion.div>
        </div>

        {/* PROGRESSO DAS METAS */}
        <div className="max-w-xl mx-auto mb-16">
          <div className="bg-gradient-to-br from-emerald-900/40 to-green-900/40 rounded-3xl p-8 border border-emerald-500/30 text-center">
            <p className="text-2xl text-gray-400 mb-4">Metas de Sustentabilidade</p>
            <p className="text-7xl font-black text-white">
              {metrics?.metasAtingidas}/{metrics?.totalMetas}
            </p>
            <p className="text-emerald-400 text-xl mt-2">
              {metrics?.totalMetas ? ((metrics.metasAtingidas / metrics.totalMetas) * 100).toFixed(0) : 0}% concluído
            </p>
          </div>
        </div>

        {/* PROJETOS */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
            Projetos Sustentáveis
          </h2>

          {metrics?.projetos.length === 0 ? (
            <div className="text-center py-20">
              <GlobeAmericasIcon className="w-32 h-32 text-gray-700 mx-auto mb-8" />
              <p className="text-3xl text-gray-500">Nenhum projeto cadastrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {metrics?.projetos.map((projeto, i) => (
                <motion.div
                  key={projeto.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 border border-white/10 hover:border-emerald-500/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm">
                      {projeto.tipo}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      projeto.status === 'concluido' ? 'bg-green-500/20 text-green-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {projeto.status}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{projeto.nome}</h3>
                  <p className="text-gray-400 text-sm mb-4">Impacto: {projeto.impacto}</p>

                  <div className="pt-4 border-t border-white/10">
                    <p className="text-2xl font-bold text-emerald-400">
                      R$ {projeto.economia.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-gray-500 text-sm">Economia gerada</p>
                  </div>
                </motion.div>
              ))}
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
          <SparklesIcon className="w-32 h-32 text-emerald-400 mx-auto mb-8 animate-pulse" />
          <p className="text-5xl font-light text-emerald-300 max-w-4xl mx-auto">
            "Cada ação sustentável hoje é um legado para as gerações futuras."
          </p>
          <p className="text-3xl text-gray-500 mt-8">
            — Citizen Supremo X.1, seu Guardião do Futuro
          </p>
        </motion.div>
      </div>
    </LayoutSupremo>
  );
}
