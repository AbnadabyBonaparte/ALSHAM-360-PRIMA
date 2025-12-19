export const ICON_SCALES = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
  xxl: 64,
} as const

export const STROKE_WIDTHS = {
  thin: 1.5,
  normal: 1.75,
  bold: 2,
} as const

export const ICON_CONTAINERS = {
  none: 'inline-flex items-center justify-center',
  medallion:
    'relative isolate grid place-items-center rounded-2xl border border-white/10 bg-[var(--surface)]/70 backdrop-blur-xl shadow-[0_15px_45px_-22px_rgba(0,0,0,0.65)]',
  glass:
    'relative isolate grid place-items-center rounded-2xl border border-white/15 bg-white/8 backdrop-blur-2xl shadow-[0_18px_60px_-25px_rgba(0,0,0,0.7)]',
  ring:
    'relative isolate grid place-items-center rounded-full border border-white/15 bg-gradient-to-br from-white/8 via-white/4 to-white/0 backdrop-blur-lg shadow-[0_12px_40px_-24px_rgba(0,0,0,0.5)]',
} as const

export const ICON_STATES = ['default', 'hover', 'active', 'locked', 'disabled'] as const

export const ICON_RARITY_TOKENS = {
  common: {
    aura: 'from-white/16 via-white/6 to-transparent',
    container: 'from-white/12 via-white/8 to-white/4',
    ring: 'ring-white/18',
    text: 'text-[var(--text)]/80',
  },
  rare: {
    aura: 'from-cyan-400/24 via-cyan-300/10 to-transparent',
    container: 'from-cyan-400/20 via-cyan-300/12 to-white/8',
    ring: 'ring-cyan-300/35',
    text: 'text-cyan-100',
  },
  epic: {
    aura: 'from-purple-400/24 via-purple-300/12 to-transparent',
    container: 'from-purple-400/22 via-purple-300/14 to-white/10',
    ring: 'ring-purple-300/35',
    text: 'text-purple-100',
  },
  legendary: {
    aura: 'from-amber-400/26 via-amber-300/14 to-transparent',
    container: 'from-amber-400/24 via-amber-300/16 to-white/10',
    ring: 'ring-amber-200/40',
    text: 'text-amber-100',
  },
  divine: {
    aura: 'from-pink-500/28 via-amber-400/18 to-indigo-400/16',
    container: 'from-pink-500/20 via-amber-400/16 to-indigo-400/12',
    ring: 'ring-pink-200/40',
    text: 'text-pink-50',
  },
} as const

export const MEDALLION_SIZE_MULTIPLIER = 2.2
