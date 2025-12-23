// src/pages/Webinars.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Webinars Alienígenas 1000/1000
// Cada webinar é um palco de autoridade. O conhecimento ao vivo conquista.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA

import {
  VideoCameraIcon,
  UserGroupIcon,
  ClockIcon,
  PlayCircleIcon,
  CalendarDaysIcon,
  SparklesIcon,
  ChartBarIcon,
  SignalIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { format, isPast, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Webinar {
  id: string;
  titulo: string;
  descricao: string;
  apresentador: string;
  data_hora: string;
  duracao: number;
  status: 'agendado' | 'ao_vivo' | 'encerrado' | 'gravado';
  inscritos: number;
  participantes: number;
  replay_views: number;
}

interface WebinarMetrics {
  totalWebinars: number;
  agendados: number;
  totalInscritos: number;
  mediaParticipacao: number;
  webinars: Webinar[];
}

export default function WebinarsPage() {
  const [metrics, setMetrics] = useState<WebinarMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeWebinars() {
      try {
        const { data: webinars } = await supabase
          .from('webinars')
          .select('*')
          .order('data_hora', { ascending: false });

        if (webinars) {
          const encerrados = webinars.filter(w => w.status === 'encerrado' || w.status === 'gravado');
          const totalInscritos = webinars.reduce((s, w) => s + (w.inscritos || 0), 0);
          const totalParticipantes = encerrados.reduce((s, w) => s + (w.participantes || 0), 0);
          const totalInscritosEncerrados = encerrados.reduce((s, w) => s + (w.inscritos || 0), 0);

          setMetrics({
            totalWebinars: webinars.length,
            agendados: webinars.filter(w => w.status === 'agendado').length,
            totalInscritos,
            mediaParticipacao: totalInscritosEncerrados > 0
              ? (totalParticipantes / totalInscritosEncerrados) * 100
              : 0,
            webinars: webinars.map(w => ({
              id: w.id,
              titulo: w.titulo || 'Webinar',
              descricao: w.descricao || '',
              apresentador: w.apresentador || 'Apresentador',
              data_hora: w.data_hora || '',
              duracao: w.duracao || 60,
              status: w.status || 'agendado',
              inscritos: w.inscritos || 0,
              participantes: w.participantes || 0,
              replay_views: w.replay_views || 0
            }))
          });
        } else {
          setMetrics({
            totalWebinars: 0,
            agendados: 0,
            totalInscritos: 0,
            mediaParticipacao: 0,
            webinars: []
          });
        }
      } catch (err) {
        console.error('Erro nos Webinars Supremos:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSupremeWebinars();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-8 border-t-transparent border-[var(--accent-alert)] rounded-full"
        />
        <p className="absolute text-4xl text-[var(--accent-alert)] font-light">Preparando o palco...</p>
      </div>
    );
  }

  const statusConfig = {
    ao_vivo: { bg: 'from-[var(--accent-alert)] to-[var(--accent-warning)]', icon: <SignalIcon className="w-6 h-6 animate-pulse" />, text: 'AO VIVO' },
    agendado: { bg: 'from-[var(--accent-sky)] to-[var(--accent-1)]', icon: <CalendarDaysIcon className="w-6 h-6" />, text: 'Agendado' },
    encerrado: { bg: 'from-[var(--text-secondary)] to-[var(--text-secondary)]', icon: <ClockIcon className="w-6 h-6" />, text: 'Encerrado' },
    gravado: { bg: 'from-[var(--accent-purple)] to-[var(--accent-pink)]', icon: <PlayCircleIcon className="w-6 h-6" />, text: 'Gravado' }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-[var(--accent-alert)] via-[var(--accent-warning)] to-[var(--accent-1)] bg-clip-text text-transparent">
            WEBINARS SUPREMOS
          </h1>
          <p className="text-3xl text-[var(--text-secondary)] mt-6">
            Cada webinar é um palco de autoridade absoluta
          </p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-[var(--surface)]/60 backdrop-blur-xl rounded-2xl p-6 border border-[var(--border)]">
            <VideoCameraIcon className="w-12 h-12 text-[var(--accent-alert)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.totalWebinars || 0}</p>
            <p className="text-[var(--text-secondary)]">Total Webinars</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-[var(--surface)]/60 backdrop-blur-xl rounded-2xl p-6 border border-[var(--border)]">
            <CalendarDaysIcon className="w-12 h-12 text-[var(--accent-sky)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.agendados || 0}</p>
            <p className="text-[var(--text-secondary)]">Agendados</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-[var(--surface)]/60 backdrop-blur-xl rounded-2xl p-6 border border-[var(--border)]">
            <UserGroupIcon className="w-12 h-12 text-[var(--accent-purple)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{(metrics?.totalInscritos || 0).toLocaleString()}</p>
            <p className="text-[var(--text-secondary)]">Total Inscritos</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-[var(--surface)]/60 backdrop-blur-xl rounded-2xl p-6 border border-[var(--border)]">
            <ChartBarIcon className="w-12 h-12 text-[var(--accent-emerald)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{(metrics?.mediaParticipacao || 0).toFixed(0)}%</p>
            <p className="text-[var(--text-secondary)]">Participação</p>
          </motion.div>
        </div>

        {/* LISTA DE WEBINARS */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[var(--accent-alert)] to-[var(--accent-warning)] bg-clip-text text-transparent">
            Próximos e Recentes
          </h2>

          {metrics?.webinars.length === 0 ? (
            <div className="text-center py-20">
              <VideoCameraIcon className="w-32 h-32 text-[var(--text)]/30 mx-auto mb-8" />
              <p className="text-3xl text-[var(--text)]/50">Nenhum webinar cadastrado</p>
            </div>
          ) : (
            <div className="space-y-6">
              {metrics?.webinars.map((webinar, i) => {
                const config = statusConfig[webinar.status];
                return (
                  <motion.div
                    key={webinar.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`rounded-3xl p-8 border backdrop-blur-xl ${
                      webinar.status === 'ao_vivo'
                        ? 'bg-[var(--accent-alert)]/10 border-[var(--accent-alert)]/50 shadow-2xl shadow-[var(--accent-alert)]/20'
                        : 'bg-[var(--surface)]/60 border-[var(--border)]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* STATUS BADGE */}
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${config.bg} text-[var(--text-primary)] text-sm font-bold mb-4`}>
                          {config.icon}
                          {config.text}
                        </div>

                        <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-2">{webinar.titulo}</h3>
                        <p className="text-[var(--text-secondary)] mb-4">{webinar.descricao}</p>

                        <div className="flex items-center gap-6 text-[var(--text-secondary)]">
                          <span>Por {webinar.apresentador}</span>
                          <span>•</span>
                          <span>{webinar.data_hora ? format(new Date(webinar.data_hora), "dd MMM 'às' HH:mm", { locale: ptBR }) : '-'}</span>
                          <span>•</span>
                          <span>{webinar.duracao} min</span>
                        </div>
                      </div>

                      <div className="text-right space-y-4">
                        <div className="bg-[var(--surface)]/80 rounded-2xl p-4">
                          <p className="text-3xl font-black text-[var(--text-primary)]">{webinar.inscritos}</p>
                          <p className="text-[var(--text-secondary)] text-sm">Inscritos</p>
                        </div>
                        {(webinar.status === 'encerrado' || webinar.status === 'gravado') && (
                          <>
                            <div className="bg-[var(--accent-emerald)]/10 rounded-2xl p-4">
                              <p className="text-2xl font-bold text-[var(--accent-emerald)]">{webinar.participantes}</p>
                              <p className="text-[var(--text-secondary)] text-sm">Participaram</p>
                            </div>
                            {webinar.replay_views > 0 && (
                              <div className="bg-[var(--accent-purple)]/10 rounded-2xl p-4">
                                <p className="text-2xl font-bold text-[var(--accent-purple)]">{webinar.replay_views}</p>
                                <p className="text-[var(--text-secondary)] text-sm">Views Replay</p>
                              </div>
                            )}
                          </>
                        )}
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
          <SparklesIcon className="w-32 h-32 text-[var(--accent-alert)] mx-auto mb-8 animate-pulse" />
          <p className="text-5xl font-light text-[var(--accent-alert)] max-w-4xl mx-auto">
            "Um webinar bem executado vale mais que 100 posts. É autoridade instantânea."
          </p>
          <p className="text-3xl text-[var(--text-secondary)] mt-8">
            — Citizen Supremo X.1, seu Produtor de Eventos
          </p>
        </motion.div>
      </div>
  );
}
