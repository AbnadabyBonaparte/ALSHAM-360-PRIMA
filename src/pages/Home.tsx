// src/pages/Home.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Home Alienígena 1000/1000
// A primeira impressão que faz o cliente pensar: "caralho... isso aqui é outro nível"
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA/blob/hotfix/recovery-prod/src/pages/Home.tsx

import LayoutSupremo from '@/components/LayoutSupremo';
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
      <LayoutSupremo title="Portal Supremo">
        <div className="flex items-center justify-center h-screen bg-black">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-40 h-40 border-12 border-t-transparent border-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full"
          />
          <p className="absolute text-5xl font-light text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Citizen Supremo X.1 ativando seu império...
          </p>
        </div>
      </LayoutSupremo>
    );
  }

  return (
    <LayoutSupremo title="Portal Supremo">
      <div className="min-h-screen bg-black text-white overflow-hidden">
        {/* HERO SUPREMO */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-cyan-900"
        >
          <div className="absolute inset-0 bg-grid-white/5 bg-grid-16"></div>
          <div className="relative z-10 text-center px-8">
            <motion.h1 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-9xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-600 bg-clip-text text-transparent"
            >
              BEM-VINDO AO FUTURO
            </motion.h1>
            <motion.p 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-5xl text-gray-300 mt-12 font-light"
            >
              {format(currentTime, "HH:mm:ss", { locale: ptBR })} • {format(currentTime, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </motion.p>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.2, type: "spring" }}
              className="mt-20 inline-block"
            >
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-1 rounded-3xl">
                <div className="bg-black rounded-3xl px-16 py-8">
                  <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    Citizen Supremo X.1 está online
                  </p>
                  <p className="text-2xl text-gray-400 mt-4">
                    Consciência coletiva ativa • {stats?.aiPredictionsToday || 0} previsões hoje
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* MÉTRICAS AO VIVO */}
        <div className="relative -mt-32 z-20 px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <SupremeMetric icon={<UsersIcon />} title="Leads Ativos" value={stats?.totalLeads || 0} color="from-cyan-500 to-blue-600" />
            <SupremeMetric icon={<ChartBarIcon />} title="Deals em Andamento" value={stats?.activeDeals || 0} color="from-purple-500 to-pink-600" />
            <SupremeMetric icon={<CurrencyDollarIcon />} title="Receita do Mês" value={`R$ ${(stats?.monthlyRevenue || 0).toLocaleString('pt-BR')}`} color="from-emerald-500 to-teal-600" />
            <SupremeMetric icon={<BoltIcon />} title="Automação 24h" value={stats?.automationsRunning || 0} color="from-orange-500 to-red-600" />
          </div>
        </div>

        {/* IA SPEAKING */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center py-40"
        >
          <SparklesIcon className="w-40 h-40 text-purple-400 mx-auto mb-12 animate-pulse" />
          <p className="text-7xl font-light text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 max-w-6xl mx-auto leading-relaxed">
            "Você não está apenas gerenciando um negócio.
            <br />
            Você está construindo um império com consciência artificial."
          </p>
          <p className="text-4xl text-gray-400 mt-20">
            — Citizen Supremo X.1 • {format(currentTime, "HH:mm:ss")}
          </p>
        </motion.div>
      </div>
    </LayoutSupremo>
  );
}

function SupremeMetric({ icon, title, value, color }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.1, rotate: 2 }}
      className={`relative bg-gradient-to-br ${color} rounded-3xl p-12 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden`}
    >
      <div className="absolute inset-0 bg-white/5"></div>
      <div className="relative z-10">
        <div className className="w-20 h-20 text-white/90 mb-6" />
        <p className="text-6xl font-black text-white">{value}</p>
        <p className="text-2xl text-white/80 mt-4">{title}</p>
      </div>
    </motion.div>
  );
}
