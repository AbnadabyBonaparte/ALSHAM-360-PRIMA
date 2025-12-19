// src/pages/Achievements.tsx
// ALSHAM 360° PRIMA — HALL OF GLORY v∞
// O trono onde lendas são forjadas e imortalizadas
// 100% tema dinâmico • Proporções divinas • Animações supremas • Poder absoluto

import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { CheckCircle2, Crown, Lock, Medal, Sparkles, Star, Trophy, Zap } from 'lucide-react'
import { IconMedallion, ICON_RARITY_TOKENS } from '../design-system/iconography'

type Rarity = keyof typeof ICON_RARITY_TOKENS

interface Badge {
  id: string
  name: string
  description: string
  icon: LucideIcon
  rarity: Rarity
  unlocked: boolean
  progress: number
  xp_reward: number
  unlocked_at?: string
}

interface UserRank {
  rank_name: string
  current_xp: number
  next_rank_xp: number
  global_position: number
  weekly_change: number
}

const ACHIEVEMENTS: Badge[] = [
  {
    id: '1',
    name: 'Bug Slayer Supremo',
    description: 'Eliminou 100 bugs críticos sem misericórdia.',
    icon: Zap,
    rarity: 'legendary',
    unlocked: true,
    progress: 100,
    xp_reward: 10000,
    unlocked_at: '2025-11-20',
  },
  {
    id: '2',
    name: 'Pipeline Divine',
    description: 'Deploy imperial sem falha por 30 dias consecutivos.',
    icon: Crown,
    rarity: 'divine',
    unlocked: true,
    progress: 100,
    xp_reward: 25000,
    unlocked_at: '2025-12-01',
  },
  {
    id: '3',
    name: 'Early Riser',
    description: 'Primeiro commit antes das 7h por 15 dias.',
    icon: Star,
    rarity: 'epic',
    unlocked: true,
    progress: 100,
    xp_reward: 5000,
    unlocked_at: '2025-12-10',
  },
  {
    id: '4',
    name: 'Code Poet',
    description: 'Documentação lida e elogiada por 10+ devs.',
    icon: Medal,
    rarity: 'rare',
    unlocked: false,
    progress: 78,
    xp_reward: 3000,
  },
  {
    id: '5',
    name: 'Sales God',
    description: 'Fechou 5 deals > R$ 500k em um trimestre.',
    icon: Trophy,
    rarity: 'divine',
    unlocked: false,
    progress: 45,
    xp_reward: 50000,
  },
  {
    id: '6',
    name: 'AI Sovereign',
    description: '100% de acerto em prompts complexos com Oraculum.',
    icon: Sparkles,
    rarity: 'legendary',
    unlocked: false,
    progress: 12,
    xp_reward: 15000,
  },
]

