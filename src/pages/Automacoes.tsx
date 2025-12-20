// src/pages/Automacoes.tsx
// ALSHAM 360° PRIMA — Automação Omnichannel (migrado para shadcn/ui)

import { BoltIcon, PlayIcon, PauseIcon, PlusIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Automation {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
  status: 'active' | 'paused' | 'error';
  executions: number;
  last_run: string;
  success_rate: number;
}

export default function AutomacoesPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAutomations() {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('id, name, trigger, actions, status, executions, last_run, success_rate')
        .order('executions', { ascending: false });

      if (!error && data) {
        setAutomations(data);
      }
      setLoading(false);
    }
    loadAutomations();

    // Realtime — se alguém disparar uma automação, atualiza na hora
    const channel = supabase
      .channel('automations-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'automation_rules' }, () => {
        loadAutomations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleStatus = async (id: string, current: string) => {
    await supabase
      .from('automation_rules')
      .update({ status: current === 'active' ? 'paused' : 'active' })
      .eq('id', id);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return {
          bg: 'bg-[var(--accent-emerald)]/20',
          text: 'text-[var(--accent-emerald)]',
          border: 'border-[var(--accent-emerald)]/50',
          label: '● ATIVA'
        };
      case 'paused':
        return {
          bg: 'bg-[var(--accent-warning)]/20',
          text: 'text-[var(--accent-warning)]',
          border: 'border-[var(--accent-warning)]/50',
          label: '⏸ PAUSADA'
        };
      default:
        return {
          bg: 'bg-[var(--accent-alert)]/20',
          text: 'text-[var(--accent-alert)]',
          border: 'border-[var(--accent-alert)]/50',
          label: '✖ ERRO'
        };
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
        {/* Header Supremo */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-8">
            <BoltIcon className="w-20 h-20 text-[var(--accent-warning)] animate-pulse" />
            <div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-[var(--accent-warning)] via-[var(--accent-warning)] to-[var(--accent-alert)] bg-clip-text text-transparent">
                Automação Omnichannel Suprema
              </h1>
              <p className="text-2xl text-[var(--text-secondary)] mt-4">
                {automations.length} fluxos ativos • {automations.reduce((a, b) => a + b.executions, 0).toLocaleString()} execuções
              </p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] hover:from-[var(--accent-purple)]/90 hover:to-[var(--accent-pink)]/90 px-10 py-6 rounded-2xl font-bold text-2xl shadow-2xl shadow-[var(--accent-purple)]/50 transition-all transform hover:scale-105 flex items-center gap-4">
            <PlusIcon className="w-10 h-10" />
            Nova Automação
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-32">
            <div className="inline-block animate-spin w-24 h-24 border-8 border-[var(--accent-warning)] border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {automations.map(auto => {
              const statusVariant = getStatusVariant(auto.status);

              return (
                <Card
                  key={auto.id}
                  className="bg-gradient-to-br from-[var(--surface)]/90 via-[var(--background)]/95 to-[var(--surface)]/90 backdrop-blur-2xl rounded-3xl border border-[var(--border)] hover:border-[var(--accent-warning)]/50 transition-all hover:shadow-2xl hover:shadow-[var(--accent-warning)]/20"
                >
                  <CardContent className="p-10">
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <h2 className="text-3xl font-bold text-[var(--text-primary)]">{auto.name}</h2>
                        <p className="text-[var(--text-secondary)] mt-2">Trigger: {auto.trigger}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge
                          variant="outline"
                          className={`${statusVariant.bg} ${statusVariant.text} ${statusVariant.border} px-6 py-3 rounded-full font-bold text-lg border`}
                        >
                          {statusVariant.label}
                        </Badge>
                        <Button
                          onClick={() => toggleStatus(auto.id, auto.status)}
                          variant="ghost"
                          className="p-4 bg-[var(--surface)]/10 hover:bg-[var(--surface)]/20 rounded-2xl transition-all"
                        >
                          {auto.status === 'active' ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      {auto.actions.map((action, i) => (
                        <div key={i} className="bg-[var(--surface)]/5 rounded-xl p-4 border border-[var(--border)]/30">
                          <p className="text-[var(--text-secondary)]">→ {action}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <p className="text-4xl font-bold text-[var(--accent-sky)]">{auto.executions.toLocaleString()}</p>
                        <p className="text-[var(--text-secondary)]">execuções</p>
                      </div>
                      <div>
                        <p className="text-4xl font-bold text-[var(--accent-emerald)]">{auto.success_rate.toFixed(1)}%</p>
                        <p className="text-[var(--text-secondary)]">sucesso</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[var(--text-primary)]">
                          {new Date(auto.last_run).toLocaleString('pt-BR')}
                        </p>
                        <p className="text-[var(--text-secondary)] text-sm">última execução</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Se não tiver nenhuma automação */}
        {automations.length === 0 && !loading && (
          <div className="text-center py-32">
            <BoltIcon className="w-32 h-32 text-[var(--text-secondary)] mx-auto mb-8" />
            <p className="text-4xl text-[var(--text-secondary)] font-light">Nenhuma automação ativa</p>
            <p className="text-2xl text-[var(--text-secondary)] mt-6">
              Crie sua primeira automação e o Citizen Supremo X.1 vai começar a trabalhar por você 24/7
            </p>
          </div>
        )}
      </div>
  );
}
