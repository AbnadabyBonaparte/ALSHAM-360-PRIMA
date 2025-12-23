// src/pages/Investors.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Investidores Alienígenas 1000/1000
// Cada investidor é um foguete de crescimento. Capital inteligente que acelera impérios.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA
// ✅ MIGRADO PARA SHADCN/UI + CSS VARIABLES

import {
  BanknotesIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  BuildingLibraryIcon,
  UserGroupIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Investor {
  id: string;
  nome: string;
  tipo: 'angel' | 'vc' | 'pe' | 'family_office' | 'corporativo';
  investimento: number;
  participacao: number;
  data_entrada: string;
  valuation_entrada: number;
  retorno_atual: number;
  status: 'ativo' | 'saiu' | 'prospect';
}

interface InvestorMetrics {
  totalInvestidores: number;
  capitalTotal: number;
  valuationAtual: number;
  multiplicador: number;
  investidores: Investor[];
}

export default function InvestorsPage() {
  const [metrics, setMetrics] = useState<InvestorMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeInvestors() {
      try {
        const { data: investidores } = await supabase
          .from('investidores')
          .select('*')
          .order('investimento', { ascending: false });

        if (investidores) {
          const capitalTotal = investidores.reduce((s: number, i: any) => s + (i.investimento || 0), 0);
          const valuationAtual = 50000000;
          const retornoTotal = investidores.reduce((s: number, i: any) => s + (i.retorno_atual || 0), 0);

          setMetrics({
            totalInvestidores: investidores.length,
            capitalTotal,
            valuationAtual,
            multiplicador: capitalTotal > 0 ? retornoTotal / capitalTotal : 0,
            investidores: investidores.map((i: any) => ({
              id: i.id,
              nome: i.nome || 'Investidor',
              tipo: i.tipo || 'angel',
              investimento: i.investimento || 0,
              participacao: i.participacao || 0,
              data_entrada: i.data_entrada || '',
              valuation_entrada: i.valuation_entrada || 0,
              retorno_atual: i.retorno_atual || 0,
              status: i.status || 'ativo'
            }))
          });
        } else {
          setMetrics({
            totalInvestidores: 0,
            capitalTotal: 0,
            valuationAtual: 0,
            multiplicador: 0,
            investidores: []
          });
        }
      } catch (err) {
        console.error('Erro nos Investidores Supremos:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSupremeInvestors();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-8 border-t-transparent border-[var(--accent-emerald)] rounded-full"
        />
        <p className="absolute text-4xl text-[var(--accent-emerald)] font-light">Calculando valuations...</p>
      </div>
    );
  }

  const tipoConfig: Record<string, { label: string; color: string }> = {
    angel: { label: 'Angel Investor', color: 'text-[var(--accent-warning)]' },
    vc: { label: 'Venture Capital', color: 'text-[var(--accent-purple)]' },
    pe: { label: 'Private Equity', color: 'text-[var(--accent-sky)]' },
    family_office: { label: 'Family Office', color: 'text-[var(--accent-emerald)]' },
    corporativo: { label: 'Corporate VC', color: 'text-[var(--accent-sky)]' }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] p-8">
      {/* HEADER ÉPICO */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-[var(--accent-emerald)] via-[var(--accent-emerald)] to-[var(--accent-sky)] bg-clip-text text-transparent">
          INVESTIDORES SUPREMOS
        </h1>
        <p className="text-3xl text-[var(--text-secondary)] mt-6">
          Capital inteligente que acelera impérios
        </p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
        <Card className="bg-[var(--accent-emerald)]/10 border-[var(--accent-emerald)]/30 hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <UserGroupIcon className="w-12 h-12 text-[var(--accent-emerald)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.totalInvestidores || 0}</p>
            <p className="text-[var(--text-secondary)]">Investidores</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-warning)]/10 border-[var(--accent-warning)]/30 hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <BanknotesIcon className="w-12 h-12 text-[var(--accent-warning)] mb-3" />
            <p className="text-3xl font-black text-[var(--text-primary)]">R$ {((metrics?.capitalTotal || 0) / 1000000).toFixed(1)}M</p>
            <p className="text-[var(--text-secondary)]">Capital Levantado</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-purple)]/10 border-[var(--accent-purple)]/30 hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <ChartBarIcon className="w-12 h-12 text-[var(--accent-purple)] mb-3" />
            <p className="text-3xl font-black text-[var(--text-primary)]">R$ {((metrics?.valuationAtual || 0) / 1000000).toFixed(0)}M</p>
            <p className="text-[var(--text-secondary)]">Valuation Atual</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-sky)]/10 border-[var(--accent-sky)]/30 hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <ArrowTrendingUpIcon className="w-12 h-12 text-[var(--accent-sky)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{(metrics?.multiplicador || 0).toFixed(1)}x</p>
            <p className="text-[var(--text-secondary)]">Multiplicador</p>
          </CardContent>
        </Card>
      </div>

      {/* LISTA DE INVESTIDORES */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[var(--accent-emerald)] to-[var(--accent-emerald)] bg-clip-text text-transparent">
          Cap Table
        </h2>

        {metrics?.investidores.length === 0 ? (
          <div className="text-center py-20">
            <BuildingLibraryIcon className="w-32 h-32 text-[var(--text-secondary)]/30 mx-auto mb-8" />
            <p className="text-3xl text-[var(--text-secondary)]">Nenhum investidor cadastrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {metrics?.investidores.map((inv, i) => {
              const config = tipoConfig[inv.tipo];
              const multiplicadorInd = inv.investimento > 0 ? inv.retorno_atual / inv.investimento : 0;

              return (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)] hover:border-[var(--accent-emerald)]/50 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-2xl bg-[var(--accent-emerald)]/20 flex items-center justify-center">
                            <BuildingLibraryIcon className="w-8 h-8 text-[var(--accent-emerald)]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-bold text-[var(--text-primary)]">{inv.nome}</h3>
                              <span className={`text-sm ${config.color}`}>{config.label}</span>
                              {inv.status === 'saiu' && (
                                <Badge className="bg-[var(--text-secondary)]/20 text-[var(--text-secondary)]">Exit</Badge>
                              )}
                            </div>
                            <p className="text-[var(--text-secondary)] text-sm">
                              Entrou em {inv.data_entrada ? format(new Date(inv.data_entrada), "MMM yyyy", { locale: ptBR }) : '-'}
                              {' '}@ R$ {(inv.valuation_entrada / 1000000).toFixed(1)}M
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-8">
                          <div className="text-center">
                            <p className="text-xl font-bold text-[var(--accent-warning)]">R$ {(inv.investimento / 1000000).toFixed(2)}M</p>
                            <p className="text-[var(--text-secondary)] text-xs">Investido</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xl font-bold text-[var(--accent-purple)]">{inv.participacao.toFixed(2)}%</p>
                            <p className="text-[var(--text-secondary)] text-xs">Participação</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xl font-bold text-[var(--accent-emerald)]">R$ {(inv.retorno_atual / 1000000).toFixed(2)}M</p>
                            <p className="text-[var(--text-secondary)] text-xs">Valor Atual</p>
                          </div>
                          <Badge className={`px-4 py-2 ${
                            multiplicadorInd >= 2 ? 'bg-[var(--accent-emerald)]/20 text-[var(--accent-emerald)]' :
                            multiplicadorInd >= 1 ? 'bg-[var(--accent-warning)]/20 text-[var(--accent-warning)]' :
                            'bg-[var(--accent-alert)]/20 text-[var(--accent-alert)]'
                          }`}>
                            <p className="text-xl font-black">{multiplicadorInd.toFixed(1)}x</p>
                          </Badge>
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
        <SparklesIcon className="w-32 h-32 text-[var(--accent-emerald)] mx-auto mb-8 animate-pulse" />
        <p className="text-5xl font-light text-[var(--accent-emerald)] max-w-4xl mx-auto">
          "Investidores não compram participação. Compram visão e execução."
        </p>
        <p className="text-3xl text-[var(--text-secondary)] mt-8">
          — Citizen Supremo X.1, seu CFO Estratégico
        </p>
      </motion.div>
    </div>
  );
}
