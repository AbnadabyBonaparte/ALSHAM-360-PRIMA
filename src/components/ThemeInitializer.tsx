// src/components/ThemeInitializer.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚜️ ALSHAM 360° PRIMA - THEME INITIALIZER
// Componente invisível que inicializa o sistema de temas no nível root
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useTheme } from '@/hooks/useTheme'

/**
 * 🎨 ThemeInitializer
 *
 * Componente crítico que deve ser montado no nível root (App.tsx).
 *
 * Responsabilidades:
 * 1. Dispara useTheme() para executar a inicialização do sistema
 * 2. Detecta tema salvo no localStorage
 * 3. Injeta variáveis CSS via injectThemeVariables()
 * 4. Aplica data-theme no documentElement
 * 5. Configura color-scheme e meta theme-color
 *
 * Este componente não renderiza nada visualmente.
 * Sua única função é garantir que useTheme() rode no mount do app.
 */
export function ThemeInitializer() {
  // Inicializa o sistema de temas
  // O hook useTheme contém useEffect que detecta e aplica o tema
  useTheme()

  // Não renderiza nada
  return null
}
