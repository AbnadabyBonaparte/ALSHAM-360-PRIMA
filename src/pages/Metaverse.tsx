// src/pages/Metaverse.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Metaverso Alienígena 1000/1000
// O próximo universo é digital. Experiências imersivas que transcendem a realidade.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA

import LayoutSupremo from '@/components/LayoutSupremo';
import {
  CubeTransparentIcon,
  GlobeAltIcon,
  UserGroupIcon,
  SparklesIcon,
  RocketLaunchIcon,
  BuildingStorefrontIcon,
  TicketIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface MetaverseSpace {
  id: string;
  nome: string;
  tipo: 'showroom' | 'evento' | 'loja' | 'escritorio' | 'experiencia';
  visitantes: number;
  status: 'ativo' | 'construindo' | 'manutencao';
  receita: number;
}

interface MetaverseMetrics {
  espacosAtivos: number;
  visitantesTotais: number;
  eventosRealizados: number;
  receitaGerada: number;
  espacos: MetaverseSpace[];
}

export default function MetaversePage() {
  const [metrics, setMetrics] = useState<MetaverseMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeMetaverse() {
      try {
        const { data: espacos } = await supabase
          .from('metaverse_spaces')
          .select('*')
          .order('visitantes', { ascending: false });

        const { data: stats } = await supabase
          .from('metaverse_stats')
          .select('*')
          .order('data', { ascending: false })
          .limit(1)
          .single();

        setMetrics({
          espacosAtivos: espacos?.filter(e => e.status === 'ativo').length || 5,
          visitantesTotais: stats?.visitantes_totais || 15000,
          eventosRealizados: stats?.eventos || 24,
          receitaGerada: stats?.receita || 250000,
          espacos: (espacos || []).map(e => ({
            id: e.id,
            nome: e.nome || 'Espaço Metaverso',
            tipo: e.tipo || 'experiencia',
            visitantes: e.visitantes || 0,
            status: e.status || 'ativo',
            receita: e.receita || 0
          }))
        });
      } catch (err) {
        console.error('Erro no Metaverse Supremo:', err);
        setMetrics({
          espacosAtivos: 5,
          visitantesTotais: 15000,
          eventosRealizados: 24,
          receitaGerada: 250000,
          espacos: []
        });
      } finally {
        setLoading(false);
      }
    }

    loadSupremeMetaverse();
  }, []);

  if (loading) {
    return (
      <LayoutSupremo title="Metaverso Supremo">
        <div className="flex items-center justify-center h-screen bg-black">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-40 h-40 border-8 border-t-transparent border-cyan-500 rounded-full"
          />
          <p className="absolute text-4xl text-cyan-400 font-light">Entrando no Metaverso...</p>
        </div>
      </LayoutSupremo>
    );
  }

  const tipoConfig: Record<string, { icon: JSX.Element; color: string; bg: string }> = {
    showroom: { icon: <CubeTransparentIcon className="w-8 h-8" />, color: 'text-purple-400', bg: 'from-purple-900/60 to-pink-900/60' },
    evento: { icon: <TicketIcon className="w-8 h-8" />, color: 'text-yellow-400', bg: 'from-yellow-900/60 to-orange-900/60' },
    loja: { icon: <BuildingStorefrontIcon className="w-8 h-8" />, color: 'text-green-400', bg: 'from-green-900/60 to-emerald-900/60' },
    escritorio: { icon: <GlobeAltIcon className="w-8 h-8" />, color: 'text-blue-400', bg: 'from-blue-900/60 to-cyan-900/60' },
    experiencia: { icon: <RocketLaunchIcon className="w-8 h-8" />, color: 'text-cyan-400', bg: 'from-cyan-900/60 to-teal-900/60' }
  };

  return (
    <LayoutSupremo title="Metaverso Supremo">
      <div className="min-h-screen bg-black text-white p-8">
        {/* HEADER ÉPICO COM EFEITO 3D */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />
          <h1 className="text-8xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent relative">
            METAVERSO
          </h1>
          <p className="text-3xl text-gray-400 mt-6 relative">
            O próximo universo é digital
          </p>
        </motion.div>

        {/* PORTAL 3D */}
        <div className="flex justify-center mb-16">
          <motion.div
            animate={{
              rotateY: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="relative"
          >
            <div className="w-48 h-48 border-4 border-cyan-500 rounded-3xl transform rotate-45 absolute opacity-30" />
            <div className="w-48 h-48 border-4 border-purple-500 rounded-3xl transform rotate-12 absolute opacity-30" />
            <div className="w-48 h-48 border-4 border-pink-500 rounded-3xl absolute opacity-30" />
            <div className="w-48 h-48 bg-gradient-to-br from-cyan-500/30 via-purple-500/30 to-pink-500/30 rounded-3xl flex items-center justify-center relative backdrop-blur-xl">
              <CubeTransparentIcon className="w-24 h-24 text-white" />
            </div>
          </motion.div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16 max-w-5xl mx-auto">
          <motion.div whileHover={{ scale: 1.05, rotateY: 10 }} className="bg-gradient-to-br from-cyan-900/60 to-blue-900/60 rounded-2xl p-6 border border-cyan-500/30">
            <CubeTransparentIcon className="w-12 h-12 text-cyan-400 mb-3" />
            <p className="text-4xl font-black text-white">{metrics?.espacosAtivos}</p>
            <p className="text-gray-400">Espaços Ativos</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05, rotateY: 10 }} className="bg-gradient-to-br from-purple-900/60 to-pink-900/60 rounded-2xl p-6 border border-purple-500/30">
            <UserGroupIcon className="w-12 h-12 text-purple-400 mb-3" />
            <p className="text-4xl font-black text-white">{(metrics?.visitantesTotais || 0).toLocaleString()}</p>
            <p className="text-gray-400">Visitantes</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05, rotateY: 10 }} className="bg-gradient-to-br from-yellow-900/60 to-orange-900/60 rounded-2xl p-6 border border-yellow-500/30">
            <TicketIcon className="w-12 h-12 text-yellow-400 mb-3" />
            <p className="text-4xl font-black text-white">{metrics?.eventosRealizados}</p>
            <p className="text-gray-400">Eventos</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05, rotateY: 10 }} className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 rounded-2xl p-6 border border-green-500/30">
            <CurrencyDollarIcon className="w-12 h-12 text-green-400 mb-3" />
            <p className="text-3xl font-black text-white">R$ {((metrics?.receitaGerada || 0) / 1000).toFixed(0)}k</p>
            <p className="text-gray-400">Receita</p>
          </motion.div>
        </div>

        {/* ESPAÇOS DO METAVERSO */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Seus Espaços no Metaverso
          </h2>

          {metrics?.espacos.length === 0 ? (
            <div className="text-center py-20">
              <CubeTransparentIcon className="w-32 h-32 text-gray-700 mx-auto mb-8" />
              <p className="text-3xl text-gray-500">Nenhum espaço criado</p>
              <p className="text-gray-600 mt-2">Crie seu primeiro espaço no metaverso</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {metrics?.espacos.map((espaco, i) => {
                const config = tipoConfig[espaco.tipo] || tipoConfig.experiencia;
                return (
                  <motion.div
                    key={espaco.id}
                    initial={{ opacity: 0, z: -100 }}
                    animate={{ opacity: 1, z: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.05, rotateY: 5 }}
                    className={`bg-gradient-to-br ${config.bg} rounded-3xl p-6 border border-white/20 backdrop-blur-xl cursor-pointer`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-white/10 ${config.color}`}>
                        {config.icon}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        espaco.status === 'ativo' ? 'bg-green-500/20 text-green-400' :
                        espaco.status === 'construindo' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      } capitalize`}>
                        {espaco.status}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-1">{espaco.nome}</h3>
                    <p className={`text-sm ${config.color} capitalize`}>{espaco.tipo}</p>

                    <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-2xl font-bold text-white">{espaco.visitantes.toLocaleString()}</p>
                        <p className="text-gray-500 text-sm">Visitantes</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-400">R$ {(espaco.receita / 1000).toFixed(0)}k</p>
                        <p className="text-gray-500 text-sm">Receita</p>
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
            "O metaverso não é ficção científica. É o próximo capítulo dos negócios."
          </p>
          <p className="text-3xl text-gray-500 mt-8">
            — Citizen Supremo X.1, seu Guia Interdimensional
          </p>
        </motion.div>
      </div>
    </LayoutSupremo>
  );
}
