// src/pages/Events.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Eventos Alienígenas 1000/1000
// Cada evento é uma experiência inesquecível. Conexões que transformam negócios.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA

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
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { format, isPast, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
            className="w-40 h-40 border-8 border-t-transparent border-violet-500 rounded-full"
          />
          <p className="absolute text-4xl text-violet-400 font-light">Organizando eventos...</p>
        </div>
      
    );
  }

  const tipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'online': return <GlobeAltIcon className="w-6 h-6 text-blue-400" />;
      case 'hibrido': return <StarIcon className="w-6 h-6 text-purple-400" />;
      default: return <MapPinIcon className="w-6 h-6 text-green-400" />;
    }
  };

  return (
    
      <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-8xl font-black bg-gradient-to-r from-violet-400 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
            EVENTOS SUPREMOS
          </h1>
          <p className="text-3xl text-gray-400 mt-6">
            Cada evento é uma experiência inesquecível
          </p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-violet-900/60 to-purple-900/60 rounded-2xl p-6 border border-violet-500/30">
            <CalendarDaysIcon className="w-12 h-12 text-violet-400 mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.totalEventos || 0}</p>
            <p className="text-gray-400">Total Eventos</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-blue-900/60 to-cyan-900/60 rounded-2xl p-6 border border-blue-500/30">
            <ClockIcon className="w-12 h-12 text-blue-400 mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.proximos || 0}</p>
            <p className="text-gray-400">Próximos</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-pink-900/60 to-rose-900/60 rounded-2xl p-6 border border-pink-500/30">
            <UserGroupIcon className="w-12 h-12 text-pink-400 mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{(metrics?.totalInscritos || 0).toLocaleString()}</p>
            <p className="text-gray-400">Total Inscritos</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 rounded-2xl p-6 border border-green-500/30">
            <TicketIcon className="w-12 h-12 text-green-400 mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">R$ {((metrics?.receitaTotal || 0) / 1000).toFixed(0)}k</p>
            <p className="text-gray-400">Receita Total</p>
          </motion.div>
        </div>

        {/* LISTA DE EVENTOS */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
            Calendário de Eventos
          </h2>

          {metrics?.eventos.length === 0 ? (
            <div className="text-center py-20">
              <CalendarDaysIcon className="w-32 h-32 text-gray-700 mx-auto mb-8" />
              <p className="text-3xl text-gray-500">Nenhum evento cadastrado</p>
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
                  className={`rounded-3xl overflow-hidden border backdrop-blur-xl ${
                    evento.status === 'em_andamento'
                      ? 'bg-gradient-to-br from-violet-900/60 to-purple-900/60 border-violet-500/50 shadow-2xl shadow-violet-500/20'
                      : evento.status === 'cancelado'
                      ? 'bg-gradient-to-br from-gray-900/60 to-gray-800/60 border-gray-500/30 opacity-60'
                      : 'bg-gradient-to-br from-white/5 to-white/10 border-[var(--border)]'
                  }`}
                >
                  {/* HEADER DO EVENTO */}
                  <div className="p-6 border-b border-[var(--border)]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm">
                        {tipoIcon(evento.tipo)}
                        <span className="capitalize">{evento.tipo}</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        evento.status === 'agendado' ? 'bg-blue-500/20 text-blue-400' :
                        evento.status === 'em_andamento' ? 'bg-green-500/20 text-green-400' :
                        evento.status === 'encerrado' ? 'bg-gray-500/20 text-gray-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {evento.status.replace('_', ' ')}
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{evento.nome}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{evento.descricao}</p>
                  </div>

                  {/* DETALHES */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3 text-gray-400">
                      <CalendarDaysIcon className="w-5 h-5" />
                      <span>
                        {evento.data_inicio ? format(new Date(evento.data_inicio), "dd MMM yyyy 'às' HH:mm", { locale: ptBR }) : '-'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-gray-400">
                      <MapPinIcon className="w-5 h-5" />
                      <span>{evento.local || 'Local a definir'}</span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                      <div>
                        <p className="text-2xl font-bold text-[var(--text-primary)]">{evento.inscritos}/{evento.capacidade}</p>
                        <p className="text-gray-500 text-sm">Inscritos</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-400">
                          {evento.valor_ingresso > 0 ? `R$ ${evento.valor_ingresso}` : 'Gratuito'}
                        </p>
                        <p className="text-gray-500 text-sm">Ingresso</p>
                      </div>
                    </div>

                    {/* BARRA DE OCUPAÇÃO */}
                    <div>
                      <div className="flex justify-between text-sm text-gray-400 mb-1">
                        <span>Ocupação</span>
                        <span>{evento.capacidade > 0 ? ((evento.inscritos / evento.capacidade) * 100).toFixed(0) : 0}%</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${evento.capacidade > 0 ? (evento.inscritos / evento.capacidade) * 100 : 0}%` }}
                          className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        />
                      </div>
                    </div>
                  </div>
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
          <SparklesIcon className="w-32 h-32 text-violet-400 mx-auto mb-8 animate-pulse" />
          <p className="text-5xl font-light text-violet-300 max-w-4xl mx-auto">
            "Eventos não são apenas reuniões. São momentos onde impérios nascem."
          </p>
          <p className="text-3xl text-gray-500 mt-8">
            — Citizen Supremo X.1, seu Mestre de Cerimônias
          </p>
        </motion.div>
      </div>
    
  );
}
