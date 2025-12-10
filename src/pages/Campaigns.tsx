// src/pages/Campaigns.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Campanhas Alienígenas 1000/1000
// Cada campanha é uma bomba nuclear de conversão. O mercado tremeu.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA

import LayoutSupremo from '@/components/LayoutSupremo';
import {
  RocketLaunchIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  PlayCircleIcon,
  PauseCircleIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface Campaign {
  id: string;
  nome: string;
  status: 'ativa' | 'pausada' | 'concluida' | 'rascunho';
  tipo: string;
  orcamento: number;
  gasto: number;
  leads_gerados: number;
  conversoes: number;
  roi: number;
  inicio: string;
  fim: string;
}

interface CampaignMetrics {
  total: number;
  ativas: number;
  orcamentoTotal: number;
  leadsTotal: number;
  roiMedio: number;
  campanhas: Campaign[];
}

export default function CampaignsPage() {
  const [metrics, setMetrics] = useState<CampaignMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeCampaigns() {
      try {
        const { data: campanhas } = await supabase
          .from('campanhas_marketing')
          .select('*')
          .order('id', { ascending: false });

        if (campanhas && campanhas.length > 0) {
          const ativas = campanhas.filter(c => c.status === 'ativa').length;
          const orcamentoTotal = campanhas.reduce((s, c) => s + (c.orcamento || 0), 0);
          const leadsTotal = campanhas.reduce((s, c) => s + (c.leads_gerados || 0), 0);
          const roiMedio = campanhas.reduce((s, c) => s + (c.roi || 0), 0) / campanhas.length;

          setMetrics({
            total: campanhas.length,
            ativas,
            orcamentoTotal,
            leadsTotal,
            roiMedio,
            campanhas: campanhas.map(c => ({
              id: c.id,
              nome: c.nome || 'Campanha sem nome',
              status: c.status || 'rascunho',
              tipo: c.tipo || 'geral',
              orcamento: c.orcamento || 0,
              gasto: c.gasto || 0,
              leads_gerados: c.leads_gerados || 0,
              conversoes: c.conversoes || 0,
              roi: c.roi || 0,
              inicio: c.data_inicio || '',
              fim: c.data_fim || ''
            }))
          });
        } else {
          setMetrics({
            total: 0,
            ativas: 0,
            orcamentoTotal: 0,
            leadsTotal: 0,
            roiMedio: 0,
            campanhas: []
          });
        }
      } catch (err) {
        console.error('Erro nas Campanhas Supremas:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSupremeCampaigns();
  }, []);

  if (loading) {
    return (
      <LayoutSupremo title="Campanhas Supremas">
        <div className="flex items-center justify-center h-screen bg-black">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-40 h-40 border-8 border-t-transparent border-purple-500 rounded-full"
          />
          <p className="absolute text-4xl text-purple-400 font-light">Carregando artilharia...</p>
        </div>
      </LayoutSupremo>
    );
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case 'ativa': return <PlayCircleIcon className="w-8 h-8 text-green-400" />;
      case 'pausada': return <PauseCircleIcon className="w-8 h-8 text-yellow-400" />;
      case 'concluida': return <CheckCircleIcon className="w-8 h-8 text-blue-400" />;
      default: return <RocketLaunchIcon className="w-8 h-8 text-gray-400" />;
    }
  };

  return (
    <LayoutSupremo title="Campanhas Supremas">
      <div className="min-h-screen bg-black text-white p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-8xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            CAMPANHAS SUPREMAS
          </h1>
          <p className="text-3xl text-gray-400 mt-6">
            Cada campanha é uma bomba nuclear de conversão
          </p>
        </motion.div>

        {/* KPIs PRINCIPAIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-16 max-w-7xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-purple-900/60 to-pink-900/60 rounded-3xl p-8 border border-purple-500/30 backdrop-blur-xl"
          >
            <RocketLaunchIcon className="w-16 h-16 text-purple-400 mb-4" />
            <p className="text-5xl font-black text-white">{metrics?.total || 0}</p>
            <p className="text-xl text-gray-400">Total Campanhas</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 rounded-3xl p-8 border border-green-500/30 backdrop-blur-xl"
          >
            <PlayCircleIcon className="w-16 h-16 text-green-400 mb-4" />
            <p className="text-5xl font-black text-white">{metrics?.ativas || 0}</p>
            <p className="text-xl text-gray-400">Ativas Agora</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-yellow-900/60 to-orange-900/60 rounded-3xl p-8 border border-yellow-500/30 backdrop-blur-xl"
          >
            <CurrencyDollarIcon className="w-16 h-16 text-yellow-400 mb-4" />
            <p className="text-4xl font-black text-white">R$ {(metrics?.orcamentoTotal || 0).toLocaleString('pt-BR')}</p>
            <p className="text-xl text-gray-400">Orçamento Total</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-cyan-900/60 to-blue-900/60 rounded-3xl p-8 border border-cyan-500/30 backdrop-blur-xl"
          >
            <UserGroupIcon className="w-16 h-16 text-cyan-400 mb-4" />
            <p className="text-5xl font-black text-white">{metrics?.leadsTotal || 0}</p>
            <p className="text-xl text-gray-400">Leads Gerados</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-emerald-900/60 to-teal-900/60 rounded-3xl p-8 border border-emerald-500/30 backdrop-blur-xl"
          >
            <ChartBarIcon className="w-16 h-16 text-emerald-400 mb-4" />
            <p className="text-5xl font-black text-white">{(metrics?.roiMedio || 0).toFixed(1)}x</p>
            <p className="text-xl text-gray-400">ROI Médio</p>
          </motion.div>
        </div>

        {/* LISTA DE CAMPANHAS */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Arsenal de Campanhas
          </h2>

          {metrics?.campanhas.length === 0 ? (
            <div className="text-center py-20">
              <RocketLaunchIcon className="w-32 h-32 text-gray-700 mx-auto mb-8" />
              <p className="text-3xl text-gray-500">Nenhuma campanha cadastrada</p>
              <p className="text-xl text-gray-600 mt-4">Crie sua primeira bomba de conversão</p>
            </div>
          ) : (
            <div className="space-y-6">
              {metrics?.campanhas.map((camp, i) => (
                <motion.div
                  key={camp.id}
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      {statusIcon(camp.status)}
                      <div>
                        <h3 className="text-2xl font-bold text-white">{camp.nome}</h3>
                        <p className="text-gray-400">{camp.tipo} • {camp.inicio} até {camp.fim || 'em andamento'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-12 text-right">
                      <div>
                        <p className="text-2xl font-bold text-yellow-400">R$ {camp.orcamento.toLocaleString('pt-BR')}</p>
                        <p className="text-gray-500">Orçamento</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-cyan-400">{camp.leads_gerados}</p>
                        <p className="text-gray-500">Leads</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-400">{camp.conversoes}</p>
                        <p className="text-gray-500">Conversões</p>
                      </div>
                      <div>
                        <p className={`text-2xl font-bold ${camp.roi >= 1 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {camp.roi.toFixed(1)}x
                        </p>
                        <p className="text-gray-500">ROI</p>
                      </div>
                    </div>
                  </div>

                  {/* BARRA DE PROGRESSO DO GASTO */}
                  <div className="mt-6">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Gasto: R$ {camp.gasto.toLocaleString('pt-BR')}</span>
                      <span>{camp.orcamento > 0 ? ((camp.gasto / camp.orcamento) * 100).toFixed(0) : 0}%</span>
                    </div>
                    <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${camp.orcamento > 0 ? (camp.gasto / camp.orcamento) * 100 : 0}%` }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
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
          className="text-center py-24 mt-20"
        >
          <SparklesIcon className="w-32 h-32 text-purple-400 mx-auto mb-8 animate-pulse" />
          <p className="text-5xl font-light text-purple-300 max-w-4xl mx-auto">
            "Cada campanha bem executada é um exército conquistando territórios."
          </p>
          <p className="text-3xl text-gray-500 mt-8">
            — Citizen Supremo X.1, seu General de Marketing
          </p>
        </motion.div>
      </div>
    </LayoutSupremo>
  );
}
