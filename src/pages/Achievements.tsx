// src/pages/Achievements.tsx
// ALSHAM 360° PRIMA — Achievements
// CANÔNICO • TOKEN-FIRST • SAFE-UI (sem Sidebar/Layout aqui)
// Importante: NÃO renderiza LayoutSupremo aqui. O shell é responsabilidade do ProtectedLayout.

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
    name: 'Estabilidade Operacional',
    description: 'Resolveu 100 incidentes críticos com tempo de resposta consistente.',
    icon: Zap,
    rarity: 'legendary',
    unlocked: true,
    progress: 100,
    xp_reward: 10000,
    unlocked_at: '2025-11-20',
  },
  {
    id: '2',
    name: 'Entrega Contínua',
    description: 'Deploy sem falha por 30 dias consecutivos em ambientes monitorados.',
    icon: Crown,
    rarity: 'divine',
    unlocked: true,
    progress: 100,
    xp_reward: 25000,
    unlocked_at: '2025-12-01',
  },
  {
    id: '3',
    name: 'Consistência de Rotina',
    description: 'Primeira contribuição antes das 07:00 por 15 dias no período.',
    icon: Star,
    rarity: 'epic',
    unlocked: true,
    progress: 100,
    xp_reward: 5000,
    unlocked_at: '2025-12-10',
  },
  {
    id: '4',
    name: 'Documentação de Qualidade',
    description: 'Documentação adotada e validada por 10+ colaboradores.',
    icon: Medal,
    rarity: 'rare',
    unlocked: false,
    progress: 78,
    xp_reward: 3000,
  },
  {
    id: '5',
    name: 'Performance Comercial',
    description: 'Atingiu meta trimestral em vendas com alto valor agregado.',
    icon: Trophy,
    rarity: 'divine',
    unlocked: false,
    progress: 45,
    xp_reward: 50000,
  },
  {
    id: '6',
    name: 'Excelência em IA Aplicada',
    description: 'Alta precisão em fluxos complexos com assistência de IA.',
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
    <div className="flex justify-center">
      <div
        role="tablist"
        aria-label="Alternar visualização"
        className={[
          'relative inline-flex items-center gap-2 p-2 rounded-2xl',
          'bg-[var(--surface)]/55 backdrop-blur-xl',
          'border border-[var(--border)]',
          'shadow-[0_0_0_1px_rgba(255,255,255,0.04)]',
        ].join(' ')}
      >
        <div className="absolute -inset-6 rounded-3xl blur-3xl bg-gradient-to-br from-[var(--accent-1)]/10 via-transparent to-[var(--accent-2)]/10 opacity-70 pointer-events-none" />

        {(['badges', 'leaderboard'] as const).map(tab => {
          const active = value === tab
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab)}
              className={[
                'relative px-8 py-3 rounded-xl font-black',
                'transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-1)]/50',
                active
                  ? [
                      'text-[var(--background)]',
                      'bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)]',
                      'shadow-[0_10px_28px_rgba(0,0,0,0.32)]',
                    ].join(' ')
                  : 'text-[var(--foreground,var(--text))]/75 hover:text-[var(--foreground,var(--text))] bg-transparent',
              ].join(' ')}
            >
              <span className="text-sm md:text-base tracking-wide">
                {tab === 'badges' ? 'Conquistas' : 'Ranking'}
              </span>
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
      initial={{ opacity: 0, scale: 0.98, rotateY: -6 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      whileHover={{ scale: 1.015, y: -6 }}
      transition={{ type: 'spring', stiffness: 240, damping: 22 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative"
    >
      <motion.div
        aria-hidden="true"
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
          'bg-[var(--surface)]/68 backdrop-blur-2xl',
          'border border-[var(--border)]',
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
          'p-8 md:p-10 flex flex-col items-center justify-between overflow-hidden',
          !badge.unlocked ? 'opacity-95' : '',
        ].join(' ')}
        role="group"
        aria-label={badge.name}
      >
        {/* highlight interno sutil (material premium) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-white/5 via-transparent to-transparent opacity-70" />

        <motion.div
          animate={{ rotate: hovered ? 1.15 : 0, scale: hovered ? 1.03 : 1 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="mt-2"
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
          <h3 className="text-2xl md:text-3xl font-black text-[var(--foreground,var(--text))] mb-3 leading-none">
            {badge.name}
          </h3>
          <p className="text-base md:text-lg text-[var(--foreground,var(--text))]/70 px-2 md:px-6">
            {badge.description}
          </p>
        </div>

        <div className="w-full mt-6 md:mt-8">
          {badge.unlocked ? (
            <div className="flex items-center justify-center gap-3 text-emerald-400">
              <CheckCircle2 className="w-8 h-8 stroke-[1.8]" aria-hidden="true" />
              <p className="text-xl md:text-2xl font-black">+{badge.xp_reward} XP</p>
            </div>
          ) : (
            <div className="w-full">
              <div className="w-full bg-[var(--background)]/50 rounded-full h-3 overflow-hidden" aria-hidden="true">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${badge.progress}%` }}
                  transition={{ duration: 1.1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)]"
                />
              </div>
              <p className="text-center text-lg md:text-xl font-black text-[var(--foreground,var(--text))] mt-4">
                {badge.progress}%
              </p>
            </div>
          )}
        </div>

        <div className="mt-3 px-6 py-3 rounded-full bg-[var(--background)]/40 border border-[var(--border)]">
          <p className="text-[10px] font-semibold tracking-[0.28em] text-[var(--foreground,var(--text))]/70">
            {badge.rarity.toUpperCase()}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

const LevelOrb = ({ rank }: { rank: UserRank }) => {
  const safeNext = Math.max(1, rank.next_rank_xp)
  const progress = (rank.current_xp / safeNext) * 100
  const pct = Math.max(0, Math.min(100, Math.floor(progress)))

  const size = 320
  const stroke = 10
  const r = size / 2 - stroke / 2 - 8
  const c = 2 * Math.PI * r
  const dash = (pct / 100) * c

  return (
    <div className="relative w-80 h-80 mx-auto">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 mx-auto" aria-hidden="true">
        <defs>
          <linearGradient id="alsham-orb" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--accent-1)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--accent-2)" stopOpacity="0.95" />
          </linearGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={stroke} />

        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#alsham-orb)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          filter="url(#softGlow)"
          initial={{ strokeDasharray: `0 ${c}` }}
          animate={{ strokeDasharray: `${dash} ${c - dash}` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />

        {Array.from({ length: 36 }).map((_, i) => {
          const a = (i / 36) * 2 * Math.PI
          const x1 = size / 2 + Math.cos(a) * (r - 18)
          const y1 = size / 2 + Math.sin(a) * (r - 18)
          const x2 = size / 2 + Math.cos(a) * (r - 8)
          const y2 = size / 2 + Math.sin(a) * (r - 8)
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={2}
              strokeLinecap="round"
            />
          )
        })}
      </svg>

      <div className="absolute inset-10 rounded-full bg-[var(--surface)]/40 border border-[var(--border)]/60 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-10">
        <h2 className="text-3xl md:text-4xl font-black text-[var(--foreground,var(--text))] leading-none tracking-tight">
          {rank.rank_name}
        </h2>

        <p className="mt-3 text-6xl md:text-7xl font-black bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] bg-clip-text text-transparent leading-none">
          {pct}%
        </p>

        <p className="mt-2 text-base md:text-lg text-[var(--foreground,var(--text))]/70">para o próximo nível</p>

        <div className="mt-5">
          <p className="text-base md:text-lg font-semibold text-emerald-400">
            Top {rank.global_position}% global
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Achievements() {
  const [achievements] = useState(ACHIEVEMENTS)
  const [activeTab, setActiveTab] = useState<'badges' | 'leaderboard'>('badges')

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalXP = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.xp_reward, 0)

  return (
    <div className="relative w-full">
      {/* Background interno (somente no content area) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[32px]"
        style={{
          background:
            'radial-gradient(1200px 760px at 14% 10%, color-mix(in oklab, var(--accent-1, #a855f7) 14%, transparent) 0%, transparent 60%),' +
            'radial-gradient(1100px 720px at 86% 8%, color-mix(in oklab, var(--accent-2, #22c55e) 10%, transparent) 0%, transparent 55%),' +
            'linear-gradient(135deg, color-mix(in oklab, var(--background) 92%, black) 0%, var(--background) 55%, color-mix(in oklab, var(--background) 88%, black) 100%)',
          opacity: 0.9,
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 py-6 md:px-8 md:py-8">
        {/* Header */}
        <div
          className="mb-6 rounded-3xl border p-6 md:p-8"
          style={{
            borderColor: 'color-mix(in oklab, var(--foreground, #fff) 10%, transparent)',
            background: 'color-mix(in oklab, var(--surface, var(--background)) 72%, transparent)',
            backdropFilter: 'blur(18px)',
          }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <h1
                className="truncate text-2xl md:text-4xl font-black"
                style={{
                  backgroundImage: 'linear-gradient(90deg, var(--accent-1, #a855f7), var(--accent-2, #22c55e))',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Achievements
              </h1>
              <p className="mt-2 text-sm md:text-base" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 65%, transparent)' }}>
                Reconhecimento por consistência, qualidade e impacto (modo simulado).
              </p>
            </div>

            <div className="flex flex-wrap gap-10">
              <div>
                <p className="text-xs md:text-sm" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 60%, transparent)' }}>
                  Desbloqueadas
                </p>
                <p className="text-3xl md:text-4xl font-black text-emerald-400">
                  {unlockedCount}/{achievements.length}
                </p>
              </div>

              <div>
                <p className="text-xs md:text-sm" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 60%, transparent)' }}>
                  XP total
                </p>
                <p className="text-3xl md:text-4xl font-black" style={{ color: 'var(--accent-1, #a855f7)' }}>
                  {totalXP.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Plinth premium para orb + tabs */}
        <div className="mb-8">
          <div
            className="relative rounded-3xl border p-6 md:p-10 overflow-hidden"
            style={{
              borderColor: 'color-mix(in oklab, var(--foreground, #fff) 10%, transparent)',
              background: 'color-mix(in oklab, var(--surface, var(--background)) 60%, transparent)',
              backdropFilter: 'blur(18px)',
            }}
          >
            <div className="absolute -inset-10 blur-3xl bg-gradient-to-br from-[var(--accent-1)]/10 via-transparent to-[var(--accent-2)]/10 opacity-80 pointer-events-none" />
            <div className="absolute inset-0 rounded-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] pointer-events-none" />

            <LevelOrb
              rank={{
                rank_name: 'Operação Avançada',
                current_xp: 42850,
                next_rank_xp: 50000,
                global_position: 3,
                weekly_change: 18,
              }}
            />

            <div className="mt-8 md:mt-10">
              <SegmentedTabs value={activeTab} onChange={setActiveTab} />
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'badges' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {achievements.map(badge => (
              <HolographicCard key={badge.id} badge={badge} />
            ))}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div
            className="rounded-3xl border p-8 md:p-12 text-center"
            style={{
              borderColor: 'color-mix(in oklab, var(--foreground, #fff) 10%, transparent)',
              background: 'color-mix(in oklab, var(--surface, var(--background)) 70%, transparent)',
              backdropFilter: 'blur(18px)',
            }}
          >
            <h2 className="text-2xl md:text-3xl font-black" style={{ color: 'var(--foreground,var(--text))' }}>
              Ranking (simulado)
            </h2>
            <p className="mt-2 text-sm md:text-base" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 60%, transparent)' }}>
              Exibição de referência. Quando conectado ao backend, este bloco refletirá dados reais.
            </p>

            <div className="mt-8 space-y-6 max-w-2xl mx-auto">
              <div className="p-6 md:p-7 rounded-3xl border" style={{ borderColor: 'color-mix(in oklab, #f59e0b 40%, transparent)', background: 'color-mix(in oklab, #f59e0b 14%, transparent)' }}>
                <p className="text-lg md:text-xl font-black" style={{ color: 'color-mix(in oklab, #fcd34d 85%, white)' }}>
                  1. Colaborador A — 142.000 XP
                </p>
              </div>

              <div className="p-6 md:p-7 rounded-3xl border" style={{ borderColor: 'color-mix(in oklab, var(--foreground, #fff) 18%, transparent)', background: 'color-mix(in oklab, var(--foreground, #fff) 8%, transparent)' }}>
                <p className="text-lg md:text-xl font-black" style={{ color: 'color-mix(in oklab, var(--foreground, #fff) 82%, transparent)' }}>
                  2. Colaborador B — 138.500 XP
                </p>
              </div>

              <div className="p-6 md:p-7 rounded-3xl border" style={{ borderColor: 'color-mix(in oklab, var(--accent-1, #a855f7) 35%, transparent)', background: 'color-mix(in oklab, var(--accent-1, #a855f7) 14%, transparent)' }}>
                <p className="text-lg md:text-xl font-black" style={{ color: 'var(--accent-1, #a855f7)' }}>
                  3. Você — 42.850 XP
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
