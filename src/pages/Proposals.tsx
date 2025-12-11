// src/pages/Proposals.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Propostas Alienígenas 1000/1000
// Cada proposta é uma oferta irrecusável. O cliente assina antes de terminar de ler.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA

import {
  DocumentTextIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Proposal {
  id: string;
  titulo: string;
  cliente: string;
  valor: number;
  status: 'rascunho' | 'enviada' | 'visualizada' | 'aceita' | 'recusada' | 'expirada';
  data_envio: string;
  data_expiracao: string;
  probabilidade: number;
}

interface ProposalMetrics {
  totalPropostas: number;
  valorTotal: number;
  aceitas: number;
  taxaAceitacao: number;
  propostas: Proposal[];
}

export default function ProposalsPage() {
  const [metrics, setMetrics] = useState<ProposalMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeProposals() {
      try {
        const { data: propostas } = await supabase
          .from('propostas')
          .select('*')
          .order('id', { ascending: false });

        if (propostas) {
          const aceitas = propostas.filter(p => p.status === 'aceita').length;
          const enviadas = propostas.filter(p => ['enviada', 'visualizada', 'aceita', 'recusada'].includes(p.status)).length;

          setMetrics({
            totalPropostas: propostas.length,
            valorTotal: propostas.reduce((s, p) => s + (p.valor || 0), 0),
            aceitas,
            taxaAceitacao: enviadas > 0 ? (aceitas / enviadas) * 100 : 0,
            propostas: propostas.map(p => ({
              id: p.id,
              titulo: p.titulo || 'Proposta',
              cliente: p.cliente || 'Cliente',
              valor: p.valor || 0,
              status: p.status || 'rascunho',
              data_envio: p.data_envio || '',
              data_expiracao: p.data_expiracao || '',
              probabilidade: p.probabilidade || 50
            }))
          });
        } else {
          setMetrics({
            totalPropostas: 0,
            valorTotal: 0,
            aceitas: 0,
            taxaAceitacao: 0,
            propostas: []
          });
        }
      } catch (err) {
        console.error('Erro nas Propostas Supremas:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSupremeProposals();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-8 border-t-transparent border-emerald-500 rounded-full"
        />
        <p className="absolute text-4xl text-emerald-400 font-light">Preparando propostas...</p>
      </div>
    );
  }

  const statusConfig: Record<string, { bg: string; text: string; icon: JSX.Element }> = {
    rascunho: { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: <DocumentTextIcon className="w-5 h-5" /> },
    enviada: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: <PaperAirplaneIcon className="w-5 h-5" /> },
    visualizada: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: <ClockIcon className="w-5 h-5" /> },
    aceita: { bg: 'bg-green-500/20', text: 'text-green-400', icon: <CheckCircleIcon className="w-5 h-5" /> },
    recusada: { bg: 'bg-red-500/20', text: 'text-red-400', icon: <XCircleIcon className="w-5 h-5" /> },
    expirada: { bg: 'bg-orange-500/20', text: 'text-orange-400', icon: <ClockIcon className="w-5 h-5" /> }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-8xl font-black bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
            PROPOSTAS SUPREMAS
          </h1>
          <p className="text-3xl text-gray-400 mt-6">
            Cada proposta é uma oferta irrecusável
          </p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-emerald-900/60 to-teal-900/60 rounded-2xl p-6 border border-emerald-500/30">
            <DocumentTextIcon className="w-12 h-12 text-emerald-400 mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.totalPropostas || 0}</p>
            <p className="text-gray-400">Total Propostas</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-yellow-900/60 to-orange-900/60 rounded-2xl p-6 border border-yellow-500/30">
            <CurrencyDollarIcon className="w-12 h-12 text-yellow-400 mb-3" />
            <p className="text-3xl font-black text-[var(--text-primary)]">R$ {((metrics?.valorTotal || 0) / 1000).toFixed(0)}k</p>
            <p className="text-gray-400">Valor Total</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 rounded-2xl p-6 border border-green-500/30">
            <CheckCircleIcon className="w-12 h-12 text-green-400 mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.aceitas || 0}</p>
            <p className="text-gray-400">Aceitas</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-cyan-900/60 to-blue-900/60 rounded-2xl p-6 border border-cyan-500/30">
            <ArrowTrendingUpIcon className="w-12 h-12 text-cyan-400 mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{(metrics?.taxaAceitacao || 0).toFixed(0)}%</p>
            <p className="text-gray-400">Taxa Aceitação</p>
          </motion.div>
        </div>

        {/* LISTA DE PROPOSTAS */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
            Pipeline de Propostas
          </h2>

          {metrics?.propostas.length === 0 ? (
            <div className="text-center py-20">
              <DocumentTextIcon className="w-32 h-32 text-gray-700 mx-auto mb-8" />
              <p className="text-3xl text-gray-500">Nenhuma proposta cadastrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {metrics?.propostas.map((proposta, i) => {
                const config = statusConfig[proposta.status];
                return (
                  <motion.div
                    key={proposta.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl rounded-2xl p-6 border border-[var(--border)] hover:border-emerald-500/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className={`p-3 rounded-xl ${config.bg}`}>
                          <span className={config.text}>{config.icon}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-[var(--text-primary)]">{proposta.titulo}</h3>
                          <p className="text-gray-400">{proposta.cliente}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-emerald-400">R$ {proposta.valor.toLocaleString('pt-BR')}</p>
                          <p className="text-gray-500 text-sm">Valor</p>
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-bold text-[var(--text-primary)]">{proposta.probabilidade}%</p>
                          <p className="text-gray-500 text-sm">Probabilidade</p>
                        </div>

                        <div className={`px-4 py-2 rounded-xl ${config.bg} ${config.text} font-medium capitalize`}>
                          {proposta.status}
                        </div>
                      </div>
                    </div>

                    {/* BARRA DE PROBABILIDADE */}
                    <div className="mt-4">
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${proposta.probabilidade}%` }}
                          className={`h-full ${
                            proposta.probabilidade >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                            proposta.probabilidade >= 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                            'bg-gradient-to-r from-red-500 to-pink-500'
                          }`}
                        />
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
            "Uma proposta perfeita não vende. Ela faz o cliente implorar para comprar."
          </p>
          <p className="text-3xl text-gray-500 mt-8">
            — Citizen Supremo X.1, seu Closer Alienígena
          </p>
        </motion.div>
      </div>
  );
}
