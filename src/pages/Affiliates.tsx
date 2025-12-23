// src/pages/Affiliates.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Afiliados Alienígenas 1000/1000
// 100% CSS Variables + shadcn/ui

import {
  UserPlusIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  TrophyIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Affiliate {
  id: string;
  nome: string;
  email: string;
  nivel: 'bronze' | 'prata' | 'ouro' | 'diamante';
  vendas: number;
  comissao_total: number;
  comissao_pendente: number;
  cliques: number;
  conversao: number;
  status: 'ativo' | 'inativo' | 'pendente';
}

interface AffiliateMetrics {
  totalAfiliados: number;
  ativos: number;
  vendasGeradas: number;
  comissoesPagas: number;
  afiliados: Affiliate[];
}

export default function AffiliatesPage() {
  const [metrics, setMetrics] = useState<AffiliateMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeAffiliates() {
      try {
        const { data: afiliados } = await supabase
          .from('afiliados')
          .select('*')
          .order('comissao_total', { ascending: false });

        if (afiliados) {
          const ativos = afiliados.filter(a => a.status === 'ativo').length;
          const vendasGeradas = afiliados.reduce((s, a) => s + (a.vendas || 0), 0);
          const comissoesPagas = afiliados.reduce((s, a) => s + (a.comissao_total || 0), 0);

          setMetrics({
            totalAfiliados: afiliados.length,
            ativos,
            vendasGeradas,
            comissoesPagas,
            afiliados: afiliados.map(a => ({
              id: a.id,
              nome: a.nome || 'Afiliado',
              email: a.email || '',
              nivel: a.nivel || 'bronze',
              vendas: a.vendas || 0,
              comissao_total: a.comissao_total || 0,
              comissao_pendente: a.comissao_pendente || 0,
              cliques: a.cliques || 0,
              conversao: a.cliques > 0 ? ((a.vendas || 0) / a.cliques) * 100 : 0,
              status: a.status || 'pendente'
            }))
          });
        } else {
          setMetrics({
            totalAfiliados: 0,
            ativos: 0,
            vendasGeradas: 0,
            comissoesPagas: 0,
            afiliados: []
          });
        }
      } catch (err) {
        console.error('Erro nos Afiliados Supremos:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSupremeAffiliates();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-8 border-t-transparent border-[var(--accent-warning)] rounded-full"
        />
        <p className="absolute text-4xl text-[var(--accent-warning)] font-light">Carregando afiliados...</p>
      </div>
    );
  }

  const nivelConfig: Record<string, { bg: string; emoji: string }> = {
    bronze: { bg: 'from-[var(--accent-warning)] to-[var(--accent-warning)]/70', emoji: '🥉' },
    prata: { bg: 'from-[var(--text-secondary)] to-[var(--text-secondary)]/70', emoji: '🥈' },
    ouro: { bg: 'from-[var(--accent-warning)] to-[var(--accent-warning)]/70', emoji: '🥇' },
    diamante: { bg: 'from-[var(--accent-sky)] to-[var(--accent-sky)]/70', emoji: '💎' }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] p-8">
      {/* HEADER ÉPICO */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-[var(--accent-warning)] via-[var(--accent-warning)] to-[var(--accent-alert)] bg-clip-text text-transparent">
          AFILIADOS SUPREMOS
        </h1>
        <p className="text-3xl text-[var(--text-secondary)] mt-6">
          Cada afiliado é um exército particular
        </p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
        <Card className="bg-[var(--accent-warning)]/10 border-[var(--accent-warning)]/30">
          <CardContent className="p-6">
            <UserPlusIcon className="w-12 h-12 text-[var(--accent-warning)] mb-3" />
            <p className="text-4xl font-black text-[var(--text)]">{metrics?.totalAfiliados || 0}</p>
            <p className="text-[var(--text-secondary)]">Total Afiliados</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-emerald)]/10 border-[var(--accent-emerald)]/30">
          <CardContent className="p-6">
            <ChartBarIcon className="w-12 h-12 text-[var(--accent-emerald)] mb-3" />
            <p className="text-4xl font-black text-[var(--text)]">{metrics?.ativos || 0}</p>
            <p className="text-[var(--text-secondary)]">Ativos</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-sky)]/10 border-[var(--accent-sky)]/30">
          <CardContent className="p-6">
            <ArrowTrendingUpIcon className="w-12 h-12 text-[var(--accent-sky)] mb-3" />
            <p className="text-4xl font-black text-[var(--text)]">{(metrics?.vendasGeradas || 0).toLocaleString()}</p>
            <p className="text-[var(--text-secondary)]">Vendas Geradas</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-purple)]/10 border-[var(--accent-purple)]/30">
          <CardContent className="p-6">
            <CurrencyDollarIcon className="w-12 h-12 text-[var(--accent-purple)] mb-3" />
            <p className="text-3xl font-black text-[var(--text)]">R$ {((metrics?.comissoesPagas || 0) / 1000).toFixed(0)}k</p>
            <p className="text-[var(--text-secondary)]">Comissões Pagas</p>
          </CardContent>
        </Card>
      </div>

      {/* RANKING DE AFILIADOS */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[var(--accent-warning)] to-[var(--accent-warning)] bg-clip-text text-transparent">
          Ranking de Afiliados
        </h2>

        {metrics?.afiliados.length === 0 ? (
          <div className="text-center py-20">
            <UserPlusIcon className="w-32 h-32 text-[var(--text-secondary)]/30 mx-auto mb-8" />
            <p className="text-3xl text-[var(--text-secondary)]">Nenhum afiliado cadastrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {metrics?.afiliados.map((afiliado, i) => {
              const config = nivelConfig[afiliado.nivel];
              return (
                <motion.div
                  key={afiliado.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={`bg-[var(--surface)]/60 border transition-all ${
                    i < 3 ? 'border-[var(--accent-warning)]/30 shadow-lg shadow-[var(--accent-warning)]/10' : 'border-[var(--border)]'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.bg} flex items-center justify-center text-2xl`}>
                            {i < 3 ? ['🥇', '🥈', '🥉'][i] : config.emoji}
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-bold text-[var(--text)]">{afiliado.nome}</h3>
                              <Badge variant="secondary" className="capitalize">
                                {afiliado.nivel}
                              </Badge>
                              {afiliado.status !== 'ativo' && (
                                <Badge variant="outline">
                                  {afiliado.status}
                                </Badge>
                              )}
                            </div>
                            <p className="text-[var(--text-secondary)] text-sm">{afiliado.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-8">
                          <div className="text-center">
                            <p className="text-xl font-bold text-[var(--text)]">{afiliado.vendas}</p>
                            <p className="text-[var(--text-secondary)] text-xs">Vendas</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xl font-bold text-[var(--accent-sky)]">{afiliado.cliques.toLocaleString()}</p>
                            <p className="text-[var(--text-secondary)] text-xs">Cliques</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xl font-bold text-[var(--accent-emerald)]">{afiliado.conversao.toFixed(1)}%</p>
                            <p className="text-[var(--text-secondary)] text-xs">Conversão</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-[var(--accent-warning)]">R$ {afiliado.comissao_total.toLocaleString('pt-BR')}</p>
                            <p className="text-[var(--text-secondary)] text-xs">Total Ganho</p>
                          </div>
                          {afiliado.comissao_pendente > 0 && (
                            <div className="text-right">
                              <p className="text-lg font-bold text-[var(--accent-warning)]">R$ {afiliado.comissao_pendente.toLocaleString('pt-BR')}</p>
                              <p className="text-[var(--text-secondary)] text-xs">Pendente</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
        <SparklesIcon className="w-32 h-32 text-[var(--accent-warning)] mx-auto mb-8 animate-pulse" />
        <p className="text-5xl font-light text-[var(--accent-warning)] max-w-4xl mx-auto">
          "Afiliados transformam clientes em vendedores. É multiplicação exponencial."
        </p>
        <p className="text-3xl text-[var(--text-secondary)] mt-8">
          — Citizen Supremo X.1, seu Gerente de Parcerias
        </p>
      </motion.div>
    </div>
  );
}
