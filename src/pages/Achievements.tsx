// src/pages/Achievements.tsx
// ALSHAM 360° PRIMA — HALL OF GLORY v∞
// O trono onde lendas são forjadas e imortalizadas
// 100% tema dinâmico • Proporções divinas • Animações supremas • Poder absoluto

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Star, Zap, Medal, Crown, Sparkles, Lock, CheckCircle2, Flame,
  TrendingUp, Award
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'divine';
  unlocked: boolean;
  progress: number;
  xp_reward: number;
  unlocked_at?: string;
}

interface UserRank {
  rank_name: string;
  current_xp: number;
  next_rank_xp: number;
  global_position: number;
  weekly_change: number;
}

const ACHIEVEMENTS: Badge[] = [
  { id: '1', name: "Bug Slayer Supremo", description: "Eliminou 100 bugs críticos sem misericórdia.", icon: <Zap className="w-20 h-20" />, rarity: 'legendary', unlocked: true, progress: 100, xp_reward: 10000, unlocked_at: '2025-11-20' },
  { id: '2', name: "Pipeline Divine", description: "Deploy imperial sem falha por 30 dias consecutivos.", icon: <Crown className="w-20 h-20" />, rarity: 'divine', unlocked: true, progress: 100, xp_reward: 25000, unlocked_at: '2025-12-01' },
  { id: '3', name: "Early Riser", description: "Primeiro commit antes das 7h por 15 dias.", icon: <Star className="w-20 h-20" />, rarity: 'epic', unlocked: true, progress: 100, xp_reward: 5000, unlocked_at: '2025-12-10' },
  { id: '4', name: "Code Poet", description: "Documentação lida e elogiada por 10+ devs.", icon: <Medal className="w-20 h-20" />, rarity: 'rare', unlocked: false, progress: 78, xp_reward: 3000 },
  { id: '5', name: "Sales God", description: "Fechou 5 deals > R$ 500k em um trimestre.", icon: <Trophy className="w-20 h-20" />, rarity: 'divine', unlocked: false, progress: 45, xp_reward: 50000 },
  { id: '6', name: "AI Sovereign", description: "100% de acerto em prompts complexos com Oraculum.", icon: <Sparkles className="w-20 h-20" />, rarity: 'legendary', unlocked: false, progress: 12, xp_reward: 15000 },
];

const RARITY_GLOW = {
  common: 'shadow-gray-500/30',
  rare: 'shadow-cyan-500/50',
  epic: 'shadow-purple-500/60',
  legendary: 'shadow-amber-500/70',
  divine: 'shadow-red-600/80 animate-pulse'
};

