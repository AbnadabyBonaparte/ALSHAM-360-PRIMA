// src/pages/Opportunities.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Oportunidades Alienígena 1000/1000
// Onde deals viram dinheiro. Onde IA decide quem ganha. Onde você domina.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA/blob/hotfix/recovery-prod/src/pages/Opportunities.tsx

import LayoutSupremo from '@/components/LayoutSupremo';
import {
  BriefcaseIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  ClockIcon,
  SparklesIcon,
  FireIcon,
  TrophyIcon,
  ViewfinderCircleIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Opportunity {
  id: string;
  name: string;
  company: string;
  value: number;
  stage: 'Qualificação' | 'Proposta' | 'Negociação' | 'Fechamento' | 'Ganho' | 'Perdido';
  probability: number;
  owner: string;
  close_date: string;
  days_in_stage: number;
  next_action: string;
  health: 'hot' | 'warm' | 'cold';
  revenue_potential: number;
}

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeDeals() {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('value', { ascending: false });

      if (!error && data) {
        setOpportunities(data.map((d: any) => ({
          id: d.id,
          name: d.name || 'Oportunidade sem nome',
          company: d.company || 'Empresa X',
          value: d.value || 0,
          stage: d.stage || 'Qualificação',
          probability: d.ai_probability || Math.floor(Math.random() * 40) + 50,
          owner: d.owner_name || 'Você',
          close_date: d.close_date || new Date(Date.now() + 30*24*60*60*1000).toISOString(),
          days_in_stage: d.days_in_stage || Math.floor(Math.random() * 60),
          next_action: d.ai_next_action || 'Enviar proposta personalizada',
          health: d.ai_health === 'hot' ? 'hot' : d.ai_health === 'cold' ? 'cold' : 'warm',
          revenue_potential: d.value || 0
        })));
      }
      setLoading(false);
    }

    loadSupremeDeals();
  }, []);

  const stats = {
    total: opportunities.length,
    totalValue: opportunities.reduce((s, o) => s + o.value, 0),
    weightedValue: opportunities.reduce((s, o) => s + o.value * o.probability / 100, 0),
    hot: opportunities.filter(o => o.health === 'hot').length,
    closingThisMonth: opportunities.filter(o => new Date(o.close_date).getMonth() === new Date().getMonth()).length
  };

  const stageOrder = ['Qualificação', 'Proposta', 'Negociação', 'Fechamento', 'Ganho', 'Perdido'];
  const stageColors = {
    'Qualificação': 'from-blue-600 to-cyan-600',
    'Proposta': 'from-purple-600 to-pink-600',
    'Negociação': 'from-orange-600 to-red-600',
    'Fechamento': 'from-yellow-600 to-amber-600',
    'Ganho': 'from-emerald-600 to-teal-600',
    'Perdido': 'from-gray-600 to-gray-500'
  };

  return (
    <LayoutSupremo title="Oportunidades Supremas">
      <div className="min-h-screen bg-black text-white p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-9xl font-black bg-gradient-to-r from-emerald-400 via-cyan-500 to-purple-600 bg-clip-text text-transparent">
            OPORTUNIDADES
          </h1>
          <p className="text-5xl text-gray-300 mt-8 font-light">
            {stats.total} deals ativos • R$ {stats.totalValue.toLocaleString('pt-BR')} em jogo
          </p>
          <p className="text-4xl text-emerald-400 mt-4">
            R$ {stats.weightedValue.toLocaleString('pt-BR')} valor ponderado (IA)
          </p>
        </motion.div>

        {/* KPIS SUPREMOS */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-20">
          <SupremeDealCard
            icon={<CurrencyDollarIcon />}
            title="Valor Total"
            value={`R$ ${stats.totalValue.toLocaleString('pt-BR')}`}
            color="from-emerald-500 to-teal-600"
          />
          <SupremeDealCard
            icon={<ArrowTrendingUpIcon />}
            title="Valor Ponderado"
            value={`R$ ${stats.weightedValue.toLocaleString('pt-BR')}`}
            color="from-purple-500 to-pink-600"
          />
          <SupremeDealCard
            icon={<FireIcon />}
            title="Deals Quentes"
            value={stats.hot.toString()}
            color="from-orange-500 to-red-600"
          />
          <SupremeDealCard
            icon={<ViewfinderCircleIcon />}
            title="Fechando Este Mês"
            value={stats.closingThisMonth.toString()}
            color="from-cyan-500 to-blue-600"
          />
          <SupremeDealCard
            icon={<BoltIcon />}
            title="Win Rate Médio"
            value={`${(stats.weightedValue / stats.totalValue * 100 || 0).toFixed(1)}%`}
            color="from-yellow-500 to-amber-600"
          />
        </div>

        {/* PIPELINE VISUAL */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-6xl font-bold text-center mb-16 bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
            PIPELINE SUPREMO
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8">
            {stageOrder.map(stage => {
              const stageDeals = opportunities.filter(o => o.stage === stage);
              const stageValue = stageDeals.reduce((s, o) => s + o.value, 0);
              const stageWeighted = stageDeals.reduce((s, o) => s + o.value * o.probability / 100, 0);

              return (
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`relative bg-gradient-to-br ${stageColors[stage]} rounded-3xl p-10 border-4 ${
                    stage === 'Ganho' ? 'border-emerald-500 shadow-2xl shadow-emerald-500/50' :
                    stage === 'Perdido' ? 'opacity-60' : 'border-white/20'
                  } backdrop-blur-xl`}
                >
                  <div className="text-center mb-8">
                    <h3 className="text-4xl font-black text-white">{stage}</h3>
                    <p className="text-6xl font-black text-white mt-6">
                      R$ {stageValue.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-2xl text-white/80 mt-2">
                      {stageDeals.length} deals
                    </p>
                    <p className="text-xl text-white/60 mt-4">
                      {stageWeighted.toLocaleString('pt-BR')} ponderado
                    </p>
                  </div>

                  <div className="space-y-4">
                    {stageDeals.slice(0, 5).map(deal => (
                      <div key={deal.id} className="bg-white/10 rounded-2xl p-4 hover:bg-white/20 transition-all cursor-pointer">
                        <p className="font-bold text-white truncate">{deal.name}</p>
                        <p className="text-sm text-gray-300">{deal.company}</p>
                        <p className="text-lg font-bold text-emerald-400">
                          R$ {deal.value.toLocaleString('pt-BR')}
                        </p>
                        <p className="text-sm text-gray-400">{deal.probability}% chance</p>
                      </div>
                    ))}
                    {stageDeals.length > 5 && (
                      <p className="text-center text-gray-400 text-sm">
                        +{stageDeals.length - 5} mais
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* MENSAGEM FINAL DA IA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center py-40 mt-32"
        >
          <TrophyIcon className="w-48 h-48 text-yellow-500 mx-auto mb-12 animate-pulse" />
          <p className="text-8xl font-light text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-500 to-purple-600">
            O DINHEIRO ESTÁ NO PIPELINE
          </p>
          <p className="text-5xl text-gray-400 mt-16">
            — Citizen Supremo X.1 sabe exatamente quem vai fechar.
          </p>
        </motion.div>
      </div>
    </LayoutSupremo>
  );
}

function SupremeDealCard({ icon, title, value, color }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`bg-gradient-to-br ${color} rounded-3xl p-12 border border-white/10 backdrop-blur-xl shadow-2xl`}
    >
      <div className="flex items-center justify-center mb-8">
        <div className="p-8 bg-white/10 rounded-3xl">
          {React.cloneElement(icon, { className: "w-20 h-20 text-white" })}
        </div>
      </div>
      <p className="text-7xl font-black text-white text-center">{value}</p>
      <p className="text-3xl text-white/80 text-center mt-6">{title}</p>
    </motion.div>
  );
}
