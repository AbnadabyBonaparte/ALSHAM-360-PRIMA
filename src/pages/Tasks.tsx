// src/pages/Tasks.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Tarefas Alienígena 1000/1000
// Onde tarefas viram conquistas. Onde atraso vira vergonha. Onde você domina o tempo.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA/blob/hotfix/recovery-prod/src/pages/Tasks.tsx

import LayoutSupremo from '@/components/LayoutSupremo';
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
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { format, isToday, isPast, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'from-red-600 to-pink-600';
      case 'high': return 'from-orange-600 to-red-600';
      case 'medium': return 'from-yellow-600 to-amber-600';
      default: return 'from-gray-600 to-gray-500';
    }
  };

  return (
    <LayoutSupremo title="Tarefas Supremas">
      <div className="min-h-screen bg-black text-white p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-9xl font-black bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
            TAREFAS SUPREMAS
          </h1>
          <p className="text-6xl text-gray-300 mt-12 font-light">
            {stats.total} tarefas • {stats.completed} concluídas • {stats.pointsEarned.toLocaleString()} pontos ganhos
          </p>
          <p className="text-5xl text-emerald-400 mt-6">
            {stats.streak} dias de streak • {stats.overdue} atrasadas
          </p>
        </motion.div>

        {/* KPIS SUPREMOS */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-20">
          <SupremeTaskCard
            icon={<CheckCircleIcon />}
            title="Concluídas"
            value={stats.completed.toString()}
            color="from-emerald-500 to-teal-600"
          />
          <SupremeTaskCard
            icon={<ClockIcon />}
            title="Hoje"
            value={stats.today.toString()}
            color="from-cyan-500 to-blue-600"
          />
          <SupremeTaskCard
            icon={<ExclamationTriangleIcon />}
            title="Atrasadas"
            value={stats.overdue.toString()}
            color="from-red-500 to-orange-600"
          />
          <SupremeTaskCard
            icon={<TrophyIcon />}
            title="Pontos Ganhos"
            value={stats.pointsEarned.toLocaleString()}
            color="from-yellow-500 to-amber-600"
          />
          <SupremeTaskCard
            icon={<FireIcon />}
            title="Streak Atual"
            value={stats.streak.toString()}
            color="from-orange-500 to-red-600"
          />
        </div>

        {/* GRID DE TAREFAS */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* COLUNA: A FAZER */}
            <TaskColumn
              title="A FAZER"
              tasks={tasks.filter(t => t.status === 'todo')}
              color="from-blue-600/80 to-cyan-600/80"
            />

            {/* COLUNA: FAZENDO */}
            <TaskColumn
              title="FAZENDO"
              tasks={tasks.filter(t => t.status === 'doing')}
              color="from-purple-600/80 to-pink-600/80"
            />

            {/* COLUNA: CONCLUÍDO */}
            <TaskColumn
              title="CONCLUÍDO"
              tasks={tasks.filter(t => t.status === 'done')}
              color="from-emerald-600/80 to-teal-600/80"
            />
          </div>
        </div>

        {/* MENSAGEM FINAL DA IA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center py-40 mt-32"
        >
          <TrophyIcon className="w-64 h-64 text-yellow-500 mx-auto mb-16 animate-pulse" />
          <p className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-500 to-purple-600">
            CADA TAREFA CONCLUÍDA
          </p>
          <p className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 mt-8">
            É UM PASSO PARA O DOMÍNIO
          </p>
          <p className="text-6xl text-gray-400 mt-24">
            — Citizen Supremo X.1
          </p>
        </motion.div>
      </div>
    </LayoutSupremo>
  );
}

function TaskColumn({ title, tasks, color }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      className={`bg-gradient-to-br ${color} rounded-3xl p-10 border-4 border-white/20 backdrop-blur-xl`}
    >
      <h2 className="text-5xl font-black text-white mb-8 text-center">{title}</h2>
      <div className="space-y-6">
        {tasks.map((task: any) => (
          <motion.div
            key={task.id}
            whileHover={{ scale: 1.05 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-primary/50 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white">{task.title}</h3>
              <div className={`px-6 py-3 rounded-full font-black text-xl bg-gradient-to-r ${getPriorityColor(task.priority)}`}>
                {task.priority.toUpperCase()}
              </div>
            </div>
            {task.description && (
              <p className="text-gray-300 mb-4">{task.description}</p>
            )}
            <div className="flex items-center justify-between text-gray-400">
              <span className="flex items-center gap-2">
                <UserIcon className="w-6 h-6" />
                {task.assignee}
              </span>
              <span className="flex items-center gap-2">
                <CalendarIcon className="w-6 h-6" />
                {format(new Date(task.due_date), 'dd/MM')}
              </span>
              <span className="flex items-center gap-2">
                <TrophyIcon className="w-6 h-6 text-yellow-400" />
                {task.points} pts
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function SupremeTaskCard({ icon, title, value, color }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`bg-gradient-to-br ${color} rounded-3xl p-12 border border-white/10 backdrop-blur-xl shadow-2xl`}
    >
      <div className="flex items-center justify-center mb-8">
        <div className="p-8 bg-white/10 rounded-3xl">
          {icon}
        </div>
      </div>
      <p className="text-7xl font-black text-white text-center">{value}</p>
      <p className="text-3xl text-white/80 text-center mt-6">{title}</p>
    </motion.div>
  );
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'critical': return 'from-red-600 to-pink-600';
    case 'high': return 'from-orange-600 to-red-600';
    case 'medium': return 'from-yellow-600 to-amber-600';
    default: return 'from-gray-600 to-gray-500';
  }
}
