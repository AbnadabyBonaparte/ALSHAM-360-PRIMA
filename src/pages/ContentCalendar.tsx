// src/pages/ContentCalendar.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Calendário de Conteúdo Alienígena 1000/1000
// Cada dia é uma oportunidade de dominação. O conteúdo nunca para.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA

import LayoutSupremo from '@/components/LayoutSupremo';
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
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
            publicados: conteudos.filter(c => c.status === 'publicado').length,
            agendados: conteudos.filter(c => c.status === 'agendado').length,
            rascunhos: conteudos.filter(c => c.status === 'rascunho').length,
            conteudos: conteudos.map(c => ({
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
      <LayoutSupremo title="Calendário de Conteúdo">
        <div className="flex items-center justify-center h-screen bg-black">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-40 h-40 border-8 border-t-transparent border-indigo-500 rounded-full"
          />
          <p className="absolute text-4xl text-indigo-400 font-light">Carregando calendário...</p>
        </div>
      </LayoutSupremo>
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
      case 'video': return 'bg-red-500';
      case 'social': return 'bg-pink-500';
      case 'podcast': return 'bg-purple-500';
      case 'email': return 'bg-blue-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <LayoutSupremo title="Calendário de Conteúdo">
      <div className="min-h-screen bg-black text-white p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-7xl font-black bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            CALENDÁRIO DE CONTEÚDO
          </h1>
          <p className="text-3xl text-gray-400 mt-6">
            Cada dia é uma oportunidade de dominação
          </p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-indigo-900/60 to-purple-900/60 rounded-2xl p-6 border border-indigo-500/30">
            <CalendarDaysIcon className="w-12 h-12 text-indigo-400 mb-3" />
            <p className="text-4xl font-black text-white">{metrics?.totalConteudos || 0}</p>
            <p className="text-gray-400">Total no Mês</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 rounded-2xl p-6 border border-green-500/30">
            <CheckCircleIcon className="w-12 h-12 text-green-400 mb-3" />
            <p className="text-4xl font-black text-white">{metrics?.publicados || 0}</p>
            <p className="text-gray-400">Publicados</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-yellow-900/60 to-orange-900/60 rounded-2xl p-6 border border-yellow-500/30">
            <ClockIcon className="w-12 h-12 text-yellow-400 mb-3" />
            <p className="text-4xl font-black text-white">{metrics?.agendados || 0}</p>
            <p className="text-gray-400">Agendados</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-gray-800/60 to-gray-700/60 rounded-2xl p-6 border border-gray-500/30">
            <PencilSquareIcon className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-4xl font-black text-white">{metrics?.rascunhos || 0}</p>
            <p className="text-gray-400">Rascunhos</p>
          </motion.div>
        </div>

        {/* NAVEGAÇÃO DO MÊS */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          >
            ←
          </button>
          <h2 className="text-3xl font-bold text-white">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h2>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          >
            →
          </button>
        </div>

        {/* CALENDÁRIO */}
        <div className="max-w-6xl mx-auto bg-gradient-to-br from-white/5 to-white/10 rounded-3xl p-8 border border-white/10 backdrop-blur-xl">
          {/* DIAS DA SEMANA */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="text-center text-gray-400 font-medium py-2">
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
                    isToday ? 'bg-indigo-500/30 border-indigo-500' :
                    dayContent.length > 0 ? 'bg-white/10 border-white/20' :
                    'bg-white/5 border-transparent hover:border-white/10'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-300 mb-1">
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayContent.slice(0, 3).map(content => (
                      <div
                        key={content.id}
                        className={`${typeColor(content.tipo)} rounded px-1 py-0.5 flex items-center gap-1 text-xs text-white truncate`}
                      >
                        {typeIcon(content.tipo)}
                        <span className="truncate">{content.titulo}</span>
                      </div>
                    ))}
                    {dayContent.length > 3 && (
                      <div className="text-xs text-gray-400">+{dayContent.length - 3} mais</div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* LEGENDA */}
        <div className="flex justify-center gap-6 mt-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span className="text-gray-400">Blog</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span className="text-gray-400">Vídeo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-pink-500 rounded" />
            <span className="text-gray-400">Social</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded" />
            <span className="text-gray-400">Podcast</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded" />
            <span className="text-gray-400">Email</span>
          </div>
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
            "Consistência é o segredo. Cada dia sem conteúdo é um dia que seu concorrente avança."
          </p>
          <p className="text-3xl text-gray-500 mt-8">
            — Citizen Supremo X.1, seu Editor-Chefe
          </p>
        </motion.div>
      </div>
    </LayoutSupremo>
  );
}
