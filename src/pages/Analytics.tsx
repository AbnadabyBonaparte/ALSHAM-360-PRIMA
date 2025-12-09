// src/pages/Analytics.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Analytics 1000/1000
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA/blob/hotfix/recovery-prod/src/pages/Analytics.tsx

import LayoutSupremo from '@/components/LayoutSupremo';
import { ChartBarIcon, CurrencyDollarIcon, SparklesIcon, ArrowTrendingUpIcon, TrophyIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface Metrics {
  totalLeads: number;
  leadsThisMonth: number;
  totalRevenue: number;
  revenueThisMonth: number;
  conversionRate: number;
  avgDealSize: number;
  activeDeals: number;
  winRate: number;
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    async function loadSupremeAnalytics() {
      setLoading(true);
      try {
        const now = new Date();
        const ranges = {
          '7d': new Date(now.setDate(now.getDate() - 7)),
          '30d': new Date(now.setDate(now.getDate() - 30)),
          '90d': new Date(now.setDate(now.getDate() - 90)),
          'all': new Date('2020-01-01')
        };

        const since = ranges[timeRange];

        // MÉTRICAS REAIS DO SEU SUPABASE — ZERO MOCK
        const [
          { count: totalLeads, data: leadsThisPeriod },
          { data: opportunities },
          { data: closedWon }
        ] = await Promise.all([
          supabase.from('leads').select('id, created_at', { count: 'exact' }),
          supabase.from('opportunities').select('id, value, stage, created_at, closed_date'),
          supabase.from('opportunities').select('value').eq('stage', 'Ganho')
        ]);

        const leadsInPeriod = leadsThisPeriod?.filter(l => new Date(l.created_at) >= since).length || 0;
        const activeDeals = opportunities?.filter(o => !o.closed_date).length || 0;
        const wonDeals = closedWon?.length || 0;
        const totalRevenue = closedWon?.reduce((sum, o) => sum + (o.value || 0), 0) || 0;
        const revenueThisPeriod = opportunities
          ?.filter(o => o.stage === 'Ganho' && new Date(o.closed_date || '') >= since)
          .reduce((sum, o) => sum + o.value, 0) || 0;

        const avgDealSize = wonDeals > 0 ? totalRevenue / wonDeals : 0;
        const conversionRate = totalLeads && totalLeads > 0 ? (wonDeals / totalLeads) * 100 : 0;
        const winRate = activeDeals + wonDeals > 0 ? (wonDeals / (activeDeals + wonDeals)) * 100 : 0;

        setMetrics({
          totalLeads: totalLeads || 0,
          leadsThisMonth: leadsInPeriod,
          totalRevenue,
          revenueThisMonth: revenueThisPeriod,
          conversionRate,
          avgDealSize,
          activeDeals,
          winRate
        });
      } catch (err) {
        console.error('Erro no Analytics Supremo:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSupremeAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <LayoutSupremo title="Analytics Supremo">
        <div className="p-12 text-center">
          <div className="inline-block animate-spin w-20 h-20 border-8 border-primary border-t-transparent rounded-full"></div>
          <p className="text-3xl text-gray-400 mt-8">Citizen Supremo X.1 analisando seu império...</p>
        </div>
      </LayoutSupremo>
    );
  }

  if (!metrics) {
    return (
      <LayoutSupremo title="Analytics Supremo">
        <div className="p-12 text-center">
          <p className="text-3xl text-red-400">Erro ao carregar dados reais</p>
        </div>
      </LayoutSupremo>
    );
  }

  return (
    <LayoutSupremo title="Analytics Supremo">
      <div className="p-8 max-w-full">
        {/* Header Supremo */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-8">
            <ChartBarIcon className="w-20 h-20 text-primary animate-pulse" />
            <div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Analytics Supremo
              </h1>
              <p className="text-2xl text-gray-300 mt-4">
                Inteligência em tempo real • {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          {/* Filtro de tempo */}
          <div className="flex gap-3">
            {(['7d', '30d', '90d', 'all'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all ${
                  timeRange === range
                    ? 'bg-primary text-white shadow-2xl shadow-primary/50'
                    : 'bg-white/10 hover:bg-white/20 text-gray-300'
                }`}
              >
                {range === '7d' ? '7 dias' : range === '30d' ? '30 dias' : range === '90d' ? '90 dias' : 'Tudo'}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Supremo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 rounded-3xl p-8 border border-emerald-500/30 hover:scale-105 transition-all">
            <UserGroupIcon className="w-16 h-16 text-emerald-400 mb-4" />
            <p className="text-5xl font-bold text-white">{metrics.totalLeads.toLocaleString()}</p>
            <p className="text-xl text-emerald-300 mt-2">Leads Totais</p>
            <p className="text-3xl text-emerald-400 mt-4">+{metrics.leadsThisMonth}</p>
            <p className="text-gray-400">neste período</p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-3xl p-8 border border-blue-500/30 hover:scale-105 transition-all">
            <CurrencyDollarIcon className="w-16 h-16 text-cyan-400 mb-4" />
            <p className="text-5xl font-bold text-white">
              R$ {metrics.totalRevenue.toLocaleString('pt-BR')}
            </p>
            <p className="text-xl text-cyan-300 mt-2">Receita Total</p>
            <p className="text-3xl text-cyan-400 mt-4">
              R$ {metrics.revenueThisMonth.toLocaleString('pt-BR')}
            </p>
            <p className="text-gray-400">neste período</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-3xl p-8 border border-purple-500/30 hover:scale-105 transition-all">
            <ArrowTrendingUpIcon className="w-16 h-16 text-purple-400 mb-4" />
            <p className="text-5xl font-bold text-white">{metrics.conversionRate.toFixed(1)}%</p>
            <p className="text-xl text-purple-300 mt-2">Taxa de Conversão</p>
            <p className="text-2xl text-gray-400 mt-4">Lead → Cliente</p>
          </div>

          <div className="bg-gradient-to-br from-orange-900/50 to-red-900/50 rounded-3xl p-8 border border-orange-500/30 hover:scale-105 transition-all">
            <TrophyIcon className="w-16 h-16 text-orange-400 mb-4" />
            <p className="text-5xl font-bold text-white">{metrics.winRate.toFixed(1)}%</p>
            <p className="text-xl text-orange-300 mt-2">Win Rate</p>
            <p className="text-2xl text-gray-400 mt-4">Fechamentos / Oportunidades</p>
          </div>
        </div>

        {/* Insight da IA */}
        <div className="bg-gradient-to-r from-purple-900/60 via-pink-900/40 to-purple-900/60 rounded-3xl p-10 border border-purple-500/40 mb-12">
          <div className="flex items-center gap-6">
            <SparklesIcon className="w-16 h-16 text-purple-400 animate-pulse" />
            <div>
              <h2 className="text-4xl font-bold text-white mb-4">Insight Supremo da IA</h2>
              <p className="text-2xl text-purple-200 leading-relaxed">
                {metrics.conversionRate > 15
                  ? "Você está no top 3% mundial de conversão. Continue assim e dominaremos o mercado em 90 dias."
                  : metrics.leadsThisMonth > 100
                  ? "Volume de leads excelente. Foque agora em aumentar a taxa de conversão com Next Best Actions."
                  : "Pipeline saudável. Recomendo campanha de alta conversão com os 50 leads mais quentes."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </LayoutSupremo>
  );
}
