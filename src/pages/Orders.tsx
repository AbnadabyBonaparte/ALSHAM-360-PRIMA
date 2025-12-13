// src/pages/Orders.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Pedidos Alienígenas 1000/1000
// Cada pedido é uma vitória. O funil que transforma cliques em dinheiro.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA

import {
  ShoppingCartIcon,
  CurrencyDollarIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Order {
  id: string;
  numero: string;
  cliente: string;
  valor: number;
  itens: number;
  status: 'pendente' | 'confirmado' | 'enviado' | 'entregue' | 'cancelado';
  data_pedido: string;
  data_entrega: string | null;
  metodo_pagamento: string;
}

interface OrderMetrics {
  totalPedidos: number;
  receitaTotal: number;
  ticketMedio: number;
  taxaConclusao: number;
  pedidos: Order[];
}

export default function OrdersPage() {
  const [metrics, setMetrics] = useState<OrderMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  useEffect(() => {
    async function loadSupremeOrders() {
      try {
        const { data: pedidos } = await supabase
          .from('pedidos')
          .select('*')
          .order('data_pedido', { ascending: false });

        if (pedidos) {
          const concluidos = pedidos.filter(p => p.status === 'entregue').length;
          const receitaTotal = pedidos.filter(p => p.status !== 'cancelado').reduce((s, p) => s + (p.valor || 0), 0);

          setMetrics({
            totalPedidos: pedidos.length,
            receitaTotal,
            ticketMedio: pedidos.length > 0 ? receitaTotal / pedidos.length : 0,
            taxaConclusao: pedidos.length > 0 ? (concluidos / pedidos.length) * 100 : 0,
            pedidos: pedidos.map(p => ({
              id: p.id,
              numero: p.numero || `#${p.id}`,
              cliente: p.cliente || 'Cliente',
              valor: p.valor || 0,
              itens: p.itens || 1,
              status: p.status || 'pendente',
              data_pedido: p.data_pedido || '',
              data_entrega: p.data_entrega || null,
              metodo_pagamento: p.metodo_pagamento || 'Não informado'
            }))
          });
        } else {
          setMetrics({
            totalPedidos: 0,
            receitaTotal: 0,
            ticketMedio: 0,
            taxaConclusao: 0,
            pedidos: []
          });
        }
      } catch (err) {
        console.error('Erro nos Pedidos Supremos:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSupremeOrders();
  }, []);

  if (loading) {
    return (
      
        <div className="flex items-center justify-center h-screen bg-[var(--bg)]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-40 h-40 border-8 border-t-transparent border-blue-500 rounded-full"
          />
          <p className="absolute text-4xl text-blue-400 font-light">Processando pedidos...</p>
        </div>
      
    );
  }

  const statusConfig: Record<string, { bg: string; text: string; icon: JSX.Element }> = {
    pendente: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: <ClockIcon className="w-5 h-5" /> },
    confirmado: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: <CheckCircleIcon className="w-5 h-5" /> },
    enviado: { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: <TruckIcon className="w-5 h-5" /> },
    entregue: { bg: 'bg-green-500/20', text: 'text-green-400', icon: <CheckCircleIcon className="w-5 h-5" /> },
    cancelado: { bg: 'bg-red-500/20', text: 'text-red-400', icon: <XCircleIcon className="w-5 h-5" /> }
  };

  const pedidosFiltrados = filtroStatus === 'todos'
    ? metrics?.pedidos || []
    : metrics?.pedidos.filter(p => p.status === filtroStatus) || [];

  return (
    
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            PEDIDOS SUPREMOS
          </h1>
          <p className="text-3xl text-gray-400 mt-6">
            Cada pedido é uma vitória conquistada
          </p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-blue-900/60 to-purple-900/60 rounded-2xl p-6 border border-blue-500/30">
            <ShoppingCartIcon className="w-12 h-12 text-blue-400 mb-3" />
            <p className="text-4xl font-black text-[var(--text)]">{metrics?.totalPedidos || 0}</p>
            <p className="text-gray-400">Total Pedidos</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 rounded-2xl p-6 border border-green-500/30">
            <CurrencyDollarIcon className="w-12 h-12 text-green-400 mb-3" />
            <p className="text-3xl font-black text-[var(--text)]">R$ {((metrics?.receitaTotal || 0) / 1000).toFixed(0)}k</p>
            <p className="text-gray-400">Receita Total</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-yellow-900/60 to-orange-900/60 rounded-2xl p-6 border border-yellow-500/30">
            <CurrencyDollarIcon className="w-12 h-12 text-yellow-400 mb-3" />
            <p className="text-3xl font-black text-[var(--text)]">R$ {(metrics?.ticketMedio || 0).toFixed(0)}</p>
            <p className="text-gray-400">Ticket Médio</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-emerald-900/60 to-teal-900/60 rounded-2xl p-6 border border-emerald-500/30">
            <CheckCircleIcon className="w-12 h-12 text-emerald-400 mb-3" />
            <p className="text-4xl font-black text-[var(--text)]">{(metrics?.taxaConclusao || 0).toFixed(0)}%</p>
            <p className="text-gray-400">Taxa Conclusão</p>
          </motion.div>
        </div>

        {/* FILTROS */}
        <div className="flex justify-center gap-3 mb-12 flex-wrap">
          {['todos', 'pendente', 'confirmado', 'enviado', 'entregue', 'cancelado'].map(status => (
            <button
              key={status}
              onClick={() => setFiltroStatus(status)}
              className={`px-5 py-2 rounded-xl font-medium transition-all capitalize ${
                filtroStatus === status
                  ? 'bg-blue-500 text-[var(--text)]'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* LISTA DE PEDIDOS */}
        <div className="max-w-6xl mx-auto">
          {pedidosFiltrados.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingCartIcon className="w-32 h-32 text-gray-700 mx-auto mb-8" />
              <p className="text-3xl text-gray-500">Nenhum pedido encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pedidosFiltrados.map((pedido, i) => {
                const config = statusConfig[pedido.status];
                return (
                  <motion.div
                    key={pedido.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl rounded-2xl p-6 border border-[var(--border)] hover:border-blue-500/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className={`p-3 rounded-xl ${config.bg}`}>
                          <span className={config.text}>{config.icon}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-[var(--text)]">{pedido.numero}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm ${config.bg} ${config.text} capitalize`}>
                              {pedido.status}
                            </span>
                          </div>
                          <p className="text-gray-400">{pedido.cliente} • {pedido.itens} {pedido.itens === 1 ? 'item' : 'itens'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-400">R$ {pedido.valor.toLocaleString('pt-BR')}</p>
                          <p className="text-gray-500 text-sm">{pedido.metodo_pagamento}</p>
                        </div>

                        <div className="text-right">
                          <p className="text-gray-400">
                            {pedido.data_pedido ? format(new Date(pedido.data_pedido), "dd MMM 'às' HH:mm", { locale: ptBR }) : '-'}
                          </p>
                          {pedido.data_entrega && (
                            <p className="text-green-400 text-sm">
                              Entregue {format(new Date(pedido.data_entrega), "dd MMM", { locale: ptBR })}
                            </p>
                          )}
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
          <SparklesIcon className="w-32 h-32 text-blue-400 mx-auto mb-8 animate-pulse" />
          <p className="text-5xl font-light text-blue-300 max-w-4xl mx-auto">
            "Cada pedido entregue é um cliente fidelizado. Cada cliente fidelizado é um império fortalecido."
          </p>
          <p className="text-3xl text-gray-500 mt-8">
            — Citizen Supremo X.1, seu Gerente de Operações
          </p>
        </motion.div>
      </div>
    
  );
}
