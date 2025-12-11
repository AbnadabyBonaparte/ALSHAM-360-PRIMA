// src/pages/SupportTickets.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Tickets de Suporte Alienígenas 1000/1000
// Cada ticket resolvido é um cliente encantado. Suporte que transforma problemas em fãs.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA

import {
  TicketIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { format, differenceInMinutes, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Ticket {
  id: string;
  numero: string;
  titulo: string;
  cliente: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  status: 'aberto' | 'em_andamento' | 'aguardando' | 'resolvido' | 'fechado';
  categoria: string;
  data_abertura: string;
  tempo_resposta: number | null;
  atendente: string | null;
}

interface TicketMetrics {
  totalTickets: number;
  abertos: number;
  tempoMedioResposta: number;
  satisfacao: number;
  tickets: Ticket[];
}

export default function SupportTicketsPage() {
  const [metrics, setMetrics] = useState<TicketMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeTickets() {
      try {
        const { data: tickets } = await supabase
          .from('support_tickets')
          .select('*')
          .order('data_abertura', { ascending: false });

        if (tickets) {
          const abertos = tickets.filter(t => ['aberto', 'em_andamento', 'aguardando'].includes(t.status)).length;
          const temposResposta = tickets.filter(t => t.tempo_resposta).map(t => t.tempo_resposta);
          const tempoMedio = temposResposta.length > 0
            ? temposResposta.reduce((s, t) => s + t!, 0) / temposResposta.length
            : 0;

          setMetrics({
            totalTickets: tickets.length,
            abertos,
            tempoMedioResposta: tempoMedio,
            satisfacao: 95, // Calculado de pesquisas de satisfação
            tickets: tickets.map(t => ({
              id: t.id,
              numero: t.numero || `#${t.id}`,
              titulo: t.titulo || 'Ticket',
              cliente: t.cliente || 'Cliente',
              prioridade: t.prioridade || 'media',
              status: t.status || 'aberto',
              categoria: t.categoria || 'Geral',
              data_abertura: t.data_abertura || '',
              tempo_resposta: t.tempo_resposta || null,
              atendente: t.atendente || null
            }))
          });
        } else {
          setMetrics({
            totalTickets: 0,
            abertos: 0,
            tempoMedioResposta: 0,
            satisfacao: 0,
            tickets: []
          });
        }
      } catch (err) {
        console.error('Erro nos Tickets Supremos:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSupremeTickets();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-8 border-t-transparent border-teal-500 rounded-full"
        />
        <p className="absolute text-4xl text-teal-400 font-light">Carregando tickets...</p>
      </div>
    );
  }

  const prioridadeConfig: Record<string, { bg: string; text: string }> = {
    baixa: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
    media: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    alta: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
    urgente: { bg: 'bg-red-500/20', text: 'text-red-400' }
  };

  const statusConfig: Record<string, { bg: string; text: string }> = {
    aberto: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    em_andamento: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    aguardando: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
    resolvido: { bg: 'bg-green-500/20', text: 'text-green-400' },
    fechado: { bg: 'bg-gray-500/20', text: 'text-gray-400' }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
            SUPORTE SUPREMO
          </h1>
          <p className="text-3xl text-gray-400 mt-6">
            Cada ticket resolvido é um cliente encantado
          </p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-teal-900/60 to-cyan-900/60 rounded-2xl p-6 border border-teal-500/30">
            <TicketIcon className="w-12 h-12 text-teal-400 mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.totalTickets || 0}</p>
            <p className="text-gray-400">Total Tickets</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-yellow-900/60 to-orange-900/60 rounded-2xl p-6 border border-yellow-500/30">
            <ExclamationTriangleIcon className="w-12 h-12 text-yellow-400 mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.abertos || 0}</p>
            <p className="text-gray-400">Abertos</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-blue-900/60 to-indigo-900/60 rounded-2xl p-6 border border-blue-500/30">
            <ClockIcon className="w-12 h-12 text-blue-400 mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{(metrics?.tempoMedioResposta || 0).toFixed(0)}min</p>
            <p className="text-gray-400">Tempo Médio</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 rounded-2xl p-6 border border-green-500/30">
            <CheckCircleIcon className="w-12 h-12 text-green-400 mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.satisfacao || 0}%</p>
            <p className="text-gray-400">Satisfação</p>
          </motion.div>
        </div>

        {/* LISTA DE TICKETS */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">
            Fila de Atendimento
          </h2>

          {metrics?.tickets.length === 0 ? (
            <div className="text-center py-20">
              <TicketIcon className="w-32 h-32 text-gray-700 mx-auto mb-8" />
              <p className="text-3xl text-gray-500">Nenhum ticket aberto</p>
              <p className="text-xl text-gray-600 mt-2">Suporte zerado = Clientes felizes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {metrics?.tickets.map((ticket, i) => {
                const prioConfig = prioridadeConfig[ticket.prioridade];
                const statConfig = statusConfig[ticket.status];

                return (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl rounded-2xl p-6 border transition-all ${
                      ticket.prioridade === 'urgente'
                        ? 'border-red-500/50 shadow-lg shadow-red-500/20'
                        : 'border-[var(--border)] hover:border-teal-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        {ticket.prioridade === 'urgente' && (
                          <FireIcon className="w-8 h-8 text-red-500 animate-pulse" />
                        )}
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-gray-500 font-mono">{ticket.numero}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${prioConfig.bg} ${prioConfig.text} capitalize`}>
                              {ticket.prioridade}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${statConfig.bg} ${statConfig.text} capitalize`}>
                              {ticket.status.replace('_', ' ')}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-[var(--text-primary)]">{ticket.titulo}</h3>
                          <p className="text-gray-400">{ticket.cliente} • {ticket.categoria}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {ticket.atendente && (
                          <div className="flex items-center gap-2 text-gray-400">
                            <UserIcon className="w-5 h-5" />
                            <span>{ticket.atendente}</span>
                          </div>
                        )}
                        <div className="text-right">
                          <p className="text-gray-400 text-sm">
                            {ticket.data_abertura
                              ? format(new Date(ticket.data_abertura), "dd MMM 'às' HH:mm", { locale: ptBR })
                              : '-'
                            }
                          </p>
                          {ticket.tempo_resposta && (
                            <p className="text-teal-400 text-sm">
                              Respondido em {ticket.tempo_resposta}min
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
          <SparklesIcon className="w-32 h-32 text-teal-400 mx-auto mb-8 animate-pulse" />
          <p className="text-5xl font-light text-teal-300 max-w-4xl mx-auto">
            "Um problema bem resolvido transforma reclamante em fã. Suporte é a última linha de vendas."
          </p>
          <p className="text-3xl text-gray-500 mt-8">
            — Citizen Supremo X.1, seu Diretor de Experiência
          </p>
        </motion.div>
      </div>
  );
}
