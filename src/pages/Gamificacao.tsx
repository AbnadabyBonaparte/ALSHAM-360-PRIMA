// src/pages/Gamificacao.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Gamificação Alienígena 1000/1000
// O fogo que transforma trabalho em vício. O trono que transforma esforço em glória.
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA/blob/hotfix/recovery-prod/src/pages/Gamificacao.tsx

import LayoutSupremo from '@/components/LayoutSupremo';
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
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

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
      <LayoutSupremo title="Gamificação Suprema">
        <div className="flex items-center justify-center h-screen bg-black">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-40 h-40 border-8 border-t-transparent border-orange-500 rounded-full"
          />
          <p className="absolute text-4xl text-orange-400 font-light">Acendendo o fogo da glória...</p>
        </div>
      </LayoutSupremo>
    );
  }

  if (!user) {
    return (
      <LayoutSupremo title="Gamificação Suprema">
        <div className="text-center py-40">
          <FireIcon className="w-40 h-40 text-gray-700 mx-auto mb-12" />
          <p className="text-5xl text-gray-400">Você ainda não entrou no jogo</p>
        </div>
      </LayoutSupremo>
    );
  }

  const levelProgress = (user.points % 500) / 5; // 500 pontos por nível

  return (
    <LayoutSupremo title="Gamificação Suprema">
      <div className="min-h-screen bg-black text-white p-8">
        {/* HEADER ÉPICO */}
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-9xl font-black bg-gradient-to-r from-orange-400 via-red-500 to-pink-600 bg-clip-text text-transparent">
            GAMIFICAÇÃO SUPREMA
          </h1>
          <p className="text-4xl text-gray-300 mt-8 font-light">
            {user.streak > 10 ? '🔥' : ''} Streak de {user.streak} dias • Rank #{user.rank}
          </p>
        </motion.div>

        {/* SEU STATUS SUPREMO */}
        <div className="max-w-6xl mx-auto mb-20">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-purple-900/50 via-pink-900/50 to-orange-900/50 rounded-3xl p-12 border-4 border-yellow-500/50 shadow-2xl shadow-yellow-500/30"
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 text-center">
              <div>
                <TrophyIcon className="w-20 h-20 text-yellow-400 mx-auto mb-auto mb-4" />
                <p className="text-6xl font-black text-yellow-400">{user.points.toLocaleString()}</p>
                <p className="text-2xl text-gray-300">Pontos Totais</p>
              </div>
              <div>
                <StarIcon className="w-20 h-20 text-purple-400 mx-auto mb-4" />
                <p className="text-6xl font-black text-purple-400">Nível {user.level}</p>
                <p className="text-xl text-gray-400">{levelProgress.toFixed(0)}% para o próximo</p>
              </div>
              <div>
                <FireIcon className="w-20 h-20 text-orange-500 mx-auto mb-4 animate-pulse" />
                <p className="text-6xl font-black text-orange-500">{user.streak}</p>
                <p className="text-2xl text-gray-300">Streak Atual</p>
              </div>
              <div>
                <TrophyIcon className="w-20 h-20 text-cyan-400 mx-auto mb-4" />
                <p className="text-6xl font-black text-cyan-400">{user.badges}</p>
                <p className="text-2xl text-gray-300">Conquistas</p>
              </div>
              <div>
                <BoltIcon className="w-20 h-20 text-pink-500 mx-auto mb-4" />
                <p className="text-6xl font-black text-pink-500">#{user.rank}</p>
                <p className="text-2xl text-gray-300">no Ranking</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* LEADERBOARD SUPREMO */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-12 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
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
                  player.rank === 1 ? 'bg-gradient-to-r from-yellow-600/40 to-orange-600/40 border-yellow-500 shadow-2xl shadow-yellow-500/50' :
                  player.rank === 2 ? 'bg-gradient-to-r from-gray-600/30 to-gray-500/30 border-gray-400' :
                  player.rank === 3 ? 'bg-gradient-to-r from-orange-700/30 to-yellow-600/30 border-orange-500' :
                  'bg-white/5 border-white/10'
                } backdrop-blur-xl`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    <div className={`text-6xl font-black ${
                      player.rank === 1 ? 'text-yellow-400' :
                      player.rank === 2 ? 'text-gray-300' :
                      player.rank === 3 ? 'text-orange-400' :
                      'text-gray-500'
                    }`}>
                      {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : `#${player.rank}`}
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white">{player.name}</h3>
                      <p className="text-xl text-gray-400">Nível {player.level} • {player.points.toLocaleString()} pts</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-3 justify-end mb-2">
                      <FireIcon className={`w-10 h-10 ${player.streak > 10 ? 'text-orange-500 animate-pulse' : 'text-gray-500'}`} />
                      <span className="text-4xl font-bold text-white">{player.streak}</span>
                    </div>
                    <p className="text-gray-400">streak • {player.badges} conquistas</p>
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
          <SparklesIcon className="w-40 h-40 text-purple-400 mx-auto mb-12 animate-pulse" />
          <p className="text-7xl font-light text-purple-300 max-w-5xl mx-auto leading-relaxed">
            "Você não está jogando.
            <br />
            Você está dominando."
          </p>
          <p className="text-4xl text-gray-400 mt-16">
            — Citizen Supremo X.1
          </p>
        </motion.div>
      </div>
    </LayoutSupremo>
  );
}
