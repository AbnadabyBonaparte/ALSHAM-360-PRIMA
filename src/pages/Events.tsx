// src/pages/Events.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Eventos Alienígenas 1000/1000
// 100% CSS Variables + shadcn/ui

import {
  CalendarDaysIcon,
  MapPinIcon,
  UserGroupIcon,
  TicketIcon,
  ClockIcon,
  SparklesIcon,
  StarIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Event {
  id: string;
  nome: string;
  descricao: string;
  tipo: 'presencial' | 'online' | 'hibrido';
  local: string;
  data_inicio: string;
  data_fim: string;
  capacidade: number;
  inscritos: number;
  confirmados: number;
  status: 'agendado' | 'em_andamento' | 'encerrado' | 'cancelado';
  valor_ingresso: number;
}

interface EventMetrics {
  totalEventos: number;
  proximos: number;
  totalInscritos: number;
  receitaTotal: number;
  eventos: Event[];
}

export default function EventsPage() {
  const [metrics, setMetrics] = useState<EventMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeEvents() {
      try {
        const { data: eventos } = await supabase
          .from('eventos')
          .select('*')
          .order('data_inicio', { ascending: false });

        if (eventos) {
          const proximos = eventos.filter(e => e.status === 'agendado').length;
          const totalInscritos = eventos.reduce((s, e) => s + (e.inscritos || 0), 0);
          const receitaTotal = eventos.reduce((s, e) => s + ((e.inscritos || 0) * (e.valor_ingresso || 0)), 0);

          setMetrics({
            totalEventos: eventos.length,
            proximos,
            totalInscritos,
            receitaTotal,
            eventos: eventos.map(e => ({
              id: e.id,
              nome: e.nome || 'Evento',
              descricao: e.descricao || '',
              tipo: e.tipo || 'presencial',
              local: e.local || '',
              data_inicio: e.data_inicio || '',
              data_fim: e.data_fim || '',
              capacidade: e.capacidade || 0,
              inscritos: e.inscritos || 0,
              confirmados: e.confirmados || 0,
              status: e.status || 'agendado',
              valor_ingresso: e.valor_ingresso || 0
            }))
          });
        } else {
          setMetrics({
            totalEventos: 0,
            proximos: 0,
            totalInscritos: 0,
            receitaTotal: 0,
            eventos: []
          });
        }
      } catch (err) {
        console.error('Erro nos Eventos Supremos:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSupremeEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-8 border-t-transparent border-[var(--accent-purple)] rounded-full"
        />
        <p className="absolute text-4xl text-[var(--accent-purple)] font-light">Organizando eventos...</p>
      </div>
    );
  }

  const tipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'online': return <GlobeAltIcon className="w-6 h-6 text-[var(--accent-sky)]" />;
      case 'hibrido': return <StarIcon className="w-6 h-6 text-[var(--accent-purple)]" />;
      default: return <MapPinIcon className="w-6 h-6 text-[var(--accent-emerald)]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] p-8">
      {/* HEADER ÉPICO */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-[var(--accent-purple)] via-[var(--accent-purple)] to-[var(--accent-pink)] bg-clip-text text-transparent">
          EVENTOS SUPREMOS
        </h1>
        <p className="text-3xl text-[var(--text-secondary)] mt-6">
          Cada evento é uma experiência inesquecível
        </p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
        <Card className="bg-[var(--accent-purple)]/10 border-[var(--accent-purple)]/30">
          <CardContent className="p-6">
            <CalendarDaysIcon className="w-12 h-12 text-[var(--accent-purple)] mb-3" />
            <p className="text-4xl font-black text-[var(--text)]">{metrics?.totalEventos || 0}</p>
            <p className="text-[var(--text-secondary)]">Total Eventos</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-sky)]/10 border-[var(--accent-sky)]/30">
          <CardContent className="p-6">
            <ClockIcon className="w-12 h-12 text-[var(--accent-sky)] mb-3" />
            <p className="text-4xl font-black text-[var(--text)]">{metrics?.proximos || 0}</p>
            <p className="text-[var(--text-secondary)]">Próximos</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-pink)]/10 border-[var(--accent-pink)]/30">
          <CardContent className="p-6">
            <UserGroupIcon className="w-12 h-12 text-[var(--accent-pink)] mb-3" />
            <p className="text-4xl font-black text-[var(--text)]">{(metrics?.totalInscritos || 0).toLocaleString()}</p>
            <p className="text-[var(--text-secondary)]">Total Inscritos</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--accent-emerald)]/10 border-[var(--accent-emerald)]/30">
          <CardContent className="p-6">
            <TicketIcon className="w-12 h-12 text-[var(--accent-emerald)] mb-3" />
            <p className="text-4xl font-black text-[var(--text)]">R$ {((metrics?.receitaTotal || 0) / 1000).toFixed(0)}k</p>
            <p className="text-[var(--text-secondary)]">Receita Total</p>
          </CardContent>
        </Card>
      </div>

      {/* LISTA DE EVENTOS */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] bg-clip-text text-transparent">
          Calendário de Eventos
        </h2>

        {metrics?.eventos.length === 0 ? (
          <div className="text-center py-20">
            <CalendarDaysIcon className="w-32 h-32 text-[var(--text-secondary)]/30 mx-auto mb-8" />
            <p className="text-3xl text-[var(--text-secondary)]">Nenhum evento cadastrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {metrics?.eventos.map((evento, i) => (
              <motion.div
                key={evento.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className={`overflow-hidden backdrop-blur-xl ${
                  evento.status === 'em_andamento'
                    ? 'bg-[var(--accent-purple)]/10 border-[var(--accent-purple)]/50 shadow-2xl shadow-[var(--accent-purple)]/20'
                    : evento.status === 'cancelado'
                    ? 'bg-[var(--surface)]/30 border-[var(--border)] opacity-60'
                    : 'bg-[var(--surface)]/60 border-[var(--border)]'
                }`}>
                  {/* HEADER DO EVENTO */}
                  <CardHeader className="border-b border-[var(--border)] pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 px-3 py-1 bg-[var(--surface)]/50 rounded-full text-sm">
                        {tipoIcon(evento.tipo)}
                        <span className="capitalize text-[var(--text-secondary)]">{evento.tipo}</span>
                      </div>
                      <Badge variant={
                        evento.status === 'agendado' ? 'secondary' :
                        evento.status === 'em_andamento' ? 'default' :
                        evento.status === 'encerrado' ? 'outline' :
                        'destructive'
                      }>
                        {evento.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <h3 className="text-2xl font-bold text-[var(--text)] mb-2">{evento.nome}</h3>
                    <p className="text-[var(--text-secondary)] text-sm line-clamp-2">{evento.descricao}</p>
                  </CardHeader>

                  {/* DETALHES */}
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                      <CalendarDaysIcon className="w-5 h-5" />
                      <span>
                        {evento.data_inicio ? format(new Date(evento.data_inicio), "dd MMM yyyy 'às' HH:mm", { locale: ptBR }) : '-'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                      <MapPinIcon className="w-5 h-5" />
                      <span>{evento.local || 'Local a definir'}</span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                      <div>
                        <p className="text-2xl font-bold text-[var(--text)]">{evento.inscritos}/{evento.capacidade}</p>
                        <p className="text-[var(--text-secondary)] text-sm">Inscritos</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[var(--accent-emerald)]">
                          {evento.valor_ingresso > 0 ? `R$ ${evento.valor_ingresso}` : 'Gratuito'}
                        </p>
                        <p className="text-[var(--text-secondary)] text-sm">Ingresso</p>
                      </div>
                    </div>

                    {/* BARRA DE OCUPAÇÃO */}
                    <div>
                      <div className="flex justify-between text-sm text-[var(--text-secondary)] mb-1">
                        <span>Ocupação</span>
                        <span>{evento.capacidade > 0 ? ((evento.inscritos / evento.capacidade) * 100).toFixed(0) : 0}%</span>
                      </div>
                      <Progress 
                        value={evento.capacidade > 0 ? (evento.inscritos / evento.capacidade) * 100 : 0}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
        <SparklesIcon className="w-32 h-32 text-[var(--accent-purple)] mx-auto mb-8 animate-pulse" />
        <p className="text-5xl font-light text-[var(--accent-purple)] max-w-4xl mx-auto">
          "Eventos não são apenas reuniões. São momentos onde impérios nascem."
        </p>
        <p className="text-3xl text-[var(--text-secondary)] mt-8">
          — Citizen Supremo X.1, seu Mestre de Cerimônias
        </p>
      </motion.div>
    </div>
  );
}
