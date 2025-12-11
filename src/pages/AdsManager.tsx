// src/pages/AdsManager.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Ads Manager Alienígena 1000/1000
// Cada centavo investido retorna como tsunami de conversões.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA

import {
  CurrencyDollarIcon,
  ChartBarIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  ShoppingCartIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface Ad {
  id: string;
  nome: string;
  plataforma: string;
  status: 'ativo' | 'pausado' | 'encerrado';
  orcamento_diario: number;
  gasto_total: number;
  impressoes: number;
  cliques: number;
  conversoes: number;
  cpc: number;
  cpa: number;
  roas: number;
}

interface AdsMetrics {
  gastoTotal: number;
  receitaGerada: number;
  roasGeral: number;
  totalAds: number;
  adsAtivos: number;
  cpcMedio: number;
  cpaMedio: number;
  ads: Ad[];
}

export default function AdsManagerPage() {
  const [metrics, setMetrics] = useState<AdsMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeAds() {
      try {
        const { data: ads } = await supabase
          .from('ads_campaigns')
          .select('*')
          .order('id', { ascending: false });

        if (ads) {
          const gastoTotal = ads.reduce((s, a) => s + (a.gasto_total || 0), 0);
          const receitaGerada = ads.reduce((s, a) => s + ((a.conversoes || 0) * (a.valor_conversao || 100)), 0);
          const totalCliques = ads.reduce((s, a) => s + (a.cliques || 0), 0);
          const totalConversoes = ads.reduce((s, a) => s + (a.conversoes || 0), 0);

          setMetrics({
            gastoTotal,
            receitaGerada,
            roasGeral: gastoTotal > 0 ? receitaGerada / gastoTotal : 0,
            totalAds: ads.length,
            adsAtivos: ads.filter(a => a.status === 'ativo').length,
            cpcMedio: totalCliques > 0 ? gastoTotal / totalCliques : 0,
            cpaMedio: totalConversoes > 0 ? gastoTotal / totalConversoes : 0,
            ads: ads.map(a => ({
              id: a.id,
              nome: a.nome || 'Anúncio',
              plataforma: a.plataforma || 'unknown',
              status: a.status || 'pausado',
              orcamento_diario: a.orcamento_diario || 0,
              gasto_total: a.gasto_total || 0,
              impressoes: a.impressoes || 0,
              cliques: a.cliques || 0,
              conversoes: a.conversoes || 0,
              cpc: a.cliques > 0 ? (a.gasto_total || 0) / a.cliques : 0,
              cpa: a.conversoes > 0 ? (a.gasto_total || 0) / a.conversoes : 0,
              roas: a.gasto_total > 0 ? ((a.conversoes || 0) * (a.valor_conversao || 100)) / a.gasto_total : 0
            }))
          });
        } else {
          setMetrics({
            gastoTotal: 0,
            receitaGerada: 0,
            roasGeral: 0,
            totalAds: 0,
            adsAtivos: 0,
            cpcMedio: 0,
            cpaMedio: 0,
            ads: []
          });
        }
      } catch (err) {
        console.error('Erro no Ads Manager Supremo:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSupremeAds();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-8 border-t-transparent border-green-500 rounded-full"
        />
        <p className="absolute text-4xl text-green-400 font-light">Calculando ROI...</p>
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
          <h1 className="text-8xl font-black bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
            ADS MANAGER SUPREMO
          </h1>
          <p className="text-3xl text-gray-400 mt-6">
            Cada centavo investido retorna como tsunami de conversões
          </p>
        </motion.div>

        {/* KPIs PRINCIPAIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 max-w-7xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-red-900/60 to-orange-900/60 rounded-3xl p-8 border border-red-500/30 backdrop-blur-xl"
          >
            <BanknotesIcon className="w-16 h-16 text-red-400 mb-4" />
            <p className="text-4xl font-black text-[var(--text-primary)]">R$ {(metrics?.gastoTotal || 0).toLocaleString('pt-BR')}</p>
            <p className="text-xl text-gray-400">Investido Total</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 rounded-3xl p-8 border border-green-500/30 backdrop-blur-xl"
          >
            <CurrencyDollarIcon className="w-16 h-16 text-green-400 mb-4" />
            <p className="text-4xl font-black text-[var(--text-primary)]">R$ {(metrics?.receitaGerada || 0).toLocaleString('pt-BR')}</p>
            <p className="text-xl text-gray-400">Receita Gerada</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-yellow-900/60 to-amber-900/60 rounded-3xl p-8 border border-yellow-500/30 backdrop-blur-xl"
          >
            <ArrowTrendingUpIcon className="w-16 h-16 text-yellow-400 mb-4" />
            <p className="text-5xl font-black text-[var(--text-primary)]">{(metrics?.roasGeral || 0).toFixed(2)}x</p>
            <p className="text-xl text-gray-400">ROAS Geral</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-purple-900/60 to-pink-900/60 rounded-3xl p-8 border border-purple-500/30 backdrop-blur-xl"
          >
            <ChartBarIcon className="w-16 h-16 text-purple-400 mb-4" />
            <p className="text-5xl font-black text-[var(--text-primary)]">{metrics?.adsAtivos || 0}/{metrics?.totalAds || 0}</p>
            <p className="text-xl text-gray-400">Ads Ativos</p>
          </motion.div>
        </div>

        {/* MÉTRICAS SECUNDÁRIAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 rounded-2xl p-8 border border-cyan-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xl">CPC Médio</p>
                <p className="text-4xl font-bold text-cyan-400">R$ {(metrics?.cpcMedio || 0).toFixed(2)}</p>
              </div>
              <CursorArrowRaysIcon className="w-16 h-16 text-cyan-400/50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-pink-900/40 to-rose-900/40 rounded-2xl p-8 border border-pink-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xl">CPA Médio</p>
                <p className="text-4xl font-bold text-pink-400">R$ {(metrics?.cpaMedio || 0).toFixed(2)}</p>
              </div>
              <ShoppingCartIcon className="w-16 h-16 text-pink-400/50" />
            </div>
          </div>
        </div>

        {/* LISTA DE ADS */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Anúncios Ativos
          </h2>

          {metrics?.ads.length === 0 ? (
            <div className="text-center py-20">
              <ChartBarIcon className="w-32 h-32 text-gray-700 mx-auto mb-8" />
              <p className="text-3xl text-gray-500">Nenhum anúncio cadastrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-4 px-6 text-gray-400">Anúncio</th>
                    <th className="text-right py-4 px-6 text-gray-400">Plataforma</th>
                    <th className="text-right py-4 px-6 text-gray-400">Gasto</th>
                    <th className="text-right py-4 px-6 text-gray-400">Impressões</th>
                    <th className="text-right py-4 px-6 text-gray-400">Cliques</th>
                    <th className="text-right py-4 px-6 text-gray-400">Conversões</th>
                    <th className="text-right py-4 px-6 text-gray-400">CPC</th>
                    <th className="text-right py-4 px-6 text-gray-400">ROAS</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics?.ads.map((ad, i) => (
                    <motion.tr
                      key={ad.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            ad.status === 'ativo' ? 'bg-green-400' :
                            ad.status === 'pausado' ? 'bg-yellow-400' : 'bg-gray-400'
                          }`} />
                          <span className="font-medium">{ad.nome}</span>
                        </div>
                      </td>
                      <td className="text-right py-4 px-6 text-gray-400">{ad.plataforma}</td>
                      <td className="text-right py-4 px-6 text-red-400">R$ {ad.gasto_total.toLocaleString('pt-BR')}</td>
                      <td className="text-right py-4 px-6">{ad.impressoes.toLocaleString()}</td>
                      <td className="text-right py-4 px-6 text-cyan-400">{ad.cliques.toLocaleString()}</td>
                      <td className="text-right py-4 px-6 text-green-400">{ad.conversoes}</td>
                      <td className="text-right py-4 px-6">R$ {ad.cpc.toFixed(2)}</td>
                      <td className={`text-right py-4 px-6 font-bold ${ad.roas >= 1 ? 'text-green-400' : 'text-red-400'}`}>
                        {ad.roas.toFixed(2)}x
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MENSAGEM FINAL DA IA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center py-24 mt-20"
        >
          <SparklesIcon className="w-32 h-32 text-green-400 mx-auto mb-8 animate-pulse" />
          <p className="text-5xl font-light text-green-300 max-w-4xl mx-auto">
            "Investir em ads sem dados é jogar dinheiro fora. Com dados, é imprimir dinheiro."
          </p>
          <p className="text-3xl text-gray-500 mt-8">
            — Citizen Supremo X.1, seu CFO de Performance
          </p>
        </motion.div>
      </div>
  );
}
