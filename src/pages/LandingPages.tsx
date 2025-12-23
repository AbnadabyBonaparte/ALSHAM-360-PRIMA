// src/pages/LandingPages.tsx
// ALSHAM 360° PRIMA — LANDING PAGES SUPREMAS (VERSÃO CANÔNICA 1000/1000)
// Totalmente integrada ao layout global • 100% variáveis de tema • Realtime • Métricas vivas

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GlobeAltIcon, RocketLaunchIcon, EyeIcon, UserPlusIcon,
  ArrowTrendingUpIcon, SparklesIcon
} from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

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
    const loadLPs = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('landing_pages')
          .select('*')
          .order('visualizacoes', { ascending: false });

        if (error) throw error;

        if (data) {
          const totalViews = data.reduce((s, l) => s + (l.visualizacoes || 0), 0);
          const totalConv = data.reduce((s, l) => s + (l.conversoes || 0), 0);

          const processed = data.map(l => ({
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
          }));

          setMetrics({
            totalLPs: data.length,
            ativas: data.filter(l => l.status === 'ativa').length,
            totalVisualizacoes: totalViews,
            totalConversoes: totalConv,
            taxaMediaConversao: totalViews > 0 ? (totalConv / totalViews) * 100 : 0,
            landingPages: processed
          });
        }
      } catch (err) {
        console.error('Erro ao carregar Landing Pages:', err);
        toast.error('Falha ao carregar o arsenal de LPs');
      } finally {
        setLoading(false);
      }
    };

    loadLPs();

    // Realtime (opcional — novo LP ou update)
    const channel = supabase
      .channel('lps-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'landing_pages' }, loadLPs)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 border-8 border-t-transparent border-[var(--accent-1)] rounded-full mx-auto mb-8"
          />
          <p className="text-3xl font-black text-[var(--text)]">CARREGANDO O ARSENAL SUPREMO...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[var(--background)] overflow-hidden">
      {/* TOOLBAR SUPERIOR */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)]/50 backdrop-blur-md p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-black bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] bg-clip-text text-transparent">
            LANDING PAGES SUPREMAS
          </h1>
          <p className="text-2xl text-[var(--text)]/70 mt-4">
            Cada LP é uma armadilha de conversão perfeita. O visitante entra, cliente sai.
          </p>
        </div>
      </div>

      {/* KPIs GRID */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 mb-16">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-[var(--surface)]/60 backdrop-blur-xl rounded-3xl p-8 border border-[var(--border)]">
            <GlobeAltIcon className="w-16 h-16 text-[var(--accent-1)] mb-4" />
            <p className="text-5xl font-black text-[var(--text)]">{metrics?.totalLPs || 0}</p>
            <p className="text-xl text-[var(--text)]/70">Total LPs</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="bg-[var(--surface)]/60 backdrop-blur-xl rounded-3xl p-8 border border-[var(--border)]">
            <RocketLaunchIcon className="w-16 h-16 text-[var(--accent-emerald)] mb-4" />
            <p className="text-5xl font-black text-[var(--text)]">{metrics?.ativas || 0}</p>
            <p className="text-xl text-[var(--text)]/70">Ativas</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="bg-[var(--surface)]/60 backdrop-blur-xl rounded-3xl p-8 border border-[var(--border)]">
            <EyeIcon className="w-16 h-16 text-[var(--accent-sky)] mb-4" />
            <p className="text-5xl font-black text-[var(--text)]">{(metrics?.totalVisualizacoes || 0).toLocaleString()}</p>
            <p className="text-xl text-[var(--text)]/70">Visualizações</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="bg-[var(--surface)]/60 backdrop-blur-xl rounded-3xl p-8 border border-[var(--border)]">
            <UserPlusIcon className="w-16 h-16 text-[var(--accent-purple)] mb-4" />
            <p className="text-5xl font-black text-[var(--text)]">{(metrics?.totalConversoes || 0).toLocaleString()}</p>
            <p className="text-xl text-[var(--text)]/70">Conversões</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="bg-[var(--surface)]/60 backdrop-blur-xl rounded-3xl p-8 border border-[var(--border)]">
            <ArrowTrendingUpIcon className="w-16 h-16 text-[var(--accent-1)] mb-4" />
            <p className="text-5xl font-black text-[var(--text)]">{(metrics?.taxaMediaConversao || 0).toFixed(1)}%</p>
            <p className="text-xl text-[var(--text)]/70">Taxa Média</p>
          </motion.div>
        </div>

        {/* LISTA DE LPs */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-12 bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] bg-clip-text text-transparent">
            ARSENAL DE CONVERSÃO
          </h2>

          {metrics?.landingPages.length === 0 ? (
            <div className="text-center py-32">
              <GlobeAltIcon className="w-32 h-32 text-[var(--text)]/30 mx-auto mb-8" />
              <p className="text-3xl text-[var(--text)]/50">Nenhuma landing page cadastrada ainda</p>
            </div>
          ) : (
            <div className="space-y-8">
              {metrics.landingPages.map((lp, i) => (
                <motion.div
                  key={lp.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-[var(--surface)]/60 backdrop-blur-xl rounded-3xl p-8 border border-[var(--border)] hover:border-[var(--accent-1)]/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      <div className={`w-5 h-5 rounded-full ${lp.status === 'ativa' ? 'bg-[var(--accent-emerald)] animate-pulse' : lp.status === 'pausada' ? 'bg-[var(--accent-warning)]' : 'bg-[var(--text)]/30'}`} />
                      <div>
                        <h3 className="text-3xl font-black text-[var(--text)]">{lp.nome}</h3>
                        <p className="text-[var(--accent-1)] text-lg">{lp.url}</p>
                        {lp.campanha && <p className="text-[var(--text)]/60">Campanha: {lp.campanha}</p>}
                      </div>
                    </div>
                    <div className="flex gap-12 text-right">
                      <div>
                        <p className="text-3xl font-black text-[var(--accent-sky)]">{lp.visualizacoes.toLocaleString()}</p>
                        <p className="text-[var(--text)]/60">Visualizações</p>
                      </div>
                      <div>
                        <p className="text-3xl font-black text-[var(--accent-purple)]">{lp.conversoes.toLocaleString()}</p>
                        <p className="text-[var(--text)]/60">Conversões</p>
                      </div>
                      <div>
                        <p className={`text-3xl font-black ${lp.taxa_conversao >= 5 ? 'text-[var(--accent-emerald)]' : lp.taxa_conversao >= 2 ? 'text-[var(--accent-warning)]' : 'text-[var(--accent-alert)]'}`}>
                          {lp.taxa_conversao.toFixed(1)}%
                        </p>
                        <p className="text-[var(--text)]/60">Taxa</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 h-3 bg-[var(--background)]/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${lp.taxa_conversao}%` }}
                      className="h-full bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)]"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MENSAGEM FINAL DA IA */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <SparklesIcon className="w-24 h-24 text-[var(--accent-1)] mx-auto mb-6 animate-pulse" />
        <p className="text-4xl font-black bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] bg-clip-text text-transparent">
          "Uma landing page perfeita não convence. Ela hipnotiza."
        </p>
        <p className="text-2xl text-[var(--text)]/70 mt-4">
          — Citizen Supremo X.1, seu Arquiteto de Conversão
        </p>
      </div>
    </div>
  );
}
