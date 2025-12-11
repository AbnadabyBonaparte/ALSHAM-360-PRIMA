// src/pages/Contracts.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Contratos Alienígenas 1000/1000
// Cada contrato é uma fortaleza jurídica. Blindagem total, lucro garantido.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA

import {
  DocumentDuplicateIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  PencilSquareIcon,
  SparklesIcon,
  CheckBadgeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Contract {
  id: string;
  titulo: string;
  cliente: string;
  tipo: string;
  valor_mensal: number;
  valor_total: number;
  status: 'rascunho' | 'em_revisao' | 'assinado' | 'ativo' | 'expirado' | 'cancelado';
  data_inicio: string;
  data_fim: string;
  renovacao_automatica: boolean;
}

interface ContractMetrics {
  totalContratos: number;
  ativos: number;
  valorRecorrente: number;
  valorTotal: number;
  contratos: Contract[];
}

export default function ContractsPage() {
  const [metrics, setMetrics] = useState<ContractMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeContracts() {
      try {
        const { data: contratos } = await supabase
          .from('contratos')
          .select('*')
          .order('id', { ascending: false });

        if (contratos) {
          const ativos = contratos.filter(c => c.status === 'ativo');
          const valorRecorrente = ativos.reduce((s, c) => s + (c.valor_mensal || 0), 0);

          setMetrics({
            totalContratos: contratos.length,
            ativos: ativos.length,
            valorRecorrente,
            valorTotal: contratos.reduce((s, c) => s + (c.valor_total || 0), 0),
            contratos: contratos.map(c => ({
              id: c.id,
              titulo: c.titulo || 'Contrato',
              cliente: c.cliente || 'Cliente',
              tipo: c.tipo || 'Serviço',
              valor_mensal: c.valor_mensal || 0,
              valor_total: c.valor_total || 0,
              status: c.status || 'rascunho',
              data_inicio: c.data_inicio || '',
              data_fim: c.data_fim || '',
              renovacao_automatica: c.renovacao_automatica || false
            }))
          });
        } else {
          setMetrics({
            totalContratos: 0,
            ativos: 0,
            valorRecorrente: 0,
            valorTotal: 0,
            contratos: []
          });
        }
      } catch (err) {
        console.error('Erro nos Contratos Supremos:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSupremeContracts();
  }, []);

  if (loading) {
    return (
      
        <div className="flex items-center justify-center h-screen bg-[var(--background)]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-40 h-40 border-8 border-t-transparent border-indigo-500 rounded-full"
          />
          <p className="absolute text-4xl text-indigo-400 font-light">Analisando contratos...</p>
        </div>
      
    );
  }

  const statusConfig: Record<string, { bg: string; text: string }> = {
    rascunho: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
    em_revisao: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    assinado: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    ativo: { bg: 'bg-green-500/20', text: 'text-green-400' },
    expirado: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
    cancelado: { bg: 'bg-red-500/20', text: 'text-red-400' }
  };

  return (
    
      <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-8xl font-black bg-gradient-to-r from-indigo-400 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
            CONTRATOS SUPREMOS
          </h1>
          <p className="text-3xl text-gray-400 mt-6">
            Cada contrato é uma fortaleza jurídica blindada
          </p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-indigo-900/60 to-blue-900/60 rounded-2xl p-6 border border-indigo-500/30">
            <DocumentDuplicateIcon className="w-12 h-12 text-indigo-400 mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.totalContratos || 0}</p>
            <p className="text-gray-400">Total Contratos</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 rounded-2xl p-6 border border-green-500/30">
            <ShieldCheckIcon className="w-12 h-12 text-green-400 mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.ativos || 0}</p>
            <p className="text-gray-400">Ativos</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-purple-900/60 to-pink-900/60 rounded-2xl p-6 border border-purple-500/30">
            <CurrencyDollarIcon className="w-12 h-12 text-purple-400 mb-3" />
            <p className="text-3xl font-black text-[var(--text-primary)]">R$ {((metrics?.valorRecorrente || 0) / 1000).toFixed(0)}k/mês</p>
            <p className="text-gray-400">Recorrente</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-yellow-900/60 to-orange-900/60 rounded-2xl p-6 border border-yellow-500/30">
            <CurrencyDollarIcon className="w-12 h-12 text-yellow-400 mb-3" />
            <p className="text-3xl font-black text-[var(--text-primary)]">R$ {((metrics?.valorTotal || 0) / 1000000).toFixed(1)}M</p>
            <p className="text-gray-400">Valor Total</p>
          </motion.div>
        </div>

        {/* LISTA DE CONTRATOS */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-indigo-400 to-cyan-500 bg-clip-text text-transparent">
            Gestão de Contratos
          </h2>

          {metrics?.contratos.length === 0 ? (
            <div className="text-center py-20">
              <DocumentDuplicateIcon className="w-32 h-32 text-gray-700 mx-auto mb-8" />
              <p className="text-3xl text-gray-500">Nenhum contrato cadastrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {metrics?.contratos.map((contrato, i) => {
                const config = statusConfig[contrato.status];
                const diasRestantes = contrato.data_fim
                  ? differenceInDays(new Date(contrato.data_fim), new Date())
                  : 0;

                return (
                  <motion.div
                    key={contrato.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl rounded-2xl p-6 border transition-all ${
                      contrato.status === 'ativo' ? 'border-green-500/30 hover:border-green-500/50' :
                      'border-[var(--border)] hover:border-indigo-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="p-4 bg-indigo-500/20 rounded-2xl">
                          <DocumentDuplicateIcon className="w-8 h-8 text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-[var(--text-primary)]">{contrato.titulo}</h3>
                          <p className="text-gray-400">{contrato.cliente} • {contrato.tipo}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-xl font-bold text-[var(--text-primary)]">R$ {contrato.valor_mensal.toLocaleString('pt-BR')}</p>
                          <p className="text-gray-500 text-sm">/mês</p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-400">
                            {contrato.data_inicio ? format(new Date(contrato.data_inicio), 'dd/MM/yy') : '-'} →{' '}
                            {contrato.data_fim ? format(new Date(contrato.data_fim), 'dd/MM/yy') : '-'}
                          </p>
                          {contrato.status === 'ativo' && diasRestantes <= 30 && diasRestantes > 0 && (
                            <p className="text-orange-400 text-sm font-medium">Expira em {diasRestantes} dias</p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          {contrato.renovacao_automatica && (
                            <div className="p-2 bg-blue-500/20 rounded-lg" title="Renovação automática">
                              <CheckBadgeIcon className="w-5 h-5 text-blue-400" />
                            </div>
                          )}
                          <div className={`px-4 py-2 rounded-xl ${config.bg} ${config.text} font-medium capitalize`}>
                            {contrato.status.replace('_', ' ')}
                          </div>
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
          <SparklesIcon className="w-32 h-32 text-indigo-400 mx-auto mb-8 animate-pulse" />
          <p className="text-5xl font-light text-indigo-300 max-w-4xl mx-auto">
            "Um contrato bem redigido é a diferença entre lucro e prejuízo."
          </p>
          <p className="text-3xl text-gray-500 mt-8">
            — Citizen Supremo X.1, seu Conselheiro Jurídico
          </p>
        </motion.div>
      </div>
    
  );
}
