// src/pages/Pipeline.tsx
// ALSHAM 360° PRIMA — PIPELINE QUÂNTICO (migrado para shadcn/ui)

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Search, Trophy, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  next_action?: string;
  health: 'divine' | 'hot' | 'warm' | 'cold' | 'fallen';
  ai_insight?: string;
}

const STAGES: Record<Stage, { label: string }> = {
  Qualificação: { label: 'Revelação' },
  Proposta: { label: 'Profecia' },
  Negociação: { label: 'Julgamento' },
  Fechamento: { label: 'Sacrifício' },
  Ganho: { label: 'APOTEOSE' },
  Perdido: { label: 'Exílio' },
};

const DealCard = ({ deal }: { deal: Deal }) => {
  const daysOld = Math.floor((Date.now() - new Date(deal.created_at).getTime()) / 86400000);
  const isStale = daysOld > 14 && deal.stage !== 'Ganho';

  return (
    <Reorder.Item value={deal} whileDrag={{ scale: 1.05, zIndex: 50 }}>
      <Card
        className={`
          relative cursor-grab active:cursor-grabbing overflow-hidden
          ${deal.health === 'divine' ? 'bg-gradient-to-br from-[var(--accent-sky)]/40 via-[var(--accent-purple)]/30 to-[var(--accent-sky)]/40 border-[var(--accent-sky)] shadow-2xl shadow-[var(--accent-sky)]/40' :
            deal.stage === 'Ganho' ? 'bg-gradient-to-br from-[var(--accent-emerald)]/30 to-[var(--accent-sky)]/30 border-[var(--accent-emerald)]/50' :
            'bg-[var(--surface)]/70 border-[var(--border)]'}
          ${isStale ? 'opacity-70 grayscale' : ''}
        `}
      >
        {deal.health === 'divine' && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-[var(--accent-sky)]/20 to-transparent blur-xl"
          />
        )}
        <CardContent className="relative z-10 p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs text-[var(--text-primary)]/60 uppercase tracking-wider">{deal.company}</p>
              <h3 className="font-black text-[var(--text-primary)] text-lg mt-1">{deal.name}</h3>
            </div>
            <div className="flex items-center gap-2">
              {deal.health === 'divine' && <Trophy className="h-6 w-6 text-[var(--accent-sky)]" />}
              {deal.health === 'hot' && <Flame className="h-6 w-6 text-[var(--accent-warning)] animate-pulse" />}
            </div>
          </div>
          <p className="text-3xl font-black text-[var(--accent-sky)] my-3">
            R$ {deal.value.toLocaleString('pt-BR')}
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-primary)]/70">{deal.probability}% chance</span>
            <span className="text-[var(--text-primary)]/50">{daysOld}d</span>
          </div>
          {deal.ai_insight && (
            <div className="mt-4 p-3 bg-[var(--accent-sky)]/20 rounded-xl border border-[var(--accent-sky)]/30">
              <p className="text-[var(--accent-sky)] text-sm font-medium">{deal.ai_insight}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </Reorder.Item>
  );
};

