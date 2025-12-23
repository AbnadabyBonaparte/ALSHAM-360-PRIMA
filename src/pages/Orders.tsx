// src/pages/Orders.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Pedidos Alienígenas 1000/1000
// 100% CSS Variables + shadcn/ui

import {
  ShoppingCartIcon,
  CurrencyDollarIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-8 border-t-transparent border-[var(--accent-sky)] rounded-full"
        />
        <p className="absolute text-4xl text-[var(--accent-sky)] font-light">Processando pedidos...</p>
      </div>
    );
  }

  const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: JSX.Element }> = {
    pendente: { variant: 'outline', icon: <ClockIcon className="w-4 h-4" /> },
    confirmado: { variant: 'secondary', icon: <CheckCircleIcon className="w-4 h-4" /> },
    enviado: { variant: 'default', icon: <TruckIcon className="w-4 h-4" /> },
    entregue: { variant: 'default', icon: <CheckCircleIcon className="w-4 h-4" /> },
    cancelado: { variant: 'destructive', icon: <XCircleIcon className="w-4 h-4" /> }
  };

  const pedidosFiltrados = filtroStatus === 'todos'
    ? metrics?.pedidos || []
    : metrics?.pedidos.filter(p => p.status === filtroStatus) || [];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] p-8">
      {/* HEADER ÉPICO */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-[var(--accent-sky)] via-[var(--accent-purple)] to-[var(--accent-pink)] bg-clip-text text-transparent">
          PEDIDOS SUPREMOS
        </h1>
        <p className="text-3xl text-[var(--text-secondary)] mt-6">
          Cada pedido é uma vitória conquistada
        </p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
        <Card className="bg-[var(--accent-sky)]/10 border-[var(--accent-sky)]/30">
          <CardContent className="p-6">
            <ShoppingCartIcon className="w-12 h-12 text-[var(--accent-sky)] mb-3" />
            <p className="text-4xl font-black text-[var(--text)]">{metrics?.totalPedidos || 0}</p>
            <p className="text-[var(--text-secondary)]">Total Pedidos</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-emerald)]/10 border-[var(--accent-emerald)]/30">
          <CardContent className="p-6">
            <CurrencyDollarIcon className="w-12 h-12 text-[var(--accent-emerald)] mb-3" />
            <p className="text-3xl font-black text-[var(--text)]">R$ {((metrics?.receitaTotal || 0) / 1000).toFixed(0)}k</p>
            <p className="text-[var(--text-secondary)]">Receita Total</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-warning)]/10 border-[var(--accent-warning)]/30">
          <CardContent className="p-6">
            <CurrencyDollarIcon className="w-12 h-12 text-[var(--accent-warning)] mb-3" />
            <p className="text-3xl font-black text-[var(--text)]">R$ {(metrics?.ticketMedio || 0).toFixed(0)}</p>
            <p className="text-[var(--text-secondary)]">Ticket Médio</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-emerald)]/10 border-[var(--accent-emerald)]/30">
          <CardContent className="p-6">
            <CheckCircleIcon className="w-12 h-12 text-[var(--accent-emerald)] mb-3" />
            <p className="text-4xl font-black text-[var(--text)]">{(metrics?.taxaConclusao || 0).toFixed(0)}%</p>
            <p className="text-[var(--text-secondary)]">Taxa Conclusão</p>
          </CardContent>
        </Card>
      </div>

      {/* FILTROS */}
      <div className="flex justify-center gap-3 mb-12 flex-wrap">
        {['todos', 'pendente', 'confirmado', 'enviado', 'entregue', 'cancelado'].map(status => (
          <Button
            key={status}
            onClick={() => setFiltroStatus(status)}
            variant={filtroStatus === status ? 'default' : 'outline'}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* LISTA DE PEDIDOS */}
      <div className="max-w-6xl mx-auto">
        {pedidosFiltrados.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCartIcon className="w-32 h-32 text-[var(--text-secondary)]/30 mx-auto mb-8" />
            <p className="text-3xl text-[var(--text-secondary)]">Nenhum pedido encontrado</p>
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
                >
                  <Card className="bg-[var(--surface)]/60 border-[var(--border)] hover:border-[var(--accent-sky)]/50 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="p-3 rounded-xl bg-[var(--accent-sky)]/10">
                            <span className="text-[var(--accent-sky)]">{config.icon}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-bold text-[var(--text)]">{pedido.numero}</h3>
                              <Badge variant={config.variant} className="capitalize">
                                {pedido.status}
                              </Badge>
                            </div>
                            <p className="text-[var(--text-secondary)]">{pedido.cliente} • {pedido.itens} {pedido.itens === 1 ? 'item' : 'itens'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-8">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-[var(--accent-emerald)]">R$ {pedido.valor.toLocaleString('pt-BR')}</p>
                            <p className="text-[var(--text-secondary)] text-sm">{pedido.metodo_pagamento}</p>
                          </div>

                          <div className="text-right">
                            <p className="text-[var(--text-secondary)]">
                              {pedido.data_pedido ? format(new Date(pedido.data_pedido), "dd MMM 'às' HH:mm", { locale: ptBR }) : '-'}
                            </p>
                            {pedido.data_entrega && (
                              <p className="text-[var(--accent-emerald)] text-sm">
                                Entregue {format(new Date(pedido.data_entrega), "dd MMM", { locale: ptBR })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
        <SparklesIcon className="w-32 h-32 text-[var(--accent-sky)] mx-auto mb-8 animate-pulse" />
        <p className="text-5xl font-light text-[var(--accent-sky)] max-w-4xl mx-auto">
          "Cada pedido entregue é um cliente fidelizado. Cada cliente fidelizado é um império fortalecido."
        </p>
        <p className="text-3xl text-[var(--text-secondary)] mt-8">
          — Citizen Supremo X.1, seu Gerente de Operações
        </p>
      </motion.div>
    </div>
  );
}
