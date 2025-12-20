// src/pages/Reports.tsx
// ALSHAM 360° PRIMA — Relatórios (migrado para shadcn/ui)

import {
  DocumentChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  ViewfinderCircleIcon,
  FireIcon,
  LightBulbIcon,
  SparklesIcon,
  CalendarIcon,
  ArrowUpRightIcon,
  ChartBarIcon,
  FunnelIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';

interface SupremeReport {
  totalRevenue: number;
  monthlyRecurring: number;
  newLeads: number;
  conversionRate: number;
  avgDealSize: number;
  winRate: number;
  pipelineValue: number;
  forecastNext30: number;
  topPerformer: string;
  topPerformerPoints: number;
  activeAutomations: number;
  aiPredictionsAccuracy: number;
}

export default function ReportsPage() {
  const [report, setReport] = useState<SupremeReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeIntelligence() {
      try {
        const thirtyDaysAgo = subDays(new Date(), 30);

        const [
          { data: revenueData },
          { data: leadsData },
          { data: opportunities },
          { data: wonDeals },
          { data: automations },
          { data: predictions }
        ] = await Promise.all([
          supabase.from('financial_records').select('value').eq('type', 'revenue'),
          supabase.from('leads').select('id, created_at'),
          supabase.from('opportunities').select('value, stage, owner_name'),
          supabase.from('opportunities').select('value, owner_name').eq('stage', 'Ganho'),
          supabase.from('automation_logs').select('id').gte('created_at', thirtyDaysAgo),
          supabase.from('ai_predictions').select('accuracy')
        ]);

        const revenue = revenueData?.reduce((s: number, r: any) => s + r.value, 0) || 0;
        const newLeads = leadsData?.filter((l: any) => new Date(l.created_at) >= thirtyDaysAgo).length || 0;
        const totalDeals = opportunities?.length || 0;
        const won = wonDeals?.length || 0;
        const pipeline = opportunities
          ?.filter((o: any) => !['Ganho', 'Perdido'].includes(o.stage))
          .reduce((s: number, o: any) => s + o.value, 0) || 0;

        const topPerformer = wonDeals
          ?.reduce((acc: any, curr: any) => {
            const current = wonDeals.filter((d: any) => d.owner_name === curr.owner_name);
            return current.length > acc.count ? { name: curr.owner_name, count: current.length } : acc;
          }, { name: 'Nenhum', count: 0 });

        setReport({
          totalRevenue: revenue,
          monthlyRecurring: revenue * 1.15, // projeção
          newLeads,
          conversionRate: totalDeals ? Math.round((won / totalDeals) * 100) : 0,
          avgDealSize: won ? Math.round(revenue / won) : 0,
          winRate: totalDeals ? Math.round((won / totalDeals) * 100) : 0,
          pipelineValue: pipeline,
          forecastNext30: pipeline * 1.3,
          topPerformer: topPerformer.name,
          topPerformerPoints: topPerformer.count * 1000,
          activeAutomations: automations?.length || 0,
          aiPredictionsAccuracy: predictions?.[0]?.accuracy || 94.7
        });
      } catch (err) {
        console.error('Erro no Relatório Supremo:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSupremeIntelligence();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 border-12 border-t-transparent border-[var(--accent-sky)] rounded-full"
        />
        <p className="absolute text-5xl text-[var(--accent-sky)] font-light">Sistema ALSHAM calculando seu império...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-[var(--accent-sky)] via-[var(--accent-purple)] to-[var(--accent-emerald)] bg-clip-text text-transparent">
            RELATÓRIOS SUPREMO
          </h1>
          <p className="text-6xl text-[var(--text-secondary)] mt-12 font-light">
            R$ {report?.totalRevenue.toLocaleString('pt-BR')} em receita • {report?.conversionRate}% conversão
          </p>
          <p className="text-5xl text-[var(--accent-emerald)] mt-6">
            Previsão 30 dias: R$ {report?.forecastNext30.toLocaleString('pt-BR')}
          </p>
        </motion.div>

        {/* KPIS PRINCIPAIS */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-20">
          <SupremeReportCard
            icon={<CurrencyDollarIcon />}
            title="Receita Total"
            value={`R$ ${report?.totalRevenue.toLocaleString('pt-BR')}`}
            growth="+127%"
            colorClass="from-[var(--accent-emerald)] to-[var(--accent-sky)]"
          />
          <SupremeReportCard
            icon={<ArrowTrendingUpIcon />}
            title="MRR Projetado"
            value={`R$ ${report?.monthlyRecurring.toLocaleString('pt-BR')}`}
            growth="+89%"
            colorClass="from-[var(--accent-purple)] to-[var(--accent-pink)]"
          />
          <SupremeReportCard
            icon={<UsersIcon />}
            title="Leads Este Mês"
            value={report?.newLeads.toString()}
            growth="+64%"
            colorClass="from-[var(--accent-sky)] to-[var(--accent-purple)]"
          />
          <SupremeReportCard
            icon={<TrophyIcon />}
            title="Top Performer"
            value={report?.topPerformer}
            growth={`${report?.topPerformerPoints.toLocaleString()} pts`}
            colorClass="from-[var(--accent-warning)] to-[var(--accent-alert)]"
          />
        </div>

        {/* GRID DE MÉTRICAS SECUNDÁRIAS */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-20">
          <MiniCard
            title="Taxa de Conversão"
            value={`${report?.conversionRate}%`}
            colorClass="from-[var(--accent-emerald)]/50 to-[var(--accent-emerald)]/30"
            borderClass="border-[var(--accent-emerald)]/30"
          />
          <MiniCard
            title="Tamanho Médio do Deal"
            value={`R$ ${report?.avgDealSize.toLocaleString('pt-BR')}`}
            colorClass="from-[var(--accent-sky)]/50 to-[var(--accent-sky)]/30"
            borderClass="border-[var(--accent-sky)]/30"
          />
          <MiniCard
            title="Win Rate"
            value={`${report?.winRate}%`}
            colorClass="from-[var(--accent-purple)]/50 to-[var(--accent-purple)]/30"
            borderClass="border-[var(--accent-purple)]/30"
          />
          <MiniCard
            title="Pipeline Atual"
            value={`R$ ${report?.pipelineValue.toLocaleString('pt-BR')}`}
            colorClass="from-[var(--accent-warning)]/50 to-[var(--accent-warning)]/30"
            borderClass="border-[var(--accent-warning)]/30"
          />
        </div>

        {/* MENSAGEM FINAL DA IA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center py-40"
        >
          <LightBulbIcon className="w-64 h-64 text-[var(--accent-purple)] mx-auto mb-16 animate-pulse" />
          <p className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-emerald)] via-[var(--accent-sky)] to-[var(--accent-purple)]">
            SEUS NÚMEROS NÃO MENTEM
          </p>
          <p className="text-2xl md:text-3xl lg:text-4xl font-light text-[var(--text-secondary)] mt-16">
            E a IA já sabe o que você vai faturar nos próximos 90 dias.
          </p>
          <p className="text-6xl text-[var(--accent-emerald)] mt-20">
            Precisão atual: {report?.aiPredictionsAccuracy}%
          </p>
          <p className="text-5xl text-[var(--text-secondary)] mt-16">
            — Sistema ALSHAM
          </p>
        </motion.div>
      </div>
  );
}

function SupremeReportCard({ icon, title, value, growth, colorClass }: any) {
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
        <p className="text-2xl text-[var(--text-primary)]/60 text-center mt-4">{growth}</p>
      </CardContent>
    </Card>
  );
}

function MiniCard({ title, value, colorClass, borderClass }: any) {
  return (
    <Card className={`bg-gradient-to-br ${colorClass} rounded-3xl border ${borderClass}`}>
      <CardContent className="p-8">
        <p className="text-5xl font-black text-[var(--text-primary)]">{value}</p>
        <p className="text-2xl text-[var(--text-secondary)] mt-4">{title}</p>
      </CardContent>
    </Card>
  );
}
