// src/pages/Pipeline.tsx
// ALSHAM 360° PRIMA — PIPELINE QUÂNTICO: DOMÍNIO REAL
// Dados reais + Experiência divina = Você ganhou o jogo.

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Search, Sparkles, LightBulb, Flame, Trophy } from 'lucide-react';

type Stage = 'Qualificação' | 'Proposta' | 'Negociação' | 'Fechamento' | 'Ganho' | 'Perdido';

interface Deal {
  id: string;
  name: string;
  company: string;
  value: number;
  stage: Stage;
  probability: number;
  owner: string;
  created_at: string;
  next_action: string;
  health: 'divine' | 'hot' | 'warm' | 'cold' | 'fallen';
  ai_insight: string;
}

const STAGES: Record<Stage, { label: string; aura: string }> = {
  'Qualificação': { label: 'Revelação',      aura: 'from-cyan-400 to-blue-600' },
  'Proposta':     { label: 'Profecia',       aura: 'from-purple-500 to-pink-600' },
  'Negociação':   { label: 'Julgamento',     aura: 'from-orange-500 to-red-600' },
  'Fechamento':   { label: 'Sacrifício',     aura: 'from-amber-400 to-yellow-600' },
  'Ganho':        { label: 'APOTEOSE',        aura: 'from-emerald-400 to-teal-600' },
  'Perdido':      { label: 'Exílio',          aura: 'from-gray-800 to-black' },
};

const DealCard = ({ deal }: { deal: Deal }) => {
  const daysOld = Math.floor((Date.now() - new Date(deal.created_at).getTime()) / 86400000);
  const isStale = daysOld > 14 && deal.stage !== 'Ganho';

  return (
    <Reorder.Item value={deal} whileDrag={{ scale: 1.06, zIndex: 100 }}>
      <motion.div
        layout
        className={`
          relative p-6 rounded-2xl backdrop-blur-2xl border cursor-grab active:cursor-grabbing overflow-hidden
          ${deal.health === 'divine' ? 'bg-gradient-to-br from-yellow-600/40 via-amber-500/50 to-orange-600/40 border-yellow-500 shadow-2xl shadow-yellow-600/60' :
            deal.stage === 'Ganho' ? 'bg-emerald-900/30 border-emerald-500/40' :
            'bg-[var(--surface)] border-[var(--border)]'}
          ${isStale ? 'opacity-60 grayscale' : ''}
        `}
        whileHover={{ scale: 1.04, borderColor: 'rgba(255,255,255,0.3)' }}
      >
        {deal.health === 'divine' && (
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-transparent blur-xl" />
        )}

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs text-[var(--text)]/50 uppercase">{deal.company}</p>
              <h3 className="font-black text-[var(--text)] text-lg">{deal.name}</h3>
            </div>
            {deal.health === 'divine' && <Trophy className="h-8 w-8 text-yellow-400" />}
            {deal.health === 'hot' && <Flame className="h-8 w-8 text-orange-500 animate-pulse" />}
          </div>

          <p className="text-4xl font-black text-emerald-400 mb-4">
            R$ {deal.value.toLocaleString('pt-BR')}
          </p>

          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text)]/60">{deal.probability}% chance</span>
            <span className="text-[var(--text)]/40">{daysOld}d</span>
          </div>

          {deal.ai_insight && (
            <div className="mt-4 p-3 bg-purple-900/40 rounded-xl border border border-purple-500/40">
              <p className="text-purple-300 text-sm font-medium">{deal.ai_insight}</p>
            </div>
          )}
        </div>
      </motion.div>
    </Reorder.Item>
  );
};

