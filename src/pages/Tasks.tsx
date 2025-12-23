// src/pages/Tasks.tsx
// ALSHAM 360° PRIMA — Tarefas (migrado para shadcn/ui)

import {
  CheckCircleIcon,
  ClockIcon,
  FireIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
  TrophyIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { format, isToday, isPast, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'doing' | 'done' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  due_date: string;
  points: number;
  tags: string[];
  completed_at?: string;
  created_at: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeTasks() {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (!error && data) {
        setTasks(data.map((t: any) => ({
          id: t.id,
          title: t.title || 'Tarefa sem nome',
          description: t.description,
          status: t.completed_at ? 'done' : isPast(new Date(t.due_date)) ? 'overdue' : 'todo',
          priority: t.priority || 'medium',
          assignee: t.assignee_name || 'Você',
          due_date: t.due_date,
          points: t.points || 100,
          tags: t.tags || [],
          completed_at: t.completed_at,
          created_at: t.created_at
        })));
      }
      setLoading(false);
    }

    loadSupremeTasks();
  }, []);

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'done').length,
    overdue: tasks.filter(t => t.status === 'overdue').length,
    today: tasks.filter(t => isToday(new Date(t.due_date))).length,
    pointsEarned: tasks.filter(t => t.status === 'done').reduce((s, t) => s + t.points, 0),
    streak: 42 // IA calcula depois
  };

  const getPriorityVariant = (priority: string): { bg: string; text: string } => {
    switch (priority) {
      case 'critical':
        return { bg: 'bg-gradient-to-r from-[var(--accent-alert)] to-[var(--accent-pink)]', text: 'text-[var(--text-primary)]' };
      case 'high':
        return { bg: 'bg-gradient-to-r from-[var(--accent-warning)] to-[var(--accent-alert)]', text: 'text-[var(--text-primary)]' };
      case 'medium':
        return { bg: 'bg-gradient-to-r from-[var(--accent-warning)] to-[var(--accent-warning)]', text: 'text-[var(--text-primary)]' };
      default:
        return { bg: 'bg-gradient-to-r from-[var(--surface-strong)] to-[var(--surface-strong)]', text: 'text-[var(--text-secondary)]' };
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-[var(--accent-emerald)] via-[var(--accent-sky)] to-[var(--accent-purple)] bg-clip-text text-transparent">
            TAREFAS SUPREMAS
          </h1>
          <p className="text-6xl text-[var(--text-secondary)] mt-12 font-light">
            {stats.total} tarefas • {stats.completed} concluídas • {stats.pointsEarned.toLocaleString()} pontos ganhos
          </p>
          <p className="text-5xl text-[var(--accent-emerald)] mt-6">
            {stats.streak} dias de streak • {stats.overdue} atrasadas
          </p>
        </motion.div>

        {/* KPIS SUPREMOS */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-20">
          <SupremeTaskCard
            icon={<CheckCircleIcon />}
            title="Concluídas"
            value={stats.completed.toString()}
            colorClass="from-[var(--accent-emerald)] to-[var(--accent-sky)]"
          />
          <SupremeTaskCard
            icon={<ClockIcon />}
            title="Hoje"
            value={stats.today.toString()}
            colorClass="from-[var(--accent-sky)] to-[var(--accent-purple)]"
          />
          <SupremeTaskCard
            icon={<ExclamationTriangleIcon />}
            title="Atrasadas"
            value={stats.overdue.toString()}
            colorClass="from-[var(--accent-alert)] to-[var(--accent-warning)]"
          />
          <SupremeTaskCard
            icon={<TrophyIcon />}
            title="Pontos Ganhos"
            value={stats.pointsEarned.toLocaleString()}
            colorClass="from-[var(--accent-warning)] to-[var(--accent-warning)]"
          />
          <SupremeTaskCard
            icon={<FireIcon />}
            title="Streak Atual"
            value={stats.streak.toString()}
            colorClass="from-[var(--accent-warning)] to-[var(--accent-alert)]"
          />
        </div>

        {/* GRID DE TAREFAS */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* COLUNA: A FAZER */}
            <TaskColumn
              title="A FAZER"
              tasks={tasks.filter(t => t.status === 'todo')}
              colorClass="from-[var(--accent-sky)]/80 to-[var(--accent-purple)]/80"
              getPriorityVariant={getPriorityVariant}
            />

            {/* COLUNA: FAZENDO */}
            <TaskColumn
              title="FAZENDO"
              tasks={tasks.filter(t => t.status === 'doing')}
              colorClass="from-[var(--accent-purple)]/80 to-[var(--accent-pink)]/80"
              getPriorityVariant={getPriorityVariant}
            />

            {/* COLUNA: CONCLUÍDO */}
            <TaskColumn
              title="CONCLUÍDO"
              tasks={tasks.filter(t => t.status === 'done')}
              colorClass="from-[var(--accent-emerald)]/80 to-[var(--accent-sky)]/80"
              getPriorityVariant={getPriorityVariant}
            />
          </div>
        </div>

        {/* MENSAGEM FINAL DA IA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center py-40 mt-32"
        >
          <TrophyIcon className="w-64 h-64 text-[var(--accent-warning)] mx-auto mb-16 animate-pulse" />
          <p className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-emerald)] via-[var(--accent-sky)] to-[var(--accent-purple)]">
            CADA TAREFA CONCLUÍDA
          </p>
          <p className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-purple)] via-[var(--accent-pink)] to-[var(--accent-warning)] mt-8">
            É UM PASSO PARA O DOMÍNIO
          </p>
          <p className="text-6xl text-[var(--text-secondary)] mt-24">
            — Sistema ALSHAM
          </p>
        </motion.div>
      </div>
  );
}

function TaskColumn({ title, tasks, colorClass, getPriorityVariant }: any) {
  return (
    <Card className={`bg-gradient-to-br ${colorClass} border-4 border-[var(--text-primary)]/20 backdrop-blur-xl rounded-3xl`}>
      <CardContent className="p-10">
        <h2 className="text-5xl font-black text-[var(--text-primary)] mb-8 text-center">{title}</h2>
        <div className="space-y-6">
          {tasks.map((task: any) => {
            const priorityVariant = getPriorityVariant(task.priority);

            return (
              <Card
                key={task.id}
                className="bg-[var(--text-primary)]/10 backdrop-blur-xl border-[var(--border)] hover:border-[var(--accent-sky)]/50 transition-all hover:scale-105"
              >
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-[var(--text-primary)]">{task.title}</h3>
                    <Badge className={`px-6 py-3 rounded-full font-black text-xl ${priorityVariant.bg} ${priorityVariant.text} border-0`}>
                      {task.priority.toUpperCase()}
                    </Badge>
                  </div>
                  {task.description && (
                    <p className="text-[var(--text-secondary)] mb-4">{task.description}</p>
                  )}
                  <div className="flex items-center justify-between text-[var(--text-secondary)]">
                    <span className="flex items-center gap-2">
                      <UserIcon className="w-6 h-6" />
                      {task.assignee}
                    </span>
                    <span className="flex items-center gap-2">
                      <CalendarIcon className="w-6 h-6" />
                      {format(new Date(task.due_date), 'dd/MM')}
                    </span>
                    <span className="flex items-center gap-2">
                      <TrophyIcon className="w-6 h-6 text-[var(--accent-warning)]" />
                      {task.points} pts
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function SupremeTaskCard({ icon, title, value, colorClass }: any) {
  return (
    <Card className={`bg-gradient-to-br ${colorClass} border-[var(--border)] backdrop-blur-xl shadow-2xl rounded-3xl hover:scale-105 transition-all`}>
      <CardContent className="p-12">
        <div className="flex items-center justify-center mb-8">
          <div className="p-8 bg-[var(--text-primary)]/10 rounded-3xl">
            {icon}
          </div>
        </div>
        <p className="text-xl md:text-2xl lg:text-3xl font-black text-[var(--text-primary)] text-center">{value}</p>
        <p className="text-3xl text-[var(--text-primary)]/80 text-center mt-6">{title}</p>
      </CardContent>
    </Card>
  );
}
