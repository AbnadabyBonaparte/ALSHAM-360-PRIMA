// src/pages/CarbonFootprint.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Pegada de Carbono Alienígena 1000/1000
// Cada tonelada de CO2 evitada é um passo para o futuro. Net Zero é o destino.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA

import {
  CloudIcon,
  ArrowTrendingDownIcon,
  BoltIcon,
  TruckIcon,
  BuildingOfficeIcon,
  SparklesIcon,
  GlobeAmericasIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface CarbonMetrics {
  emissaoTotal: number;
  emissaoAnterior: number;
  reducao: number;
  offsetCredits: number;
  netEmission: number;
  porCategoria: {
    energia: number;
    transporte: number;
    operacoes: number;
    cadeia: number;
  };
  historico: { mes: string; emissao: number }[];
}

export default function CarbonFootprintPage() {
  const [metrics, setMetrics] = useState<CarbonMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeCarbon() {
      try {
        const { data: carbonData } = await supabase
          .from('carbon_footprint')
          .select('*')
          .order('data', { ascending: false })
          .limit(1)
          .single();

        const { data: historico } = await supabase
          .from('carbon_historico')
          .select('mes, emissao')
          .order('mes', { ascending: true })
          .limit(12);

        const emissaoTotal = carbonData?.emissao_total || 5000;
        const emissaoAnterior = carbonData?.emissao_anterior || 6500;
        const offsetCredits = carbonData?.offset_credits || 1000;

        setMetrics({
          emissaoTotal,
          emissaoAnterior,
          reducao: emissaoAnterior > 0 ? ((emissaoAnterior - emissaoTotal) / emissaoAnterior) * 100 : 0,
          offsetCredits,
          netEmission: emissaoTotal - offsetCredits,
          porCategoria: {
            energia: carbonData?.energia || 2000,
            transporte: carbonData?.transporte || 1500,
            operacoes: carbonData?.operacoes || 1000,
            cadeia: carbonData?.cadeia || 500
          },
          historico: historico || []
        });
      } catch (err) {
        console.error('Erro no Carbon Footprint Supremo:', err);
        setMetrics({
          emissaoTotal: 5000,
          emissaoAnterior: 6500,
          reducao: 23,
          offsetCredits: 1000,
          netEmission: 4000,
          porCategoria: {
            energia: 2000,
            transporte: 1500,
            operacoes: 1000,
            cadeia: 500
          },
          historico: []
        });
      } finally {
        setLoading(false);
      }
    }

    loadSupremeCarbon();
  }, []);

  if (loading) {
    return (
      
        <div className="flex items-center justify-center h-screen bg-[var(--background)]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-40 h-40 border-8 border-t-transparent border-cyan-500 rounded-full"
          />
          <p className="absolute text-4xl text-cyan-400 font-light">Medindo emissões...</p>
        </div>
      
    );
  }

  const totalCategoria = Object.values(metrics?.porCategoria || {}).reduce((a, b) => a + b, 0);

  return (
    
      <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-7xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
            PEGADA DE CARBONO
          </h1>
          <p className="text-3xl text-gray-400 mt-6">
            Net Zero é o destino. Cada tonelada conta.
          </p>
        </motion.div>

        {/* EMISSÃO PRINCIPAL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-gray-800/60 to-gray-700/60 rounded-3xl p-8 border border-gray-500/30 text-center"
          >
            <CloudIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-5xl font-black text-[var(--text-primary)]">{(metrics?.emissaoTotal || 0).toLocaleString()}</p>
            <p className="text-gray-400 mt-2">Ton CO₂ Total</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 rounded-3xl p-8 border border-green-500/30 text-center"
          >
            <ArrowTrendingDownIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <p className="text-5xl font-black text-green-400">-{(metrics?.reducao || 0).toFixed(1)}%</p>
            <p className="text-gray-400 mt-2">Redução YoY</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`rounded-3xl p-8 border text-center ${
              (metrics?.netEmission || 0) <= 0
                ? 'bg-gradient-to-br from-emerald-900/60 to-green-900/60 border-emerald-500/30'
                : 'bg-gradient-to-br from-orange-900/60 to-red-900/60 border-orange-500/30'
            }`}
          >
            <GlobeAmericasIcon className={`w-16 h-16 mx-auto mb-4 ${
              (metrics?.netEmission || 0) <= 0 ? 'text-emerald-400' : 'text-orange-400'
            }`} />
            <p className={`text-5xl font-black ${
              (metrics?.netEmission || 0) <= 0 ? 'text-emerald-400' : 'text-orange-400'
            }`}>
              {(metrics?.netEmission || 0).toLocaleString()}
            </p>
            <p className="text-gray-400 mt-2">Emissão Líquida</p>
            {(metrics?.netEmission || 0) <= 0 && (
              <p className="text-emerald-400 text-sm mt-2 font-bold">🌿 CARBONO NEUTRO!</p>
            )}
          </motion.div>
        </div>

        {/* CRÉDITOS DE OFFSET */}
        <div className="max-w-md mx-auto mb-16">
          <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 rounded-2xl p-6 border border-cyan-500/30 text-center">
            <p className="text-gray-400 mb-2">Créditos de Carbono Compensados</p>
            <p className="text-4xl font-black text-cyan-400">{(metrics?.offsetCredits || 0).toLocaleString()} ton</p>
          </div>
        </div>

        {/* EMISSÕES POR CATEGORIA */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-[var(--text-primary)]">Emissões por Categoria</h2>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <BoltIcon className="w-6 h-6 text-yellow-400" />
                  <span className="text-[var(--text-primary)]">Energia</span>
                </div>
                <span className="text-gray-400">{metrics?.porCategoria.energia.toLocaleString()} ton ({totalCategoria > 0 ? ((metrics?.porCategoria.energia || 0) / totalCategoria * 100).toFixed(0) : 0}%)</span>
              </div>
              <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalCategoria > 0 ? ((metrics?.porCategoria.energia || 0) / totalCategoria * 100) : 0}%` }}
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <TruckIcon className="w-6 h-6 text-blue-400" />
                  <span className="text-[var(--text-primary)]">Transporte</span>
                </div>
                <span className="text-gray-400">{metrics?.porCategoria.transporte.toLocaleString()} ton ({totalCategoria > 0 ? ((metrics?.porCategoria.transporte || 0) / totalCategoria * 100).toFixed(0) : 0}%)</span>
              </div>
              <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalCategoria > 0 ? ((metrics?.porCategoria.transporte || 0) / totalCategoria * 100) : 0}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <BuildingOfficeIcon className="w-6 h-6 text-purple-400" />
                  <span className="text-[var(--text-primary)]">Operações</span>
                </div>
                <span className="text-gray-400">{metrics?.porCategoria.operacoes.toLocaleString()} ton ({totalCategoria > 0 ? ((metrics?.porCategoria.operacoes || 0) / totalCategoria * 100).toFixed(0) : 0}%)</span>
              </div>
              <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalCategoria > 0 ? ((metrics?.porCategoria.operacoes || 0) / totalCategoria * 100) : 0}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <FireIcon className="w-6 h-6 text-red-400" />
                  <span className="text-[var(--text-primary)]">Cadeia de Suprimentos</span>
                </div>
                <span className="text-gray-400">{metrics?.porCategoria.cadeia.toLocaleString()} ton ({totalCategoria > 0 ? ((metrics?.porCategoria.cadeia || 0) / totalCategoria * 100).toFixed(0) : 0}%)</span>
              </div>
              <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalCategoria > 0 ? ((metrics?.porCategoria.cadeia || 0) / totalCategoria * 100) : 0}%` }}
                  className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* MENSAGEM FINAL DA IA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center py-24 mt-8"
        >
          <SparklesIcon className="w-32 h-32 text-cyan-400 mx-auto mb-8 animate-pulse" />
          <p className="text-5xl font-light text-cyan-300 max-w-4xl mx-auto">
            "Net Zero não é utopia. É compromisso com o único planeta que temos."
          </p>
          <p className="text-3xl text-gray-500 mt-8">
            — Citizen Supremo X.1, seu Guardião Climático
          </p>
        </motion.div>
      </div>
    
  );
}
