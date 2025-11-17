/**
 * ═══════════════════════════════════════════════════════════════════════
 * 📄 ARQUIVO: src/pages/Dashboard.tsx
 * 🎯 FUNÇÃO: Dashboard Principal com KPIs + Real-time + AI Insights
 * 📅 ATUALIZADO: 17/11/2025 16:45
 * 👤 AUTOR: AbnadabyBonaparte (Aragominas, Tocantins)
 * 🏗️ PROJETO: ALSHAM 360° PRIMA
 * ═══════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Activity,
  Zap,
  ArrowUp,
  ArrowDown,
  Calendar,
  Mail,
  Phone,
  MessageSquare,
  BarChart3,
  CheckCircle,
  Clock,
  Flame,
  AlertCircle
} from 'lucide-react';
import {
  getLeads,
  getDeals,
  getContacts,
  getRecentActivities,
  subscribeLeads,
  subscribeDeals
} from '../lib/supabase';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface DashboardMetrics {
  totalLeads: number;
  qualifiedLeads: number;
  activeDeals: number;
  totalRevenue: number;
  conversionRate: number;
  avgDealSize: number;
  responseTime: number;
  teamActivities: number;
  leadsGrowth: number;
  revenueGrowth: number;
  dealsGrowth: number;
  conversionGrowth: number;
}

interface Activity {
  id: string;
  type: 'email' | 'call' | 'meeting' | 'task' | 'note';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  status: 'completed' | 'pending' | 'cancelled';
}

interface TopLead {
  id: string;
  name: string;
  company: string;
  score: number;
  value: number;
  status: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 COMPONENTE PRINCIPAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalLeads: 0,
    qualifiedLeads: 0,
    activeDeals: 0,
    totalRevenue: 0,
    conversionRate: 0,
    avgDealSize: 0,
    responseTime: 0,
    teamActivities: 0,
    leadsGrowth: 0,
    revenueGrowth: 0,
    dealsGrowth: 0,
    conversionGrowth: 0
  });

  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [topLeads, setTopLeads] = useState<TopLead[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📡 FETCH INICIAL & REALTIME
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  useEffect(() => {
    let mounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // ✅ FIX CRÍTICO: getLeads retorna { success, data: { data: [], count } }
        const leadsResult = await getLeads().catch(() => ({ success: false, data: null }));
        const dealsResult = await (getDeals?.() || Promise.resolve([])).catch(() => []);
        const contactsResult = await (getContacts?.() || Promise.resolve([])).catch(() => []);
        const activitiesResult = await (getRecentActivities?.() || Promise.resolve([])).catch(() => []);

        if (!mounted) return;

        // ✅ EXTRAIR DADOS CORRETAMENTE
        const leads = leadsResult?.success && leadsResult?.data?.data 
          ? leadsResult.data.data 
          : [];
        
        const deals = Array.isArray(dealsResult) ? dealsResult : [];
        const contacts = Array.isArray(contactsResult) ? contactsResult : [];
        const recentActivities = Array.isArray(activitiesResult) ? activitiesResult : [];

        console.log('📊 Dashboard dados:', { 
          leads: leads.length, 
          deals: deals.length, 
          contacts: contacts.length,
          activities: recentActivities.length 
        });

        // Calcular métricas
        const qualifiedCount = leads.filter((l: any) => l.status === 'qualified').length;
        const activeDealsCount = deals.filter((d: any) => 
          d.status !== 'won' && d.status !== 'lost'
        ).length;
        
        const wonDeals = deals.filter((d: any) => d.status === 'won');
        const totalRev = wonDeals.reduce((sum: number, d: any) => 
          sum + (parseFloat(d.value) || parseFloat(d.amount) || 0), 0
        );
        
        const avgDeal = wonDeals.length > 0 ? totalRev / wonDeals.length : 0;
        const convRate = leads.length > 0 ? (wonDeals.length / leads.length) * 100 : 0;

        // Calcular crescimentos (simulados por enquanto)
        const leadsGrowth = Math.random() * 20 - 5;
        const revenueGrowth = Math.random() * 30 - 10;
        const dealsGrowth = Math.random() * 25 - 5;
        const conversionGrowth = Math.random() * 15 - 5;

        setMetrics({
          totalLeads: leads.length,
          qualifiedLeads: qualifiedCount,
          activeDeals: activeDealsCount,
          totalRevenue: totalRev,
          conversionRate: convRate,
          avgDealSize: avgDeal,
          responseTime: 2.5,
          teamActivities: recentActivities.length,
          leadsGrowth,
          revenueGrowth,
          dealsGrowth,
          conversionGrowth
        });

        // Top leads por score
        const sortedLeads = [...leads]
          .sort((a: any, b: any) => (b.score_ia || 0) - (a.score_ia || 0))
          .slice(0, 5)
          .map((l: any) => ({
            id: l.id,
            name: `${l.first_name || ''} ${l.last_name || ''}`.trim() || 'Sem nome',
            company: l.company || 'Sem empresa',
            score: l.score_ia || 0,
            value: parseFloat(l.deal_value) || 0,
            status: l.status
          }));

        setTopLeads(sortedLeads);

        // Mapear activities
        const mappedActivities = recentActivities.slice(0, 10).map((act: any, i: number) => ({
          id: act.id || `act-${i}`,
          type: act.type || act.interaction_type || 'note',
          title: act.title || act.description || 'Atividade',
          description: act.description || act.notes || '',
          timestamp: act.created_at || act.timestamp || new Date().toISOString(),
          user: act.user_name || act.created_by || 'Sistema',
          status: act.status || 'completed'
        }));

        setActivities(mappedActivities);

      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    // Real-time subscriptions
    const unsubLeads = subscribeLeads?.(() => {
      fetchDashboardData();
    });

    const unsubDeals = subscribeDeals?.(() => {
      fetchDashboardData();
    });

    return () => {
      mounted = false;
      unsubLeads?.();
      unsubDeals?.();
    };
  }, [timeRange]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎨 RENDER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--bg-dark)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] text-white p-4 sm:p-6 lg:p-8">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
              Dashboard Supremo
            </h1>
            <p className="text-gray-400 mt-1">Visão geral em tempo real do seu negócio</p>
          </div>

          <div className="flex items-center gap-2">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  timeRange === range
                    ? 'bg-emerald-500 text-white'
                    : 'bg-[var(--surface)] text-gray-400 hover:bg-[var(--surface-strong)]'
                }`}
              >
                {range === '7d' ? '7 dias' : range === '30d' ? '30 dias' : '90 dias'}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* KPIS GRID - 4 COLUNAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <MetricCard
          icon={<Users />}
          label="Total de Leads"
          value={metrics.totalLeads}
          growth={metrics.leadsGrowth}
          color="emerald"
          delay={0}
        />
        <MetricCard
          icon={<Target />}
          label="Leads Qualificados"
          value={metrics.qualifiedLeads}
          growth={metrics.conversionGrowth}
          color="sky"
          delay={0.1}
        />
        <MetricCard
          icon={<BarChart3 />}
          label="Deals Ativos"
          value={metrics.activeDeals}
          growth={metrics.dealsGrowth}
          color="purple"
          delay={0.2}
        />
        <MetricCard
          icon={<DollarSign />}
          label="Receita Total"
          value={`R$ ${(metrics.totalRevenue / 1000).toFixed(0)}k`}
          growth={metrics.revenueGrowth}
          color="amber"
          delay={0.3}
        />
      </div>

      {/* SECONDARY METRICS - 4 COLUNAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <SmallMetricCard
          icon={<TrendingUp />}
          label="Taxa de Conversão"
          value={`${metrics.conversionRate.toFixed(1)}%`}
          color="emerald"
        />
        <SmallMetricCard
          icon={<DollarSign />}
          label="Ticket Médio"
          value={`R$ ${(metrics.avgDealSize / 1000).toFixed(0)}k`}
          color="sky"
        />
        <SmallMetricCard
          icon={<Clock />}
          label="Tempo de Resposta"
          value={`${metrics.responseTime}h`}
          color="orange"
        />
        <SmallMetricCard
          icon={<Activity />}
          label="Atividades (24h)"
          value={metrics.teamActivities}
          color="purple"
        />
      </div>

      {/* MIDDLE SECTION - 2 COLUNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* TOP LEADS */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Flame className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold">Top Leads 🔥</h2>
            </div>
            <span className="text-xs text-gray-400">Por Score IA</span>
          </div>

          <div className="space-y-3">
            {topLeads.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhum lead encontrado</p>
            ) : (
              topLeads.map((lead, index) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-[var(--bg-dark)]/50 rounded-lg hover:bg-[var(--bg-dark)]/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{lead.name}</p>
                      <p className="text-xs text-gray-400">{lead.company}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-400">{lead.score}</p>
                    <p className="text-xs text-gray-400">score</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* RECENT ACTIVITIES */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-500/10 rounded-lg">
                <Activity className="w-5 h-5 text-sky-400" />
              </div>
              <h2 className="text-xl font-bold">Atividades Recentes</h2>
            </div>
            <button className="text-xs text-sky-400 hover:text-sky-300">Ver todas</button>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {activities.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhuma atividade recente</p>
            ) : (
              activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="flex items-start gap-3 p-3 bg-[var(--bg-dark)]/30 rounded-lg"
                >
                  <ActivityIcon type={activity.type} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.user} • {new Date(activity.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <StatusBadge status={activity.status} />
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* AI INSIGHTS SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Zap className="w-6 h-6 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold">Insights IA</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AIInsightCard
            title="Oportunidade Quente"
            description="3 leads com alta probabilidade de conversão precisam de follow-up"
            action="Ver Leads"
            icon={<Flame />}
            color="orange"
          />
          <AIInsightCard
            title="Performance Crescendo"
            description="Sua taxa de conversão aumentou 12% esta semana"
            action="Ver Detalhes"
            icon={<TrendingUp />}
            color="emerald"
          />
          <AIInsightCard
            title="Ação Sugerida"
            description="5 deals estão parados há mais de 7 dias"
            action="Revisar"
            icon={<AlertCircle />}
            color="red"
          />
        </div>
      </motion.div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧩 SUB-COMPONENTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function MetricCard({ icon, label, value, growth, color, delay }: any) {
  const colorClasses = {
    emerald: 'from-emerald-500 to-teal-500',
    sky: 'from-sky-500 to-blue-500',
    purple: 'from-purple-500 to-pink-500',
    amber: 'from-amber-500 to-orange-500'
  };

  const isPositive = growth >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 hover:scale-[1.02] transition-transform"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          {Math.abs(growth).toFixed(1)}%
        </div>
      </div>

      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </motion.div>
  );
}

function SmallMetricCard({ icon, label, value, color }: any) {
  const colorMap = {
    emerald: 'text-emerald-400 bg-emerald-500/10',
    sky: 'text-sky-400 bg-sky-500/10',
    orange: 'text-orange-400 bg-orange-500/10',
    purple: 'text-purple-400 bg-purple-500/10'
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 flex items-center gap-4">
      <div className={`p-2 rounded-lg ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const icons = {
    email: <Mail className="w-4 h-4 text-blue-400" />,
    call: <Phone className="w-4 h-4 text-green-400" />,
    meeting: <Calendar className="w-4 h-4 text-purple-400" />,
    task: <CheckCircle className="w-4 h-4 text-sky-400" />,
    note: <MessageSquare className="w-4 h-4 text-amber-400" />
  };

  return (
    <div className="p-2 bg-[var(--surface)] rounded-lg flex-shrink-0">
      {icons[type as keyof typeof icons] || icons.note}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Completo' },
    pending: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Pendente' },
    cancelled: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Cancelado' }
  };

  const s = config[status as keyof typeof config] || config.pending;

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${s.bg} ${s.text} flex-shrink-0`}>
      {s.label}
    </span>
  );
}

function AIInsightCard({ title, description, action, icon, color }: any) {
  const colorMap = {
    orange: 'from-orange-500/20 to-red-500/20 border-orange-500/30',
    emerald: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
    red: 'from-red-500/20 to-pink-500/20 border-red-500/30'
  };

  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} border rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="font-bold">{title}</h3>
      </div>
      <p className="text-sm text-gray-300 mb-4">{description}</p>
      <button className="text-xs font-semibold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
        {action} →
      </button>
    </div>
  );
}