const SegmentedTabs = ({
  value,
  onChange,
}: {
  value: 'badges' | 'leaderboard'
  onChange: (v: 'badges' | 'leaderboard') => void
}) => {
  return (
    <div className="flex justify-center mb-16">
      <div
        className={[
          'relative inline-flex items-center gap-2 p-2 rounded-2xl',
          'bg-[var(--surface)]/55 backdrop-blur-xl',
          'border border-[var(--border)]',
          'shadow-[0_0_0_1px_rgba(255,255,255,0.04)]',
        ].join(' ')}
      >
        <div className="absolute -inset-6 rounded-3xl blur-3xl bg-gradient-to-br from-[var(--accent-1)]/10 via-transparent to-[var(--accent-2)]/10 opacity-70 pointer-events-none" />

        {(['badges', 'leaderboard'] as const).map((tab) => {
          const active = value === tab
          return (
            <button
              key={tab}
              onClick={() => onChange(tab)}
              className={[
                'relative px-10 py-4 rounded-xl font-black uppercase',
                'tracking-[0.18em]',
                'transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-1)]/50',
                active
                  ? [
                      'text-[var(--background)]',
                      'bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)]',
                      // micro-ajuste (2): depth premium no tab ativo
                      'shadow-[0_8px_24px_rgba(0,0,0,0.25)]',
                    ].join(' ')
                  : 'text-[var(--text)]/75 hover:text-[var(--text)] bg-transparent',
              ].join(' ')}
            >
              <span className="text-lg">{tab === 'badges' ? 'ACHIEVEMENTS' : 'LEADERBOARD'}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

const HolographicCard = ({ badge }: { badge: Badge }) => {
  const [hovered, setHovered] = useState(false)
  const lockedIcon = useMemo(() => Lock, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, rotateY: -8 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      whileHover={{ scale: 1.02, y: -8 }}
      transition={{ type: 'spring', stiffness: 240, damping: 22 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative cursor-pointer"
    >
      <motion.div
        animate={{ opacity: hovered ? 0.9 : 0.55 }}
        className={[
          'absolute -inset-6 rounded-3xl blur-3xl',
          'bg-gradient-to-br',
          ICON_RARITY_TOKENS[badge.rarity].aura,
        ].join(' ')}
      />

      <div
        className={[
          'relative h-96 rounded-3xl',
          'bg-[var(--surface)]/70 backdrop-blur-2xl',
          'border border-[var(--border)]',
          'p-10 flex flex-col items-center justify-between overflow-hidden',
          !badge.unlocked ? 'opacity-90' : '',
        ].join(' ')}
      >
        <motion.div
          animate={{ rotate: hovered ? 1.25 : 0, scale: hovered ? 1.03 : 1 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          // micro-ajuste (3): topo do card menos “vazio”
          className="mt-3"
        >
          <IconMedallion
            rarity={badge.rarity}
            icon={badge.unlocked ? badge.icon : lockedIcon}
            locked={!badge.unlocked}
            scale="2xl"
            container="glass"
            state={hovered ? 'hover' : 'default'}
          />
        </motion.div>

        <div className="text-center">
          <h3 className="text-3xl font-black text-[var(--text)] mb-3 leading-none">{badge.name}</h3>
          <p className="text-lg text-[var(--text)]/70 px-6">{badge.description}</p>
        </div>

        <div className="w-full mt-8">
          {badge.unlocked ? (
            <div className="flex items-center justify-center gap-4 text-emerald-400">
              <CheckCircle2 className="w-9 h-9 stroke-[1.8]" />
              <p className="text-2xl font-black">+{badge.xp_reward} XP</p>
            </div>
          ) : (
            <div className="w-full">
              <div className="w-full bg-[var(--background)]/50 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${badge.progress}%` }}
                  transition={{ duration: 1.1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)]"
                />
              </div>
              <p className="text-center text-xl font-black text-[var(--text)] mt-4">{badge.progress}%</p>
            </div>
          )}
        </div>

        <div className="mt-4 px-6 py-3 rounded-full bg-[var(--background)]/40 border border-[var(--border)]">
          <p
            className={[
              // micro-ajuste (4): label mais “luxo” (menos peso, mais espaçamento)
              'text-[10px] font-semibold tracking-[0.32em]',
              'text-[var(--text)]/70',
            ].join(' ')}
          >
            {badge.rarity.toUpperCase()}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

const LevelOrb = ({ rank }: { rank: UserRank }) => {
  const progress = (rank.current_xp / rank.next_rank_xp) * 100
  const pct = Math.max(0, Math.min(100, Math.floor(progress)))

  return (
    <div className="relative w-80 h-80 mx-auto">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        // micro-ajuste (1): anel menos “pesado” (conteúdo vence a moldura)
        className="absolute inset-0 rounded-full border-4 border-[var(--accent-1)]/12"
      />

      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 4.5, repeat: Infinity }}
        className="absolute inset-8 rounded-full bg-gradient-to-br from-[var(--accent-1)]/16 to-[var(--accent-2)]/12 blur-3xl"
      />

      <div className="absolute inset-10 rounded-full bg-[var(--surface)]/35 border border-[var(--border)]/60 backdrop-blur-xl" />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-10">
        <h2 className="text-5xl font-black text-[var(--text)] leading-none tracking-tight">
          {rank.rank_name}
        </h2>

        <p className="mt-4 text-7xl font-black bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] bg-clip-text text-transparent leading-none">
          {pct}%
        </p>

        <p className="mt-3 text-xl text-[var(--text)]/70">para próximo nível</p>

        <div className="mt-6">
          <p className="text-xl font-semibold text-emerald-400">Top {rank.global_position}% global</p>
        </div>
      </div>
    </div>
  )
}

export default function Achievements() {
  const [achievements] = useState(ACHIEVEMENTS)
  const [activeTab, setActiveTab] = useState<'badges' | 'leaderboard'>('badges')

  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const totalXP = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.xp_reward, 0)

  return (
    <div className="flex-1 flex flex-col bg-[var(--background)] overflow-hidden">
      <div className="border-b border-[var(--border)] bg-[var(--surface)]/60 backdrop-blur-md p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-6xl font-black bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] bg-clip-text text-transparent">
            HALL OF GLORY
          </h1>
          <p className="text-3xl text-[var(--text)]/70 mt-4">Sua jornada de lenda no Império ALSHAM</p>

          <div className="flex gap-16 mt-8">
            <div>
              <p className="text-xl text-[var(--text)]/60">Desbloqueadas</p>
              <p className="text-5xl font-black text-emerald-400">
                {unlockedCount}/{achievements.length}
              </p>
            </div>
            <div>
              <p className="text-xl text-[var(--text)]/60">XP Total</p>
              <p className="text-5xl font-black text-[var(--accent-1)]">{totalXP.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <LevelOrb
              rank={{
                rank_name: 'Cyber Sovereign',
                current_xp: 42850,
                next_rank_xp: 50000,
                global_position: 3,
                weekly_change: 18,
              }}
            />
          </div>

          <SegmentedTabs value={activeTab} onChange={setActiveTab} />

          {activeTab === 'badges' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {achievements.map((badge) => (
                <HolographicCard key={badge.id} badge={badge} />
              ))}
            </div>
          )}

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
  )
}
