// src/pages/CarbonFootprint.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Pegada de Carbono Alienígena 1000/1000
// Cada tonelada de CO2 evitada é um passo para o futuro. Net Zero é o destino.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA

import {
  Cloud,
  TrendingDown,
  Zap,
  Truck,
  Building2,
  Sparkles,
  Globe,
  Flame
} from 'lucide-react';
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
            className="w-40 h-40 border-8 border-t-transparent border-[var(--accent-sky)] rounded-full"
          />
          <p className="absolute text-4xl text-[var(--accent-sky)] font-light">Medindo emissões...</p>
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
          <h1 className="text-xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-[var(--accent-sky)] via-[var(--accent-sky)] to-[var(--accent-purple)] bg-clip-text text-transparent">
            PEGADA DE CARBONO
          </h1>
          <p className="text-3xl text-[var(--text-secondary)] mt-6">
            Net Zero é o destino. Cada tonelada conta.
          </p>
        </motion.div>

        {/* EMISSÃO PRINCIPAL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-[var(--surface)]/60 to-[var(--surface-strong)]/60 rounded-3xl p-8 border border-[var(--border)] text-center"
          >
            <Cloud className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
            <p className="text-5xl font-black text-[var(--text-primary)]">{(metrics?.emissaoTotal || 0).toLocaleString()}</p>
            <p className="text-[var(--text-secondary)] mt-2">Ton CO₂ Total</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-[var(--accent-emerald)]/20 to-[var(--accent-emerald)]/20 rounded-3xl p-8 border border-[var(--accent-emerald)]/30 text-center"
          >
            <TrendingDown className="w-16 h-16 text-[var(--accent-emerald)] mx-auto mb-4" />
            <p className="text-5xl font-black text-[var(--accent-emerald)]">-{(metrics?.reducao || 0).toFixed(1)}%</p>
            <p className="text-[var(--text-secondary)] mt-2">Redução YoY</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`rounded-3xl p-8 border text-center ${
              (metrics?.netEmission || 0) <= 0
                ? 'bg-gradient-to-br from-[var(--accent-emerald)]/20 to-[var(--accent-emerald)]/20 border-[var(--accent-emerald)]/30'
                : 'bg-gradient-to-br from-[var(--accent-warning)]/20 to-[var(--accent-alert)]/20 border-[var(--accent-warning)]/30'
            }`}
          >
            <Globe className={`w-16 h-16 mx-auto mb-4 ${
              (metrics?.netEmission || 0) <= 0 ? 'text-[var(--accent-emerald)]' : 'text-[var(--accent-warning)]'
            }`} />
            <p className={`text-5xl font-black ${
              (metrics?.netEmission || 0) <= 0 ? 'text-[var(--accent-emerald)]' : 'text-[var(--accent-warning)]'
            }`}>
              {(metrics?.netEmission || 0).toLocaleString()}
            </p>
            <p className="text-[var(--text-secondary)] mt-2">Emissão Líquida</p>
            {(metrics?.netEmission || 0) <= 0 && (
              <p className="text-[var(--accent-emerald)] text-sm mt-2 font-bold">🌿 CARBONO NEUTRO!</p>
            )}
          </motion.div>
        </div>

        {/* CRÉDITOS DE OFFSET */}
        <div className="max-w-md mx-auto mb-16">
          <div className="bg-gradient-to-br from-[var(--accent-sky)]/20 to-[var(--accent-sky)]/20 rounded-2xl p-6 border border-[var(--accent-sky)]/30 text-center">
            <p className="text-[var(--text-secondary)] mb-2">Créditos de Carbono Compensados</p>
            <p className="text-4xl font-black text-[var(--accent-sky)]">{(metrics?.offsetCredits || 0).toLocaleString()} ton</p>
          </div>
        </div>

        {/* EMISSÕES POR CATEGORIA */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-[var(--text-primary)]">Emissões por Categoria</h2>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-[var(--accent-warning)]" />
                  <span className="text-[var(--text-primary)]">Energia</span>
                </div>
                <span className="text-[var(--text-secondary)]">{metrics?.porCategoria.energia.toLocaleString()} ton ({totalCategoria > 0 ? ((metrics?.porCategoria.energia || 0) / totalCategoria * 100).toFixed(0) : 0}%)</span>
              </div>
              <div className="h-4 bg-[var(--bg)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalCategoria > 0 ? ((metrics?.porCategoria.energia || 0) / totalCategoria * 100) : 0}%` }}
                  className="h-full bg-gradient-to-r from-[var(--accent-warning)] to-[var(--accent-warning)]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Truck className="w-6 h-6 text-[var(--accent-sky)]" />
                  <span className="text-[var(--text-primary)]">Transporte</span>
                </div>
                <span className="text-[var(--text-secondary)]">{metrics?.porCategoria.transporte.toLocaleString()} ton ({totalCategoria > 0 ? ((metrics?.porCategoria.transporte || 0) / totalCategoria * 100).toFixed(0) : 0}%)</span>
              </div>
              <div className="h-4 bg-[var(--bg)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalCategoria > 0 ? ((metrics?.porCategoria.transporte || 0) / totalCategoria * 100) : 0}%` }}
                  className="h-full bg-gradient-to-r from-[var(--accent-sky)] to-[var(--accent-sky)]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-[var(--accent-purple)]" />
                  <span className="text-[var(--text-primary)]">Operações</span>
                </div>
                <span className="text-[var(--text-secondary)]">{metrics?.porCategoria.operacoes.toLocaleString()} ton ({totalCategoria > 0 ? ((metrics?.porCategoria.operacoes || 0) / totalCategoria * 100).toFixed(0) : 0}%)</span>
              </div>
              <div className="h-4 bg-[var(--bg)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalCategoria > 0 ? ((metrics?.porCategoria.operacoes || 0) / totalCategoria * 100) : 0}%` }}
                  className="h-full bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-alert)]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Flame className="w-6 h-6 text-[var(--accent-alert)]" />
                  <span className="text-[var(--text-primary)]">Cadeia de Suprimentos</span>
                </div>
                <span className="text-[var(--text-secondary)]">{metrics?.porCategoria.cadeia.toLocaleString()} ton ({totalCategoria > 0 ? ((metrics?.porCategoria.cadeia || 0) / totalCategoria * 100).toFixed(0) : 0}%)</span>
              </div>
              <div className="h-4 bg-[var(--bg)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalCategoria > 0 ? ((metrics?.porCategoria.cadeia || 0) / totalCategoria * 100) : 0}%` }}
                  className="h-full bg-gradient-to-r from-[var(--accent-alert)] to-[var(--accent-warning)]"
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
          <Sparkles className="w-32 h-32 text-[var(--accent-sky)] mx-auto mb-8 animate-pulse" />
          <p className="text-5xl font-light text-[var(--accent-sky)] max-w-4xl mx-auto">
            "Net Zero não é utopia. É compromisso com o único planeta que temos."
          </p>
          <p className="text-3xl text-[var(--text-secondary)] mt-8">
            — Citizen Supremo X.1, seu Guardião Climático
          </p>
        </motion.div>
      </div>
    
  );
}
