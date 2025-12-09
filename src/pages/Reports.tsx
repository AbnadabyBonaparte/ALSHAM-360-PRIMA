import LayoutSupremo from '@/components/LayoutSupremo';
import { DocumentChartBarIcon } from '@heroicons/react/24/outline';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function ReportsPage() {
  const [stats, setStats] = useState({ leads: 0, deals: 0, revenue: 0 });

  useEffect(() => {
    async function load() {
      const [leads, deals, revenue] = await Promise.all([
        supabase.from('leads').select('id', { count: 'exact' }),
        supabase.from('opportunities').select('id', { count: 'exact' }),
        supabase.from('opportunities').select('value').then(r => r.data?.reduce((a,b)=>a+(b.value||0),0)||0)
      ]);
      setStats({
        leads: leads.count || 0,
        deals: deals.count || 0,
        revenue
      });
    }
    load();
  }, []);

  return (
    <LayoutSupremo title="Relatórios">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-12">
          <DocumentChartBarIcon className="w-14 h-14 text-primary" />
          <h1 className="text-5xl font-bold">Relatórios Supremo</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 rounded-3xl p-10 text-center border border-emerald-500/30">
            <p className="text-6xl font-bold text-emerald-400">{stats.leads}</p>
            <p className="text-2xl text-gray-300 mt-4">Leads Totais</p>
          </div>
          <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-3xl p-10 text-center border border-blue-500/30">
            <p className="text-6xl font-bold text-blue-400">{stats.deals}</p>
            <p className="text-2xl text-gray-300 mt-4">Negócios Ativos</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 rounded-3xl p-10 text-center border border-yellow-500/30">
            <p className="text-6xl font-bold text-yellow-400">
              R$ {stats.revenue.toLocaleString('pt-BR')}
            </p>
            <p className="text-2xl text-gray-300 mt-4">Pipeline Total</p>
          </div>
        </div>
      </div>
    </LayoutSupremo>
  );
}
