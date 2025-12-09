import LayoutSupremo from '@/components/LayoutSupremo';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface Deal {
  id: string;
  name: string;
  company: string;
  value: number;
  stage: string;
  probability: number;
  owner_name: string;
  close_date?: string;
}

const stages = ['Qualificação', 'Proposta', 'Negociação', 'Fechamento', 'Ganho', 'Perdido'];

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPipeline() {
      const { data, error } = await supabase
        .from('opportunities')
        .select('id, name, company, value, stage, probability, owner_name, close_date')
        .in('stage', stages)
        .order('value', { ascending: false });

      if (error) {
        console.error('Erro ao carregar pipeline:', error);
      } else {
        setDeals(data || []);
      }
      setLoading(false);
    }
    loadPipeline();
  }, []);

  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
  const weightedValue = deals.reduce((sum, d) => sum + (d.value || 0) * (d.probability || 0) / 100, 0);

  return (
    <LayoutSupremo title="Pipeline de Vendas">
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-6">
            <ChartBarIcon className="w-16 h-16 text-primary" />
            <div>
              <h1 className="text-5xl font-bold text-white">Pipeline de Vendas</h1>
              <p className="text-xl text-gray-400 mt-2">
                {deals.length} deals • R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl text-cyan-400 font-bold">
              R$ {weightedValue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </p>
            <p className="text-gray-400">Valor ponderado</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-32">
            <div className="animate-spin w-20 h-20 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-32">
            <ChartBarIcon className="w-32 h-32 text-gray-600 mx-auto mb-8" />
            <p className="text-3xl text-gray-400">Nenhum deal no pipeline</p>
            <p className="text-xl text-gray-500 mt-4">Crie sua primeira oportunidade para começar</p>
          </div>
        ) : (
          <div className="space-y-12">
            {stages.map(stage => {
              const stageDeals = deals.filter(d => d.stage === stage);
              const stageTotal = stageDeals.reduce((s, d) => s + (d.value || 0), 0);

              return (
                <div key={stage} className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-white">{stage}</h2>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        R$ {stageTotal.toLocaleString('pt-BR')}
                      </p>
                      <p className="text-gray-400">{stageDeals.length} deals</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stageDealsDeals.map(deal => (
                      <div
                        key={deal.id}
                        className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/10 hover:border-primary/50 transition-all cursor-pointer"
                      >
                        <h3 className="text-xl font-bold text-white">{deal.name}</h3>
                        <p className="text-gray-300 mt-1">{deal.company}</p>
                        <p className="text-3xl font-bold text-green-400 mt-4">
                          R$ {deal.value.toLocaleString('pt-BR')}
                        </p>
                        <div className="flex justify-between items-center mt-4">
                          <span className="text-sm text-gray-400">{deal.owner_name}</span>
                          <span className="px-4 py-1 bg-primary/20 rounded-full text-primary text-sm font-medium">
                            {deal.probability}% chance
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </LayoutSupremo>
  );
}
