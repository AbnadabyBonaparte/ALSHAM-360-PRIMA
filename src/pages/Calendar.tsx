// src/pages/Calendar.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Calendário Alienígena 1000/1000
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA/blob/hotfix/recovery-prod/src/pages/Calendar.tsx

import LayoutSupremo from '@/components/LayoutSupremo';
import { CalendarIcon, ClockIcon, VideoCameraIcon, UserGroupIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface Event {
  id: string;
  title: string;
  type: 'meeting' | 'task' | 'call' | 'demo' | 'followup';
  start: string;
  end: string;
  participants: string[];
  status: 'confirmed' | 'pending' | 'cancelled';
  revenue_potential?: number;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCalendar() {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('id, title, type, start, end, participants, status, revenue_potential')
        .gte('start', format(startOfMonth(currentMonth), 'yyyy-MM-dd'))
        .lte('start', format(endOfMonth(currentMonth), 'yyyy-MM-dd'));

      if (!error && data) {
        setEvents(data);
      }
      setLoading(false);
    }
    loadCalendar();
  }, [currentMonth]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDay = (day: Date) => {
    return events.filter(e => isSameDay(new Date(e.start), day));
  };

  const totalRevenueThisMonth = events
    .filter(e => e.revenue_potential && e.status === 'confirmed')
    .reduce((sum, e) => sum + (e.revenue_potential || 0), 0);

  const eventTypeColor = (type: string) => {
    switch (type) {
      case 'demo': return 'from-purple-600 to-pink-600';
      case 'call': return 'from-blue-600 to-cyan-600';
      case 'meeting': return 'from-emerald-600 to-teal-600';
      case 'task': return 'from-orange-600 to-red-600';
      default: return 'from-gray-600 to-gray-500';
    }
  };

  return (
    <LayoutSupremo title="Calendário Alienígena">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header Supremo */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-8">
            <CalendarIcon className="w-20 h-20 text-primary animate-pulse" />
            <div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-600 bg-clip-text text-transparent">
                Calendário Alienígena
              </h1>
              <p className="text-2xl text-gray-300 mt-4">
                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })} • R$ {totalRevenueThisMonth.toLocaleString('pt-BR')} em potencial
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-8 py-4 bg-primary/20 hover:bg-primary/30 rounded-2xl font-bold transition-all"
            >
              Hoje
            </button>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
            >
              Próximo →
            </button>
          </div>
        </div>

        {/* Grid do Calendário */}
        <div className="bg-black/40 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden">
          <div className="grid grid-cols-7 text-center border-b border-white/10">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="py-6 text-xl font-bold text-gray-300">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 min-h-screen">
            {monthDays.map(day => {
              const dayEvents = getEventsForDay(day);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toString()}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-48 p-4 border-r border-b border-white/5 transition-all cursor-pointer hover:bg-white/5 ${
                    isToday ? 'bg-gradient-to-br from-primary/20 to-transparent border-primary/50' : ''
                  } ${!isSameMonth(day, currentMonth) ? 'opacity-30' : ''}`}
                >
                  <div className={`text-right text-2xl font-bold mb-3 ${isToday ? 'text-primary' : 'text-gray-300'}`}>
                    {format(day, 'd')}
                  </div>

                  <div className="space-y-2">
                    {dayEvents.slice(0, 4).map(event => (
                      <div
                        key={event.id}
                        className={`text-xs px-3 py-2 rounded-lg text-white font-medium bg-gradient-to-r ${eventTypeColor(event.type)} truncate`}
                      >
                        {event.type === 'demo' && 'Demo '}
                        {event.type === 'call' && 'Call '}
                        {event.type === 'meeting' && 'Reunião '}
                        {event.type === 'task' && 'Tarefa '}
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 4 && (
                      <p className="text-xs text-gray-500 mt-2">+{dayEvents.length - 4} mais</p>
                    }
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rodapé Supremo */}
        <div className="mt-16 text-center">
          <p className="text-3xl font-light text-gray-300">
            Citizen Supremo X.1 está sincronizando seu tempo com o universo.
          </p>
          <p className="text-lg text-gray-500 mt-4">
            Todas as reuniões, calls e demos e tarefas — em um único lugar.
          </p>
        </div>
      </div>
    </LayoutSupremo>
  );
}
