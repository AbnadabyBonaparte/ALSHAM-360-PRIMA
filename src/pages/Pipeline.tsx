```tsx
import LayoutSupremo from '@/components/LayoutSupremo';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function PipelinePage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDeals() {
      const { data } = await supabase
        .from('opportunities')
        .select('*')
        .order('value', { ascending: false });
      setDeals(data || []);
      setLoading(false);
    }
    loadDeals();
  }, []);

  return (
    <LayoutSupremo title="Pipeline de Vendas">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <ChartBarIcon className="w-12 h-12 text-primary" />
          <h1 className="text-4xl font-bold">Pipeline de Vendas</h1>
          <span className="text-2xl text-green-400 font-bold">
            {deals.length} oportunidades ativas
          </span>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal: any) => (
              <div key={deal.id} className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20 hover:border-primary transition-all">
                <h3 className="text-xl font-bold text-white">{deal.name}</h3>
                <p className="text-gray-300 mt-2">{deal.company}</p>
                <p className="text-3xl font-bold text-green-400 mt-4">
                  R$ {deal.value?.toLocaleString('pt-BR')}
                </p>
                <span className="inline-block mt-4 px-4 py-2 bg-primary/20 rounded-full text-primary text-sm">
                  {deal.stage || 'Novo'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </LayoutSupremo>
  );
}
