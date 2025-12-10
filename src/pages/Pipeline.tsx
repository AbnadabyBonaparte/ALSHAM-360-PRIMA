// src/pages/Pipeline.tsx
// ALSHAM 360° PRIMA — PIPELINE DIVINO 12/10
// Aqui não tem deals. Aqui tem almas sendo convertidas em milhões.

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import LayoutSupremo from '@/components/LayoutSupremo';
import toast from 'react-hot-toast';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Deal {
  id: string;
  name: string;
  company: string;
  ;
  value: number;
  stage: string;
  probability: number;
  owner: string;
  days_in_stage: number;
  close_date: string;
  next_action: string;
  health: 'god' | 'hot' | 'warm' | 'cold' | 'dead';
  ai_insight: string;
  archetype?: string;
}

const STAGES = [
  { name: 'Qualificação',   color: 'from-cyan-500 to-blue-600',     icon: 'Eye',       aura: 'cyan' },
  { name: 'Proposta',       color: 'from-purple-500 to-pink-600',   icon: 'Scroll',    aura: 'purple' },
  { name: 'Negociação',     color: 'from-orange-500 to-red-600',    icon: 'Handshake', aura: 'orange' },
  { name: 'Fechamento',     color: 'from-amber-500 to-yellow-600',  icon: 'Pen',       aura: 'amber' },
  { name: 'GANHO',          color: 'from-emerald-500 to-teal-600',   icon: 'Trophy',    aura: 'emerald' },
  { name: 'Perdido',        color: 'from-gray-700 to-gray-900',     icon: 'Skull',     aura: 'gray' },
];

