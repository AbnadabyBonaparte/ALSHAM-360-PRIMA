// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚜️ ALSHAM 360° PRIMA - SISTEMA DE TEMAS NEON INSANOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 6 TEMAS CYBERPUNK DE OUTRO MUNDO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type ThemeKey =
  | 'cyber-vivid'
  | 'neon-energy'
  | 'midnight-aurora'
  | 'platinum-glass'
  | 'desert-quartz'
  | 'glass-dark';

export interface ThemeColors {
  // Background
  background: string;
  backgroundGradient1: string;
  backgroundGradient2: string;

  // Surfaces
  surface: string;
  surfaceStrong: string;
  surfaceElevated: string;
  glassHighlight: string;

  // Borders
  border: string;
  borderStrong: string;

  // Text
  textPrimary: string;
  textSecondary: string;

  // Accent Colors (Neon)
  accentPrimary: string;
  accentSecondary: string;
  accentTertiary: string;
  accentWarm: string;
  accentAlert: string;

  // Gradients
  gradientPrimary: string;
  gradientSecondary: string;
  gradientAccent: string;
  gradientWash: string;
  gradientVeiled: string;

  // Neon Glow Effects
  glowPrimary: string;
  glowSecondary: string;
  glowAccent: string;
}

export interface Theme {
  key: ThemeKey;
  name: string;
  description: string;
  emoji: string;
  swatch: string;
  swatchSecondary: string;
  colors: ThemeColors;
  isDark: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔮 CYBER VIVID - O TEMA PADRÃO (Fuchsia/Purple Elétrico)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const cyberVivid: Theme = {
  key: 'cyber-vivid',
  name: 'Cyber Vivid',
  description: 'Fuchsia elétrico com vibrações cósmicas',
  emoji: '🔮',
  swatch: 'linear-gradient(135deg, #d946ef, #8b5cf6)',
  swatchSecondary: '#f472b6',
  isDark: true,
  colors: {
    background: '#0c0a14',
    backgroundGradient1: 'rgba(251, 146, 60, 0.22)',
    backgroundGradient2: 'rgba(244, 114, 182, 0.18)',
    surface: 'rgba(16, 13, 28, 0.9)',
    surfaceStrong: 'rgba(22, 18, 34, 0.95)',
    surfaceElevated: 'rgba(32, 26, 48, 0.92)',
    glassHighlight: 'rgba(244, 114, 182, 0.32)',
    border: 'rgba(251, 146, 60, 0.18)',
    borderStrong: 'rgba(139, 92, 246, 0.28)',
    textPrimary: 'rgba(255, 255, 255, 0.96)',
    textSecondary: 'rgba(231, 219, 255, 0.76)',
    accentPrimary: '#d946ef',
    accentSecondary: '#8b5cf6',
    accentTertiary: '#f472b6',
    accentWarm: '#fb923c',
    accentAlert: '#ef4444',
    gradientPrimary: 'linear-gradient(135deg, #d946ef, #a855f7)',
    gradientSecondary: 'linear-gradient(135deg, #a855f7, #8b5cf6)',
    gradientAccent: 'linear-gradient(135deg, #ec4899, #f43f5e)',
    gradientWash: 'linear-gradient(135deg, rgba(251, 146, 60, 0.12), rgba(244, 114, 182, 0.1), rgba(139, 92, 246, 0.12))',
    gradientVeiled: 'radial-gradient(circle at 26% 22%, rgba(251, 146, 60, 0.18), transparent 58%), radial-gradient(circle at 74% 78%, rgba(139, 92, 246, 0.16), transparent 60%)',
    glowPrimary: '0 0 20px rgba(217, 70, 239, 0.5), 0 0 40px rgba(217, 70, 239, 0.3)',
    glowSecondary: '0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3)',
    glowAccent: '0 0 20px rgba(244, 114, 182, 0.5), 0 0 40px rgba(244, 114, 182, 0.3)',
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚡ NEON ENERGY - Cyan/Azul Vibrante com Pink
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const neonEnergy: Theme = {
  key: 'neon-energy',
  name: 'Neon Energy',
  description: 'Energia cibernética pura',
  emoji: '⚡',
  swatch: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
  swatchSecondary: '#22d3ee',
  isDark: true,
  colors: {
    background: '#0a0f14',
    backgroundGradient1: 'rgba(34, 197, 94, 0.22)',
    backgroundGradient2: 'rgba(59, 130, 246, 0.18)',
    surface: 'rgba(13, 20, 28, 0.88)',
    surfaceStrong: 'rgba(18, 27, 36, 0.94)',
    surfaceElevated: 'rgba(24, 36, 48, 0.9)',
    glassHighlight: 'rgba(56, 189, 248, 0.32)',
    border: 'rgba(52, 211, 153, 0.18)',
    borderStrong: 'rgba(56, 189, 248, 0.28)',
    textPrimary: 'rgba(255, 255, 255, 0.96)',
    textSecondary: 'rgba(226, 244, 255, 0.72)',
    accentPrimary: '#22d3ee',
    accentSecondary: '#3b82f6',
    accentTertiary: '#34d399',
    accentWarm: '#fb923c',
    accentAlert: '#ef4444',
    gradientPrimary: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
    gradientSecondary: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    gradientAccent: 'linear-gradient(135deg, #ec4899, #f43f5e)',
    gradientWash: 'linear-gradient(135deg, rgba(52, 211, 153, 0.12), rgba(56, 189, 248, 0.1), rgba(168, 85, 247, 0.12))',
    gradientVeiled: 'radial-gradient(circle at 18% 18%, rgba(52, 211, 153, 0.18), transparent 58%), radial-gradient(circle at 82% 82%, rgba(168, 85, 247, 0.14), transparent 60%)',
    glowPrimary: '0 0 20px rgba(34, 211, 238, 0.5), 0 0 40px rgba(34, 211, 238, 0.3)',
    glowSecondary: '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)',
    glowAccent: '0 0 20px rgba(52, 211, 153, 0.5), 0 0 40px rgba(52, 211, 153, 0.3)',
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🌌 MIDNIGHT AURORA - Violet/Purple Profundo
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const midnightAurora: Theme = {
  key: 'midnight-aurora',
  name: 'Midnight Aurora',
  description: 'Aurora boreal à meia-noite',
  emoji: '🌌',
  swatch: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
  swatchSecondary: '#c084fc',
  isDark: true,
  colors: {
    background: '#10141c',
    backgroundGradient1: 'rgba(119, 137, 150, 0.18)',
    backgroundGradient2: 'rgba(173, 149, 116, 0.16)',
    surface: 'rgba(24, 28, 34, 0.82)',
    surfaceStrong: 'rgba(39, 46, 56, 0.86)',
    surfaceElevated: 'rgba(48, 56, 68, 0.84)',
    glassHighlight: 'rgba(110, 128, 140, 0.32)',
    border: 'rgba(155, 168, 179, 0.22)',
    borderStrong: 'rgba(198, 206, 212, 0.28)',
    textPrimary: '#f7f7f4',
    textSecondary: 'rgba(218, 224, 228, 0.74)',
    accentPrimary: '#a78bfa',
    accentSecondary: '#818cf8',
    accentTertiary: '#c084fc',
    accentWarm: '#fb923c',
    accentAlert: '#f87171',
    gradientPrimary: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
    gradientSecondary: 'linear-gradient(135deg, #6366f1, #3b82f6)',
    gradientAccent: 'linear-gradient(135deg, #d946ef, #ec4899)',
    gradientWash: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(99, 102, 241, 0.1))',
    gradientVeiled: 'radial-gradient(circle at 82% 12%, rgba(139, 92, 246, 0.22), transparent 60%), radial-gradient(circle at 18% 88%, rgba(99, 102, 241, 0.18), transparent 55%)',
    glowPrimary: '0 0 20px rgba(167, 139, 250, 0.5), 0 0 40px rgba(167, 139, 250, 0.3)',
    glowSecondary: '0 0 20px rgba(129, 140, 248, 0.5), 0 0 40px rgba(129, 140, 248, 0.3)',
    glowAccent: '0 0 20px rgba(192, 132, 252, 0.5), 0 0 40px rgba(192, 132, 252, 0.3)',
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🪙 PLATINUM GLASS - Elegância Metálica
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const platinumGlass: Theme = {
  key: 'platinum-glass',
  name: 'Platinum Glass',
  description: 'Elegância corporativa premium',
  emoji: '🪙',
  swatch: 'linear-gradient(135deg, #94a3b8, #cbd5e1)',
  swatchSecondary: '#e2e8f0',
  isDark: false,
  colors: {
    background: '#e9ecef',
    backgroundGradient1: 'rgba(143, 153, 163, 0.22)',
    backgroundGradient2: 'rgba(209, 192, 166, 0.18)',
    surface: 'rgba(255, 255, 255, 0.72)',
    surfaceStrong: 'rgba(245, 247, 249, 0.88)',
    surfaceElevated: 'rgba(255, 255, 255, 0.92)',
    glassHighlight: 'rgba(232, 234, 236, 0.75)',
    border: 'rgba(153, 161, 170, 0.32)',
    borderStrong: 'rgba(98, 110, 124, 0.38)',
    textPrimary: '#1f2933',
    textSecondary: 'rgba(60, 72, 86, 0.72)',
    accentPrimary: '#64748b',
    accentSecondary: '#475569',
    accentTertiary: '#94a3b8',
    accentWarm: '#b45309',
    accentAlert: '#dc2626',
    gradientPrimary: 'linear-gradient(135deg, #94a3b8, #cbd5e1)',
    gradientSecondary: 'linear-gradient(135deg, #64748b, #94a3b8)',
    gradientAccent: 'linear-gradient(135deg, #475569, #64748b)',
    gradientWash: 'linear-gradient(135deg, rgba(148, 163, 184, 0.12), rgba(203, 213, 225, 0.1))',
    gradientVeiled: 'radial-gradient(circle at 18% 12%, rgba(255, 255, 255, 0.28), transparent 60%)',
    glowPrimary: '0 0 20px rgba(100, 116, 139, 0.3), 0 0 40px rgba(100, 116, 139, 0.15)',
    glowSecondary: '0 0 20px rgba(71, 85, 105, 0.3), 0 0 40px rgba(71, 85, 105, 0.15)',
    glowAccent: '0 0 20px rgba(148, 163, 184, 0.3), 0 0 40px rgba(148, 163, 184, 0.15)',
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏜️ DESERT QUARTZ - Amber/Orange Quente
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const desertQuartz: Theme = {
  key: 'desert-quartz',
  name: 'Desert Quartz',
  description: 'Calor do deserto ao entardecer',
  emoji: '🏜️',
  swatch: 'linear-gradient(135deg, #f59e0b, #f97316)',
  swatchSecondary: '#fbbf24',
  isDark: false,
  colors: {
    background: '#efe4d4',
    backgroundGradient1: 'rgba(204, 173, 132, 0.24)',
    backgroundGradient2: 'rgba(189, 159, 118, 0.22)',
    surface: 'rgba(255, 255, 255, 0.78)',
    surfaceStrong: 'rgba(250, 247, 242, 0.9)',
    surfaceElevated: 'rgba(255, 255, 255, 0.95)',
    glassHighlight: 'rgba(232, 210, 184, 0.72)',
    border: 'rgba(201, 178, 146, 0.38)',
    borderStrong: 'rgba(163, 135, 100, 0.45)',
    textPrimary: '#3f2f24',
    textSecondary: 'rgba(110, 86, 63, 0.76)',
    accentPrimary: '#f59e0b',
    accentSecondary: '#ea580c',
    accentTertiary: '#d97706',
    accentWarm: '#c2410c',
    accentAlert: '#dc2626',
    gradientPrimary: 'linear-gradient(135deg, #f59e0b, #f97316)',
    gradientSecondary: 'linear-gradient(135deg, #eab308, #f59e0b)',
    gradientAccent: 'linear-gradient(135deg, #f97316, #ef4444)',
    gradientWash: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(249, 115, 22, 0.1))',
    gradientVeiled: 'linear-gradient(140deg, rgba(249, 241, 229, 0.65), rgba(227, 213, 194, 0.8))',
    glowPrimary: '0 0 20px rgba(245, 158, 11, 0.4), 0 0 40px rgba(245, 158, 11, 0.2)',
    glowSecondary: '0 0 20px rgba(234, 88, 12, 0.4), 0 0 40px rgba(234, 88, 12, 0.2)',
    glowAccent: '0 0 20px rgba(217, 119, 6, 0.4), 0 0 40px rgba(217, 119, 6, 0.2)',
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🌑 GLASS DARK - Emerald/Teal Clássico (Fallback)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const glassDark: Theme = {
  key: 'glass-dark',
  name: 'Glass Dark',
  description: 'Elegância escura atemporal',
  emoji: '🌑',
  swatch: 'linear-gradient(135deg, #10b981, #14b8a6)',
  swatchSecondary: '#34d399',
  isDark: true,
  colors: {
    background: '#111417',
    backgroundGradient1: 'rgba(122, 143, 128, 0.16)',
    backgroundGradient2: 'rgba(197, 164, 124, 0.14)',
    surface: 'rgba(21, 23, 24, 0.78)',
    surfaceStrong: 'rgba(36, 40, 42, 0.86)',
    surfaceElevated: 'rgba(52, 56, 58, 0.8)',
    glassHighlight: 'rgba(168, 178, 173, 0.25)',
    border: 'rgba(210, 215, 212, 0.16)',
    borderStrong: 'rgba(235, 238, 234, 0.24)',
    textPrimary: '#f5f5f1',
    textSecondary: 'rgba(229, 229, 222, 0.72)',
    accentPrimary: '#34d399',
    accentSecondary: '#2dd4bf',
    accentTertiary: '#38bdf8',
    accentWarm: '#fbbf24',
    accentAlert: '#f87171',
    gradientPrimary: 'linear-gradient(135deg, #10b981, #14b8a6)',
    gradientSecondary: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    gradientAccent: 'linear-gradient(135deg, #a855f7, #ec4899)',
    gradientWash: 'linear-gradient(135deg, rgba(122, 143, 128, 0.22), rgba(197, 164, 124, 0.16))',
    gradientVeiled: 'radial-gradient(circle at 12% 18%, rgba(122, 143, 128, 0.22), transparent 58%), radial-gradient(circle at 88% 82%, rgba(197, 164, 124, 0.18), transparent 60%)',
    glowPrimary: '0 0 20px rgba(52, 211, 153, 0.5), 0 0 40px rgba(52, 211, 153, 0.3)',
    glowSecondary: '0 0 20px rgba(45, 212, 191, 0.5), 0 0 40px rgba(45, 212, 191, 0.3)',
    glowAccent: '0 0 20px rgba(56, 189, 248, 0.5), 0 0 40px rgba(56, 189, 248, 0.3)',
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 EXPORTAÇÃO DOS TEMAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const themes: Record<ThemeKey, Theme> = {
  'cyber-vivid': cyberVivid,
  'neon-energy': neonEnergy,
  'midnight-aurora': midnightAurora,
  'platinum-glass': platinumGlass,
  'desert-quartz': desertQuartz,
  'glass-dark': glassDark,
};

export const themeList: Theme[] = [
  cyberVivid,
  neonEnergy,
  midnightAurora,
  platinumGlass,
  desertQuartz,
  glassDark,
];

export const defaultTheme: ThemeKey = 'cyber-vivid';

// Helper para obter tema por key
export function getTheme(key: ThemeKey): Theme {
  return themes[key] || themes[defaultTheme];
}

// Helper para verificar se tema é escuro
export function isThemeDark(key: ThemeKey): boolean {
  return themes[key]?.isDark ?? true;
}

// Swatch colors para preview rápido
export const themeSwatches: Record<ThemeKey, string> = {
  'cyber-vivid': cyberVivid.swatch,
  'neon-energy': neonEnergy.swatch,
  'midnight-aurora': midnightAurora.swatch,
  'platinum-glass': platinumGlass.swatch,
  'desert-quartz': desertQuartz.swatch,
  'glass-dark': glassDark.swatch,
};
