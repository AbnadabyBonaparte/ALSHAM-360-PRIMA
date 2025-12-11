// src/pages/Affiliates.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Afiliados Alienígenas 1000/1000
// Cada afiliado é um exército particular. Comissões que multiplicam vendas.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA

import {
  UserPlusIcon,
  CurrencyDollarIcon,
  LinkIcon,
  ChartBarIcon,
  TrophyIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

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
            className="w-40 h-40 border-8 border-t-transparent border-yellow-500 rounded-full"
          />
          <p className="absolute text-4xl text-yellow-400 font-light">Carregando afiliados...</p>
        </div>
      
    );
  }

  const nivelConfig: Record<string, { bg: string; text: string; emoji: string }> = {
    bronze: { bg: 'from-orange-700 to-orange-600', text: 'text-orange-400', emoji: '🥉' },
    prata: { bg: 'from-gray-500 to-gray-400', text: 'text-gray-300', emoji: '🥈' },
    ouro: { bg: 'from-yellow-600 to-yellow-500', text: 'text-yellow-400', emoji: '🥇' },
    diamante: { bg: 'from-cyan-500 to-blue-500', text: 'text-cyan-400', emoji: '💎' }
  };

  return (
    
      <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-8xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            AFILIADOS SUPREMOS
          </h1>
          <p className="text-3xl text-gray-400 mt-6">
            Cada afiliado é um exército particular
          </p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-yellow-900/60 to-orange-900/60 rounded-2xl p-6 border border-yellow-500/30">
            <UserPlusIcon className="w-12 h-12 text-yellow-400 mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.totalAfiliados || 0}</p>
            <p className="text-gray-400">Total Afiliados</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 rounded-2xl p-6 border border-green-500/30">
            <ChartBarIcon className="w-12 h-12 text-green-400 mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.ativos || 0}</p>
            <p className="text-gray-400">Ativos</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-blue-900/60 to-indigo-900/60 rounded-2xl p-6 border border-blue-500/30">
            <ArrowTrendingUpIcon className="w-12 h-12 text-blue-400 mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{(metrics?.vendasGeradas || 0).toLocaleString()}</p>
            <p className="text-gray-400">Vendas Geradas</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-purple-900/60 to-pink-900/60 rounded-2xl p-6 border border-purple-500/30">
            <CurrencyDollarIcon className="w-12 h-12 text-purple-400 mb-3" />
            <p className="text-3xl font-black text-[var(--text-primary)]">R$ {((metrics?.comissoesPagas || 0) / 1000).toFixed(0)}k</p>
            <p className="text-gray-400">Comissões Pagas</p>
          </motion.div>
        </div>

        {/* RANKING DE AFILIADOS */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Ranking de Afiliados
          </h2>

          {metrics?.afiliados.length === 0 ? (
            <div className="text-center py-20">
              <UserPlusIcon className="w-32 h-32 text-gray-700 mx-auto mb-8" />
              <p className="text-3xl text-gray-500">Nenhum afiliado cadastrado</p>
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
                    className={`bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl rounded-2xl p-6 border transition-all ${
                      i < 3 ? 'border-yellow-500/30 shadow-lg shadow-yellow-500/10' : 'border-[var(--border)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.bg} flex items-center justify-center text-2xl`}>
                          {i < 3 ? ['🥇', '🥈', '🥉'][i] : config.emoji}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-[var(--text-primary)]">{afiliado.nome}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs bg-gradient-to-r ${config.bg} text-[var(--text-primary)] capitalize`}>
                              {afiliado.nivel}
                            </span>
                            {afiliado.status !== 'ativo' && (
                              <span className="px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400">
                                {afiliado.status}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm">{afiliado.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <p className="text-xl font-bold text-[var(--text-primary)]">{afiliado.vendas}</p>
                          <p className="text-gray-500 text-xs">Vendas</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-cyan-400">{afiliado.cliques.toLocaleString()}</p>
                          <p className="text-gray-500 text-xs">Cliques</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-green-400">{afiliado.conversao.toFixed(1)}%</p>
                          <p className="text-gray-500 text-xs">Conversão</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-yellow-400">R$ {afiliado.comissao_total.toLocaleString('pt-BR')}</p>
                          <p className="text-gray-500 text-xs">Total Ganho</p>
                        </div>
                        {afiliado.comissao_pendente > 0 && (
                          <div className="text-right">
                            <p className="text-lg font-bold text-orange-400">R$ {afiliado.comissao_pendente.toLocaleString('pt-BR')}</p>
                            <p className="text-gray-500 text-xs">Pendente</p>
                          </div>
                        )}
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
          <SparklesIcon className="w-32 h-32 text-yellow-400 mx-auto mb-8 animate-pulse" />
          <p className="text-5xl font-light text-yellow-300 max-w-4xl mx-auto">
            "Afiliados transformam clientes em vendedores. É multiplicação exponencial."
          </p>
          <p className="text-3xl text-gray-500 mt-8">
            — Citizen Supremo X.1, seu Gerente de Parcerias
          </p>
        </motion.div>
      </div>
    
  );
}
