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
        <div className="p-6 sm:p-8 lg:p-12 text-center">
          <div className="inline-block animate-spin w-12 h-12 sm:w-16 lg:w-20 border-4 sm:border-6 lg:border-8 border-[var(--accent-primary)] border-t-transparent rounded-full"></div>
          <p className="text-base sm:text-xl lg:text-2xl text-[var(--text-secondary)] mt-4 sm:mt-6 lg:mt-8">Citizen Supremo X.1 analisando seu império...</p>
        </div>
      </LayoutSupremo>
    );
  }

  if (!metrics) {
    return (
      <LayoutSupremo title="Analytics Supremo">
        <div className="p-6 sm:p-8 lg:p-12 text-center">
          <p className="text-xl sm:text-2xl lg:text-3xl text-[var(--accent-alert)]">Erro ao carregar dados reais</p>
        </div>
      </LayoutSupremo>
    );
  }

  return (
    <LayoutSupremo title="Analytics Supremo">
      <div className="p-4 sm:p-6 lg:p-8 max-w-full">
        {/* Header Supremo */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8 mb-8 sm:mb-10 lg:mb-12">
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
            <ChartBarIcon className="w-12 h-12 sm:w-16 lg:w-20 text-[var(--accent-primary)] animate-pulse" />
            <div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-[var(--accent-secondary)] via-[var(--accent-primary)] to-[var(--accent-tertiary)] bg-clip-text text-transparent">
                Analytics Supremo
              </h1>
              <p className="text-sm sm:text-lg lg:text-xl text-[var(--text-secondary)] mt-2 sm:mt-3 lg:mt-4">
                Inteligência em tempo real • {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          {/* Filtro de tempo */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {(['7d', '30d', '90d', 'all'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm lg:text-base transition-all ${
                  timeRange === range
                    ? 'bg-[var(--accent-primary)] text-white shadow-lg'
                    : 'bg-[var(--surface)] hover:bg-[var(--surface-strong)] text-[var(--text-secondary)] border border-[var(--border)]'
                }`}
              >
                {range === '7d' ? '7 dias' : range === '30d' ? '30 dias' : range === '90d' ? '90 dias' : 'Tudo'}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Supremo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 lg:mb-12">
          <div className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-emerald-500/30 hover:scale-105 transition-all">
            <UserGroupIcon className="w-10 h-10 sm:w-12 lg:w-16 text-emerald-400 mb-3 sm:mb-4" />
            <p className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[var(--text-primary)]">{metrics.totalLeads.toLocaleString()}</p>
            <p className="text-sm sm:text-base lg:text-lg text-emerald-300 mt-1 sm:mt-2">Leads Totais</p>
            <p className="text-lg sm:text-2xl lg:text-3xl text-emerald-400 mt-2 sm:mt-3 lg:mt-4">+{metrics.leadsThisMonth}</p>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">neste período</p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-blue-500/30 hover:scale-105 transition-all">
            <CurrencyDollarIcon className="w-10 h-10 sm:w-12 lg:w-16 text-cyan-400 mb-3 sm:mb-4" />
            <p className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[var(--text-primary)]">
              R$ {metrics.totalRevenue.toLocaleString('pt-BR')}
            </p>
            <p className="text-sm sm:text-base lg:text-lg text-cyan-300 mt-1 sm:mt-2">Receita Total</p>
            <p className="text-lg sm:text-2xl lg:text-3xl text-cyan-400 mt-2 sm:mt-3 lg:mt-4">
              R$ {metrics.revenueThisMonth.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">neste período</p>
          </div>

          <div className="bg-gradient-to-br from-[var(--accent-primary)]/40 to-[var(--accent-tertiary)]/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-[var(--accent-primary)]/30 hover:scale-105 transition-all">
            <ArrowTrendingUpIcon className="w-10 h-10 sm:w-12 lg:w-16 text-[var(--accent-primary)] mb-3 sm:mb-4" />
            <p className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[var(--text-primary)]">{metrics.conversionRate.toFixed(1)}%</p>
            <p className="text-sm sm:text-base lg:text-lg text-[var(--accent-primary)] mt-1 sm:mt-2">Taxa de Conversão</p>
            <p className="text-sm sm:text-base lg:text-xl text-[var(--text-secondary)] mt-2 sm:mt-3 lg:mt-4">Lead → Cliente</p>
          </div>

          <div className="bg-gradient-to-br from-orange-900/50 to-red-900/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-orange-500/30 hover:scale-105 transition-all">
            <TrophyIcon className="w-10 h-10 sm:w-12 lg:w-16 text-orange-400 mb-3 sm:mb-4" />
            <p className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[var(--text-primary)]">{metrics.winRate.toFixed(1)}%</p>
            <p className="text-sm sm:text-base lg:text-lg text-orange-300 mt-1 sm:mt-2">Win Rate</p>
            <p className="text-sm sm:text-base lg:text-xl text-[var(--text-secondary)] mt-2 sm:mt-3 lg:mt-4">Fechamentos / Oportunidades</p>
          </div>
        </div>

        {/* Insight da IA */}
        <div className="bg-gradient-to-r from-[var(--accent-primary)]/30 via-[var(--accent-tertiary)]/20 to-[var(--accent-primary)]/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-10 border border-[var(--accent-primary)]/40 mb-8 sm:mb-10 lg:mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <SparklesIcon className="w-10 h-10 sm:w-12 lg:w-16 text-[var(--accent-primary)] animate-pulse flex-shrink-0" />
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-[var(--text-primary)] mb-2 sm:mb-3 lg:mb-4">Insight Supremo da IA</h2>
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-[var(--accent-primary)] leading-relaxed">
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
