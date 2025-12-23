// src/pages/LandingPages.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Landing Pages Alienígenas 1000/1000
// Cada LP é uma armadilha de conversão perfeita. O visitante entra, cliente sai.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA

import {
  RocketLaunchIcon,
  EyeIcon,
  UserPlusIcon,
  SparklesIcon,
  GlobeAltIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(
  (import.meta as any).env.VITE_SUPABASE_URL,
  (import.meta as any).env.VITE_SUPABASE_ANON_KEY
);
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

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
          const totalViews = lps.reduce((s: number, l: any) => s + (l.visualizacoes || 0), 0);
          const totalConv = lps.reduce((s: number, l: any) => s + (l.conversoes || 0), 0);

          setMetrics({
            totalLPs: lps.length,
            ativas: lps.filter(l => l.status === 'ativa').length,
            totalVisualizacoes: totalViews,
            totalConversoes: totalConv,
            taxaMediaConversao: totalViews > 0 ? (totalConv / totalViews) * 100 : 0,
            landingPages: lps.map((l: any) => ({
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
        <Skeleton className="w-40 h-40 rounded-full" />
        <p className="absolute text-4xl text-[var(--accent-sky)] font-light">Carregando LPs...</p>
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
          <Card className="border-0 bg-transparent">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-black text-[var(--text-primary)]">
                LANDING PAGES SUPREMAS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl text-[var(--text-secondary)]">
                Cada LP é uma armadilha de conversão perfeita
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12 max-w-7xl mx-auto">
          <motion.div whileHover={{ scale: 1.05 }}>
            <Card className="border-[var(--border)] bg-[var(--surface)]">
              <CardContent className="p-6">
                <GlobeAltIcon className="w-12 h-12 text-[var(--accent-sky)] mb-3" />
                <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.totalLPs || 0}</p>
                <p className="text-[var(--text-secondary)]">Total LPs</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }}>
            <Card className="border-[var(--border)] bg-[var(--surface)]">
              <CardContent className="p-6">
                <RocketLaunchIcon className="w-12 h-12 text-[var(--accent-emerald)] mb-3" />
                <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.ativas || 0}</p>
                <p className="text-[var(--text-secondary)]">Ativas</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }}>
            <Card className="border-[var(--border)] bg-[var(--surface)]">
              <CardContent className="p-6">
                <EyeIcon className="w-12 h-12 text-[var(--accent-sky)] mb-3" />
                <p className="text-4xl font-black text-[var(--text-primary)]">{(metrics?.totalVisualizacoes || 0).toLocaleString()}</p>
                <p className="text-[var(--text-secondary)]">Visualizações</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }}>
            <Card className="border-[var(--border)] bg-[var(--surface)]">
              <CardContent className="p-6">
                <UserPlusIcon className="w-12 h-12 text-[var(--accent-purple)] mb-3" />
                <p className="text-4xl font-black text-[var(--text-primary)]">{(metrics?.totalConversoes || 0).toLocaleString()}</p>
                <p className="text-[var(--text-secondary)]">Conversões</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }}>
            <Card className="border-[var(--border)] bg-[var(--surface)]">
              <CardContent className="p-6">
                <ArrowTrendingUpIcon className="w-12 h-12 text-[var(--accent-warning)] mb-3" />
                <p className="text-4xl font-black text-[var(--text-primary)]">{(metrics?.taxaMediaConversao || 0).toFixed(1)}%</p>
                <p className="text-[var(--text-secondary)]">Taxa Média</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* LISTA DE LPs */}
        <div className="max-w-7xl mx-auto">
          <Card className="border-0 bg-transparent mb-12">
            <CardHeader className="text-center">
              <CardTitle className="text-4xl font-bold text-[var(--text-primary)]">
                Arsenal de Landing Pages
              </CardTitle>
            </CardHeader>
          </Card>

          {metrics?.landingPages.length === 0 ? (
            <Card className="border-[var(--border)] bg-[var(--surface)]">
              <CardContent className="text-center py-20">
                <GlobeAltIcon className="w-32 h-32 text-[var(--text-secondary)] mx-auto mb-8" />
                <p className="text-3xl text-[var(--text-secondary)]">Nenhuma landing page cadastrada</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {metrics?.landingPages.map((lp, i) => (
                <motion.div
                  key={lp.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent-sky)]/50 transition-all">
                    <CardContent className="p-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <Badge variant="outline" className={`w-4 h-4 rounded-full p-0 ${
                            lp.status === 'ativa' ? 'bg-[var(--accent-emerald)] animate-pulse' :
                            lp.status === 'pausada' ? 'bg-[var(--accent-warning)]' : 'bg-[var(--text-secondary)]'
                          }`} />
                          <div>
                            <h3 className="text-2xl font-bold text-[var(--text-primary)]">{lp.nome}</h3>
                            <p className="text-[var(--accent-sky)] text-sm">{lp.url}</p>
                            {lp.campanha && <p className="text-[var(--text-secondary)] text-sm">Campanha: {lp.campanha}</p>}
                          </div>
                        </div>

                        <div className="flex items-center gap-10 text-right">
                          <div>
                            <p className="text-2xl font-bold text-[var(--accent-sky)]">{lp.visualizacoes.toLocaleString()}</p>
                            <p className="text-[var(--text-secondary)] text-sm">Visualizações</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-[var(--accent-purple)]">{lp.conversoes.toLocaleString()}</p>
                            <p className="text-[var(--text-secondary)] text-sm">Conversões</p>
                          </div>
                          <div>
                            <p className={`text-2xl font-bold ${
                              lp.taxa_conversao >= 5 ? 'text-[var(--accent-emerald)]' :
                              lp.taxa_conversao >= 2 ? 'text-[var(--accent-warning)]' : 'text-[var(--accent-alert)]'
                            }`}>
                              {lp.taxa_conversao.toFixed(1)}%
                            </p>
                            <p className="text-[var(--text-secondary)] text-sm">Taxa</p>
                          </div>
                        </div>
                      </div>

                      {/* BARRA DE CONVERSÃO */}
                      <div className="mt-6">
                        <Progress value={Math.min(lp.taxa_conversao * 10, 100)} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
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
          <Card className="border-0 bg-transparent max-w-4xl mx-auto">
            <CardContent className="text-center">
              <SparklesIcon className="w-32 h-32 text-[var(--accent-sky)] mx-auto mb-8 animate-pulse" />
              <p className="text-5xl font-light text-[var(--accent-sky)] max-w-4xl mx-auto">
                "Uma landing page perfeita não convence. Ela hipnotiza."
              </p>
              <p className="text-3xl text-[var(--text-secondary)] mt-8">
                — Citizen Supremo X.1, seu Arquiteto de Conversão
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
  );
}
