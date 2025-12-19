// src/lib/theme-variables.ts
// ⚜️ ALSHAM 360° PRIMA - Adapter Público (Contrato SSOT → CSS Variables)
// Responsável apenas por injetar variáveis CSS a partir do Theme (SSOT)

import { Theme } from './themes';

export function injectThemeVariables(theme: Theme): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  console.log('💉 injectThemeVariables iniciando:', {
    themeName: theme.name,
    background: theme.colors.background,
    accentPrimary: theme.colors.accentPrimary
  });

  // Mapeamento completo e alinhado com o consumo no themes.css + Tailwind
  const variables: Record<string, string> = {
    // Background (usado no body/#root via var(--bg))
    '--bg': theme.colors.background,
    '--bg-g1': theme.colors.backgroundGradient1,
    '--bg-g2': theme.colors.backgroundGradient2,
    '--bg-gradient': `linear-gradient(135deg, ${theme.colors.backgroundGradient1}, ${theme.colors.backgroundGradient2})`,

    // Surfaces & Glass
    '--surface': theme.colors.surface,
    '--surface-strong': theme.colors.surfaceStrong,
    '--surface-elev': theme.colors.surfaceElevated,
    '--surface-glass': 'rgba(255, 255, 255, 0.04)', // fallback fixo ou pode vir do tema se adicionar
    '--glass-hi': theme.colors.glassHighlight,

    // Borders
    '--border': theme.colors.border,
    '--border-strong': theme.colors.borderStrong,

    // Text
    '--text': theme.colors.textPrimary,
    '--text-2': theme.colors.textSecondary,
    '--text-muted': `color-mix(in srgb, ${theme.colors.textSecondary} 75%, transparent)`,

    // Accents (contrato principal + aliases Tailwind)
    '--accent-1': theme.colors.accentPrimary,
    '--accent-2': theme.colors.accentSecondary,
    '--accent-3': theme.colors.accentTertiary,
    '--accent-warm': theme.colors.accentWarm,
    '--accent-alert': theme.colors.accentAlert,

    // Aliases de compatibilidade (usados no Tailwind e CSS legado)
    '--accent-primary': theme.colors.accentPrimary,
    '--accent-secondary': theme.colors.accentSecondary,
    '--accent-tertiary': theme.colors.accentTertiary,
    '--accent-emerald': theme.colors.accentPrimary,
    '--accent-sky': theme.colors.accentSecondary,
    '--accent-fuchsia': theme.colors.accentTertiary,
    '--accent-amber': theme.colors.accentWarm,

    // Gradients diretos
    '--grad-primary': theme.colors.gradientPrimary,
    '--grad-secondary': theme.colors.gradientSecondary,
    '--grad-accent': theme.colors.gradientAccent,
    '--grad-wash': theme.colors.gradientWash,
    '--grad-veiled': theme.colors.gradientVeiled,

    // Aliases legados para botões e componentes
    '--gradient-primary': theme.colors.gradientPrimary,
    '--gradient-secondary': theme.colors.gradientSecondary,
    '--gradient-tertiary': theme.colors.gradientAccent,
    '--gradient-wash': theme.colors.gradientWash,
    '--gradient-veiled': theme.colors.gradientVeiled,

    // Glows
    '--glow-1': theme.colors.glowPrimary,
    '--glow-2': theme.colors.glowSecondary,
    '--glow-3': theme.colors.glowAccent,
    '--glow-primary': theme.colors.glowPrimary,
    '--glow-secondary': theme.colors.glowSecondary,
    '--glow-tertiary': theme.colors.glowAccent,

    // Hover accents (podem ser melhorados depois com :hover no CSS, mas fallback útil)
    '--accent-primary-hover': theme.colors.accentPrimary + 'cc', // ~80% opacity
    '--accent-secondary-hover': theme.colors.accentSecondary + 'cc',
    '--accent-tertiary-hover': theme.colors.accentTertiary + 'cc',
  };

  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  console.log('✅ injectThemeVariables completo:', Object.keys(variables).length, 'variáveis injetadas');
}

// Opcional: cleanup completo (útil para testes ou hot-reload)
export function removeThemeVariables(): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const keys = Object.keys(root.style).filter(k => k.startsWith('--'));
  keys.forEach(key => root.style.removeProperty(key));
}
