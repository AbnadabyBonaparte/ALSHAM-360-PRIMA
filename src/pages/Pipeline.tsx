// src/pages/Pipeline.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Pipeline Alienígena 1000/1000
// Onde o dinheiro nasce. Onde a IA decide. Onde você reina.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA/blob/hotfix/recovery-prod/src/pages/Pipeline.tsx

import LayoutSupremo from '@/components/LayoutSupremo';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  TrendingUpIcon,
  FireIcon,
  ZapIcon,
  TrophyIcon,
  BrainIcon,
  SparklesIcon,
  ArrowRightIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  owner: string;
  days_in_stage: number;
  close_date: string;
  next_action: string;
  health: 'critical' | 'warning' | 'healthy' | 'hot';
  ai_insight: string;
}

const stages = [
  { name: 'Qualificação', color: 'from-blue-600/80 to-cyan-600/80', icon: '🔍' },
  { name: 'Proposta', color: 'from-purple-600/80 to-pink-600/80', icon: '📄' },
  { name: 'Negociação', color: 'from-orange-600/80 to-red-600/80', icon: '🤝' },
  { name: 'Fechamento', color: 'from-yellow-600/80 to-amber-600/80', icon: '✍️' },
  { name: 'Ganho', color: 'from-emerald-600/80 to-teal-600/80', icon: '🏆' },
  { name: 'Perdido', color: 'from-gray-600/60 to-gray-700/60', icon: '💀' }
];

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremePipeline() {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('value', { ascending: false });

      if (!error && data) {
        setDeals(data.map((d: any) => ({
          id: d.id,
          name: d.name || 'Deal sem nome',
          company: d.company || 'Empresa X',
          value: d.value || 0,
          stage: d.stage || 'Qualificação',
          probability: d.ai_probability || 0,
          owner: d.owner_name || 'Você',
          days_in_stage: d.days_in_stage || 0,
          close_date: d.close_date || addDays(new Date(), 30).toISOString(),
          next_action: d.ai_next_action || 'Enviar proposta',
          health: d.ai_health || 'healthy',
          ai_insight: d.ai_insight || 'IA analisando...'
        })));
      }
      setLoading(false);
    }

    loadSupremePipeline();
  }, []);

  const stats = {
    totalValue: deals.reduce((s, d) => s + d.value, 0),
    weightedValue: deals.reduce((s, d) => s + d.value * d.probability / 100, 0),
    totalDeals: deals.length,
    hotDeals: deals.filter(d => d.health === 'hot').length,
    criticalDeals: deals.filter(d => d.health === 'critical').length,
    avgProbability: deals.length ? Math.round(deals.reduce((s, d) => s + d.probability, 0) / deals.length) : 0
  };

  return (
    <LayoutSupremo title="Pipeline Supremo">
      <div className="min-h-screen bg-black text-white p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-9xl font-black bg-gradient-to-r from-emerald-400 via-cyan-500 to-purple-600 bg-clip-text text-transparent">
            PIPELINE SUPREMO
          </h1>
          <p className="text-6xl text-gray-300 mt-12 font-light">
            R$ {stats.totalValue.toLocaleString('pt-BR')} em jogo
          </p>
          <p className="text-5xl text-emerald-400 mt-6">
            R$ {stats.weightedValue.toLocaleString('pt-BR')} valor real (IA)
          </p>
          <div className="flex justify-center gap-16 mt-16">
            <div className="text-center">
              <p className="text-8xl font-black text-orange-400">{stats.hotDeals}</p>
              <p className="text-3xl text-gray-400">Deals quentes</p>
            </div>
            <div className="text-center">
              <p className="text-8xl font-black text-red-400">{stats.criticalDeals}</p>
              <p className="text-3xl text-gray-400">Em risco</p>
            </div>
            <div className="text-center">
              <p className="text-8xl font-black text-cyan-400">{stats.avgProbability}%</p>
              <p className="text-3xl text-gray-400">Probabilidade média</p>
            </div>
          </div>
        </motion.div>

        {/* PIPELINE VISUAL */}
        <div className="max-w-full overflow-x-auto">
          <div className="flex gap-8 pb-8" style={{ minWidth: '2000px' }}>
            {stages.map((stage, i) => {
              const stageDeals = deals.filter(d => d.stage === stage.name);
              const stageValue = stageDeals.reduce((s, d) => s + d.value, 0);
              const stageWeighted = stageDeals.reduce((s, d) => s + d.value * d.probability / 100, 0);

              return (
                <motion.div
                  key={stage.name}
                  initial={{ opacity: 0, x: -200 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex-1 min-w-96 bg-gradient-to-br ${stage.color} rounded-3xl p-10 border-4 ${
                    stage.name === 'Ganho' ? 'border-emerald-500 shadow-2xl shadow-emerald-500/50' :
                    stage.name === 'Perdido' ? 'opacity-70' : 'border-white/20'
                  } backdrop-blur-xl`}
                >
                  <div className="text-center mb-10">
                    <div className="text-6xl mb-6">{stage.icon}</div>
                    <h2 className="text-5xl font-black text-white mb-4">{stage.name}</h2>
                    <p className="text-7xl font-black text-white">
                      R$ {stageValue.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-3xl text-white/80 mt-4">
                      {stageDeals.length} deals • {stageWeighted.toLocaleString('pt-BR')} ponderado
                    </p>
                  </div>

                  <div className="space-y-6">
                    {stageDeals.map((deal, j) => (
                      <motion.div
                        key={deal.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: j * 0.05 }}
                        className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-primary/70 transition-all hover:shadow-2xl hover:shadow-primary/30 cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-2xl font-bold text-white group-hover:text-primary transition-colors">
                            {deal.name}
                          </h3>
                          <div className={`px-6 py-3 rounded-full font-black text-xl ${
                            deal.health === 'hot' ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                            deal.health === 'critical' ? 'bg-gradient-to-r from-red-600 to-pink-600' :
                            'bg-white/10'
                          }`}>
                            {deal.probability}%
                          </div>
                        </div>
                        <p className="text-xl text-gray-300 mb-4">{deal.company}</p>
                        <p className="text-4xl font-black text-emerald-400 mb-4">
                          R$ {deal.value.toLocaleString('pt-BR')}
                        </p>
                        <div className="flex items-center justify-between text-gray-400">
                          <span className="flex items-center gap-2">
                            <UserIcon className="w-6 h-6" />
                            {deal.owner}
                          </span>
                          <span className="flex items-center gap-2">
                            <ClockIcon className="w-6 h-6" />
                            {deal.days_in_stage} dias
                          </span>
                        </div>
                        <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl border border-purple-500/30">
                          <p className="text-purple-300 font-bold flex items-center gap-3">
                            <BrainIcon className="w-8 h-8" />
                            {deal.next_action}
                          </p>
                        </div>
                      </motion.div>
                    ))}
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
          <TrophyIcon className="w-64 h-64 text-yellow-500 mx-auto mb-16 animate-pulse" />
          <p className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-500 to-purple-600">
            O DINHEIRO ESTÁ AQUI
          </p>
          <p className="text-6xl text-gray-300 mt-16 font-light">
            E a IA já sabe exatamente quem vai pagar.
          </p>
          <p className="text-5xl text-gray-400 mt-12">
            — Citizen Supremo X.1
          </p>
        </motion.div>
      </div>
    </LayoutSupremo>
  );
}
