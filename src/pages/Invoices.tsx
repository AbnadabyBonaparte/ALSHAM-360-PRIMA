// src/pages/Invoices.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Faturas Alienígenas 1000/1000
// Cada fatura é dinheiro no bolso. Cobrança automatizada, caixa cheio.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA

import {
  DocumentTextIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  BanknotesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Invoice {
  id: string;
  numero: string;
  cliente: string;
  valor: number;
  status: 'rascunho' | 'enviada' | 'paga' | 'atrasada' | 'cancelada';
  data_emissao: string;
  data_vencimento: string;
  data_pagamento: string | null;
}

interface InvoiceMetrics {
  totalFaturas: number;
  valorEmitido: number;
  valorRecebido: number;
  valorPendente: number;
  atrasadas: number;
  faturas: Invoice[];
}

export default function InvoicesPage() {
  const [metrics, setMetrics] = useState<InvoiceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeInvoices() {
      try {
        const { data: faturas } = await supabase
          .from('faturas')
          .select('*')
          .order('data_emissao', { ascending: false });

        if (faturas) {
          const pagas = faturas.filter(f => f.status === 'paga');
          const pendentes = faturas.filter(f => ['enviada', 'atrasada'].includes(f.status));
          const atrasadas = faturas.filter(f => f.status === 'atrasada');

          setMetrics({
            totalFaturas: faturas.length,
            valorEmitido: faturas.reduce((s, f) => s + (f.valor || 0), 0),
            valorRecebido: pagas.reduce((s, f) => s + (f.valor || 0), 0),
            valorPendente: pendentes.reduce((s, f) => s + (f.valor || 0), 0),
            atrasadas: atrasadas.length,
            faturas: faturas.map(f => ({
              id: f.id,
              numero: f.numero || `#${f.id}`,
              cliente: f.cliente || 'Cliente',
              valor: f.valor || 0,
              status: f.status || 'rascunho',
              data_emissao: f.data_emissao || '',
              data_vencimento: f.data_vencimento || '',
              data_pagamento: f.data_pagamento || null
            }))
          });
        } else {
          setMetrics({
            totalFaturas: 0,
            valorEmitido: 0,
            valorRecebido: 0,
            valorPendente: 0,
            atrasadas: 0,
            faturas: []
          });
        }
      } catch (err) {
        console.error('Erro nas Faturas Supremas:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSupremeInvoices();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-8 border-t-transparent border-green-500 rounded-full"
        />
        <p className="absolute text-4xl text-green-400 font-light">Contando dinheiro...</p>
      </div>
    );
  }

  const statusConfig: Record<string, { bg: string; text: string; icon: JSX.Element }> = {
    rascunho: { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: <DocumentTextIcon className="w-5 h-5" /> },
    enviada: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: <ClockIcon className="w-5 h-5" /> },
    paga: { bg: 'bg-green-500/20', text: 'text-green-400', icon: <CheckCircleIcon className="w-5 h-5" /> },
    atrasada: { bg: 'bg-red-500/20', text: 'text-red-400', icon: <ExclamationTriangleIcon className="w-5 h-5" /> },
    cancelada: { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: <ArrowPathIcon className="w-5 h-5" /> }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-8xl font-black bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
            FATURAS SUPREMAS
          </h1>
          <p className="text-3xl text-gray-400 mt-6">
            Cada fatura é dinheiro garantido no seu bolso
          </p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12 max-w-7xl mx-auto">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-gray-800/60 to-gray-700/60 rounded-2xl p-6 border border-gray-500/30">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.totalFaturas || 0}</p>
            <p className="text-gray-400">Total Faturas</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-blue-900/60 to-indigo-900/60 rounded-2xl p-6 border border-blue-500/30">
            <BanknotesIcon className="w-12 h-12 text-blue-400 mb-3" />
            <p className="text-3xl font-black text-[var(--text-primary)]">R$ {((metrics?.valorEmitido || 0) / 1000).toFixed(0)}k</p>
            <p className="text-gray-400">Emitido</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 rounded-2xl p-6 border border-green-500/30">
            <CheckCircleIcon className="w-12 h-12 text-green-400 mb-3" />
            <p className="text-3xl font-black text-[var(--text-primary)]">R$ {((metrics?.valorRecebido || 0) / 1000).toFixed(0)}k</p>
            <p className="text-gray-400">Recebido</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-yellow-900/60 to-orange-900/60 rounded-2xl p-6 border border-yellow-500/30">
            <ClockIcon className="w-12 h-12 text-yellow-400 mb-3" />
            <p className="text-3xl font-black text-[var(--text-primary)]">R$ {((metrics?.valorPendente || 0) / 1000).toFixed(0)}k</p>
            <p className="text-gray-400">Pendente</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-red-900/60 to-pink-900/60 rounded-2xl p-6 border border-red-500/30">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.atrasadas || 0}</p>
            <p className="text-gray-400">Atrasadas</p>
          </motion.div>
        </div>

        {/* LISTA DE FATURAS */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Registro de Faturas
          </h2>

          {metrics?.faturas.length === 0 ? (
            <div className="text-center py-20">
              <DocumentTextIcon className="w-32 h-32 text-gray-700 mx-auto mb-8" />
              <p className="text-3xl text-gray-500">Nenhuma fatura cadastrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-4 px-6 text-gray-400">Fatura</th>
                    <th className="text-left py-4 px-6 text-gray-400">Cliente</th>
                    <th className="text-right py-4 px-6 text-gray-400">Valor</th>
                    <th className="text-center py-4 px-6 text-gray-400">Emissão</th>
                    <th className="text-center py-4 px-6 text-gray-400">Vencimento</th>
                    <th className="text-center py-4 px-6 text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics?.faturas.map((fatura, i) => {
                    const config = statusConfig[fatura.status];
                    const diasAtraso = fatura.status === 'atrasada' && fatura.data_vencimento
                      ? differenceInDays(new Date(), new Date(fatura.data_vencimento))
                      : 0;

                    return (
                      <motion.tr
                        key={fatura.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <span className="font-mono font-bold text-[var(--text-primary)]">{fatura.numero}</span>
                        </td>
                        <td className="py-4 px-6 text-gray-300">{fatura.cliente}</td>
                        <td className="py-4 px-6 text-right">
                          <span className="text-xl font-bold text-green-400">
                            R$ {fatura.valor.toLocaleString('pt-BR')}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center text-gray-400">
                          {fatura.data_emissao ? format(new Date(fatura.data_emissao), 'dd/MM/yy') : '-'}
                        </td>
                        <td className="py-4 px-6 text-center text-gray-400">
                          {fatura.data_vencimento ? format(new Date(fatura.data_vencimento), 'dd/MM/yy') : '-'}
                          {diasAtraso > 0 && (
                            <span className="block text-red-400 text-xs">{diasAtraso} dias atraso</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${config.bg} ${config.text} text-sm capitalize`}>
                            {config.icon}
                            {fatura.status}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
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
          className="text-center py-24 mt-16"
        >
          <SparklesIcon className="w-32 h-32 text-green-400 mx-auto mb-8 animate-pulse" />
          <p className="text-5xl font-light text-green-300 max-w-4xl mx-auto">
            "Fatura enviada é dinheiro a caminho. Fatura paga é império crescendo."
          </p>
          <p className="text-3xl text-gray-500 mt-8">
            — Citizen Supremo X.1, seu Tesoureiro Alienígena
          </p>
        </motion.div>
      </div>
  );
}