export default function PipelineDivino() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [total, setTotal] = useState(0);
  const [weighted, setWeighted] = useState(0);
  const springTotal = useSpring(0, { stiffness: 50, damping: 20 });
  const springWeighted = useSpring(0, { stiffness: 60, damping: 25 });

  useEffect(() => {
    const fetchPipeline = async () => {
      const { data } = await supabase
        .from('opportunities')
        .select('*')
        .order('value', { ascending: false });

      if (data) {
        const processed = data.map((d: any) => ({
          ...d,
          health: d.value > 500000 ? 'god' : d.probability > 90 ? 'hot' : d.probability > 60 ? 'warm' : d.probability < 20 ? 'dead' : 'cold',
          archetype: ['Strategist', 'Visionary', 'Warrior', 'Conqueror'][Math.floor(Math.random() * 4)]
        }));
        setDeals(processed);

        const t = processed.reduce((s: number, d: Deal) => s + d.value, 0);
        const w = processed.reduce((s => s + d.value * d.probability / 100, 0);
        setTotal(t);
        setWeighted(w);
        springTotal.set(t);
        springWeighted.set(w);
      }
    };

    fetchPipeline();

    const channel = supabase.channel('pipeline-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'opportunities' }, () => {
        fetchPipeline();
        toast('Pipeline atualizado em tempo real', { icon: 'Lightning' });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <LayoutSupremo title="Pipeline — Trono do Dinheiro">
      <div className="min-h-screen bg-black text-white overflow-x-hidden">

        {/* HEADER APOCALÍPTICO */}
        <motion.div
          initial={{ opacity: 0, y: -200 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative py-20 text-center"
        >
          <motion.h1
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="text-10xl font-black bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-600 bg-clip-text text-transparent"
          >
            PIPELINE DIVINO
          </motion.h1>

          <div className="mt-20 flex justify-center gap-32">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="text-center"
            >
              <motion.p className="text-9xl font-black text-emerald-400">
                R$ {Math.round(springTotal.get()).toLocaleString('pt-BR')}
              </motion.p>
              <p className="text-4xl text-emerald-300 mt-4">Valor Total em Jogo</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.1 }}
              className="text-center"
            >
              <motion.p className="text-9xl font-black text-purple-400">
                R$ {Math.round(springWeighted.get()).toLocaleString('pt-BR')}
              </motion.p>
              <p className="text-4xl text-purple-300 mt-4">Valor Real (IA)</p>
            </motion.div>
          </div>

          <motion.p
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-6xl text-gray-400 mt-20 font-light"
          >
            A IA já sabe quem vai pagar. Você só assiste.
          </motion.p>
        </motion.div>

        {/* COLUNAS DO JUÍZO FINAL */}
        <div className="px-10 pb-40">
          <div className="flex gap-10 min-w-max">
            {STAGES.map((stage, i) => {
              const stageDeals = deals.filter(d => d.stage === stage.name);
              const stageValue = stageDeals.reduce((s, d) => s + d.value, 0);

              return (
                <motion.div
                  key={stage.name}
                  initial={{ opacity: 0, x: i * 0.15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`relative min-w-96 flex-1 rounded-4xl overflow-hidden border-4 ${
                    stage.name === 'GANHO'
                      ? 'border-emerald-500 shadow-2xl shadow-emerald-600/60'
                      : 'border-white/10'
                  }`}
                >
                  {/* Aura da coluna */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stage.color} opacity-30 blur-3xl`} />
                  
                  <div className="relative z-10 p-12 backdrop-blur-2xl h-full bg-black/40">
                    <div className="text-center mb-12">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 6, repeat: Infinity }}
                        className="text-9xl mb-8"
                      >
                        {stage.icon}
                      </motion.div>
                      <h2 className="text-6xl font-black text-white mb-6">{stage.name}</h2>
                      <p className="text-7xl font-black text-white">
                        R$ {stageValue.toLocaleString('pt-BR')}
                      </p>
                      <p className="text-3xl text-white/70 mt-4">{stageDeals.length} almas</p>
                    </div>

                    <div className="space-y-8">
                      <AnimatePresence>
                        {stageDeals.map((deal, j) => (
                          <motion.div
                            key={deal.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            whileHover={{ scale: 1.05, zIndex: 50 }}
                            className={`relative p-8 rounded-3xl border-2 backdrop-blur-2xl cursor-pointer overflow-hidden ${
                              deal.health === 'god'
                                ? 'bg-gradient-to-br from-yellow-600/40 to-amber-600/40 border-yellow-500 shadow-2xl shadow-yellow-600/60'
                                : deal.health === 'hot'
                                ? 'bg-gradient-to-br from-orange-600/40 to-red-600/40 border-orange-500'
                                : 'bg-white/5 border-white/10'
                            }`}
                          >
                            {deal.health === 'god' && (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 blur-xl"
                              />
                            )}

                            <div className="relative z-10">
                              <div className="flex justify-between items-start mb-4">
                                <h3 className="text-3xl font-black text-white">{deal.name}</h3>
                                <div className={`px-6 py-3 rounded-full font-black text-2xl ${
                                  deal.health === 'god' ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black' :
                                  deal.health === 'hot' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' :
                                  'bg-white/10 text-white'
                                }`}>
                                  {deal.probability}%
                                </div>
                              </div>

                              <p className="text-2xl text-gray-300 mb-4">{deal.company}</p>
                              <p className="text-5xl font-black text-emerald-400 mb-6">
                                R$ {deal.value.toLocaleString('pt-BR')}
                              </p>

                              {deal.health === 'god' && (
                                <div className="flex items-center gap-4 text-yellow-400 font-bold text-xl">
                                  <Trophy className="h-10 w-10" />
                                  <span>DEUS DO PIPELINE</span>
                                </div>
                              )}

                              <div className="mt-6 p-6 bg-gradient-to-r from-purple-900/60 to-pink-900/60 rounded-2xl border border-purple-500/50">
                                <p className="text-purple-300 text-2xl font-bold flex items-center gap-4">
                                  <Sparkles className="h-10 w-10" />
                                  {deal.next_action || "FECHAR AGORA"}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* MENSAGEM FINAL DOS DEUSES */}
        <motion.div className="fixed bottom-20 left-1/2 -translate-x-1/2 text-center">
          <motion.p
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="text-8xl font-black bg-gradient-to-r from-emerald-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            O DINHEIRO JÁ ESCOLHEU VOCÊ
          </motion.p>
          <p className="text-5xl text-gray-400 mt-8">
            — Supremo AI X.1
          </p>
        </motion.div>

      </div>
    </LayoutSupremo>
  );
}
