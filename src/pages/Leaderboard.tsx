// src/pages/Leaderboard.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Leaderboard Alienígena 1000/1000
// O fogo eterno da competição. O trono da glória. O lugar onde lendas nascem.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA
// ✅ MIGRADO PARA SHADCN/UI + CSS VARIABLES

import {
  TrophyIcon,
  FireIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    async function loadHallOfFame() {
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
    }

    loadHallOfFame();
  }, [timeframe]);

  const podium = champions.slice(0, 3);
  const mortals = champions.slice(3);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] p-8">
      {/* HEADER ÉPICO */}
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20"
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-[var(--accent-warning)] via-[var(--accent-alert)] to-[var(--accent-alert)] bg-clip-text text-transparent">
          HALL DA GLÓRIA
        </h1>
        <p className="text-5xl text-[var(--text-secondary)] mt-8 font-light">
          O fogo da competição nunca apaga
        </p>
        <div className="flex justify-center gap-8 mt-12">
          <Button
            onClick={() => setTimeframe('week')}
            variant={timeframe === 'week' ? 'default' : 'outline'}
            className={`px-12 py-6 rounded-3xl font-bold text-2xl ${timeframe === 'week' ? 'bg-gradient-to-r from-[var(--accent-warning)] to-[var(--accent-alert)] shadow-2xl shadow-[var(--accent-warning)]/50 text-[var(--background)]' : 'bg-[var(--surface)]/60'}`}
          >
            Esta Semana
          </Button>
          <Button
            onClick={() => setTimeframe('month')}
            variant={timeframe === 'month' ? 'default' : 'outline'}
            className={`px-12 py-6 rounded-3xl font-bold text-2xl ${timeframe === 'month' ? 'bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] shadow-2xl shadow-[var(--accent-purple)]/50 text-[var(--background)]' : 'bg-[var(--surface)]/60'}`}
          >
            Este Mês
          </Button>
          <Button
            onClick={() => setTimeframe('all')}
            variant={timeframe === 'all' ? 'default' : 'outline'}
            className={`px-12 py-6 rounded-3xl font-bold text-2xl ${timeframe === 'all' ? 'bg-gradient-to-r from-[var(--accent-sky)] to-[var(--accent-sky)] shadow-2xl shadow-[var(--accent-sky)]/50 text-[var(--background)]' : 'bg-[var(--surface)]/60'}`}
          >
            Todos os Tempos
          </Button>
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
              <Card
                className={`relative backdrop-blur-xl ${
                  i === 0 ? 'bg-gradient-to-br from-[var(--accent-warning)]/60 via-[var(--accent-alert)]/60 to-[var(--accent-warning)]/60 border-[var(--accent-warning)] shadow-2xl shadow-[var(--accent-warning)]/50' :
                  i === 1 ? 'bg-gradient-to-br from-[var(--text-secondary)]/60 to-[var(--text-secondary)]/40 border-[var(--text-secondary)]' :
                  'bg-gradient-to-br from-[var(--accent-alert)]/60 to-[var(--accent-warning)]/60 border-[var(--accent-warning)]'
                } border-4`}
              >
                <CardContent className="p-12">
                  {/* Coroa para o 1º lugar */}
                  {i === 0 && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute -top-12 left-1/2 -translate-x-1/2"
                    >
                      <TrophyIcon className="w-32 h-32 text-[var(--accent-warning)]" />
                    </motion.div>
                  )}

                  {/* Medalha */}
                  <div className="text-center mb-8">
                    <div className={`text-4xl md:text-5xl lg:text-6xl font-black mb-6 ${
                      i === 0 ? 'text-[var(--accent-warning)]' :
                      i === 1 ? 'text-[var(--text-secondary)]' :
                      'text-[var(--accent-alert)]'
                    }`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                    </div>
                  </div>

                  {/* Avatar + Nome */}
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div className="w-40 h-40 bg-gradient-to-br from-[var(--accent-1)] to-[var(--accent-purple)] rounded-full flex items-center justify-center text-6xl font-bold text-[var(--text-primary)] shadow-2xl mx-auto">
                        {hero.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <Badge className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 bg-[var(--background)]/80 border-2 border-[var(--border)] text-[var(--text-primary)] font-bold text-lg">
                        Nível {hero.level}
                      </Badge>
                    </div>
                    <h2 className="text-5xl font-bold text-[var(--text-primary)] mt-12">{hero.name}</h2>
                    <p className="text-2xl text-[var(--text-secondary)] mt-4">{hero.title}</p>
                    <p className="text-xl text-[var(--text-secondary)]/80">{hero.department}</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-6 mt-12 text-center">
                    <div>
                      <p className="text-5xl font-black text-[var(--accent-warning)]">{hero.points.toLocaleString()}</p>
                      <p className="text-[var(--text-secondary)]">pontos</p>
                    </div>
                    <div>
                      <p className="text-5xl font-black text-[var(--accent-alert)]">{hero.streak}</p>
                      <p className="text-[var(--text-secondary)]">streak</p>
                    </div>
                    <div>
                      <p className="text-5xl font-black text-[var(--accent-sky)]">{hero.badges}</p>
                      <p className="text-[var(--text-secondary)]">conquistas</p>
                    </div>
                  </div>

                  {/* Trend */}
                  <div className="text-center mt-8">
                    {hero.trend === 'up' && <ArrowTrendingUpIcon className="w-16 h-16 text-[var(--accent-emerald)] mx-auto animate-bounce" />}
                    {hero.trend === 'down' && <ArrowTrendingDownIcon className="w-16 h-16 text-[var(--accent-alert)] mx-auto" />}
                    {hero.trend === 'new' && <SparklesIcon className="w-16 h-16 text-[var(--accent-pink)] mx-auto animate-pulse" />}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* RESTANTE DO RANKING */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-5xl font-bold text-center mb-12 text-[var(--text-secondary)]">
          Os Imortais do ALSHAM
        </h2>
        <div className="space-y-6">
          {mortals.map((player) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <Card className="bg-[var(--surface)]/70 backdrop-blur-xl border-[var(--border)] hover:border-[var(--accent-1)]/50 transition-all">
                <CardContent className="p-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      <div className="text-6xl font-black text-[var(--text-secondary)]">
                        #{player.rank}
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-[var(--text-primary)]">{player.name}</h3>
                        <p className="text-xl text-[var(--text-secondary)]">{player.title} • {player.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-5xl font-black text-[var(--accent-1)]">{player.points.toLocaleString()}</p>
                      <p className="text-[var(--text-secondary)]">pontos • streak {player.streak}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
        <FireIcon className="w-48 h-48 text-[var(--accent-alert)] mx-auto mb-12 animate-pulse" />
        <p className="text-2xl md:text-3xl lg:text-4xl font-light text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-warning)] via-[var(--accent-alert)] to-[var(--accent-pink)]">
          O FOGO NUNCA APAGA
        </p>
        <p className="text-4xl text-[var(--text-secondary)] mt-16">
          — Citizen Supremo X.1
        </p>
      </motion.div>
    </div>
  );
}
