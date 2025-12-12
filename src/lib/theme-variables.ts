// src/lib/theme-variables.ts
import { Theme } from './themes';

export function injectThemeVariables(theme: Theme): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  
  // Mapear cores do tema para variáveis CSS
  const variables = {
    // Background
    '--background': theme.colors.background,
    '--background-gradient-1': theme.colors.backgroundGradient1,
    '--background-gradient-2': theme.colors.backgroundGradient2,
    
    // Surfaces
    '--surface': theme.colors.surface,
    '--surface-strong': theme.colors.surfaceStrong,
    '--surface-elevated': theme.colors.surfaceElevated,
    '--glass-highlight': theme.colors.glassHighlight,
    
    // Borders
    '--border': theme.colors.border,
    '--border-strong': theme.colors.borderStrong,
    
    // Text
    '--text-primary': theme.colors.textPrimary,
    '--text-secondary': theme.colors.textSecondary,
    
    // Accents (mapeando para nomes usados no CSS)
    '--color-primary-from': theme.colors.accentPrimary,
    '--color-primary-to': theme.colors.accentSecondary, // para gradients
    '--accent-emerald': theme.colors.accentPrimary,
    '--accent-sky': theme.colors.accentSecondary,
    '--accent-fuchsia': theme.colors.accentTertiary,
    '--accent-amber': theme.colors.accentWarm,
    '--accent-alert': theme.colors.accentAlert,
    
    // Gradients
    '--gradient-primary': theme.colors.gradientPrimary,
    '--gradient-secondary': theme.colors.gradientSecondary,
    '--gradient-accent': theme.colors.gradientAccent,
    '--gradient-wash': theme.colors.gradientWash,
    '--gradient-veiled': theme.colors.gradientVeiled,
    
    // Glows
    '--glow-primary': theme.colors.glowPrimary,
    '--glow-secondary': theme.colors.glowSecondary,
    '--glow-accent': theme.colors.glowAccent,
  };

  // Aplicar todas as variáveis
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

// Função para remover tema
export function removeThemeVariables(): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  const allVariables = [
    '--background', '--background-gradient-1', '--background-gradient-2',
    '--surface', '--surface-strong', '--surface-elevated', '--glass-highlight',
    '--border', '--border-strong',
    '--text-primary', '--text-secondary',
    '--color-primary-from', '--color-primary-to',
    '--accent-emerald', '--accent-sky', '--accent-fuchsia', '--accent-amber', '--accent-alert',
    '--gradient-primary', '--gradient-secondary', '--gradient-accent',
    '--gradient-wash', '--gradient-veiled',
    '--glow-primary', '--glow-secondary', '--glow-accent',
  ];

  allVariables.forEach(variable => {
    root.style.removeProperty(variable);
  });
}