export default function PipelineQuantico() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDeals = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: queryError } = await supabase
          .from('opportunities')
          .select('*')
          .order('created_at', { ascending: false });

        if (queryError) {
          console.error('Erro ao carregar oportunidades:', queryError);
          setError('Não foi possível carregar o pipeline. Verifique a tabela opportunities.');
          return;
        }

        if (data) {
          const enriched: Deal[] = data.map((d: any) => ({
            ...d,
            health: d.value > 1000000 ? 'divine' :
                    d.probability > 90 ? 'hot' :
                    d.probability > 60 ? 'warm' :
                    d.probability < 20 ? 'fallen' : 'cold'
          }));
          setDeals(enriched);
        }
      } catch (err) {
        console.error('Erro inesperado:', err);
        setError('Erro de conexão com o banco.');
      } finally {
        setLoading(false);
      }
    };

    loadDeals();

    // Realtime subscription (multi-org seguro via RLS)
    const channel = supabase
      .channel('pipeline-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'opportunities' }, () => {
        loadDeals();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredDeals = useMemo(() => {
    return deals.filter(d =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.company.toLowerCase().includes(search.toLowerCase())
    );
  }, [deals, search]);

  const columns = useMemo(() => {
    const map: Record<Stage, Deal[]> = {
      Qualificação: [], Proposta: [], Negociação: [], Fechamento: [], Ganho: [], Perdido: []
    };
    filteredDeals.forEach(d => map[d.stage]?.push(d));
    return map;
  }, [filteredDeals]);

  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
  const weightedValue = deals.reduce((sum, d) => sum + d.value * (d.probability / 100), 0);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-[var(--accent-sky)] mx-auto mb-6"></div>
          <p className="text-2xl text-[var(--text-primary)]/70">Despertando o Pipeline Quântico...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-lg">
          <p className="text-6xl mb-6">⚠️</p>
          <h2 className="text-3xl font-black text-[var(--text-primary)] mb-4">Pipeline Indisponível</h2>
          <p className="text-xl text-[var(--text-primary)]/70 mb-8">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-[var(--accent-sky)]/70 hover:bg-[var(--accent-sky)] text-[var(--background)] rounded-2xl font-bold text-lg"
          >
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[var(--background)] overflow-hidden">
      {/* TOOLBAR SUPERIOR */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)]/50 backdrop-blur-md p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-[var(--accent-sky)] to-[var(--accent-purple)] bg-clip-text text-transparent">
              DOMÍNIO REAL — PIPELINE QUÂNTICO
            </h1>
            <div className="flex gap-12 mt-6">
              <div>
                <p className="text-sm text-[var(--text-primary)]/60">Total em Pipeline</p>
                <p className="text-4xl font-black text-[var(--text-primary)]">R$ {totalValue.toLocaleString('pt-BR')}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--text-primary)]/60">Previsão Ponderada (IA)</p>
                <p className="text-4xl font-black text-[var(--accent-sky)]">R$ {weightedValue.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-[var(--text-primary)]/50" />
            <Input
              type="text"
              placeholder="Buscar deals por nome ou empresa..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-14 pr-6 py-4 bg-[var(--surface)]/70 border-[var(--border)] rounded-2xl text-lg w-96 text-[var(--text-primary)]"
            />
          </div>
        </div>
      </div>

      {/* KANBAN BOARD */}
      <div className="flex-1 overflow-auto p-8">
        <div className="flex gap-8 h-full">
          {Object.entries(STAGES).map(([key, config]) => {
            const stageDeals = columns[key as Stage];
            const stageTotal = stageDeals.reduce((sum, d) => sum + d.value, 0);

            return (
              <div key={key} className="flex-1 min-w-80">
                <Card className="bg-[var(--surface)]/40 backdrop-blur-md border-[var(--border)] rounded-3xl h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <h2 className="text-3xl font-black text-center text-[var(--text-primary)] mb-4">{config.label}</h2>
                    <p className="text-2xl font-bold text-center text-[var(--accent-sky)] mb-8">
                      R$ {stageTotal.toLocaleString('pt-BR')}
                    </p>
                    <Reorder.Group
                      axis="y"
                      values={stageDeals}
                      onReorder={async (newOrder) => {
                        // Atualiza estágio no Supabase (optimistic UI)
                        const updates = newOrder.map((deal, index) =>
                          supabase.from('opportunities').update({ stage: key }).eq('id', deal.id)
                        );
                        await Promise.all(updates);
                        toast.success(`Deal movido para ${config.label}`, { duration: 2000 });
                      }}
                      className="flex-1 space-y-4 overflow-y-auto"
                    >
                      <AnimatePresence>
                        {stageDeals.map(deal => (
                          <DealCard key={deal.id} deal={deal} />
                        ))}
                      </AnimatePresence>
                      {stageDeals.length === 0 && (
                        <p className="text-center text-[var(--text-primary)]/40 py-12 text-xl">Vazio neste estágio</p>
                      )}
                    </Reorder.Group>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* MENSAGEM ÉPICA FIXA */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <p className="text-5xl font-black bg-gradient-to-r from-[var(--accent-sky)] via-[var(--accent-purple)] to-[var(--accent-sky)] bg-clip-text text-transparent">
          O DINHEIRO JÁ ESCOLHEU VOCÊ
        </p>
      </div>
    </div>
  );
}
