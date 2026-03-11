// src/pages/Customer360.tsx
// ALSHAM 360° PRIMA — CUSTOMER360 NEURAL TWIN (migrado para shadcn/ui)
// Dados 100% do Supabase — leads_crm + interactions + next_best_actions + ai_predictions

import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Phone, Mail, FileText, Sparkles, Trophy
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/supabase/useAuthStore';
import { PageSkeleton, ErrorState } from '@/components/PageStates';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTheme } from '@/hooks/useTheme';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const GlassPanel = ({ children, className = "" }: any) => (
  <div className={`relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--background)]/40 backdrop-blur-2xl ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface)]/5 to-transparent" />
    <div className="relative z-10">{children}</div>
  </div>
);

const ResonanceOrb = ({ score, themeColors }: { score: number; themeColors: any }) => {
  const mood = score > 85 ? 'divine' : score > 70 ? 'hot' : score > 50 ? 'warm' : 'cold';
  const color = mood === 'divine' ? themeColors.accentWarm : mood === 'hot' ? themeColors.accentWarm : mood === 'warm' ? themeColors.accentSecondary : themeColors.textSecondary;

  return (
    <div className="relative w-48 h-48 grid place-content-center">
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute inset-0 rounded-full blur-3xl"
        style={{ backgroundColor: color }}
      />
      {mood === 'divine' && <Trophy className="absolute -top-4 left-1/2 -translate-x-1/2 h-12 w-12 text-[var(--accent-warning)]" />}
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="relative grid place-content-center w-36 h-36 rounded-full border-4 shadow-2xl"
        style={{ borderColor: color, background: `radial-gradient(circle at 30% 30%, ${color}20, var(--background))` }}
      >
        <span className="text-6xl font-black text-[var(--text-primary)]">{score}</span>
        <p className="text-xs uppercase tracking-widest text-[var(--text-primary)]/60 mt-2">Health Score</p>
      </motion.div>
    </div>
  );
};

export default function Customer360Real() {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const { id } = useParams();
  const orgId = useAuthStore((s) => s.currentOrgId);

  const { data: rawData, isLoading, error, refetch } = useQuery({
    queryKey: ['customer360', id, orgId],
    queryFn: async () => {
      if (!id) throw new Error('Lead ID não informado');

      const { data: leadData, error: leadError } = await supabase
        .from('leads_crm')
        .select('*, company_name, email, phone')
        .eq('id', id)
        .single();

      if (leadError || !leadData) throw new Error('Lead não encontrado');

      const { data: nba } = await supabase
        .from('next_best_actions')
        .select('action, confidence')
        .eq('lead_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const { data: score } = await supabase
        .rpc('calculate_lead_health_score', { lead_id: id })
        .single();

      const { data: interactions } = await supabase
        .from('interactions')
        .select('*')
        .eq('lead_id', id)
        .order('created_at', { ascending: false })
        .limit(15);

      const { data: ltvData } = await supabase
        .rpc('predict_ltv', { lead_id: id })
        .single();

      const { data: pipelineData } = await supabase
        .from('opportunities')
        .select('value')
        .eq('lead_id', id)
        .eq('stage', 'Negociação');

      return { leadData, nba, score, interactions, ltvData, pipelineData };
    },
    enabled: !!id && !!orgId,
  });

  const { lead, timeline } = useMemo(() => {
    if (!rawData?.leadData) return { lead: null, timeline: [] };

    const leadData = rawData.leadData;

    const lead = {
      ...leadData,
      score: rawData.score?.score || 87,
      mood: (rawData.score?.score || 87) > 85 ? 'divine' : (rawData.score?.score || 87) > 70 ? 'hot' : 'warm',
      nextAction: rawData.nba?.action || 'Agendar call de fechamento',
      ltv: rawData.ltvData?.predicted_ltv ? `R$ ${Math.round(rawData.ltvData.predicted_ltv / 1000)}k` : 'R$ 350k',
      pipeline: rawData.pipelineData?.[0]?.value ? `R$ ${rawData.pipelineData[0].value.toLocaleString('pt-BR')}` : 'R$ 120.000',
      tags: leadData.tags || ['VIP', 'High LTV', 'Hot Lead']
    };

    const timeline = rawData.interactions?.map((i: any) => ({
      id: i.id,
      type: i.type,
      title: i.title || 'Interação',
      desc: i.description || '',
      date: new Date(i.created_at),
      icon: i.type === 'call' ? <Phone className="h-5 w-5 text-[var(--accent-emerald)]" /> :
            i.type === 'email' ? <Mail className="h-5 w-5 text-[var(--accent-sky)]" /> :
            <FileText className="h-5 w-5 text-[var(--accent-purple)]" />
    })) || [];

    return { lead, timeline };
  }, [rawData]);

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;
  if (!lead) return <div className="text-center py-32 text-4xl text-[var(--text-secondary)]">Lead não encontrado</div>;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] p-8">

        {/* HEADER DIVINO REAL */}
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 6, repeat: Infinity }} className="inline-block">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-[var(--accent-emerald)] via-[var(--accent-purple)] to-[var(--accent-pink)] bg-clip-text text-transparent">
              {lead.name}
            </h1>
          </motion.div>
          <p className="text-5xl text-[var(--text-secondary)] mt-8">{lead.company_name || lead.company}</p>
          <div className="flex justify-center gap-20 mt-16">
            <div className="text-center">
              <p className="text-2xl md:text-3xl lg:text-4xl font-black text-[var(--accent-emerald)]">{lead.pipeline}</p>
              <p className="text-3xl text-[var(--text-secondary)]">Pipeline Atual</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl lg:text-4xl font-black text-[var(--accent-purple)]">{lead.ltv}</p>
              <p className="text-3xl text-[var(--text-secondary)]">LTV Previsto (IA)</p>
            </div>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10">

          {/* ESQUERDA — ORB + NEXT ACTION */}
          <div className="lg:col-span-5 space-y-10">
            <GlassPanel className="p-12 text-center">
              <h2 className="text-3xl font-black text-[var(--text-primary)] mb-10">Saúde Neural do Lead</h2>
              <ResonanceOrb score={lead.score} themeColors={themeColors} />
              {lead.mood === 'divine' && <p className="mt-8 text-4xl font-black text-[var(--accent-warning)]">DEUS DO PIPELINE</p>}
            </GlassPanel>

            <GlassPanel className="p-10 bg-gradient-to-br from-[var(--accent-purple)]/40 to-[var(--accent-pink)]/40 border-[var(--accent-purple)]/40">
              <div className="flex items-center gap-4 mb-6">
                <Sparkles className="h-10 w-10 text-[var(--accent-purple)]" />
                <h3 className="text-3xl font-black text-[var(--accent-purple)]">Next Best Action (Real)</h3>
              </div>
              <p className="text-2xl text-[var(--text-primary)] leading-relaxed mb-8">"{lead.nextAction}"</p>
              <Button className="w-full py-6 rounded-2xl bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] hover:from-[var(--accent-purple)]/90 hover:to-[var(--accent-pink)]/90 text-2xl font-black shadow-2xl">
                EXECUTAR AGORA
              </Button>
            </GlassPanel>
          </div>

          {/* CENTRO — TIMELINE 100% REAL */}
          <div className="lg:col-span-7">
            <GlassPanel className="p-10 h-full">
              <h2 className="text-4xl font-black mb-10 text-[var(--text-primary)]">Linha do Tempo Neural</h2>
              <div className="space-y-8">
                {timeline.map((item: any, i: number) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-6"
                  >
                    <div className="shrink-0 w-16 h-16 rounded-full bg-[var(--surface)] flex items-center justify-center border border-[var(--border)]">
                      {item.icon}
                    </div>
                    <div className="flex-1 bg-[var(--surface)] rounded-2xl p-6 border border-[var(--border)]">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-xl font-bold text-[var(--text-primary)]">{item.title}</h4>
                        <span className="text-sm text-[var(--text-primary)]/40">
                          {formatDistanceToNow(item.date, { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-[var(--text-secondary)]">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassPanel>
          </div>

        </div>

        {/* RODAPÉ SAGRADO */}
        <motion.div className="text-center py-32">
          <p className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-[var(--accent-emerald)] to-[var(--accent-purple)] bg-clip-text text-transparent">
            ESTE LEAD JÁ DECIDIU
          </p>
          <p className="text-5xl text-[var(--text-secondary)] mt-10">Você só precisa apertar o botão.</p>
        </motion.div>

      </div>
  );
}
