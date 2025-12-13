// src/lib/theme-variables.ts
import type { Theme } from './themes'

export function injectThemeVariables(theme: Theme): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement

  const variables: Record<string, string> = {
    // ✅ Contrato novo (fonte preferida)
    '--bg': theme.colors.background,
    '--bg-g1': theme.colors.backgroundGradient1,
    '--bg-g2': theme.colors.backgroundGradient2,

    '--surface': theme.colors.surface,
    '--surface-strong': theme.colors.surfaceStrong,
    '--surface-elev': theme.colors.surfaceElevated,
    '--glass-hi': theme.colors.glassHighlight,

    '--border': theme.colors.border,
    '--border-strong': theme.colors.borderStrong,

    '--text': theme.colors.textPrimary,
    '--text-2': theme.colors.textSecondary,

    '--accent-1': theme.colors.accentPrimary,
    '--accent-2': theme.colors.accentSecondary,
    '--accent-3': theme.colors.accentTertiary,
    '--accent-warm': theme.colors.accentWarm,
    '--accent-alert': theme.colors.accentAlert,

    '--grad-primary': theme.colors.gradientPrimary,
    '--grad-secondary': theme.colors.gradientSecondary,
    '--grad-accent': theme.colors.gradientAccent,
    '--grad-wash': theme.colors.gradientWash,
    '--grad-veiled': theme.colors.gradientVeiled,

    '--glow-1': theme.colors.glowPrimary,
    '--glow-2': theme.colors.glowSecondary,
    '--glow-3': theme.colors.glowAccent,

    // ✅ Aliases legacy (compatibilidade)
    '--background': theme.colors.background,
    '--background-gradient-1': theme.colors.backgroundGradient1,
    '--background-gradient-2': theme.colors.backgroundGradient2,

    '--surface-elevated': theme.colors.surfaceElevated,
    '--glass-highlight': theme.colors.glassHighlight,

    '--text-primary': theme.colors.textPrimary,
    '--text-secondary': theme.colors.textSecondary,

    '--gradient-primary': theme.colors.gradientPrimary,
    '--gradient-secondary': theme.colors.gradientSecondary,
    '--gradient-accent': theme.colors.gradientAccent,
    '--gradient-wash': theme.colors.gradientWash,
    '--gradient-veiled': theme.colors.gradientVeiled,

    '--glow-primary': theme.colors.glowPrimary,
    '--glow-secondary': theme.colors.glowSecondary,
    '--glow-accent': theme.colors.glowAccent,

    // ✅ Mantém o CSS atual de botões funcionando (SEM sobrescrever por accent)
    // Deixe o themes.css definir --color-primary-from/to por tema,
    // ou então mapeie para "primário real" caso queira padronizar via JS:
    '--color-primary-from': theme.colors.accentPrimary,
    '--color-primary-to': theme.colors.accentSecondary,
  }

  for (const [k, v] of Object.entries(variables)) {
    root.style.setProperty(k, v)
  }
}

export function removeThemeVariables(): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement

  const vars = [
    '--bg','--bg-g1','--bg-g2',
    '--surface','--surface-strong','--surface-elev','--glass-hi',
    '--border','--border-strong',
    '--text','--text-2',
    '--accent-1','--accent-2','--accent-3','--accent-warm','--accent-alert',
    '--grad-primary','--grad-secondary','--grad-accent','--grad-wash','--grad-veiled',
    '--glow-1','--glow-2','--glow-3',
    '--background','--background-gradient-1','--background-gradient-2',
    '--surface-elevated','--glass-highlight',
    '--text-primary','--text-secondary',
    '--gradient-primary','--gradient-secondary','--gradient-accent','--gradient-wash','--gradient-veiled',
    '--glow-primary','--glow-secondary','--glow-accent',
    '--color-primary-from','--color-primary-to',
  ]

  vars.forEach((v) => root.style.removeProperty(v))
}
