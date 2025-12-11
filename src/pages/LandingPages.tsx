// src/pages/LandingPages.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Landing Pages Alienígenas 1000/1000
// Cada LP é uma armadilha de conversão perfeita. O visitante entra, cliente sai.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA

import {
  RocketLaunchIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  UserPlusIcon,
  ChartBarIcon,
  SparklesIcon,
  GlobeAltIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface LandingPage {
  id: string;
  nome: string;
  url: string;
  status: 'ativa' | 'pausada' | 'rascunho';
  visualizacoes: number;
  conversoes: number;
  taxa_conversao: number;
  leads_gerados: number;
  campanha: string;
  data_criacao: string;
}

interface LPMetrics {
  totalLPs: number;
  ativas: number;
  totalVisualizacoes: number;
  totalConversoes: number;
  taxaMediaConversao: number;
  landingPages: LandingPage[];
}

export default function LandingPagesPage() {
  const [metrics, setMetrics] = useState<LPMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeLPs() {
      try {
        const { data: lps } = await supabase
          .from('landing_pages')
          .select('*')
          .order('visualizacoes', { ascending: false });

        if (lps) {
          const totalViews = lps.reduce((s, l) => s + (l.visualizacoes || 0), 0);
          const totalConv = lps.reduce((s, l) => s + (l.conversoes || 0), 0);

          setMetrics({
            totalLPs: lps.length,
            ativas: lps.filter(l => l.status === 'ativa').length,
            totalVisualizacoes: totalViews,
            totalConversoes: totalConv,
            taxaMediaConversao: totalViews > 0 ? (totalConv / totalViews) * 100 : 0,
            landingPages: lps.map(l => ({
              id: l.id,
              nome: l.nome || 'LP sem nome',
              url: l.url || '',
              status: l.status || 'rascunho',
              visualizacoes: l.visualizacoes || 0,
              conversoes: l.conversoes || 0,
              taxa_conversao: l.visualizacoes > 0 ? ((l.conversoes || 0) / l.visualizacoes) * 100 : 0,
              leads_gerados: l.leads_gerados || 0,
              campanha: l.campanha || '',
              data_criacao: l.data_criacao || ''
            }))
          });
        } else {
          setMetrics({
            totalLPs: 0,
            ativas: 0,
            totalVisualizacoes: 0,
            totalConversoes: 0,
            taxaMediaConversao: 0,
            landingPages: []
          });
        }
      } catch (err) {
        console.error('Erro nas Landing Pages Supremas:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSupremeLPs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-8 border-t-transparent border-cyan-500 rounded-full"
        />
        <p className="absolute text-4xl text-cyan-400 font-light">Carregando LPs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            LANDING PAGES SUPREMAS
          </h1>
          <p className="text-3xl text-gray-400 mt-6">
            Cada LP é uma armadilha de conversão perfeita
          </p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12 max-w-7xl mx-auto">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-cyan-900/60 to-blue-900/60 rounded-2xl p-6 border border-cyan-500/30">
            <GlobeAltIcon className="w-12 h-12 text-cyan-400 mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.totalLPs || 0}</p>
            <p className="text-gray-400">Total LPs</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 rounded-2xl p-6 border border-green-500/30">
            <RocketLaunchIcon className="w-12 h-12 text-green-400 mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.ativas || 0}</p>
            <p className="text-gray-400">Ativas</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-blue-900/60 to-indigo-900/60 rounded-2xl p-6 border border-blue-500/30">
            <EyeIcon className="w-12 h-12 text-blue-400 mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{(metrics?.totalVisualizacoes || 0).toLocaleString()}</p>
            <p className="text-gray-400">Visualizações</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-purple-900/60 to-pink-900/60 rounded-2xl p-6 border border-purple-500/30">
            <UserPlusIcon className="w-12 h-12 text-purple-400 mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{(metrics?.totalConversoes || 0).toLocaleString()}</p>
            <p className="text-gray-400">Conversões</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-yellow-900/60 to-orange-900/60 rounded-2xl p-6 border border-yellow-500/30">
            <ArrowTrendingUpIcon className="w-12 h-12 text-yellow-400 mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{(metrics?.taxaMediaConversao || 0).toFixed(1)}%</p>
            <p className="text-gray-400">Taxa Média</p>
          </motion.div>
        </div>

        {/* LISTA DE LPs */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Arsenal de Landing Pages
          </h2>

          {metrics?.landingPages.length === 0 ? (
            <div className="text-center py-20">
              <GlobeAltIcon className="w-32 h-32 text-gray-700 mx-auto mb-8" />
              <p className="text-3xl text-gray-500">Nenhuma landing page cadastrada</p>
            </div>
          ) : (
            <div className="space-y-6">
              {metrics?.landingPages.map((lp, i) => (
                <motion.div
                  key={lp.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl rounded-2xl p-8 border border-[var(--border)] hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className={`w-4 h-4 rounded-full ${
                        lp.status === 'ativa' ? 'bg-green-400 animate-pulse' :
                        lp.status === 'pausada' ? 'bg-yellow-400' : 'bg-gray-400'
                      }`} />
                      <div>
                        <h3 className="text-2xl font-bold text-[var(--text-primary)]">{lp.nome}</h3>
                        <p className="text-cyan-400 text-sm">{lp.url}</p>
                        {lp.campanha && <p className="text-gray-500 text-sm">Campanha: {lp.campanha}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-10 text-right">
                      <div>
                        <p className="text-2xl font-bold text-blue-400">{lp.visualizacoes.toLocaleString()}</p>
                        <p className="text-gray-500 text-sm">Visualizações</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-400">{lp.conversoes.toLocaleString()}</p>
                        <p className="text-gray-500 text-sm">Conversões</p>
                      </div>
                      <div>
                        <p className={`text-2xl font-bold ${
                          lp.taxa_conversao >= 5 ? 'text-green-400' :
                          lp.taxa_conversao >= 2 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {lp.taxa_conversao.toFixed(1)}%
                        </p>
                        <p className="text-gray-500 text-sm">Taxa</p>
                      </div>
                    </div>
                  </div>

                  {/* BARRA DE CONVERSÃO */}
                  <div className="mt-6">
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(lp.taxa_conversao * 10, 100)}%` }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                      />
                    </div>
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
          <SparklesIcon className="w-32 h-32 text-cyan-400 mx-auto mb-8 animate-pulse" />
          <p className="text-5xl font-light text-cyan-300 max-w-4xl mx-auto">
            "Uma landing page perfeita não convence. Ela hipnotiza."
          </p>
          <p className="text-3xl text-gray-500 mt-8">
            — Citizen Supremo X.1, seu Arquiteto de Conversão
          </p>
        </motion.div>
      </div>
  );
}
