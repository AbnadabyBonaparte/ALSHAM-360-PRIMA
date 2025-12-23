// src/pages/Calendar.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Calendário Alienígena 1000/1000
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA/blob/hotfix/recovery-prod/src/pages/Calendar.tsx

import { CalendarIcon, ClockIcon, VideoCameraIcon, UserGroupIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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


  return (

      <div className="p-8 max-w-7xl mx-auto bg-[var(--bg)] text-[var(--text)]">
        {/* Header Supremo */}
        <Card className="mb-12 bg-[var(--grad-primary)] border-[var(--border)] backdrop-blur-xl">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <CalendarIcon className="w-20 h-20 text-[var(--accent-1)] animate-pulse" />
                <div>
                  <CardTitle className="text-6xl bg-[var(--grad-primary)] bg-clip-text text-transparent">
                    Calendário Alienígena
                  </CardTitle>
                  <p className="text-2xl text-[var(--text-2)] mt-4">
                    {format(currentMonth, 'MMMM yyyy', { locale: ptBR })} • R$ {totalRevenueThisMonth.toLocaleString('pt-BR')} em potencial
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  variant="outline"
                  size="lg"
                >
                  ← Anterior
                </Button>
                <Button
                  onClick={() => setCurrentMonth(new Date())}
                  variant="default"
                  size="lg"
                >
                  Hoje
                </Button>
                <Button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  variant="outline"
                  size="lg"
                >
                  Próximo →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid do Calendário */}
        <Card className="bg-[var(--surface-glass)] border-[var(--border)] backdrop-blur-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-7 text-center border-b border-[var(--border)]">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="py-6 text-xl font-bold text-[var(--text-2)]">
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
                    className={`min-h-48 p-4 border-r border-b border-[var(--border)] transition-all cursor-pointer hover:bg-[var(--surface-elev)] ${
                      isToday ? 'bg-[var(--surface-elev)] border-[var(--accent-1)]' : ''
                    } ${!isSameMonth(day, currentMonth) ? 'opacity-30' : ''}`}
                  >
                    <div className={`text-right text-2xl font-bold mb-3 ${isToday ? 'text-[var(--accent-1)]' : 'text-[var(--text-2)]'}`}>
                      {format(day, 'd')}
                    </div>

                    <div className="space-y-2">
                      {dayEvents.slice(0, 4).map(event => (
                        <Badge
                          key={event.id}
                          variant={
                            event.type === 'demo' ? 'default' :
                            event.type === 'call' ? 'secondary' :
                            event.type === 'meeting' ? 'outline' :
                            'destructive'
                          }
                          className="text-xs px-3 py-2 justify-start truncate block"
                        >
                          {event.type === 'demo' && 'Demo '}
                          {event.type === 'call' && 'Call '}
                          {event.type === 'meeting' && 'Reunião '}
                          {event.type === 'task' && 'Tarefa '}
                          {event.title}
                        </Badge>
                      ))}
                      {dayEvents.length > 4 && (
                        <p className="text-xs text-[var(--text-muted)] mt-2">+{dayEvents.length - 4} mais</p>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
          </CardContent>
        </Card>

        {/* Rodapé Supremo */}
        <Card className="mt-16 bg-[var(--surface)] border-[var(--border)]">
          <CardContent className="text-center p-8">
            <p className="text-3xl font-light text-[var(--text-2)]">
              Citizen Supremo X.1 está sincronizando seu tempo com o universo.
            </p>
            <p className="text-lg text-[var(--text-muted)] mt-4">
              Todas as reuniões, calls e demos e tarefas — em um único lugar.
            </p>
          </CardContent>
        </Card>
      </div>
    
  );
}
