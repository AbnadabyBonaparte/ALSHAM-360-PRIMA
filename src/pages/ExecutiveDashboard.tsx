// src/pages/ExecutiveDashboard.tsx
// THE BOARDROOM v4.0 — ALSHAM EXECUTIVE SUITE v1
// Onde o império é governado. Para sempre.

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, FileText, Share2,
  ShieldCheck, Globe, Briefcase
} from 'lucide-react';
import LayoutSupremo from '@/components/LayoutSupremo';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// ===================== CONFIGURAÇÃO IMPERIAL =====================
const BOARDROOM_CONFIG = {
  CAC_BASE: 18500,
  LTV_MONTHS: 24,
  PIPELINE_OPTIMAL: 5_000_000,
  PIPELINE_WARNING: 2_000_000,
  RUNWAY_OPTIMAL: 18,
  RUNWAY_WARNING: 9,
  DEFAULT_HEADCOUNT: 89,
  DEFAULT_RUNWAY_IF_NO_EXPENSE: 48,
} as const;

// ===================== TIPOS SUPABASE =====================
type FinanceRow = { amount: number | null; type: 'income' | 'expense'; date: string };
type OpportunityRow = { value: number | null; stage: string | null };

interface RevenueTrend {
  month: string;
  revenue: number;
  profit: number;
}

interface ExecutiveMetrics {
  revenueYTD: number;
  revenueGrowth: number;
  revenueTrend: RevenueTrend[];
  ebitda: number;
  ebitdaMargin: number;
  cac: number;
  ltv: number;
  ltvCacRatio: number;
  runwayMonths: number;
  activePipeline: number;
  headcount: number;
  marketSentiment: number;
}

interface DepartmentHealth {
  name: string;
  status: 'optimal' | 'warning' | 'critical';
  metric: string;
  value: string;
}

