// src/pages/Achievements.tsx
// ALSHAM 360° PRIMA — HALL OF GLORY v∞
// O trono onde lendas são forjadas e imortalizadas
// 100% tema dinâmico • Proporções divinas • Animações supremas • Poder absoluto

import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Trophy,
  Star,
  Zap,
  Medal,
  Crown,
  Sparkles,
  Lock,
  CheckCircle2,
} from 'lucide-react'
import toast from 'react-hot-toast'

type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'divine'

interface Badge {
  id: string
  name: string
  description: string
  icon: React.ReactNode
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

/**
 * ICONOGRAPHY SYSTEM (in-page demo)
 * - Consistent scale
 * - Consistent stroke
 * - Premium container (medallion)
 * - State-driven visuals
 */
const RARITY_AURA: Record<Rarity, string> = {
  common: 'shadow-gray-500/20',
  rare: 'shadow-cyan-500/25',
  epic: 'shadow-purple-500/30',
  legendary: 'shadow-amber-500/35',
  divine: 'shadow-red-600/40',
}

const RARITY_MEDALLION: Record<Rarity, string> = {
  common: 'from-white/6 to-white/2 border-white/10',
  rare: 'from-cyan-500/18 to-white/2 border-cyan-400/20',
  epic: 'from-purple-500/18 to-white/2 border-purple-400/20',
  legendary: 'from-amber-500/18 to-white/2 border-amber-400/20',
  divine: 'from-red-500/18 to-white/2 border-red-400/25',
}

const ICON_SVG_CLASS =
  // governança: ícone não manda no layout — ele se adapta
  'w-11 h-11 stroke-[1.6]'

function IconMedallion({
  rarity,
  unlocked,
  icon,
}: {
  rarity: Rarity
  unlocked: boolean
  icon: React.ReactNode
}) {
  return (
    <div
      className={[
        'relative grid place-items-center',
        'w-20 h-20 rounded-2xl',
        'bg-gradient-to-br backdrop-blur-xl border',
        RARITY_MEDALLION[rarity],
      ].join(' ')}
    >
      {/* inner ring */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10" />

      {/* specular highlight */}
      <div className="absolute -top-6 -left-6 w-20 h-20 rounded-full bg-white/10 blur-2xl" />

      {/* icon */}
      <div className={unlocked ? 'text-[var(--text)]/85' : 'text-[var(--text)]/45'}>
        <div className="[&>svg]:w-11 [&>svg]:h-11 [&>svg]:stroke-[1.6]">{icon}</div>
      </div>

      {!unlocked && (
        <div className="absolute inset-0 rounded-2xl bg-black/10 dark:bg-black/20" />
      )}
    </div>
  )
}

const ACHIEVEMENTS: Badge[] = [
  {
    id: '1',
    name: 'Bug Slayer Supremo',
    description: 'Eliminou 100 bugs críticos sem misericórdia.',
    icon: <Zap className={ICON_SVG_CLASS} />,
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
    icon: <Crown className={ICON_SVG_CLASS} />,
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
    icon: <Star className={ICON_SVG_CLASS} />,
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
    icon: <Medal className={ICON_SVG_CLASS} />,
    rarity: 'rare',
    unlocked: false,
    progress: 78,
    xp_reward: 3000,
  },
  {
    id: '5',
    name: 'Sales God',
    description: 'Fechou 5 deals > R$ 500k em um trimestre.',
    icon: <Trophy className={ICON_SVG_CLASS} />,
    rarity: 'divine',
    unlocked: false,
    progress: 45,
    xp_reward: 50000,
  },
  {
    id: '6',
    name: 'AI Sovereign',
    description: '100% de acerto em prompts complexos com Oraculum.',
    icon: <Sparkles className={ICON_SVG_CLASS} />,
    rarity: 'legendary',
    unlocked: false,
    progress: 12,
    xp_reward: 15000,
  },
]

const HolographicCard = ({ badge }: { badge: Badge }) => {
  const [hovered, setHovered] = useState(false)

  const lockedIcon = useMemo(() => <Lock className={ICON_SVG_CLASS} />, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, rotateY: -10 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      whileHover={{ scale: 1.03, y: -10 }}
      transition={{ type: 'spring', stiffness: 240, damping: 22 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative cursor-pointer"
    >
      {/* Aura controlada (premium) */}
      <motion.div
        animate={{ opacity: hovered ? 0.95 : 0.55 }}
        className={[
          'absolute -inset-6 rounded-3xl blur-3xl',
          'bg-gradient-to-br from-[var(--accent-1)]/14 via-transparent to-[var(--accent-2)]/10',
          RARITY_AURA[badge.rarity],
        ].join(' ')}
      />

      <div
        className={[
          'relative h-96 rounded-3xl',
          'bg-[var(--surface)]/70 backdrop-blur-2xl',
          'border border-[var(--border)]',
          'p-10 flex flex-col items-center justify-between overflow-hidden',
          !badge.unlocked ? 'opacity-85' : '',
        ].join(' ')}
      >
        {/* Icon area: medallion governado */}
        <motion.div
          // micro-rotations (enterprise), não arcade 360 infinito
          animate={{ rotate: hovered ? 2 : 0, scale: hovered ? 1.02 : 1 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="mt-8"
        >
          <IconMedallion
            rarity={badge.rarity}
            unlocked={badge.unlocked}
            icon={badge.unlocked ? badge.icon : lockedIcon}
          />
        </motion.div>

        <div className="text-center">
          <h3 className="text-3xl font-black text-[var(--text)] mb-3">{badge.name}</h3>
          <p className="text-lg text-[var(--text)]/70 px-6">{badge.description}</p>
        </div>

        {/* Progresso ou XP */}
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
              <p className="text-center text-xl font-black text-[var(--text)] mt-4">
                {badge.progress}%
              </p>
            </div>
          )}
        </div>

        {/* Raridade label (mais contida) */}
        <div className="mt-4 px-6 py-3 rounded-full bg-[var(--background)]/45 border border-[var(--border)]">
          <p className="text-sm font-black tracking-[0.22em] text-[var(--text)]/75">
            {badge.rarity.toUpperCase()}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

const LevelOrb = ({ rank }: { rank: UserRank }) => {
  const progress = (rank.current_xp / rank.next_rank_xp) * 100

  return (
    <div className="relative w-80 h-80 mx-auto">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full border-8 border-[var(--accent-1)]/20"
      />

      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute inset-8 rounded-full bg-gradient-to-br from-[var(--accent-1)]/18 to-[var(--accent-2)]/14 blur-3xl"
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
              <p className="text-5xl font-black text-emerald-400">
                {unlockedCount}/{achievements.length}
              </p>
            </div>
            <div>
              <p className="text-xl text-[var(--text)]/60">XP Total</p>
              <p className="text-5xl font-black text-[var(--accent-1)]">
                {totalXP.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-auto p-12">
        <div className="max-w-7xl mx-auto">
          {/* Level Orb Central */}
          <div className="mb-20">
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

          {/* Tabs */}
          <div className="flex justify-center gap-12 mb-16">
            {(['badges', 'leaderboard'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={[
                  'px-12 py-6 text-3xl font-black uppercase tracking-widest rounded-2xl transition-all',
                  activeTab === tab
                    ? 'bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] text-[var(--background)]'
                    : 'bg-[var(--surface)]/50 text-[var(--text)]/70 hover:text-[var(--text)]',
                ].join(' ')}
              >
                {tab === 'badges' ? 'ACHIEVEMENTS' : 'LEADERBOARD'}
              </button>
            ))}
          </div>

          {/* Badges Grid */}
          {activeTab === 'badges' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {achievements.map((badge) => (
                <HolographicCard key={badge.id} badge={badge} />
              ))}
            </div>
          )}

          {/* Leaderboard Placeholder */}
          {activeTab === 'leaderboard' && (
            <div className="bg-[var(--surface)]/70 backdrop-blur-xl rounded-3xl border border-[var(--border)] p-16 text-center">
              <h2 className="text-5xl font-black text-[var(--text)] mb-12">
                GLOBAL ELITE LEAGUE
              </h2>
              <div className="space-y-8 max-w-2xl mx-auto">
                <div className="p-8 bg-gradient-to-r from-yellow-600/30 to-amber-600/30 rounded-3xl border border-yellow-500/50">
                  <p className="text-4xl font-black text-yellow-400">
                    1. Neo Anderson — 142,000 XP
                  </p>
                </div>
                <div className="p-8 bg-gradient-to-r from-gray-600/30 to-gray-500/30 rounded-3xl border border-gray-400/50">
                  <p className="text-4xl font-black text-gray-300">
                    2. Sarah Connor — 138,500 XP
                  </p>
                </div>
                <div className="p-8 bg-gradient-to-r from-[var(--accent-1)]/40 to-[var(--accent-2)]/40 rounded-3xl border border-[var(--accent-1)]">
                  <p className="text-4xl font-black text-[var(--accent-1)]">
                    3. VOCÊ — 42,850 XP
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
