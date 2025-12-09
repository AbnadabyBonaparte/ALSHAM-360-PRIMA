// src/pages/Leaderboard.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Leaderboard Alienígena 1000/1000
// O fogo eterno da competição. O trono da glória. O lugar onde lendas nascem.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA/blob/hotfix/recovery-prod/src/pages/Leaderboard.tsx

import LayoutSupremo from '@/components/LayoutSupremo';
import { 
  TrophyIcon, 
  FlameIcon, 
  StarIcon, 
  RocketIcon,
  CrownIcon,
  FireIcon,
  BoltIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface Champion {
  id: string;
  rank: number;
  name: string;
  avatar?: string;
  level: number;
  points: number;
  streak: number;
  badges: number;
  weeklyGain: number;
  title: string;
  department: string;
  trend: 'up' | 'down' | 'new' | 'same';
}

export default function LeaderboardPage() {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    async function loadHallOfFame() {
      const { 
      const { data, error } = await supabase
        .from('gamification_rankings')
        .select('id, name, avatar_url, nivel, pontos, streak, badges, weekly_gain, title, department')
        .order('pontos', { ascending: false })
        .limit(50);

      if (!error && data) {
        setChampions(data.map((p: any, i: number) => ({
          id: p.id,
          rank: i + 1,
          name: p.name,
          avatar: p.avatar_url,
          level: p.nivel || 1,
          points: p.pontos || 0,
          streak: p.streak || 0,
          badges: p.badges || 0,
          weeklyGain: p.weekly_gain || 0,
          title: p.title || 'Guerreiro Supremo',
          department: p.department || 'Operações',
          trend: p.weekly_gain > 500 ? 'up' : p.weekly_gain < -100 ? 'down' : p.weekly_gain > 0 ? 'new' : 'same'
        })));
      }
      setLoading(false);
    }

    loadHallOfFame();
  }, [timeframe]);

  const podium = champions.slice(0, 3);
  const mortals = champions.slice(3);

  return (
    <LayoutSupremo title="Hall da Glória Suprema">
      <div className="min-h-screen bg-black text-white p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-9xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
            HALL DA GLÓRIA
          </h1>
          <p className="text-5xl text-gray-300 mt-8 font-light">
            O fogo da competição nunca apaga
          </p>
          <div className="flex justify-center gap-8 mt-12">
            <button
              onClick={() => setTimeframe('week')}
              className={`px-12 py-6 rounded-3xl font-bold text-2xl transition-all ${timeframe === 'week' ? 'bg-gradient-to-r from-orange-600 to-red-600 shadow-2xl shadow-orange-500/50' : 'bg-white/10'}`}
            >
              Esta Semana
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-12 py-6 rounded-3xl font-bold text-2xl transition-all ${timeframe === 'month' ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-2xl shadow-purple-500/50' : 'bg-white/10'}`}
            >
              Este Mês
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`px-12 py-6 rounded-3xl font-bold text-2xl transition-all ${timeframe === 'all' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 shadow-2xl shadow-cyan-500/50' : 'bg-white/10'}`}
            >
              Todos os Tempos
            </button>
          </div>
        </motion.div>

        {/* PÓDIO SUPREMO */}
        <div className="max-w-7xl mx-auto mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {podium.map((hero, i) => (
              <motion.div
                key={hero.id}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.2 }}
                className={`relative ${i === 0 ? 'order-first md:order-2' : i === 1 ? 'order-1 md:order-1' : 'order-3 md:order-3'}`}
              >
                <div className="div"
                  className={`relative bg-gradient-to-br ${i === 0 ? 'from-yellow-600/60 via-orange-600/60 to-red-600/60' : i === 1 ? 'from-gray-600/60 to-gray-500/60' : 'from-orange-700/60 to-yellow-600/60'} rounded-3xl p-12 border-4 ${i === 0 ? 'border-yellow-500 shadow-2xl shadow-yellow-500/50' : 'border-gray-400'} backdrop-blur-xl`}
                >
                  {/* Coroa para o 1º lugar */}
                  {i === 0 && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute -top-12 left-1/2 -translate-x-1/2"
                    >
                      <CrownIcon className="w-32 h-32 text-yellow-400" />
                    </motion.div>
                  )}

                  {/* Medalha */}
                  <div className="text-center mb-8">
                    <div className={`text-9xl font-black mb-6 ${
                      i === 0 ? 'text-yellow-400' :
                      i === 1 ? 'text-gray-300' :
                      'text-orange-400'
                    }`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                    </div>
                  </div>

                  {/* Avatar + Nome */}
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div className="w-40 h-40 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-6xl font-bold text-white shadow-2xl mx-auto">
                        {hero.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 bg-black/80 rounded-full border-2 border-white/20 text-white font-bold">
                        Nível {hero.level}
                      </div>
                    </div>
                    <h2 className="text-5xl font-bold text-white mt-12">{hero.name}</h2>
                    <p className="text-2xl text-gray-300 mt-4">{hero.title}</p>
                    <p className="text-xl text-gray-400">{hero.department}</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-6 mt-12 text-center">
                    <div>
                      <p className="text-5xl font-black text-yellow-400">{hero.points.toLocaleString()}</p>
                      <p className="text-gray-400">pontos</p>
                    </div>
                    <div>
                      <p className="text-5xl font-black text-orange-400">{hero.streak}</p>
                      <p className="text-gray-400">streak</p>
                    </div>
                    <div>
                      <p className="text-5xl font-black text-cyan-400">{hero.badges}</p>
                      <p className="text-gray-400">conquistas</p>
                    </div>
                  </div>

                  {/* Trend */}
                  <div className="text-center mt-8">
                    {hero.trend === 'up' && <ArrowTrendingUpIcon className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />}
                    {hero.trend === 'down' && <ArrowTrendingDownIcon className="w-16 h-16 text-red-400 mx-auto" />}
                    {hero.trend === 'new' && <SparklesIcon className="w-16 h-16 text-pink-400 mx-auto animate-pulse" />}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* RESTANTE DO RANKING */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-12 text-gray-300">
            Os Imortais do ALSHAM
          </h2>
          <div className="space-y-6">
            {mortals.map((player) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -100 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-r from-gray-900/70 to-black/70 backdrop-blur-xl rounded-3xl p-10 border border-white/10 hover:border-primary/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    <div className="text-6xl font-black text-gray-500">
                      #{player.rank}
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white">{player.name}</h3>
                      <p className="text-xl text-gray-400">{player.title} • {player.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-5xl font-black text-primary">{player.points.toLocaleString()}</p>
                    <p className="text-gray-400">pontos • streak {player.streak}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* MENSAGEM FINAL */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center py-40 mt-32"
        >
          <FlameIcon className="w-48 h-48 text-orange-500 mx-auto mb-12 animate-pulse" />
          <p className="text-8xl font-light text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-pink-600">
            O FOGO NUNCA APAGA
          </p>
          <p className="text-4xl text-gray-400 mt-16">
            — Citizen Supremo X.1
          </p>
        </motion.div>
      </div>
    </LayoutSupremo>
  );
}