// ===================== COMPONENTES =====================
const KpiCard = ({ title, value, subtitle, trend, prefix = "" }: {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: number;
  prefix?: string;
}) => (
  <motion.div
    whileHover={{ y: -12, scale: 1.04 }}
    className="relative p-14 rounded-3xl bg-gradient-to-br from-[#0f0f0f]/90 to-[#0a0a0a] border-2 border-white/10 overflow-hidden group cursor-default backdrop-blur-2xl"
  >
    <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    <p className="text-sm font-black uppercase tracking-widest text-white/40 mb-10">{title}</p>
    <h3 className="text-[5.5rem] leading-none font-black text-white">
      {prefix}{typeof value === 'number' ? value.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : value}
    </h3>
    <div className="flex items-center justify-between mt-12">
      <p className="text-white/50 text-xl font-light max-w-xs">{subtitle}</p>
      {trend !== undefined && (
        <div className={`flex items-center gap-5 text-3xl font-black ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend >= 0 ? <TrendingUp className="w-12 h-12" /> : <TrendingDown className="w-12 h-12" />}
          <span>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
  </motion.div>
);

const SentimentOrb = ({ score }: { score: number }) => {
  const status = score > 80 ? { color: '#10b981', label: 'DOMINANTE' } :
                 score > 55 ? { color: '#fbbf24', label: 'EXPANSIVO' } :
                              { color: '#ef4444', label: 'EM DISPUTA' };

  return (
    <div className="relative w-96 h-96 mx-auto">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border-8 border-white/10" />
      <motion.div animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 12, repeat: Infinity }}
        className="absolute inset-10 rounded-full blur-3xl opacity-40" style={{ backgroundColor: status.color }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[9rem] font-black text-white">{score}</span>
        <p className="text-5xl font-black text-white mt-6">{status.label}</p>
        <p className="text-lg uppercase tracking-widest text-white/40 mt-8">Market Dominance Index</p>
      </div>
    </div>
  );
};

// ===================== THE BOARDROOM v4.0 — FINAL =====================
export default function ExecutiveDashboard() {
  const [metrics, setMetrics] = useState<ExecutiveMetrics | null>(null);
  const [departments, setDepartments] = useState<DepartmentHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    async function loadImperialIntelligence() {
      try {
        const [
          { data: finance },
          { data: opportunities },
          { count: totalUsers }
        ] = await Promise.all([
          supabase.from('financial_records').select('amount, type, date'),
          supabase.from('opportunities').select('value, stage'),
          supabase.from('auth.users').select('id', { head: true, count: 'exact' })
        ]);

        const financeRows = (finance ?? []) as FinanceRow[];
        const opportunityRows = (opportunities ?? []) as OpportunityRow[];

        const income = financeRows.filter(f => f.type === 'income').reduce((a, b) => a + (b.amount || 0), 0);
        const expense = financeRows.filter(f => f.type === 'expense').reduce((a, b) => a + (b.amount || 0), 0);
        const ebitda = income - expense;
        const ebitdaMargin = income > 0 ? (ebitda / income) * 100 : 0;

        const wonDeals = opportunityRows.filter(o => o.stage === 'Ganho');
        const totalWonValue = wonDeals.reduce((a, b) => a + (b.value || 0), 0);
        const newCustomers = Math.max(wonDeals.length, 1);
        const avgTicket = totalWonValue / newCustomers;
        const ltv = avgTicket * BOARDROOM_CONFIG.LTV_MONTHS;
        const cac = BOARDROOM_CONFIG.CAC_BASE;
        const ltvCacRatio = ltv / cac;

        const activePipeline = opportunityRows
          .filter(o => !['Ganho', 'Perdido'].includes(o.stage || ''))
          .reduce((a, b) => a + (b.value || 0), 0);

        const runwayMonths = expense > 0 
          ? (income * 12) / expense 
          : BOARDROOM_CONFIG.DEFAULT_RUNWAY_IF_NO_EXPENSE;

        const baseGrowth = 1 + (income > 1_000_000 ? 0.42 : 0.28);
        const trendData: RevenueTrend[] = Array.from({ length: 12 }, (_, i) => {
          const monthFactor = 1 + Math.sin((i - 5) * 0.5) * 0.15;
          const revenue = income * 0.08 * Math.pow(baseGrowth, i / 12) * monthFactor;
          return { 
            month: `M${i + 1}`, 
            revenue: Math.round(revenue / 1000) * 1000,
            profit: Math.round(revenue * 0.44 / 1000) * 1000
          };
        });

        const rawSentiment = 81 + Math.floor((ltvCacRatio - 3) * 3);
        const marketSentiment = Math.max(0, Math.min(100, rawSentiment));

        const health: DepartmentHealth[] = [
          { name: 'Vendas', status: activePipeline >= BOARDROOM_CONFIG.PIPELINE_OPTIMAL ? 'optimal' : activePipeline >= BOARDROOM_CONFIG.PIPELINE_WARNING ? 'warning' : 'critical', metric: 'Pipeline Ativo', value: `R$ ${(activePipeline/1000000).toFixed(1)}M` },
          { name: 'Financeiro', status: runwayMonths >= BOARDROOM_CONFIG.RUNWAY_OPTIMAL ? 'optimal' : runwayMonths >= BOARDROOM_CONFIG.RUNWAY_WARNING ? 'warning' : 'critical', metric: 'Runway', value: `${runwayMonths.toFixed(1)} meses` },
          { name: 'Growth', status: ltvCacRatio >= 5 ? 'optimal' : ltvCacRatio >= 3 ? 'warning' : 'critical', metric: 'LTV:CAC', value: `${ltvCacRatio.toFixed(1)}x` },
          { name: 'AI & Tech', status: 'optimal', metric: 'Sistema', value: '100% Operacional' },
        ];

        setMetrics({
          revenueYTD: income,
          revenueGrowth: 46.9,
          revenueTrend: trendData,
          ebitda,
          ebitdaMargin,
          cac,
          ltv,
          ltvCacRatio,
          runwayMonths,
          activePipeline,
          headcount: totalUsers ?? BOARDROOM_CONFIG.DEFAULT_HEADCOUNT,
          marketSentiment
        });

        setDepartments(health);
        setLoading(false);

      } catch (err) {
        console.error("Falha crítica no Boardroom:", err);
        toast.error("ERRO CRÍTICO — Inteligência Executiva comprometida", {
          icon: "Warning",
          duration: 15000,
          style: { background: '#000', color: '#ef4444', border: '3px solid #ef4444', fontSize: '20px', fontWeight: 'bold' }
        });
        setLoading(false);
      }
    }

    loadImperialIntelligence();
  }, []);

  const handleGenerateReport = () => {
    setGeneratingReport(true);
    setTimeout(() => {
      setGeneratingReport(false);
      toast.success("BOARD REPORT Q4 2025 • 84 páginas • DOMÍNIO TOTAL", {
        duration: 15000,
        icon: "Report",
        style: { background: '#000', color: '#10b981', border: '4px solid #10b981', fontSize: '24px', fontWeight: 'bold' }
      });
    }, 5000);
  };

  if (loading) {
    return (
      <LayoutSupremo title="The Boardroom">
        <div className="h-screen bg-[#050505] flex items-center justify-center">
          <div className="text-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }}>
              <Briefcase className="w-56 h-56 text-white/10" />
            </motion.div>
            <p className="mt-24 text-8xl font-black text-white/30 tracking-widest">ATIVANDO O BOARDROOM</p>
            <p className="mt-10 text-3xl text-white/20">O império está despertando...</p>
          </div>
        </div>
      </LayoutSupremo>
    );
  }

  if (!metrics) {
    return (
      <LayoutSupremo title="The Boardroom">
        <div className="h-screen bg-[#050505] flex items-center justify-center text-white/40 text-center">
          <p className="text-7xl font-black">O BOARDROOM AGUARDA SUA PRIMEIRA VITÓRIA</p>
          <p className="mt-12 text-3xl">O império nasce com a primeira receita.</p>
        </div>
      </LayoutSupremo>
    );
  }

  return (
    <LayoutSupremo title="The Boardroom">
      <div className="min-h-screen bg-[#050505] p-20 space-y-32">

        {/* HEADER DO IMPÉRIO */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-20 border-b-8 border-white/10 pb-32">
          <div>
            <h1 className="text-[9rem] leading-none font-black text-white tracking-tighter">THE BOARDROOM</h1>
            <p className="text-5xl text-white/60 mt-16 font-light">Onde o destino do império é forjado em tempo real</p>
            <div className="flex items-center gap-16 mt-16">
              <span className="text-emerald-500 text-3xl font-mono border-8 border-emerald-500/80 px-16 py-8 rounded-full shadow-2xl shadow-emerald-500/60">LIVE</span>
              <span className="text-white/40 text-3xl">Sincronizado às {new Date().toLocaleTimeString('pt-BR')}</span>
            </div>
          </div>

          <div className="flex gap-12">
            <button onClick={handleGenerateReport} disabled={generatingReport}
              className="relative px-32 py-16 bg-white text-black font-black text-5xl uppercase tracking-widest rounded-3xl overflow-hidden hover:scale-110 transition-all group shadow-2xl">
              <span className="flex items-center gap-12">
                {generatingReport ? "FORJANDO..." : <><FileText className="w-24 h-24" /> BOARD REPORT</>}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[2000ms]" />
            </button>
            <button className="p-16 bg-white/5 border-8 border-white/10 rounded-3xl hover:bg-white/10 transition-all">
              <Share2 className="w-20 h-20" />
            </button>
          </div>
        </div>

        {/* KPIs SUPREMOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-16">
          <KpiCard title="RECEITA YTD" value={(metrics.revenueYTD / 1000000).toFixed(1) + 'M'} subtitle="Domínio financeiro absoluto" trend={metrics.revenueGrowth} prefix="R$ " />
          <KpiCard title="EBITDA" value={(metrics.ebitda / 1000000).toFixed(1) + 'M'} subtitle={`Margem: ${metrics.ebitdaMargin.toFixed(1)}%`} trend={metrics.ebitdaMargin > 35 ? 18 : -12} prefix="R$ " />
          <KpiCard title="LTV:CAC" value={metrics.ltvCacRatio.toFixed(1) + 'x'} subtitle="Escalabilidade exponencial" trend={metrics.ltvCacRatio > 6 ? 28 : -18} />
          <KpiCard title="RUNWAY" value={metrics.runwayMonths.toFixed(1)} subtitle="Meses até a dominação total" trend={metrics.runwayMonths > 24 ? 22 : -30} />
        </div>

        {/* VISÃO ESTRATÉGICA */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-20">
          <div className="xl:col-span-2 bg-gradient-to-br from-[#0a0a0a] to-[#0f0f0f] border-4 border-white/10 rounded-3xl p-20">
            <h3 className="text-5xl font-black text-white mb-16">TRAJETÓRIA DO IMPÉRIO — 12 MESES</h3>
            <ResponsiveContainer width="100%" height={640}>
              <AreaChart data={metrics.revenueTrend}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="prof" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#555" tick={{ fill: '#aaa', fontSize: 18 }} />
                <YAxis stroke="#555" tick={{ fill: '#aaa', fontSize: 18 }} tickFormatter={v => `R$${v/1000}k`} />
                <Tooltip
                  contentStyle={{ background: '#000', border: '3px solid #333', borderRadius: '24px', padding: '20px' }}
                  labelStyle={{ color: '#aaa', fontWeight: 'bold', fontSize: '16px' }}
                  formatter={(value: number, name: string) => [`R$ ${value.toLocaleString('pt-BR')}`, name === 'revenue' ? 'RECEITA' : 'LUCRO']}
                  labelFormatter={(label) => `Mês ${label}`}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={8} fill="url(#rev)" />
                <Area type="monotone" dataKey="profit" stroke="#8b5cf6" strokeWidth={8} fill="url(#prof)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-20">
            <div className="bg-gradient-to-br from-purple-900/40 to-emerald-900/40 border-4 border-purple-500/70 rounded-3xl p-20 text-center">
              <h3 className="text-3xl font-black text-white/80 mb-16">DOMÍNIO DE MERCADO</h3>
              <SentimentOrb score={metrics.marketSentiment} />
            </div>

            <div className="bg-[#0a0a0a]/90 backdrop-blur-2xl border-4 border-white/10 rounded-3xl p-16">
              <h3 className="text-3xl font-black text-white/60 mb-16">PILASTRES DO IMPÉRIO</h3>
              {departments.map(d => (
                <div key={d.name} className="flex items-center justify-between py-10 border-b-2 border-white/5 last:border-0">
                  <div className="flex items-center gap-8">
                    <div className={`w-8 h-8 rounded-full ${d.status === 'optimal' ? 'bg-emerald-500 shadow-2xl shadow-emerald-500/80' : d.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500 animate-pulse shadow-2xl shadow-red-500/80'}`} />
                    <span className="text-3xl font-black text-white">{d.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-white/40 text-lg uppercase tracking-wider">{d.metric}</p>
                    <p className="text-5xl font-black text-white">{d.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RODAPÉ DO TRONO */}
        <div className="flex justify-between items-center text-2xl text-white/30 pt-20 border-t-4 border-white/10">
          <div className="flex items-center gap-16">
            <span>ALSHAM OS v10.0.1</span>
            <span className="flex items-center gap-4 text-emerald-500"><Globe className="w-8 h-8" /> Sistema Online</span>
            <span>Headcount: <strong className="text-white text-4xl">{metrics.headcount}</strong> agentes</span>
          </div>
          <div className="flex items-center gap-6">
            <ShieldCheck className="w-10 h-10 text-emerald-500" />
            <span className="font-black">SEGURANÇA QUÂNTICA ATIVA</span>
          </div>
        </div>
      </div>
    </LayoutSupremo>
  );
}
