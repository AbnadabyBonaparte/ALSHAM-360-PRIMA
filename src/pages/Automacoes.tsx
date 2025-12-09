// src/pages/Automacoes.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Automação Omnichannel 1000/1000
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA/blob/hotfix/recovery-prod/src/pages/Automacoes.tsx

import LayoutSupremo from '@/components/LayoutSupremo';
import { BoltIcon, PlayIcon, PauseIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

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

  return (
    <LayoutSupremo title="Automação Omnichannel Suprema">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header Supremo */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-8">
            <BoltIcon className="w-20 h-20 text-yellow-500 animate-pulse" />
            <div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
                Automação Omnichannel Suprema
              </h1>
              <p className="text-2xl text-gray-300 mt-4">
                {automations.length} fluxos ativos • {automations.reduce((a, b) => a + b.executions, 0).toLocaleString()} execuções
              </p>
            </div>
          </div>
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-10 py-6 rounded-2xl font-bold text-2xl shadow-2xl shadow-purple-500/50 transition-all transform hover:scale-105 flex items-center gap-4">
            <PlusIcon className="w-10 h-10" />
            Nova Automação
          </button>
        </div>

        {loading ? (
          <div className="text-center py-32">
            <div className="inline-block animate-spin w-24 h-24 border-8 border-yellow-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {automations.map(auto => (
              <div
                key={auto.id}
                className="bg-gradient-to-br from-gray-900/90 via-black/95 to-gray-900/90 backdrop-blur-2xl rounded-3xl border border-white/10 p-10 hover:border-yellow-500/50 transition-all hover:shadow-2xl hover:shadow-yellow-500/20"
              >
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white">{auto.name}</h2>
                    <p className="text-gray-400 mt-2">Trigger: {auto.trigger}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-6 py-3 rounded-full font-bold text-lg ${
                      auto.status === 'active' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                        : auto.status === 'paused'
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                        : 'bg-red-500/20 text-red-400 border border-red-500/50'
                    }`}>
                      {auto.status === 'active' ? '● ATIVA' : auto.status === 'paused' ? '⏸ PAUSADA' : '✖ ERRO'}
                    </span>
                    <button
                      onClick={() => toggleStatus(auto.id, auto.status)}
                      className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
                    >
                      {auto.status === 'active' ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {auto.actions.map((action, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <p className="text-gray-300">→ {action}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-4xl font-bold text-cyan-400">{auto.executions.toLocaleString()}</p>
                    <p className="text-gray-400">execuções</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-green-400">{auto.success_rate.toFixed(1)}%</p>
                    <p className="text-gray-400">sucesso</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-300">
                      {new Date(auto.last_run).toLocaleString('pt-BR')}
                    </p>
                    <p className="text-gray-500 text-sm">última execução</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Se não tiver nenhuma automação */}
        {automations.length === 0 && !loading && (
          <div className="text-center py-32">
            <BoltIcon className="w-32 h-32 text-gray-600 mx-auto mb-8" />
            <p className="text-4xl text-gray-400 font-light">Nenhuma automação ativa</p>
            <p className="text-2xl text-gray-500 mt-6">
              Crie sua primeira automação e o Citizen Supremo X.1 vai começar a trabalhar por você 24/7
            </p>
          </div>
        )}
      </div>
    </LayoutSupremo>
  );
}
