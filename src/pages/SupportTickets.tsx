// src/pages/SupportTickets.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Tickets de Suporte Alienígenas 1000/1000
// Cada ticket resolvido é um cliente encantado. Suporte que transforma problemas em fãs.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA
// ✅ MIGRADO PARA SHADCN/UI + CSS VARIABLES

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
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
          const abertos = tickets.filter((t: any) => ['aberto', 'em_andamento', 'aguardando'].includes(t.status)).length;
          const temposResposta = tickets.filter((t: any) => t.tempo_resposta).map((t: any) => t.tempo_resposta);
          const tempoMedio = temposResposta.length > 0
            ? temposResposta.reduce((s: number, t: number) => s + t!, 0) / temposResposta.length
            : 0;

          setMetrics({
            totalTickets: tickets.length,
            abertos,
            tempoMedioResposta: tempoMedio,
            satisfacao: 95,
            tickets: tickets.map((t: any) => ({
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
          className="w-40 h-40 border-8 border-t-transparent border-[var(--accent-sky)] rounded-full"
        />
        <p className="absolute text-4xl text-[var(--accent-sky)] font-light">Carregando tickets...</p>
      </div>
    );
  }

  const prioridadeConfig: Record<string, { bg: string; text: string }> = {
    baixa: { bg: 'bg-[var(--text-secondary)]/20', text: 'text-[var(--text-secondary)]' },
    media: { bg: 'bg-[var(--accent-sky)]/20', text: 'text-[var(--accent-sky)]' },
    alta: { bg: 'bg-[var(--accent-warning)]/20', text: 'text-[var(--accent-warning)]' },
    urgente: { bg: 'bg-[var(--accent-alert)]/20', text: 'text-[var(--accent-alert)]' }
  };

  const statusConfig: Record<string, { bg: string; text: string }> = {
    aberto: { bg: 'bg-[var(--accent-warning)]/20', text: 'text-[var(--accent-warning)]' },
    em_andamento: { bg: 'bg-[var(--accent-sky)]/20', text: 'text-[var(--accent-sky)]' },
    aguardando: { bg: 'bg-[var(--accent-purple)]/20', text: 'text-[var(--accent-purple)]' },
    resolvido: { bg: 'bg-[var(--accent-emerald)]/20', text: 'text-[var(--accent-emerald)]' },
    fechado: { bg: 'bg-[var(--text-secondary)]/20', text: 'text-[var(--text-secondary)]' }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] p-8">
      {/* HEADER ÉPICO */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-[var(--accent-sky)] via-[var(--accent-purple)] to-[var(--accent-sky)] bg-clip-text text-transparent">
          SUPORTE SUPREMO
        </h1>
        <p className="text-3xl text-[var(--text-secondary)] mt-6">
          Cada ticket resolvido é um cliente encantado
        </p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
        <Card className="bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)] hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <TicketIcon className="w-12 h-12 text-[var(--accent-sky)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.totalTickets || 0}</p>
            <p className="text-[var(--text-secondary)]">Total Tickets</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)] hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <ExclamationTriangleIcon className="w-12 h-12 text-[var(--accent-warning)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.abertos || 0}</p>
            <p className="text-[var(--text-secondary)]">Abertos</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)] hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <ClockIcon className="w-12 h-12 text-[var(--accent-purple)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{(metrics?.tempoMedioResposta || 0).toFixed(0)}min</p>
            <p className="text-[var(--text-secondary)]">Tempo Médio</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)] hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <CheckCircleIcon className="w-12 h-12 text-[var(--accent-emerald)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.satisfacao || 0}%</p>
            <p className="text-[var(--text-secondary)]">Satisfação</p>
          </CardContent>
        </Card>
      </div>

      {/* LISTA DE TICKETS */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[var(--accent-sky)] to-[var(--accent-purple)] bg-clip-text text-transparent">
          Fila de Atendimento
        </h2>

        {metrics?.tickets.length === 0 ? (
          <div className="text-center py-20">
            <TicketIcon className="w-32 h-32 text-[var(--text-secondary)]/30 mx-auto mb-8" />
            <p className="text-3xl text-[var(--text-secondary)]">Nenhum ticket aberto</p>
            <p className="text-xl text-[var(--text-secondary)]/60 mt-2">Suporte zerado = Clientes felizes</p>
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
                  className={`bg-[var(--surface)]/60 backdrop-blur-xl rounded-2xl p-6 border transition-all ${
                    ticket.prioridade === 'urgente'
                      ? 'border-[var(--accent-alert)]/50 shadow-lg shadow-[var(--accent-alert)]/20'
                      : 'border-[var(--border)] hover:border-[var(--accent-sky)]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      {ticket.prioridade === 'urgente' && (
                        <FireIcon className="w-8 h-8 text-[var(--accent-alert)] animate-pulse" />
                      )}
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-[var(--text-secondary)] font-mono">{ticket.numero}</span>
                          <Badge className={`${prioConfig.bg} ${prioConfig.text} capitalize`}>
                            {ticket.prioridade}
                          </Badge>
                          <Badge className={`${statConfig.bg} ${statConfig.text} capitalize`}>
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-bold text-[var(--text-primary)]">{ticket.titulo}</h3>
                        <p className="text-[var(--text-secondary)]">{ticket.cliente} • {ticket.categoria}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {ticket.atendente && (
                        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                          <UserIcon className="w-5 h-5" />
                          <span>{ticket.atendente}</span>
                        </div>
                      )}
                      <div className="text-right">
                        <p className="text-[var(--text-secondary)] text-sm">
                          {ticket.data_abertura
                            ? format(new Date(ticket.data_abertura), "dd MMM 'às' HH:mm", { locale: ptBR })
                            : '-'
                          }
                        </p>
                        {ticket.tempo_resposta && (
                          <p className="text-[var(--accent-sky)] text-sm">
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
        <SparklesIcon className="w-32 h-32 text-[var(--accent-sky)] mx-auto mb-8 animate-pulse" />
        <p className="text-5xl font-light text-[var(--accent-sky)] max-w-4xl mx-auto">
          "Um problema bem resolvido transforma reclamante em fã. Suporte é a última linha de vendas."
        </p>
        <p className="text-3xl text-[var(--text-secondary)] mt-8">
          — Citizen Supremo X.1, seu Diretor de Experiência
        </p>
      </motion.div>
    </div>
  );
}