const HolographicCard = ({ badge }: { badge: Badge }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      whileHover={{ scale: 1.08, y: -20 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative cursor-pointer"
    >
      {/* Glow dinâmico por raridade */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0.6 }}
        className={`absolute -inset-8 rounded-3xl blur-3xl bg-gradient-to-br ${RARITY_GLOW[badge.rarity]}`}
      />

      <div className={`relative h-96 rounded-3xl bg-[var(--surface)]/70 backdrop-blur-2xl border-4 border-[var(--border)] p-10 flex flex-col items-center justify-between overflow-hidden ${!badge.unlocked && 'grayscale opacity-80'}`}>
        {/* Ícone com animação */}
        <motion.div
          animate={{ rotate: hovered ? 360 : 0 }}
          transition={{ duration: 20, repeat: hovered ? Infinity : 0, ease: "linear" }}
          className="mt-8"
        >
          {badge.unlocked ? badge.icon : <Lock className="w-20 h-20 text-[var(--text)]/50" />}
        </motion.div>

        <div className="text-center">
          <h3 className="text-3xl font-black text-[var(--text)] mb-4">{badge.name}</h3>
          <p className="text-lg text-[var(--text)]/70 px-6">{badge.description}</p>
        </div>

        {/* Progresso ou XP */}
        <div className="w-full mt-8">
          {badge.unlocked ? (
            <div className="flex items-center justify-center gap-4 text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
              <p className="text-2xl font-black">+{badge.xp_reward} XP</p>
            </div>
          ) : (
            <div className="w-full bg-[var(--background)]/50 rounded-full h-8 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${badge.progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)]"
              />
              <p className="text-center text-xl font-black text-[var(--text)] mt-4">{badge.progress}%</p>
            </div>
          )}
        </div>

        {/* Raridade badge */}
        <div className="mt-6 px-8 py-4 rounded-full bg-[var(--background)]/50 border border-[var(--border)]">
          <p className={`text-2xl font-black text-[var(--accent-1)]`}>
            {badge.rarity.toUpperCase()}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const LevelOrb = ({ rank }: { rank: UserRank }) => {
  const progress = (rank.current_xp / rank.next_rank_xp) * 100;

  return (
    <div className="relative w-80 h-80 mx-auto">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border-8 border-[var(--accent-1)]/20"
      />

      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute inset-8 rounded-full bg-gradient-to-br from-[var(--accent-1)]/20 to-[var(--accent-2)]/20 blur-3xl"
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <h2 className="text-6xl font-black text-[var(--text)] mb-4">{rank.rank_name}</h2>
        <p className="text-8xl font-black bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] bg-clip-text text-transparent">
          {Math.floor(progress)}%
        </p>
        <p className="text-2xl text-[var(--text)]/70 mt-4">para próximo nível</p>
        <div className="flex items-center gap-8 mt-8">
          <p className="text-3xl text-emerald-400">Top {rank.global_position}% global</p>
        </div>
      </div>
    </div>
  );
};

export default function Achievements() {
  const [achievements] = useState(ACHIEVEMENTS);
  const [activeTab, setActiveTab] = useState<'badges' | 'leaderboard'>('badges');

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalXP = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.xp_reward, 0);

  return (
    <div className="flex-1 flex flex-col bg-[var(--background)] overflow-hidden">
      {/* TOOLBAR SUPERIOR */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)]/60 backdrop-blur-md p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-6xl font-black bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] bg-clip-text text-transparent">
            HALL OF GLORY
          </h1>
          <p className="text-3xl text-[var(--text)]/70 mt-4">
            Sua jornada de lenda no Império ALSHAM
          </p>
          <div className="flex gap-16 mt-8">
            <div>
              <p className="text-xl text-[var(--text)]/60">Desbloqueadas</p>
              <p className="text-5xl font-black text-emerald-400">{unlockedCount}/{achievements.length}</p>
            </div>
            <div>
              <p className="text-xl text-[var(--text)]/60">XP Total</p>
              <p className="text-5xl font-black text-[var(--accent-1)]">{totalXP.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-auto p-12">
        <div className="max-w-7xl mx-auto">
          {/* Level Orb Central */}
          <div className="mb-20">
            <LevelOrb rank={{
              rank_name: "Cyber Sovereign",
              current_xp: 42850,
              next_rank_xp: 50000,
              global_position: 3,
              weekly_change: 18
            }} />
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-12 mb-16">
            {['badges', 'leaderboard'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-12 py-6 text-3xl font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === tab ? 'bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] text-[var(--background)]' : 'bg-[var(--surface)]/50 text-[var(--text)]/70 hover:text-[var(--text)]'}`}
              >
                {tab === 'badges' ? 'ACHIEVEMENTS' : 'LEADERBOARD'}
              </button>
            ))}
          </div>

          {/* Badges Grid */}
          {activeTab === 'badges' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {achievements.map((badge, i) => (
                <HolographicCard key={badge.id} badge={badge} />
              ))}
            </div>
          )}

          {/* Leaderboard Placeholder */}
          {activeTab === 'leaderboard' && (
            <div className="bg-[var(--surface)]/70 backdrop-blur-xl rounded-3xl border border-[var(--border)] p-16 text-center">
              <h2 className="text-5xl font-black text-[var(--text)] mb-12">GLOBAL ELITE LEAGUE</h2>
              <div className="space-y-8 max-w-2xl mx-auto">
                <div className="p-8 bg-gradient-to-r from-yellow-600/30 to-amber-600/30 rounded-3xl border border-yellow-500/50">
                  <p className="text-4xl font-black text-yellow-400">1. Neo Anderson — 142,000 XP</p>
                </div>
                <div className="p-8 bg-gradient-to-r from-gray-600/30 to-gray-500/30 rounded-3xl border border-gray-400/50">
                  <p className="text-4xl font-black text-gray-300">2. Sarah Connor — 138,500 XP</p>
                </div>
                <div className="p-8 bg-gradient-to-r from-[var(--accent-1)]/40 to-[var(--accent-2)]/40 rounded-3xl border border-[var(--accent-1)]">
                  <p className="text-4xl font-black text-[var(--accent-1)]">3. VOCÊ — 42,850 XP</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
