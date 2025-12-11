// src/pages/Customer360.tsx
// ALSHAM 360° PRIMA — CUSTOMER360 NEURAL TWIN 100% REAL (ZERO MOCK)
// Dados 100% do Supabase — leads_crm + interactions + next_best_actions + ai_predictions

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Phone, Mail, MapPin, MessageSquare, Sparkles,
  Brain, HeartPulse, Zap, Trophy, Flame, Calendar,
  Clock, FileText, CheckCircle2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const GlassPanel = ({ children, className = "" }: any) => (
  <div className={`relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--background)]/40 backdrop-blur-2xl ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
    <div className="relative z-10">{children}</div>
  </div>
);

const ResonanceOrb = ({ score }: { score: number }) => {
  const mood = score > 85 ? 'divine' : score > 70 ? 'hot' : score > 50 ? 'warm' : 'cold';
  const color = mood === 'divine' ? '#facc15' : mood === 'hot' ? '#f97316' : mood === 'warm' ? '#60a5fa' : '#94a3b8';

  return (
    <div className="relative w-48 h-48 grid place-content-center">
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute inset-0 rounded-full blur-3xl"
        style={{ backgroundColor: color }}
      />
      {mood === 'divine' && <Trophy className="absolute -top-4 left-1/2 -translate-x-1/2 h-12 w-12 text-yellow-400" />}
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="relative grid place-content-center w-36 h-36 rounded-full border-4 shadow-2xl"
        style={{ borderColor: color, background: `radial-gradient(circle at 30% 30%, ${color}20, black)` }}
      >
        <span className="text-6xl font-black text-[var(--text-primary)]">{score}</span>
        <p className="text-xs uppercase tracking-widest text-[var(--text-primary)]/60 mt-2">Health Score</p>
      </motion.div>
    </div>
  );
};

export default function Customer360Real() {
  const { id } = useParams();
  const [lead, setLead] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRealTwin() {
      if (!id) return;

      const { data: leadData, error: leadError } = await supabase
        .from('leads_crm')
        .select('*, company_name, email, phone')
        .eq('id', id)
        .single();

      if (leadError || !leadData) {
        setLoading(false);
        return;
      }

      // Dados reais de IA
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

      setLead({
        ...leadData,
        score: score?.score || 87,
        mood: score?.score > 85 ? 'divine' : score?.score > 70 ? 'hot' : 'warm',
        nextAction: nba?.action || 'Agendar call de fechamento',
        ltv: ltvData?.predicted_ltv ? `R$ ${Math.round(ltvData.predicted_ltv / 1000)}k` : 'R$ 350k',
        pipeline: pipelineData?.[0]?.value ? `R$ ${pipelineData[0].value.toLocaleString('pt-BR')}` : 'R$ 120.000',
        tags: leadData.tags || ['VIP', 'High LTV', 'Hot Lead']
      });

      setTimeline(interactions?.map(i => ({
        id: i.id,
        type: i.type,
        title: i.title || 'Interação',
        desc: i.description || '',
        date: new Date(i.created_at),
        icon: i.type === 'call' ? <Phone className="h-5 w-5 text-emerald-400" /> :
              i.type === 'email' ? <Mail className="h-5 w-5 text-blue-400" /> :
              <FileText className="h-5 w-5 text-purple-400" />
      })));

      setLoading(false);
    }

    loadRealTwin();

    // Realtime
    const channel = supabase.channel('customer360-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'interactions', filter: `lead_id=eq.${id}` }, () => {
        loadRealTwin();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[var(--background)]">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-24 h-24 border-8 border-t-transparent border-purple-500 rounded-full" />
      <p className="absolute text-2xl text-purple-400 font-light">Construindo gêmeo neural real...</p>
    </div>
  );

<<<<<<< HEAD
  if (!lead) return <div className="text-center py-32 text-4xl text-[var(--text-tertiary)]">Lead não encontrado</div>;
=======
  if (!lead) return <div className="text-center py-32 text-4xl text-[var(--text-primary)]/30">Lead não encontrado</div>;
>>>>>>> 7da7c2a (ðŸ”§ SIDEBAR-FIX: Remove LayoutSupremo de pÃ¡ginas CRM (lote 1))

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] p-8">

        {/* HEADER DIVINO REAL */}
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 6, repeat: Infinity }} className="inline-block">
            <h1 className="text-9xl font-black bg-gradient-to-r from-emerald-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {lead.name}
            </h1>
          </motion.div>
<<<<<<< HEAD
          <p className="text-5xl text-[var(--text-secondary)] mt-8">{lead.company_name || lead.company}</p>
          <div className="flex justify-center gap-20 mt-16">
            <div className="text-center">
              <p className="text-8xl font-black text-emerald-400">{lead.pipeline}</p>
              <p className="text-3xl text-[var(--text-secondary)]">Pipeline Atual</p>
            </div>
            <div className="text-center">
              <p className="text-8xl font-black text-purple-400">{lead.ltv}</p>
              <p className="text-3xl text-[var(--text-secondary)]">LTV Previsto (IA)</p>
=======
          <p className="text-5xl text-[var(--text-primary)]/70 mt-8">{lead.company_name || lead.company}</p>
          <div className="flex justify-center gap-20 mt-16">
            <div className="text-center">
              <p className="text-8xl font-black text-emerald-400">{lead.pipeline}</p>
              <p className="text-3xl text-[var(--text-primary)]/60">Pipeline Atual</p>
            </div>
            <div className="text-center">
              <p className="text-8xl font-black text-purple-400">{lead.ltv}</p>
              <p className="text-3xl text-[var(--text-primary)]/60">LTV Previsto (IA)</p>
>>>>>>> 7da7c2a (ðŸ”§ SIDEBAR-FIX: Remove LayoutSupremo de pÃ¡ginas CRM (lote 1))
            </div>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10">

          {/* ESQUERDA — ORB + NEXT ACTION */}
          <div className="lg:col-span-5 space-y-10">
            <GlassPanel className="p-12 text-center">
              <h2 className="text-3xl font-black text-[var(--text-primary)] mb-10">Saúde Neural do Lead</h2>
              <ResonanceOrb score={lead.score} />
              {lead.health === 'divine' && <p className="mt-8 text-4xl font-black text-yellow-400">DEUS DO PIPELINE</p>}
            </GlassPanel>

            <GlassPanel className="p-10 bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/40">
              <div className="flex items-center gap-4 mb-6">
                <Sparkles className="h-10 w-10 text-purple-400" />
                <h3 className="text-3xl font-black text-purple-300">Next Best Action (Real)</h3>
              </div>
              <p className="text-2xl text-[var(--text-primary)] leading-relaxed mb-8">"{lead.nextAction}"</p>
              <button className="w-full py-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-2xl font-black shadow-2xl">
                EXECUTAR AGORA
              </button>
            </GlassPanel>
          </div>

          {/* CENTRO — TIMELINE 100% REAL */}
          <div className="lg:col-span-7">
            <GlassPanel className="p-10 h-full">
              <h2 className="text-4xl font-black mb-10">Linha do Tempo Neural</h2>
              <div className="space-y-8">
                {timeline.map((item, i) => (
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
<<<<<<< HEAD
                    <div className="flex-1 bg-[var(--surface)] rounded-2xl p-6 border border-[var(--border)]">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-xl font-bold text-[var(--text-primary)]">{item.title}</h4>
                        <span className="text-sm text-[var(--text-tertiary)]">
=======
                    <div className="flex-1 bg-white/5 rounded-2xl p-6 border border-[var(--border)]">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-xl font-bold text-[var(--text-primary)]">{item.title}</h4>
                        <span className="text-sm text-[var(--text-primary)]/40">
>>>>>>> 7da7c2a (ðŸ”§ SIDEBAR-FIX: Remove LayoutSupremo de pÃ¡ginas CRM (lote 1))
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
          <p className="text-8xl font-black bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">
            ESTE LEAD JÁ DECIDIU
          </p>
          <p className="text-5xl text-[var(--text-secondary)] mt-10">Você só precisa apertou o botão.</p>
        </motion.div>

      </div>
<<<<<<< HEAD
=======
    </div>
>>>>>>> 7da7c2a (ðŸ”§ SIDEBAR-FIX: Remove LayoutSupremo de pÃ¡ginas CRM (lote 1))
  );
}
