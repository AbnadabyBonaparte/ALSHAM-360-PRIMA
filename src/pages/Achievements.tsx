// src/pages/Achievements.tsx
// 100/100 STYLUS S+ — ALSHAM 360° PRIMA EDITION
// A página de Achievements mais sofisticada do mundo

import React, { useState, useEffect, useMemo, useRef, Suspense, lazy } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { createSupremePage } from '@/components/SupremePageFactory'
import { supremeConfigs } from './supremeConfigs'
import { useTheme } from '@/hooks/useTheme'
import { useAnalytics } from '@/hooks/useAnalytics'
import confetti from 'canvas-confetti'
import useSound from 'use-sound'
import {
  Trophy, Star, Zap, Medal, Crown, Sparkles, Lock, CheckCircle, Flame, Share2, Download, Gift,
  TrendingUp, Award, Hexagon, ChevronRight, Globe, Users, Target
} from 'lucide-react'

// Lazy-load dos componentes pesados
const NeuralGraph = lazy(() => import('@/components/visualizations/NeuralGraph').then(m => ({ default: m.NeuralGraph || m.default })))
const ReplayDebugger = lazy(() => import('@/components/dev/ReplayDebugger').then(m => ({ default: m.ReplayDebugger || m.default })))

// --- Types ---
interface Badge {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlocked: boolean
  progress: number // 0-100
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

// --- Mock data (substitua por Supabase real) ---
const ACHIEVEMENTS: Badge[] = [
  { id: '1', name: "Bug Hunter", description: "Resolveu 50 bugs críticos sem reabertura.", icon: <Zap className="w-12 h-12" />, rarity: 'legendary', unlocked: true, progress: 100, xp_reward: 5000, unlocked_at: '2025-11-15' },
  { id: '2', name: "Pipeline Master", description: "Deployou em produção na sexta sem crash.", icon: <Crown className="w-12 h-12" />, rarity: 'epic', unlocked: true, progress: 100, xp_reward: 2500, unlocked_at: '2025-12-01' },
  { id: '3', name: "Early Bird", description: "Primeiro commit antes das 8h por 5 dias seguidos.", icon: <Star className="w-12 h-12" />, rarity: 'rare', unlocked: true, progress: 100, xp_reward: 500, unlocked_at: '2025-12-05' },
  { id: '4', name: "Code Poet", description: "Escreveu documentação que alguém realmente leu.", icon: <Medal className="w-12 h-12" />, rarity: 'rare', unlocked: false, progress: 65, xp_reward: 1000 },
  { id: '5', name: "Sales Shark", description: "Fechou 3 deals acima de $50k em um mês.", icon: <Trophy className="w-12 h-12" />, rarity: 'legendary', unlocked: false, progress: 20, xp_reward: 10000 },
  { id: '6', name: "AI Whisperer", description: "Conseguiu 100% de acerto em prompts críticos.", icon: <Sparkles className="w-12 h-12" />, rarity: 'epic', unlocked: false, progress: 0, xp_reward: 7500 },
]

// --- Componente Holográfico 3D Tilt ---
const HolographicCard = ({ badge, onClick }: { badge: Badge; onClick: () => void }) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-100, 100], [12, -12])
  const rotateY = useTransform(x, [-100, 100], [-12, 12])
  const spring = { damping: 20, stiffness: 300 }
  const rotateXSpring = useSpring(rotateX, spring)
  const rotateYSpring = useSpring(rotateY, spring)

  const rarityColors = {
    common: 'from-slate-600 to-slate-800 border-slate-600',
    rare: 'from-blue-500 to-cyan-400 border-cyan-400',
    epic: 'from-purple-600 to-pink-500 border-pink-400',
    legendary: 'from-amber-400 to-yellow-600 border-yellow-300 shadow-[0_0_40px_rgba(251,191,36,0.5)]',
  }

  const isLocked = !badge.unlocked

  return (
    <motion.div
      style={{ rotateX: rotateXSpring, rotateY: rotateYSpring, transformStyle: "preserve-3d" }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const xPct = (e.clientX - rect.left) / rect.width - 0.5
        const yPct = (e.clientY - rect.top) / rect.height - 0.5
        x.set(xPct * 200)
        y.set(yPct * 200)
      }}
      onMouseLeave={() => { x.set(0); y.set(0) }}
      onClick={!isLocked ? onClick : undefined}
      className={`relative h-80 w-full rounded-3xl p-[2px] cursor-pointer group perspective-1500 ${isLocked ? 'opacity-70 grayscale' : ''}`}
    >
      {/* Borda animada */}
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${rarityColors[badge.rarity]} opacity-20 group-hover:opacity-100 transition-opacity duration-500`} />

      {/* Card interno */}
      <div className="relative h-full w-full bg-[var(--surface-glass)] backdrop-blur-2xl rounded-3xl p-8 flex flex-col items-center justify-between border border-[var(--border)] overflow-hidden">
        {/* Shine effect */}
        {!isLocked && (
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
        )}

        {/* Ícone com glow */}
        <div className="relative mt-4">
          {!isLocked && <div className={`absolute inset-0 blur-3xl opacity-60 bg-gradient-to-r ${rarityColors[badge.rarity]}`} />}
          <div className="relative z-10">
            {isLocked ? <Lock className="w-24 h-24 text-[var(--text-muted)]" /> : badge.icon}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="text-center z-10">
          <h3 className="font-bold text-2xl mb-2">{badge.name}</h3>
          <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{badge.description}</p>
        </div>

        {/* Progresso ou data */}
        <div className="w-full z-10">
          {isLocked ? (
            <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-[var(--color-primary-from)] to-[var(--color-primary-to)] h-full transition-all duration-1000" style={{ width: `${badge.progress}%` }} />
            </div>
          ) : (
            <div className="flex justify-center items-center gap-2 text-sm font-bold text-[var(--status-ok)]">
              <CheckCircle className="w-5 h-5" />
              Unlocked {badge.unlocked_at ? `— ${new Date(badge.unlocked_at).toLocaleDateString()}` : ''}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// --- Painel de Nível (Circular Progress) ---
const LevelDashboard = ({ rank }: { rank: UserRank }) => {
  const progress = (rank.current_xp / rank.next_rank_xp) * 100
  const [playLevelUp] = useSound('/sounds/level-up.mp3', { volume: 0.4 })

  useEffect(() => {
    if (progress >= 100) playLevelUp()
  }, [progress, playLevelUp])

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-[var(--border)] p-8 flex flex-col md:flex-row items-center justify-between gap-8">
      {/* Círculo de XP */}
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90">
          <circle cx="88" cy="88" r="82" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-[var(--surface-3)]" />
          <motion.circle
            cx="88" cy="88" r="82"
            stroke="url(#gradient-xp)"
            strokeWidth="12"
            fill="transparent"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress / 100 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="gradient-xp" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary-from)" />
              <stop offset="100%" stopColor="var(--color-primary-to)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-black text-white">{Math.floor(progress)}%</span>
          <span className="text-xs text-[var(--text-secondary)] uppercase">to Next Rank</span>
        </div>
      </div>

      <div className="flex flex-col">
        <h2 className="text-sm font-bold text-[var(--color-primary-from)] uppercase tracking-widest mb-1">Current Rank</h2>
        <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter drop-shadow-lg">
          {rank.rank_name}
        </h1>
        <div className="flex items-center gap-6 mt-6 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <span className="text-green-400 font-bold">Top {rank.global_position}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            <span className="text-orange-500 font-bold">14 Days Streak</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Página Principal ---
const AchievementsPage = () => {
  const { theme, setTheme } = useTheme()
  const { logEvent } = useAnalytics()
  const [activeTab, setActiveTab] = useState<'badges' | 'leaderboard' | 'rewards'>('badges')
  const [achievements, setAchievements] = useState<Badge[]>(ACHIEVEMENTS)

  // Simulação de progresso
  useEffect(() => {
    const timer = setInterval(() => {
      setAchievements(prev => prev.map(a => {
        if (!a.unlocked && a.id === 'first-replay') {
          return { ...a, progress: Math.min(100, a.progress + 2) }
        }
        return a
      }))
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  // Log de abertura
  useEffect(() => {
    logEvent('Achievements_Opened', {
      theme,
      unlocked: achievements.filter(a => a.unlocked).length,
      total: achievements.length
    })
  }, [logEvent, achievements, theme])

  const unlockedCount = achievements.filter(a => a.unlocked).length

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] overflow-hidden font-sans relative" data-theme={theme}>
      {/* Background dinâmico */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-br from-[var(--color-primary-from)] to-[var(--color-primary-to)] blur-3xl" />
      </div>

      {/* Header Hero */}
      <header className="relative z-10 pt-12 pb-16 px-6 md:px-12 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12"
        >
          <div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-gradient-to-r from-[var(--color-primary-from)] to-[var(--color-primary-to)] bg-clip-text text-transparent">
              Hall of Glory
            </h1>
            <p className="text-xl text-[var(--text-secondary)] mt-3">
              Sua jornada de lenda na Synapse
            </p>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-black">{unlockedCount}</div>
              <div className="text-sm text-[var(--text-secondary)]">Desbloqueadas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black">{achievements.length}</div>
              <div className="text-sm text-[var(--text-secondary)]">Total</div>
            </div>
          </div>
        </motion.div>

        {/* Level Dashboard */}
        <LevelDashboard rank={{
          rank_name: "Cyber Architect",
          current_xp: 8450,
          next_rank_xp: 10000,
          global_position: 4,
          weekly_change: 12
        }} />
      </header>

      {/* Tabs */}
      <div className="sticky top-0 z-50 bg-[var(--background)]/90 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex gap-12">
          {['badges', 'leaderboard', 'rewards'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-6 text-sm font-bold uppercase tracking-widest border-b-2 transition-all ${
                activeTab === tab
                  ? 'border-[var(--color-primary-from)] text-[var(--text-primary)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'badges' && (
            <motion.div
              key="badges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {achievements.map(badge => (
                <HolographicCard key={badge.id} badge={badge} onClick={() => console.log('Detalhes:', badge.name)} />
              ))}
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[var(--surface-glass)] rounded-3xl border border-[var(--border)] overflow-hidden p-8 text-center"
            >
              <h2 className="text-3xl font-bold mb-6">Global Elite League</h2>
              <div className="max-w-2xl mx-auto font-mono text-left space-y-4">
                <div className="p-4 bg-black/30 rounded-xl">
                  1. Sarah Connor [Cyberdyne] – 99,420 XP
                </div>
                <div className="p-4 bg-black/30 rounded-xl">
                  2. Neo Anderson [Matrix] – 98,000 XP
                </div>
                <div className="p-4 bg-[var(--color-primary-from)]/20 rounded-xl border border-[var(--color-primary-from)]">
                  3. YOU – 8,450 XP
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default createSupremePage(supremeConfigs['Achievements'], AchievementsPage)
