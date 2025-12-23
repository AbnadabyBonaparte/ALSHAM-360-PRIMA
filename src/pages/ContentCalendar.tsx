// src/pages/ContentCalendar.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Calendário de Conteúdo Alienígena 1000/1000
// Cada dia é uma oportunidade de dominação. O conteúdo nunca para.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA
// ✅ MIGRADO PARA SHADCN/UI + CSS VARIABLES

import {
  CalendarDaysIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  PhotoIcon,
  MicrophoneIcon,
  SparklesIcon,
  CheckCircleIcon,
  ClockIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ContentItem {
  id: string;
  titulo: string;
  tipo: 'blog' | 'video' | 'social' | 'podcast' | 'email';
  status: 'rascunho' | 'agendado' | 'publicado';
  data_publicacao: string;
  canal: string;
}

interface CalendarMetrics {
  totalConteudos: number;
  publicados: number;
  agendados: number;
  rascunhos: number;
  conteudos: ContentItem[];
}

export default function ContentCalendarPage() {
  const [metrics, setMetrics] = useState<CalendarMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    async function loadSupremeCalendar() {
      try {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);

        const { data: conteudos } = await supabase
          .from('content_calendar')
          .select('*')
          .gte('data_publicacao', format(start, 'yyyy-MM-dd'))
          .lte('data_publicacao', format(end, 'yyyy-MM-dd'))
          .order('data_publicacao', { ascending: true });

        if (conteudos) {
          setMetrics({
            totalConteudos: conteudos.length,
            publicados: conteudos.filter((c: any) => c.status === 'publicado').length,
            agendados: conteudos.filter((c: any) => c.status === 'agendado').length,
            rascunhos: conteudos.filter((c: any) => c.status === 'rascunho').length,
            conteudos: conteudos.map((c: any) => ({
              id: c.id,
              titulo: c.titulo || 'Sem título',
              tipo: c.tipo || 'blog',
              status: c.status || 'rascunho',
              data_publicacao: c.data_publicacao || '',
              canal: c.canal || ''
            }))
          });
        } else {
          setMetrics({
            totalConteudos: 0,
            publicados: 0,
            agendados: 0,
            rascunhos: 0,
            conteudos: []
          });
        }
      } catch (err) {
        console.error('Erro no Content Calendar Supremo:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSupremeCalendar();
  }, [currentMonth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-8 border-t-transparent border-[var(--accent-purple)] rounded-full"
        />
        <p className="absolute text-4xl text-[var(--accent-purple)] font-light">Carregando calendário...</p>
      </div>
    );
  }

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const getContentForDay = (day: Date) => {
    return metrics?.conteudos.filter(c =>
      c.data_publicacao && isSameDay(parseISO(c.data_publicacao), day)
    ) || [];
  };

  const typeIcon = (tipo: string) => {
    switch (tipo) {
      case 'video': return <VideoCameraIcon className="w-4 h-4" />;
      case 'social': return <PhotoIcon className="w-4 h-4" />;
      case 'podcast': return <MicrophoneIcon className="w-4 h-4" />;
      case 'email': return <DocumentTextIcon className="w-4 h-4" />;
      default: return <PencilSquareIcon className="w-4 h-4" />;
    }
  };

  const typeColor = (tipo: string) => {
    switch (tipo) {
      case 'video': return 'bg-[var(--accent-alert)]';
      case 'social': return 'bg-[var(--accent-pink)]';
      case 'podcast': return 'bg-[var(--accent-purple)]';
      case 'email': return 'bg-[var(--accent-sky)]';
      default: return 'bg-[var(--accent-emerald)]';
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
        <h1 className="text-xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-[var(--accent-purple)] via-[var(--accent-1)] to-[var(--accent-pink)] bg-clip-text text-transparent">
          CALENDÁRIO DE CONTEÚDO
        </h1>
        <p className="text-3xl text-[var(--text-secondary)] mt-6">
          Cada dia é uma oportunidade de dominação
        </p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
        <Card className="bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)] hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <CalendarDaysIcon className="w-12 h-12 text-[var(--accent-purple)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.totalConteudos || 0}</p>
            <p className="text-[var(--text-secondary)]">Total no Mês</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)] hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <CheckCircleIcon className="w-12 h-12 text-[var(--accent-emerald)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.publicados || 0}</p>
            <p className="text-[var(--text-secondary)]">Publicados</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)] hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <ClockIcon className="w-12 h-12 text-[var(--accent-warning)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.agendados || 0}</p>
            <p className="text-[var(--text-secondary)]">Agendados</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)] hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <PencilSquareIcon className="w-12 h-12 text-[var(--text-secondary)] mb-3" />
            <p className="text-4xl font-black text-[var(--text-primary)]">{metrics?.rascunhos || 0}</p>
            <p className="text-[var(--text-secondary)]">Rascunhos</p>
          </CardContent>
        </Card>
      </div>

      {/* NAVEGAÇÃO DO MÊS */}
      <div className="flex items-center justify-center gap-8 mb-8">
        <Button
          variant="ghost"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-3 rounded-xl bg-[var(--surface)]/60 hover:bg-[var(--surface)] text-[var(--text-primary)]"
        >
          ←
        </Button>
        <h2 className="text-3xl font-bold text-[var(--text-primary)]">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <Button
          variant="ghost"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-3 rounded-xl bg-[var(--surface)]/60 hover:bg-[var(--surface)] text-[var(--text-primary)]"
        >
          →
        </Button>
      </div>

      {/* CALENDÁRIO */}
      <Card className="max-w-6xl mx-auto bg-[var(--surface)]/60 backdrop-blur-xl border-[var(--border)]">
        <CardContent className="p-8">
          {/* DIAS DA SEMANA */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="text-center text-[var(--text-secondary)] font-medium py-2">
                {day}
              </div>
            ))}
          </div>

          {/* DIAS DO MÊS */}
          <div className="grid grid-cols-7 gap-2">
            {/* Espaços vazios para alinhar o primeiro dia */}
            {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {days.map(day => {
              const dayContent = getContentForDay(day);
              const isToday = isSameDay(day, new Date());

              return (
                <motion.div
                  key={day.toISOString()}
                  whileHover={{ scale: 1.05 }}
                  className={`aspect-square rounded-xl p-2 border transition-all cursor-pointer ${
                    isToday ? 'bg-[var(--accent-purple)]/30 border-[var(--accent-purple)]' :
                    dayContent.length > 0 ? 'bg-[var(--surface)]/60 border-[var(--border)]' :
                    'bg-[var(--surface)]/30 border-transparent hover:border-[var(--border)]'
                  }`}
                >
                  <div className="text-sm font-medium text-[var(--text-secondary)] mb-1">
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayContent.slice(0, 3).map(content => (
                      <div
                        key={content.id}
                        className={`${typeColor(content.tipo)} rounded px-1 py-0.5 flex items-center gap-1 text-xs text-[var(--text-primary)] truncate`}
                      >
                        {typeIcon(content.tipo)}
                        <span className="truncate">{content.titulo}</span>
                      </div>
                    ))}
                    {dayContent.length > 3 && (
                      <div className="text-xs text-[var(--text-secondary)]">+{dayContent.length - 3} mais</div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* LEGENDA */}
      <div className="flex justify-center gap-6 mt-8 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[var(--accent-emerald)] rounded" />
          <span className="text-[var(--text-secondary)]">Blog</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[var(--accent-alert)] rounded" />
          <span className="text-[var(--text-secondary)]">Vídeo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[var(--accent-pink)] rounded" />
          <span className="text-[var(--text-secondary)]">Social</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[var(--accent-purple)] rounded" />
          <span className="text-[var(--text-secondary)]">Podcast</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[var(--accent-sky)] rounded" />
          <span className="text-[var(--text-secondary)]">Email</span>
        </div>
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
          "Consistência é o segredo. Cada dia sem conteúdo é um dia que seu concorrente avança."
        </p>
        <p className="text-3xl text-[var(--text-secondary)] mt-8">
          — Citizen Supremo X.1, seu Editor-Chefe
        </p>
      </motion.div>
    </div>
  );
}
