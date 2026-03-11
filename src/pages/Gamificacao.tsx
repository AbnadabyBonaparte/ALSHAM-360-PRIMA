// src/pages/Gamificacao.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Gamificação Alienígena 1000/1000
// O fogo que transforma trabalho em vício. O trono que transforma esforço em glória.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA/blob/hotfix/recovery-prod/src/pages/Gamificacao.tsx

import {
  Trophy,
  Flame,
  Rocket,
  Star,
  Zap,
  Crosshair,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/supabase/useAuthStore';
import { PageSkeleton, ErrorState, EmptyState } from '@/components/PageStates';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  const orgId = useAuthStore((s) => s.currentOrgId);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['gamificacao', orgId],
    queryFn: async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser?.email) return { profile: null, allPlayers: [] };

      const { data: profile, error: profileError } = await supabase
        .from('gamificacao_usuarios')
        .select('*')
        .eq('email', authUser.email)
        .single();

      if (profileError) return { profile: null, allPlayers: [] };

      const { data: allPlayers, error: playersError } = await supabase
        .from('gamificacao_usuarios')
        .select('name, pontos, streak, nivel, badges, email')
        .order('pontos', { ascending: false })
        .limit(10);

      if (playersError) return { profile, allPlayers: [] };

      return { profile, allPlayers: allPlayers ?? [], userEmail: authUser.email };
    },
    enabled: !!orgId,
  });

  const { user, leaderboard } = useMemo(() => {
    if (!data?.profile) return { user: null, leaderboard: [] };

    const rank = data.allPlayers?.findIndex((p: any) => p.email === data.userEmail) + 1 || 0;

    const userStats: UserStats = {
      points: data.profile.pontos || 0,
      level: data.profile.nivel || 1,
      streak: data.profile.streak || 0,
      badges: data.profile.badges || 0,
      rank,
      nextLevelPoints: data.profile.nivel * 500,
      weeklyProgress: data.profile.progresso_semanal || [0,0,0,0,0,0,0]
    };

    const players: Player[] = data.allPlayers?.map((p: any, i: number) => {
      const next = data.allPlayers?.[i + 1];
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
    }) || [];

    return { user: userStats, leaderboard: players };
  }, [data]);

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;

  if (!user) {
    return (
      <div className="text-center py-40">
        <Flame className="w-40 h-40 text-[var(--text)]/30 mx-auto mb-12" />
        <p className="text-5xl text-[var(--text)]/50">Você ainda não entrou no jogo</p>
      </div>
    );
  }

  const levelProgress = (user.points % 500) / 5;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-[var(--accent-warning)] via-[var(--accent-alert)] to-[var(--accent-pink)] bg-clip-text text-transparent">
            GAMIFICAÇÃO SUPREMA
          </h1>
          <p className="text-4xl text-[var(--text)] mt-8 font-light">
            {user.streak > 10 ? '🔥' : ''} Streak de {user.streak} dias • Rank #{user.rank}
          </p>
        </motion.div>

        {/* SEU STATUS SUPREMO */}
        <div className="max-w-6xl mx-auto mb-20">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[var(--surface)]/60 backdrop-blur-xl rounded-3xl p-12 border-4 border-[var(--accent-1)]/50 shadow-2xl shadow-[var(--accent-1)]/30"
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 text-center">
              <div>
                <Trophy className="w-20 h-20 text-[var(--accent-1)] mx-auto mb-auto mb-4" />
                <p className="text-6xl font-black text-[var(--accent-1)]">{user.points.toLocaleString()}</p>
                <p className="text-2xl text-[var(--text)]">Pontos Totais</p>
              </div>
              <div>
                <Star className="w-20 h-20 text-[var(--accent-purple)] mx-auto mb-4" />
                <p className="text-6xl font-black text-[var(--accent-purple)]">Nível {user.level}</p>
                <p className="text-xl text-[var(--text-secondary)]">{levelProgress.toFixed(0)}% para o próximo</p>
              </div>
              <div>
                <Flame className="w-20 h-20 text-[var(--accent-warning)] mx-auto mb-4 animate-pulse" />
                <p className="text-6xl font-black text-[var(--accent-warning)]">{user.streak}</p>
                <p className="text-2xl text-[var(--text)]">Streak Atual</p>
              </div>
              <div>
                <Trophy className="w-20 h-20 text-[var(--accent-sky)] mx-auto mb-4" />
                <p className="text-6xl font-black text-[var(--accent-sky)]">{user.badges}</p>
                <p className="text-2xl text-[var(--text)]">Conquistas</p>
              </div>
              <div>
                <Zap className="w-20 h-20 text-[var(--accent-pink)] mx-auto mb-4" />
                <p className="text-6xl font-black text-[var(--accent-pink)]">#{user.rank}</p>
                <p className="text-2xl text-[var(--text)]">no Ranking</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* LEADERBOARD SUPREMO */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-12 bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-warning)] bg-clip-text text-transparent">
            Hall da Glória
          </h2>
          <div className="space-y-6">
            {leaderboard.map((player, i) => (
              <motion.div
                key={player.rank}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-3xl p-8 border-2 ${
                  player.rank === 1 ? 'bg-[var(--accent-1)]/20 border-[var(--accent-1)] shadow-2xl shadow-[var(--accent-1)]/50' :
                  player.rank === 2 ? 'bg-[var(--text-secondary)]/20 border-[var(--text-secondary)]' :
                  player.rank === 3 ? 'bg-[var(--accent-warning)]/20 border-[var(--accent-warning)]' :
                  'bg-[var(--surface)]/60 border-[var(--border)]'
                } backdrop-blur-xl`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    <div className={`text-6xl font-black ${
                      player.rank === 1 ? 'text-[var(--accent-1)]' :
                      player.rank === 2 ? 'text-[var(--text-secondary)]' :
                      player.rank === 3 ? 'text-[var(--accent-warning)]' :
                      'text-[var(--text)]/50'
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
                      <Flame className={`w-10 h-10 ${player.streak > 10 ? 'text-[var(--accent-warning)] animate-pulse' : 'text-[var(--text)]/50'}`} />
                      <span className="text-4xl font-bold text-[var(--text-primary)]">{player.streak}</span>
                    </div>
                    <p className="text-[var(--text-secondary)]">streak • {player.badges} conquistas</p>
                  </div>
                </div>
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
          <Sparkles className="w-40 h-40 text-[var(--accent-purple)] mx-auto mb-12 animate-pulse" />
          <p className="text-xl md:text-2xl lg:text-3xl font-light text-[var(--accent-purple)] max-w-5xl mx-auto leading-relaxed">
            "Você não está jogando.
            <br />
            Você está dominando."
          </p>
          <p className="text-4xl text-[var(--text-secondary)] mt-16">
            — Citizen Supremo X.1
          </p>
        </motion.div>
      </div>
  );
}
