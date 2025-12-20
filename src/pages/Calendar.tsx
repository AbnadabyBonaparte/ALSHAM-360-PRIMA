// src/pages/Calendar.tsx
// ALSHAM 360° PRIMA — Calendário (migrado para shadcn/ui)

import { CalendarIcon, ClockIcon, VideoCameraIcon, UserGroupIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

  const getEventTypeColor = (type: string): { bg: string; text: string } => {
    switch (type) {
      case 'demo':
        return { bg: 'bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)]', text: 'text-[var(--text-primary)]' };
      case 'call':
        return { bg: 'bg-gradient-to-r from-[var(--accent-sky)] to-[var(--accent-purple)]', text: 'text-[var(--text-primary)]' };
      case 'meeting':
        return { bg: 'bg-gradient-to-r from-[var(--accent-emerald)] to-[var(--accent-sky)]', text: 'text-[var(--text-primary)]' };
      case 'task':
        return { bg: 'bg-gradient-to-r from-[var(--accent-warning)] to-[var(--accent-alert)]', text: 'text-[var(--text-primary)]' };
      default:
        return { bg: 'bg-gradient-to-r from-[var(--surface-strong)] to-[var(--surface-strong)]', text: 'text-[var(--text-secondary)]' };
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header Supremo */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-8">
          <CalendarIcon className="w-20 h-20 text-[var(--accent-sky)] animate-pulse" />
          <div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-[var(--accent-sky)] via-[var(--accent-purple)] to-[var(--accent-pink)] bg-clip-text text-transparent">
              Calendário
            </h1>
            <p className="text-2xl text-[var(--text-secondary)] mt-4">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })} • R$ {totalRevenueThisMonth.toLocaleString('pt-BR')} em potencial
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            variant="ghost"
            className="p-4 bg-[var(--surface)]/10 hover:bg-[var(--surface)]/20 rounded-2xl transition-all"
          >
            ← Anterior
          </Button>
          <Button
            onClick={() => setCurrentMonth(new Date())}
            variant="default"
            className="px-8 py-4 bg-[var(--accent-sky)]/20 hover:bg-[var(--accent-sky)]/30 rounded-2xl font-bold transition-all"
          >
            Hoje
          </Button>
          <Button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            variant="ghost"
            className="p-4 bg-[var(--surface)]/10 hover:bg-[var(--surface)]/20 rounded-2xl transition-all"
          >
            Próximo →
          </Button>
        </div>
      </div>

      {/* Grid do Calendário */}
      <Card className="bg-[var(--background)]/40 backdrop-blur-2xl border-[var(--border)] overflow-hidden rounded-3xl">
        <CardContent className="p-0">
          <div className="grid grid-cols-7 text-center border-b border-[var(--border)]">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="py-6 text-xl font-bold text-[var(--text-secondary)]">
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
                  className={`min-h-48 p-4 border-r border-b border-[var(--border)]/20 transition-all cursor-pointer hover:bg-[var(--surface)]/5 ${
                    isToday ? 'bg-gradient-to-br from-[var(--accent-sky)]/20 to-transparent border-[var(--accent-sky)]/50' : ''
                  } ${!isSameMonth(day, currentMonth) ? 'opacity-30' : ''}`}
                >
                  <div className={`text-right text-2xl font-bold mb-3 ${isToday ? 'text-[var(--accent-sky)]' : 'text-[var(--text-secondary)]'}`}>
                    {format(day, 'd')}
                  </div>

                  <div className="space-y-2">
                    {dayEvents.slice(0, 4).map(event => {
                      const typeColor = getEventTypeColor(event.type);

                      return (
                        <Badge
                          key={event.id}
                          className={`text-xs px-3 py-2 rounded-lg font-medium ${typeColor.bg} ${typeColor.text} truncate w-full border-0`}
                        >
                          {event.type === 'demo' && 'Demo '}
                          {event.type === 'call' && 'Call '}
                          {event.type === 'meeting' && 'Reunião '}
                          {event.type === 'task' && 'Tarefa '}
                          {event.title}
                        </Badge>
                      );
                    })}
                    {dayEvents.length > 4 && (
                      <p className="text-xs text-[var(--text-secondary)] mt-2">+{dayEvents.length - 4} mais</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Rodapé Supremo */}
      <div className="mt-16 text-center">
        <p className="text-3xl font-light text-[var(--text-secondary)]">
          Sincronizando seu tempo com o universo.
        </p>
        <p className="text-lg text-[var(--text-secondary)] mt-4">
          Todas as reuniões, calls e demos e tarefas — em um único lugar.
        </p>
      </div>
    </div>
  );
}
