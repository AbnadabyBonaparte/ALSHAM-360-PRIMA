// src/pages/Home.tsx
// ALSHAM 360° PRIMA — Home (migrado para shadcn/ui)

import {
  Rocket,
  Lightbulb,
  Zap,
  Trophy,
  Globe,
  ShieldCheck,
  Sparkles,
  Users,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/supabase/useAuthStore';
import { PageSkeleton, ErrorState } from '@/components/PageStates';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';

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
  const orgId = useAuthStore((s) => s.currentOrgId);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: rawData, isLoading, error, refetch } = useQuery({
    queryKey: ['home-stats', orgId],
    queryFn: async () => {
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

      return { leads, deals, revenue, users, automations, predictions };
    },
    enabled: !!orgId,
  });

  const stats = useMemo((): SupremeStats | null => {
    if (!rawData) return null;
    return {
      totalLeads: rawData.leads || 0,
      activeDeals: rawData.deals || 0,
      monthlyRevenue: rawData.revenue?.reduce((s: number, r: any) => s + r.valor, 0) || 0,
      activeUsers: rawData.users || 0,
      automationsRunning: rawData.automations || 0,
      aiPredictionsToday: rawData.predictions || 0,
      userStreak: 42,
      companyGrowth: 127
    };
  }, [rawData]);

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] overflow-hidden">
      {/* HERO SUPREMO */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-screen flex items-center justify-center bg-gradient-to-br from-[var(--accent-purple)]/40 via-[var(--background)] to-[var(--accent-sky)]/40"
      >
        <div className="absolute inset-0 bg-grid-[var(--text-primary)]/5 bg-grid-16"></div>
        <div className="relative z-10 text-center px-8">
          <motion.h1
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-[var(--accent-sky)] via-[var(--accent-purple)] to-[var(--accent-pink)] bg-clip-text text-transparent"
          >
            BEM-VINDO AO FUTURO
          </motion.h1>
          <motion.p
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-5xl text-[var(--text-secondary)] mt-12 font-light"
          >
            {format(currentTime, "HH:mm:ss", { locale: ptBR })} • {format(currentTime, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </motion.p>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.2, type: "spring" }}
            className="mt-20 inline-block"
          >
            <Card className="bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] p-1 rounded-3xl border-0">
              <CardContent className="bg-[var(--background)] rounded-3xl px-16 py-8">
                <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)]">
                  Sistema ALSHAM está online
                </p>
                <p className="text-2xl text-[var(--text-secondary)] mt-4">
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
          <SupremeMetric
            icon={<Users />}
            title="Leads Ativos"
            value={stats?.totalLeads || 0}
            colorClass="from-[var(--accent-sky)] to-[var(--accent-purple)]"
          />
          <SupremeMetric
            icon={<BarChart3 />}
            title="Deals em Andamento"
            value={stats?.activeDeals || 0}
            colorClass="from-[var(--accent-purple)] to-[var(--accent-pink)]"
          />
          <SupremeMetric
            icon={<DollarSign />}
            title="Receita do Mês"
            value={`R$ ${(stats?.monthlyRevenue || 0).toLocaleString('pt-BR')}`}
            colorClass="from-[var(--accent-emerald)] to-[var(--accent-sky)]"
          />
          <SupremeMetric
            icon={<Zap />}
            title="Automação 24h"
            value={stats?.automationsRunning || 0}
            colorClass="from-[var(--accent-warning)] to-[var(--accent-alert)]"
          />
        </div>
      </div>

      {/* IA SPEAKING */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="text-center py-40"
      >
        <Sparkles className="w-40 h-40 text-[var(--accent-purple)] mx-auto mb-12 animate-pulse" />
        <p className="text-xl md:text-2xl lg:text-3xl font-light text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-purple)] via-[var(--accent-pink)] to-[var(--accent-sky)] max-w-6xl mx-auto leading-relaxed">
          "Você não está apenas gerenciando um negócio.
          <br />
          Você está construindo um império com consciência artificial."
        </p>
        <p className="text-4xl text-[var(--text-secondary)] mt-20">
          — Sistema ALSHAM • {format(currentTime, "HH:mm:ss")}
        </p>
      </motion.div>
    </div>
  );
}

function SupremeMetric({ icon, title, value, colorClass }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.1, rotate: 2 }}
      className={`relative bg-gradient-to-br ${colorClass} rounded-3xl p-12 border border-[var(--border)] backdrop-blur-xl shadow-2xl overflow-hidden`}
    >
      <div className="absolute inset-0 bg-[var(--text-primary)]/5"></div>
      <div className="relative z-10">
        <div className="w-20 h-20 text-[var(--text-primary)]/90 mb-6">{icon}</div>
        <p className="text-6xl font-black text-[var(--text-primary)]">{value}</p>
        <p className="text-2xl text-[var(--text-primary)]/80 mt-4">{title}</p>
      </div>
    </motion.div>
  );
}
