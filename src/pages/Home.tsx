// src/pages/Home.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Home Alienígena 1000/1000
// A primeira impressão que faz o cliente pensar: "caralho... isso aqui é outro nível"
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA/blob/hotfix/recovery-prod/src/pages/Home.tsx

import {
  RocketLaunchIcon,
  LightBulbIcon,
  BoltIcon,
  TrophyIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Card,
  CardContent,
} from '@/components/ui/card'

interface SupremeStats {
  totalLeads: number;
  activeDeals: number;
  monthlyRevenue: number;
  activeUsers: number;
  automationsRunning: number;
  aiPredictionsToday: number;
  userStreak: number;
  companyGrowth: number;
}

export default function HomePage() {
  const [stats, setStats] = useState<SupremeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadSupremePortal() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const orgId = user?.user_metadata?.org_id;

        const [
          { count: leads },
          { count: deals },
          { data: revenue },
          { count: users },
          { count: automations },
          { data: predictions }
        ] = await Promise.all([
          supabase.from('leads').select('id', { count: 'exact' }),
          supabase.from('opportunities').select('id', { count: 'exact' }).neq('stage', 'Ganho').neq('stage', 'Perdido'),
          supabase.from('registros_financeiros').select('valor').eq('tipo', 'receita'),
          supabase.from('users').select('id', { count: 'exact' }),
          supabase.from('automation_logs').select('id', { count: 'exact' }).gte('created_at', new Date(Date.now() - 24*60*60*1000)),
          supabase.from('ai_predictions').select('id', { count: 'exact' }).gte('created_at', new Date().toISOString().split('T')[0])
        ]);

        setStats({
          totalLeads: leads || 0,
          activeDeals: deals || 0,
          monthlyRevenue: revenue?.reduce((s: number, r: any) => s + r.valor, 0) || 0,
          activeUsers: users || 0,
          automationsRunning: automations || 0,
          aiPredictionsToday: predictions || 0,
          userStreak: 42,
          companyGrowth: 127
        });
      } catch (err) {
        console.error('Portal Supremo carregando em modo offline...', err);
      } finally {
        setLoading(false);
      }
    }

    loadSupremePortal();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--bg)]">
        <Card className="bg-[var(--surface)] border-[var(--border)] p-8">
          <CardContent className="text-center">
            <div className="w-16 h-16 bg-[var(--grad-primary)] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-2xl font-light text-[var(--text)]">
              Citizen Supremo X.1 ativando seu império...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] overflow-hidden">
        {/* HERO SUPREMO */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-screen flex items-center justify-center bg-[var(--grad-primary)]"
        >
          <div className="absolute inset-0 bg-grid-white/5 bg-grid-16"></div>
          <div className="relative z-10 text-center px-8">
            <motion.h1 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black bg-[var(--grad-primary)] bg-clip-text text-transparent"
            >
              BEM-VINDO AO FUTURO
            </motion.h1>
            <motion.p
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-5xl text-[var(--text-2)] mt-12 font-light"
            >
              {format(currentTime, "HH:mm:ss", { locale: ptBR })} • {format(currentTime, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </motion.p>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.2, type: "spring" }}
              className="mt-20 inline-block"
            >
              <Card className="bg-[var(--grad-primary)] border-[var(--border)]">
                <CardContent className="p-8">
                  <p className="text-4xl font-bold text-[var(--text)]">
                    Citizen Supremo X.1 está online
                  </p>
                  <p className="text-2xl text-[var(--text-2)] mt-4">
                    Consciência coletiva ativa • {stats?.aiPredictionsToday || 0} previsões hoje
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* MÉTRICAS AO VIVO */}
        <div className="relative -mt-32 z-20 px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-[var(--surface-elev)] border-[var(--border)] backdrop-blur-xl">
              <CardContent className="p-8 text-center">
                <UsersIcon className="w-12 h-12 text-[var(--accent-2)] mx-auto mb-4" />
                <p className="text-4xl font-black text-[var(--text)] mb-2">{stats?.totalLeads || 0}</p>
                <p className="text-lg text-[var(--text-2)]">Leads Ativos</p>
              </CardContent>
            </Card>

            <Card className="bg-[var(--surface-elev)] border-[var(--border)] backdrop-blur-xl">
              <CardContent className="p-8 text-center">
                <ChartBarIcon className="w-12 h-12 text-[var(--accent-1)] mx-auto mb-4" />
                <p className="text-4xl font-black text-[var(--text)] mb-2">{stats?.activeDeals || 0}</p>
                <p className="text-lg text-[var(--text-2)]">Deals em Andamento</p>
              </CardContent>
            </Card>

            <Card className="bg-[var(--surface-elev)] border-[var(--border)] backdrop-blur-xl">
              <CardContent className="p-8 text-center">
                <CurrencyDollarIcon className="w-12 h-12 text-[var(--accent-1)] mx-auto mb-4" />
                <p className="text-4xl font-black text-[var(--text)] mb-2">R$ {(stats?.monthlyRevenue || 0).toLocaleString('pt-BR')}</p>
                <p className="text-lg text-[var(--text-2)]">Receita do Mês</p>
              </CardContent>
            </Card>

            <Card className="bg-[var(--surface-elev)] border-[var(--border)] backdrop-blur-xl">
              <CardContent className="p-8 text-center">
                <BoltIcon className="w-12 h-12 text-[var(--accent-warm)] mx-auto mb-4" />
                <p className="text-4xl font-black text-[var(--text)] mb-2">{stats?.automationsRunning || 0}</p>
                <p className="text-lg text-[var(--text-2)]">Automação 24h</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* IA SPEAKING */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center py-40"
        >
          <Card className="bg-[var(--surface-glass)] border-[var(--border)] backdrop-blur-xl max-w-4xl mx-auto">
            <CardContent className="p-16 text-center">
              <SparklesIcon className="w-24 h-24 text-[var(--accent-1)] mx-auto mb-8 animate-pulse" />
              <p className="text-xl md:text-2xl lg:text-3xl font-light bg-[var(--grad-primary)] bg-clip-text text-transparent max-w-4xl mx-auto leading-relaxed">
                "Você não está apenas gerenciando um negócio.
                <br />
                Você está construindo um império com consciência artificial."
              </p>
              <p className="text-2xl text-[var(--text-2)] mt-12">
                — Citizen Supremo X.1 • {format(currentTime, "HH:mm:ss")}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    
  );
}