export default function PipelineQuantico() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('opportunities').select('*');
      if (data) {
        const enriched = data.map(d => ({
          ...d,
          health: d.value > 1000000 ? 'divine' : d.probability > 90 ? 'hot' : d.probability > 60 ? 'warm' : d.probability < 20 ? 'fallen' : 'cold'
        }));
        setDeals(enriched);
      }
    };
    load();

    supabase.channel('pipeline-live').on('postgres_changes', { event: '*', schema: 'public', table: 'opportunities' }, () => load()).subscribe();
  }, []);

  const columns = useMemo(() => {
    const map: Record<Stage, Deal[]> = {
      'Qualificação': [], 'Proposta': [], 'Negociação': [], 'Fechamento': [], 'Ganho': [], 'Perdido': []
    };
    deals
      .filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.company.toLowerCase().includes(search.toLowerCase()))
      .forEach(d => map[d.stage as Stage]?.push(d));
    return map;
  }, [deals, search]);

  const total = deals.reduce((a, d) => a + d.value, 0);
  const weighted = deals.reduce((a, d) => a + d.value * d.probability / 100, 0);

  return (
    <div className="h-screen flex flex-col bg-[var(--bg)]">

        {/* HEADER DIVINO + REAL */}
        <div className="p-8 border-b border-[var(--border)] bg-gradient-to-b from-[var(--bg)]/80 to-transparent backdrop-blur-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-emerald-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                DOMÍNIO REAL
              </h1>
              <div className="flex gap-12 mt-6">
                <div><p className="text-5xl font-black text-emerald-400">R$ {total.toLocaleString('pt-BR')}</p><p className="text-[var(--text-2)]">Total</p></div>
                <div><p className="text-5xl font-black text-purple-400">R$ {weighted.toLocaleString('pt-BR')}</p><p className="text-[var(--text-2)]">Previsão IA</p></div>
                <div><p className="text-5xl font-black text-emerald-400">R$ {total.toLocaleString('pt-BR')}</p><p className="text-[var(--text)]/60">Total</p></div>
                <div><p className="text-5xl font-black-purple-400">R$ {weighted.toLocaleString('pt-BR')}</p><p className="text-[var(--text)]/60">Previsão IA</p></div>
              </div>
            </div>
            <input
              type="text"
              placeholder="Buscar deals..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-[var(--surface-strong)] border border-[var(--border)] rounded-2xl px-6 py-4 text-lg w-96 focus:border-purple-500/50 outline-none text-[var(--text)]"
            />
          </div>
        </div>

        {/* KANBAN QUÂNTICO */}
        <div className="flex-1 overflow-auto p-8">
          <div className="flex gap-8 min-w-max">
            {Object.entries(STAGES).map(([key, config]) => {
              const stageDeals = columns[key as Stage] || [];
              const stageTotal = stageDeals.reduce((a, d) => a + d.value, 0);

              return (
                <div key={key} className="w-96">
                  <motion.div className={`p-6 rounded-3xl bg-gradient-to-br ${config.aura} opacity-20 blur-2xl absolute -inset-4`} animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 6, repeat: Infinity }} />
                  <div className="relative bg-[var(--bg)]/60 backdrop-blur-3xl rounded-3xl border border-[var(--border)] p-6">
                    <h2 className="text-4xl font-black text-[var(--text)] mb-8 text-center">{config.label}</h2>
                    <p className="text-5xl font-black text-center text-[var(--text)] mb-8">R$ {stageTotal.toLocaleString('pt-BR')}</p>

                    <Reorder.Group axis="y" values={stageDeals} onReorder={newOrder => {
                      // Atualiza estágio no Supabase (optimistic UI)
                      newOrder.forEach((deal, idx) => {
                        supabase.from('opportunities').update({ stage: key }).eq('id', deal.id);
                      });
                      toast.success(`Deal movido para ${config.label}`);
                    }} className="space-y-4 min-h-screen">
                      <AnimatePresence>
                        {stageDeals.map(deal => <DealCard key={deal.id} deal={deal} />)}
                      </AnimatePresence>
                    </Reorder.Group>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MENSAGEM FINAL */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 text-center">
          <p className="text-6xl font-black bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">
            O DINHEIRO JÁ ESCOLHEU VOCÊ
          </p>
        </div>
      </div>
  );
}
