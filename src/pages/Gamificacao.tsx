// src/pages/Gamificacao.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Gamificação Alienígena 1000/1000
// O fogo que transforma trabalho em vício. O trono que transforma esforço em glória.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA/blob/hotfix/recovery-prod/src/pages/Gamificacao.tsx

import {
  TrophyIcon,
  FireIcon,
  RocketLaunchIcon,
  StarIcon,
  BoltIcon,
  ViewfinderCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

const supabase = createClient(
  (import.meta as any).env.VITE_SUPABASE_URL,
  (import.meta as any).env.VITE_SUPABASE_ANON_KEY
);

interface Player {
  rank: number;
  name: string;
  level: number;
  points: number;
  streak: number;
  badges: number;
  trend: 'up' | 'down' | 'same';
}

interface UserStats {
  points: number;
  level: number;
  streak: number;
  badges: number;
  rank: number;
  nextLevelPoints: number;
  weeklyProgress: number[];
}

export default function GamificacaoPage() {
  const [user, setUser] = useState<UserStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupremeGamification() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;

      const { data: profile } = await supabase
        .from('gamificacao_usuarios')
        .select('*')
        .eq('email', user.email)
        .single();

      const { data: allPlayers } = await supabase
        .from('gamificacao_usuarios')
        .select('name, pontos, streak, nivel, badges')
        .order('pontos', { ascending: false })
        .limit(10);

      if (profile) {
        const rank = allPlayers?.findIndex(p => p.email === user.email) + 1 || 0;

        setUser({
          points: profile.pontos || 0,
          level: profile.nivel || 1,
          streak: profile.streak || 0,
          badges: profile.badges || 0,
          rank,
          nextLevelPoints: profile.nivel * 500,
          weeklyProgress: profile.progresso_semanal || [0,0,0,0,0,0,0]
        });

        setLeaderboard(allPlayers?.map((p: any, i: number) => {
          const next = allPlayers?.[i + 1];
          const trend = next
            ? (p.pontos >= next.pontos ? 'up' : 'down')
            : 'same';
          return {
            rank: i + 1,
            name: p.name,
            level: p.nivel,
            points: p.pontos,
            streak: p.streak,
            badges: p.badges,
            trend
          };
        }) || []);
      }

      setLoading(false);
    }

    loadSupremeGamification();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <Skeleton className="w-40 h-40 rounded-full" />
        <p className="absolute text-4xl text-[var(--accent-warning)] font-light">Acendendo o fogo da glória...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="border-[var(--border)] bg-[var(--surface)] max-w-2xl mx-auto mt-20">
        <CardContent className="text-center py-40">
          <FireIcon className="w-40 h-40 text-[var(--text-secondary)] mx-auto mb-12" />
          <p className="text-5xl text-[var(--text-secondary)]">Você ainda não entrou no jogo</p>
        </CardContent>
      </Card>
    );
  }

  const levelProgress = (user.points % 500) / 5; // 500 pontos por nível

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Card className="border-0 bg-transparent">
            <CardHeader>
              <CardTitle className="text-4xl md:text-5xl lg:text-6xl font-black text-[var(--text-primary)]">
                GAMIFICAÇÃO SUPREMA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl text-[var(--text-secondary)] font-light">
                {user.streak > 10 ? '🔥' : ''} Streak de {user.streak} dias • Rank #{user.rank}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* SEU STATUS SUPREMO */}
        <div className="max-w-6xl mx-auto mb-20">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Card className="border-[var(--accent-warning)]/50 bg-[var(--surface)] shadow-2xl">
              <CardContent className="p-12">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 text-center">
                  <div>
                    <TrophyIcon className="w-20 h-20 text-[var(--accent-warning)] mx-auto mb-4" />
                    <p className="text-6xl font-black text-[var(--accent-warning)]">{user.points.toLocaleString()}</p>
                    <p className="text-2xl text-[var(--text-secondary)]">Pontos Totais</p>
                  </div>
                  <div>
                    <StarIcon className="w-20 h-20 text-[var(--accent-purple)] mx-auto mb-4" />
                    <p className="text-6xl font-black text-[var(--accent-purple)]">Nível {user.level}</p>
                    <p className="text-xl text-[var(--text-secondary)]">{levelProgress.toFixed(0)}% para o próximo</p>
                  </div>
                  <div>
                    <FireIcon className="w-20 h-20 text-[var(--accent-warning)] mx-auto mb-4 animate-pulse" />
                    <p className="text-6xl font-black text-[var(--accent-warning)]">{user.streak}</p>
                    <p className="text-2xl text-[var(--text-secondary)]">Streak Atual</p>
                  </div>
                  <div>
                    <TrophyIcon className="w-20 h-20 text-[var(--accent-sky)] mx-auto mb-4" />
                    <p className="text-6xl font-black text-[var(--accent-sky)]">{user.badges}</p>
                    <p className="text-2xl text-[var(--text-secondary)]">Conquistas</p>
                  </div>
                  <div>
                    <BoltIcon className="w-20 h-20 text-[var(--accent-pink)] mx-auto mb-4" />
                    <p className="text-6xl font-black text-[var(--accent-pink)]">#{user.rank}</p>
                    <p className="text-2xl text-[var(--text-secondary)]">no Ranking</p>
                  </div>
                </div>
                <div className="mt-8">
                  <Progress value={levelProgress} className="h-3" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* LEADERBOARD SUPREMO */}
        <div className="max-w-5xl mx-auto">
          <Card className="border-0 bg-transparent mb-12">
            <CardHeader className="text-center">
              <CardTitle className="text-5xl font-bold text-[var(--text-primary)]">
                Hall da Glória
              </CardTitle>
            </CardHeader>
          </Card>
          <div className="space-y-6">
            {leaderboard.map((player, i) => (
              <motion.div
                key={player.rank}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`border-[var(--border)] bg-[var(--surface)] ${
                  player.rank === 1 ? 'border-[var(--accent-warning)] shadow-2xl' :
                  player.rank === 2 ? 'border-[var(--text-secondary)]' :
                  player.rank === 3 ? 'border-[var(--accent-warning)]/50' :
                  ''
                }`}>
                  <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    <div className={`text-6xl font-black ${
                      player.rank === 1 ? 'text-[var(--accent-warning)]' :
                      player.rank === 2 ? 'text-[var(--text-secondary)]' :
                      player.rank === 3 ? 'text-[var(--accent-warning)]' :
                      'text-[var(--text-secondary)]'
                    }`}>
                      {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : `#${player.rank}`}
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-[var(--text-primary)]">{player.name}</h3>
                      <p className="text-xl text-[var(--text-secondary)]">Nível {player.level} • {player.points.toLocaleString()} pts</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-3 justify-end mb-2">
                      <FireIcon className={`w-10 h-10 ${player.streak > 10 ? 'text-[var(--accent-warning)] animate-pulse' : 'text-[var(--text-secondary)]'}`} />
                      <span className="text-4xl font-bold text-[var(--text-primary)]">{player.streak}</span>
                    </div>
                    <p className="text-[var(--text-secondary)]">streak • {player.badges} conquistas</p>
                  </div>
                </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* MENSAGEM FINAL DA IA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center py-32 mt-32"
        >
          <Card className="border-0 bg-transparent max-w-5xl mx-auto">
            <CardContent className="text-center">
              <SparklesIcon className="w-40 h-40 text-[var(--accent-purple)] mx-auto mb-12 animate-pulse" />
              <p className="text-xl md:text-2xl lg:text-3xl font-light text-[var(--accent-purple)] max-w-5xl mx-auto leading-relaxed">
                "Você não está jogando.
                <br />
                Você está dominando."
              </p>
              <p className="text-4xl text-[var(--text-secondary)] mt-16">
                — Citizen Supremo X.1
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
  );
}
