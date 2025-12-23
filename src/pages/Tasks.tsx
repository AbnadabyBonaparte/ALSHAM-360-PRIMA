// src/pages/Tasks.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Tarefas Alienígena 1000/1000
// Onde tarefas viram conquistas. Onde atraso vira vergonha. Onde você domina o tempo.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA/blob/hotfix/recovery-prod/src/pages/Tasks.tsx

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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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


  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-[var(--grad-primary)] bg-clip-text text-transparent">
            TAREFAS SUPREMAS
          </h1>
          <p className="text-6xl text-[var(--text-2)] mt-12 font-light">
            {stats.total} tarefas • {stats.completed} concluídas • {stats.pointsEarned.toLocaleString()} pontos ganhos
          </p>
          <p className="text-5xl text-[var(--accent-1)] mt-6">
            {stats.streak} dias de streak • {stats.overdue} atrasadas
          </p>
        </motion.div>

        {/* KPIS SUPREMOS */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-20">
          <Card className="bg-[var(--surface-elev)] border-[var(--border)] backdrop-blur-xl">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="p-6 bg-[var(--surface)] rounded-2xl">
                  <CheckCircleIcon className="w-12 h-12 text-[var(--accent-1)]" />
                </div>
              </div>
              <p className="text-3xl font-black text-[var(--text)] mb-2">{stats.completed}</p>
              <p className="text-lg text-[var(--text-2)]">Concluídas</p>
            </CardContent>
          </Card>

          <Card className="bg-[var(--surface-elev)] border-[var(--border)] backdrop-blur-xl">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="p-6 bg-[var(--surface)] rounded-2xl">
                  <ClockIcon className="w-12 h-12 text-[var(--accent-2)]" />
                </div>
              </div>
              <p className="text-3xl font-black text-[var(--text)] mb-2">{stats.today}</p>
              <p className="text-lg text-[var(--text-2)]">Hoje</p>
            </CardContent>
          </Card>

          <Card className="bg-[var(--surface-elev)] border-[var(--border)] backdrop-blur-xl">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="p-6 bg-[var(--surface)] rounded-2xl">
                  <ExclamationTriangleIcon className="w-12 h-12 text-[var(--accent-alert)]" />
                </div>
              </div>
              <p className="text-3xl font-black text-[var(--text)] mb-2">{stats.overdue}</p>
              <p className="text-lg text-[var(--text-2)]">Atrasadas</p>
            </CardContent>
          </Card>

          <Card className="bg-[var(--surface-elev)] border-[var(--border)] backdrop-blur-xl">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="p-6 bg-[var(--surface)] rounded-2xl">
                  <TrophyIcon className="w-12 h-12 text-[var(--accent-warm)]" />
                </div>
              </div>
              <p className="text-3xl font-black text-[var(--text)] mb-2">{stats.pointsEarned.toLocaleString()}</p>
              <p className="text-lg text-[var(--text-2)]">Pontos Ganhos</p>
            </CardContent>
          </Card>

          <Card className="bg-[var(--surface-elev)] border-[var(--border)] backdrop-blur-xl">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="p-6 bg-[var(--surface)] rounded-2xl">
                  <FireIcon className="w-12 h-12 text-[var(--accent-alert)]" />
                </div>
              </div>
              <p className="text-3xl font-black text-[var(--text)] mb-2">{stats.streak}</p>
              <p className="text-lg text-[var(--text-2)]">Streak Atual</p>
            </CardContent>
          </Card>
        </div>

        {/* GRID DE TAREFAS */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* COLUNA: A FAZER */}
            <Card className="bg-[var(--surface-elev)] border-[var(--border)] backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-center text-4xl">A FAZER</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.filter(t => t.status === 'todo').map((task: any) => (
                    <Card key={task.id} className="bg-[var(--surface)] border-[var(--border)] hover:border-[var(--accent-1)]">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-bold text-[var(--text)]">{task.title}</h3>
                          <Badge variant={
                            task.priority === 'critical' ? 'destructive' :
                            task.priority === 'high' ? 'destructive' :
                            task.priority === 'medium' ? 'outline' : 'secondary'
                          }>
                            {task.priority.toUpperCase()}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-[var(--text-2)] mb-4">{task.description}</p>
                        )}
                        <div className="flex justify-between items-center text-sm text-[var(--text-muted)]">
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4" />
                            {task.assignee}
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            {format(new Date(task.due_date), 'dd/MM')}
                          </div>
                          <div className="flex items-center gap-2">
                            <TrophyIcon className="w-4 h-4 text-[var(--accent-warm)]" />
                            {task.points} pts
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* COLUNA: FAZENDO */}
            <Card className="bg-[var(--surface-elev)] border-[var(--border)] backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-center text-4xl">FAZENDO</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.filter(t => t.status === 'doing').map((task: any) => (
                    <Card key={task.id} className="bg-[var(--surface)] border-[var(--border)] hover:border-[var(--accent-2)]">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-bold text-[var(--text)]">{task.title}</h3>
                          <Badge variant={
                            task.priority === 'critical' ? 'destructive' :
                            task.priority === 'high' ? 'destructive' :
                            task.priority === 'medium' ? 'outline' : 'secondary'
                          }>
                            {task.priority.toUpperCase()}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-[var(--text-2)] mb-4">{task.description}</p>
                        )}
                        <div className="flex justify-between items-center text-sm text-[var(--text-muted)]">
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4" />
                            {task.assignee}
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            {format(new Date(task.due_date), 'dd/MM')}
                          </div>
                          <div className="flex items-center gap-2">
                            <TrophyIcon className="w-4 h-4 text-[var(--accent-warm)]" />
                            {task.points} pts
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* COLUNA: CONCLUÍDO */}
            <Card className="bg-[var(--surface-elev)] border-[var(--border)] backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-center text-4xl">CONCLUÍDO</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.filter(t => t.status === 'done').map((task: any) => (
                    <Card key={task.id} className="bg-[var(--surface)] border-[var(--border)] hover:border-[var(--accent-1)] opacity-75">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-bold text-[var(--text)] line-through">{task.title}</h3>
                          <Badge variant="default">
                            CONCLUÍDO
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-[var(--text-2)] mb-4 line-through">{task.description}</p>
                        )}
                        <div className="flex justify-between items-center text-sm text-[var(--text-muted)]">
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4" />
                            {task.assignee}
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4 text-[var(--accent-1)]" />
                            {format(new Date(task.completed_at || task.due_date), 'dd/MM')}
                          </div>
                          <div className="flex items-center gap-2">
                            <TrophyIcon className="w-4 h-4 text-[var(--accent-warm)]" />
                            +{task.points} pts
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* MENSAGEM FINAL DA IA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center py-40 mt-32"
        >
          <Card className="bg-[var(--surface-glass)] border-[var(--border)] backdrop-blur-xl max-w-4xl mx-auto">
            <CardContent className="p-16 text-center">
              <TrophyIcon className="w-32 h-32 text-[var(--accent-warm)] mx-auto mb-12 animate-pulse" />
              <p className="text-4xl md:text-5xl lg:text-6xl font-black bg-[var(--grad-primary)] bg-clip-text text-transparent mb-8">
                CADA TAREFA CONCLUÍDA
              </p>
              <p className="text-4xl md:text-5xl lg:text-6xl font-black bg-[var(--grad-secondary)] bg-clip-text text-transparent mb-12">
                É UM PASSO PARA O DOMÍNIO
              </p>
              <p className="text-4xl text-[var(--text-2)]">
                — Citizen Supremo X.1
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
  );
}

