// src/pages/Investors.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Investidores Alienígenas 1000/1000
// Cada investidor é um foguete de crescimento. Capital inteligente que acelera impérios.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA

import LayoutSupremo from '@/components/LayoutSupremo';
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
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
          const capitalTotal = investidores.reduce((s, i) => s + (i.investimento || 0), 0);
          const valuationAtual = 50000000; // Valuation atual da empresa
          const retornoTotal = investidores.reduce((s, i) => s + (i.retorno_atual || 0), 0);

          setMetrics({
            totalInvestidores: investidores.length,
            capitalTotal,
            valuationAtual,
            multiplicador: capitalTotal > 0 ? retornoTotal / capitalTotal : 0,
            investidores: investidores.map(i => ({
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
      <LayoutSupremo title="Investidores Supremos">
        <div className="flex items-center justify-center h-screen bg-black">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-40 h-40 border-8 border-t-transparent border-emerald-500 rounded-full"
          />
          <p className="absolute text-4xl text-emerald-400 font-light">Calculando valuations...</p>
        </div>
      </LayoutSupremo>
    );
  }

  const tipoConfig: Record<string, { label: string; color: string }> = {
    angel: { label: 'Angel Investor', color: 'text-yellow-400' },
    vc: { label: 'Venture Capital', color: 'text-purple-400' },
    pe: { label: 'Private Equity', color: 'text-blue-400' },
    family_office: { label: 'Family Office', color: 'text-emerald-400' },
    corporativo: { label: 'Corporate VC', color: 'text-cyan-400' }
  };

  return (
    <LayoutSupremo title="Investidores Supremos">
      <div className="min-h-screen bg-black text-white p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-8xl font-black bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 bg-clip-text text-transparent">
            INVESTIDORES SUPREMOS
          </h1>
          <p className="text-3xl text-gray-400 mt-6">
            Capital inteligente que acelera impérios
          </p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-emerald-900/60 to-green-900/60 rounded-2xl p-6 border border-emerald-500/30">
            <UserGroupIcon className="w-12 h-12 text-emerald-400 mb-3" />
            <p className="text-4xl font-black text-white">{metrics?.totalInvestidores || 0}</p>
            <p className="text-gray-400">Investidores</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-yellow-900/60 to-orange-900/60 rounded-2xl p-6 border border-yellow-500/30">
            <BanknotesIcon className="w-12 h-12 text-yellow-400 mb-3" />
            <p className="text-3xl font-black text-white">R$ {((metrics?.capitalTotal || 0) / 1000000).toFixed(1)}M</p>
            <p className="text-gray-400">Capital Levantado</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-purple-900/60 to-pink-900/60 rounded-2xl p-6 border border-purple-500/30">
            <ChartBarIcon className="w-12 h-12 text-purple-400 mb-3" />
            <p className="text-3xl font-black text-white">R$ {((metrics?.valuationAtual || 0) / 1000000).toFixed(0)}M</p>
            <p className="text-gray-400">Valuation Atual</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-cyan-900/60 to-blue-900/60 rounded-2xl p-6 border border-cyan-500/30">
            <ArrowTrendingUpIcon className="w-12 h-12 text-cyan-400 mb-3" />
            <p className="text-4xl font-black text-white">{(metrics?.multiplicador || 0).toFixed(1)}x</p>
            <p className="text-gray-400">Multiplicador</p>
          </motion.div>
        </div>

        {/* LISTA DE INVESTIDORES */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
            Cap Table
          </h2>

          {metrics?.investidores.length === 0 ? (
            <div className="text-center py-20">
              <BuildingLibraryIcon className="w-32 h-32 text-gray-700 mx-auto mb-8" />
              <p className="text-3xl text-gray-500">Nenhum investidor cadastrado</p>
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
                    className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-emerald-500/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600/30 to-green-600/30 flex items-center justify-center">
                          <BuildingLibraryIcon className="w-8 h-8 text-emerald-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-white">{inv.nome}</h3>
                            <span className={`text-sm ${config.color}`}>{config.label}</span>
                            {inv.status === 'saiu' && (
                              <span className="px-2 py-1 bg-gray-500/20 rounded text-gray-400 text-xs">Exit</span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm">
                            Entrou em {inv.data_entrada ? format(new Date(inv.data_entrada), "MMM yyyy", { locale: ptBR }) : '-'}
                            {' '}@ R$ {(inv.valuation_entrada / 1000000).toFixed(1)}M
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <p className="text-xl font-bold text-yellow-400">R$ {(inv.investimento / 1000000).toFixed(2)}M</p>
                          <p className="text-gray-500 text-xs">Investido</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-purple-400">{inv.participacao.toFixed(2)}%</p>
                          <p className="text-gray-500 text-xs">Participação</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-emerald-400">R$ {(inv.retorno_atual / 1000000).toFixed(2)}M</p>
                          <p className="text-gray-500 text-xs">Valor Atual</p>
                        </div>
                        <div className={`px-4 py-2 rounded-xl ${
                          multiplicadorInd >= 2 ? 'bg-emerald-500/20 text-emerald-400' :
                          multiplicadorInd >= 1 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          <p className="text-xl font-black">{multiplicadorInd.toFixed(1)}x</p>
                        </div>
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
          <SparklesIcon className="w-32 h-32 text-emerald-400 mx-auto mb-8 animate-pulse" />
          <p className="text-5xl font-light text-emerald-300 max-w-4xl mx-auto">
            "Investidores não compram participação. Compram visão e execução."
          </p>
          <p className="text-3xl text-gray-500 mt-8">
            — Citizen Supremo X.1, seu CFO Estratégico
          </p>
        </motion.div>
      </div>
    </LayoutSupremo>
  );
}
