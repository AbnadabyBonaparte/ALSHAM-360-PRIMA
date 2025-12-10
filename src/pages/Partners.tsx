// src/pages/Partners.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Parceiros Alienígenas 1000/1000
// Cada parceiro é uma aliança estratégica. Juntos somos invencíveis.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA

import LayoutSupremo from '@/components/LayoutSupremo';
import {
  BuildingOffice2Icon,
  HandshakeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  GlobeAltIcon,
  SparklesIcon,
  StarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface Partner {
  id: string;
  nome: string;
  tipo: 'tecnologia' | 'distribuidor' | 'integrador' | 'revendedor' | 'estrategico';
  nivel: 'bronze' | 'prata' | 'ouro' | 'platina';
  status: 'ativo' | 'inativo' | 'prospect';
  receita_gerada: number;
  deals_conjuntos: number;
  nota_satisfacao: number;
  contato: string;
  pais: string;
}

interface PartnerMetrics {
  totalParceiros: number;
  ativos: number;
  receitaTotal: number;
  dealsConjuntos: number;
  parceiros: Partner[];
}

export default function PartnersPage() {
  const [metrics, setMetrics] = useState<PartnerMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremePartners() {
      try {
        const { data: parceiros } = await supabase
          .from('parceiros')
          .select('*')
          .order('receita_gerada', { ascending: false });

        if (parceiros) {
          const ativos = parceiros.filter(p => p.status === 'ativo').length;
          const receitaTotal = parceiros.reduce((s, p) => s + (p.receita_gerada || 0), 0);
          const dealsConjuntos = parceiros.reduce((s, p) => s + (p.deals_conjuntos || 0), 0);

          setMetrics({
            totalParceiros: parceiros.length,
            ativos,
            receitaTotal,
            dealsConjuntos,
            parceiros: parceiros.map(p => ({
              id: p.id,
              nome: p.nome || 'Parceiro',
              tipo: p.tipo || 'estrategico',
              nivel: p.nivel || 'bronze',
              status: p.status || 'prospect',
              receita_gerada: p.receita_gerada || 0,
              deals_conjuntos: p.deals_conjuntos || 0,
              nota_satisfacao: p.nota_satisfacao || 0,
              contato: p.contato || '',
              pais: p.pais || 'Brasil'
            }))
          });
        } else {
          setMetrics({
            totalParceiros: 0,
            ativos: 0,
            receitaTotal: 0,
            dealsConjuntos: 0,
            parceiros: []
          });
        }
      } catch (err) {
        console.error('Erro nos Parceiros Supremos:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSupremePartners();
  }, []);

  if (loading) {
    return (
      <LayoutSupremo title="Parceiros Supremos">
        <div className="flex items-center justify-center h-screen bg-black">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-40 h-40 border-8 border-t-transparent border-cyan-500 rounded-full"
          />
          <p className="absolute text-4xl text-cyan-400 font-light">Conectando alianças...</p>
        </div>
      </LayoutSupremo>
    );
  }

  const nivelConfig: Record<string, { bg: string; border: string }> = {
    bronze: { bg: 'from-orange-700/40 to-orange-600/40', border: 'border-orange-500/30' },
    prata: { bg: 'from-gray-500/40 to-gray-400/40', border: 'border-gray-400/30' },
    ouro: { bg: 'from-yellow-600/40 to-yellow-500/40', border: 'border-yellow-500/30' },
    platina: { bg: 'from-cyan-500/40 to-blue-500/40', border: 'border-cyan-500/30' }
  };

  const tipoLabel: Record<string, string> = {
    tecnologia: 'Tecnologia',
    distribuidor: 'Distribuidor',
    integrador: 'Integrador',
    revendedor: 'Revendedor',
    estrategico: 'Estratégico'
  };

  return (
    <LayoutSupremo title="Parceiros Supremos">
      <div className="min-h-screen bg-black text-white p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-8xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            PARCEIROS SUPREMOS
          </h1>
          <p className="text-3xl text-gray-400 mt-6">
            Cada parceiro é uma aliança estratégica invencível
          </p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-cyan-900/60 to-blue-900/60 rounded-2xl p-6 border border-cyan-500/30">
            <BuildingOffice2Icon className="w-12 h-12 text-cyan-400 mb-3" />
            <p className="text-4xl font-black text-white">{metrics?.totalParceiros || 0}</p>
            <p className="text-gray-400">Total Parceiros</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 rounded-2xl p-6 border border-green-500/30">
            <StarIcon className="w-12 h-12 text-green-400 mb-3" />
            <p className="text-4xl font-black text-white">{metrics?.ativos || 0}</p>
            <p className="text-gray-400">Ativos</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-yellow-900/60 to-orange-900/60 rounded-2xl p-6 border border-yellow-500/30">
            <CurrencyDollarIcon className="w-12 h-12 text-yellow-400 mb-3" />
            <p className="text-3xl font-black text-white">R$ {((metrics?.receitaTotal || 0) / 1000000).toFixed(1)}M</p>
            <p className="text-gray-400">Receita Gerada</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-purple-900/60 to-pink-900/60 rounded-2xl p-6 border border-purple-500/30">
            <ChartBarIcon className="w-12 h-12 text-purple-400 mb-3" />
            <p className="text-4xl font-black text-white">{metrics?.dealsConjuntos || 0}</p>
            <p className="text-gray-400">Deals Conjuntos</p>
          </motion.div>
        </div>

        {/* GRID DE PARCEIROS */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Rede de Parceiros
          </h2>

          {metrics?.parceiros.length === 0 ? (
            <div className="text-center py-20">
              <BuildingOffice2Icon className="w-32 h-32 text-gray-700 mx-auto mb-8" />
              <p className="text-3xl text-gray-500">Nenhum parceiro cadastrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {metrics?.parceiros.map((parceiro, i) => {
                const config = nivelConfig[parceiro.nivel];
                return (
                  <motion.div
                    key={parceiro.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -10 }}
                    className={`bg-gradient-to-br ${config.bg} rounded-3xl p-6 border ${config.border} backdrop-blur-xl`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300">
                          {tipoLabel[parceiro.tipo]}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrophyIcon className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-400 font-bold capitalize">{parceiro.nivel}</span>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-1">{parceiro.nome}</h3>
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
                      <GlobeAltIcon className="w-4 h-4" />
                      <span>{parceiro.pais}</span>
                      {parceiro.status !== 'ativo' && (
                        <span className="px-2 py-0.5 bg-gray-500/20 rounded text-gray-500 text-xs">
                          {parceiro.status}
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Receita Gerada</span>
                        <span className="text-green-400 font-bold">R$ {(parceiro.receita_gerada / 1000).toFixed(0)}k</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Deals Conjuntos</span>
                        <span className="text-white font-bold">{parceiro.deals_conjuntos}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Satisfação</span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, idx) => (
                            <StarIcon
                              key={idx}
                              className={`w-4 h-4 ${idx < parceiro.nota_satisfacao ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                            />
                          ))}
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
          <SparklesIcon className="w-32 h-32 text-cyan-400 mx-auto mb-8 animate-pulse" />
          <p className="text-5xl font-light text-cyan-300 max-w-4xl mx-auto">
            "Sozinhos vamos rápido. Juntos vamos longe. Parceiros são multiplicadores."
          </p>
          <p className="text-3xl text-gray-500 mt-8">
            — Citizen Supremo X.1, seu Diretor de Alianças
          </p>
        </motion.div>
      </div>
    </LayoutSupremo>
  );
}
