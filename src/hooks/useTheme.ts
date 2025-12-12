// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚜️ ALSHAM 360° PRIMA - HOOK DE TEMAS (10/10)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { injectThemeVariables } from '../lib/theme-variables'
import {
  themes,
  themeList,
  defaultTheme,
  getTheme,
  isThemeDark,
  type ThemeKey,
  type Theme,
} from '../lib/themes'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const STORAGE_KEY = 'alsham-theme'

// 10/10: alinhado com o “warp” de troca de tema
const TRANSITION_DURATION = 320
const TRANSITION_CLASS = 'theme-switching'

/**
 * Detecta o tema salvo no localStorage ou retorna o padrão.
 */
function detectSavedTheme(): ThemeKey {
  if (typeof window === 'undefined') return defaultTheme

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && themes[saved as ThemeKey]) return saved as ThemeKey
  } catch {
    // ignore
  }

  return defaultTheme
}

/**
 * 10/10: contrato único de CSS Variables no :root (HTML)
 * Mantém compatibilidade chamando injectThemeVariables(theme) ao final.
 */
function applyThemeToDOM(themeKey: ThemeKey): void {
  if (typeof document === 'undefined') return

  const theme = getTheme(themeKey)
  const root = document.documentElement

  // 1) Fonte da verdade: atributo + color-scheme
  root.setAttribute('data-theme', themeKey)
  root.style.colorScheme = theme.isDark ? 'dark' : 'light'

  // 2) Meta theme-color (mobile)
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) metaThemeColor.setAttribute('content', theme.colors.background)

  // 3) CSS Variables (contrato estável)
  const vars: Record<string, string> = {
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
  }

  for (const [k, v] of Object.entries(vars)) {
    root.style.setProperty(k, v)
  }

  // 4) Compatibilidade: mantém seu pipeline atual (caso algum CSS dependa)
  injectThemeVariables(theme)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 HOOK INTERFACE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface UseThemeReturn {
  currentTheme: ThemeKey
  theme: Theme

  themes: typeof themes
  themeList: Theme[]

  isDark: boolean
  isTransitioning: boolean

  setTheme: (theme: ThemeKey) => void
  toggleDarkMode: () => void
  cycleTheme: () => void

  getThemeColors: (themeKey?: ThemeKey) => Theme['colors']
  getThemeSwatch: (themeKey?: ThemeKey) => string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 MAIN HOOK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function useTheme(): UseThemeReturn {
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>(defaultTheme)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // 10/10: cancela transição se o usuário trocar tema rápido
  const transitionTimerRef = useRef<number | null>(null)

  const theme = useMemo(() => getTheme(currentTheme), [currentTheme])
  const isDark = useMemo(() => isThemeDark(currentTheme), [currentTheme])

  // Initial theme detection
  useEffect(() => {
    const savedTheme = detectSavedTheme()
    setCurrentTheme(savedTheme)
    applyThemeToDOM(savedTheme)
  }, [])

  // Apply theme changes
  useEffect(() => {
    applyThemeToDOM(currentTheme)
  }, [currentTheme])

  const setTheme = useCallback(
    (newTheme: ThemeKey) => {
      if (!themes[newTheme] || newTheme === currentTheme) return
      if (typeof document === 'undefined') return

      // Persist
      try {
        localStorage.setItem(STORAGE_KEY, newTheme)
      } catch {
        // ignore
      }

      // Start transition
      setIsTransitioning(true)

      // 10/10: warp class no <html>
      const root = document.documentElement
      root.classList.add(TRANSITION_CLASS)

      // Atualiza tema (isso dispara applyThemeToDOM pelo effect)
      setCurrentTheme(newTheme)

      // Clear timers
      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current)
      }

      transitionTimerRef.current = window.setTimeout(() => {
        root.classList.remove(TRANSITION_CLASS)
        setIsTransitioning(false)
        transitionTimerRef.current = null
      }, TRANSITION_DURATION)
    },
    [currentTheme]
  )

  const toggleDarkMode = useCallback(() => {
    const darkThemes: ThemeKey[] = ['cyber-vivid', 'neon-energy', 'midnight-aurora', 'glass-dark']
    const lightThemes: ThemeKey[] = ['platinum-glass', 'desert-quartz']
    setTheme(isDark ? lightThemes[0] : darkThemes[0])
  }, [isDark, setTheme])

  const cycleTheme = useCallback(() => {
    const themeKeys = Object.keys(themes) as ThemeKey[]
    const currentIndex = themeKeys.indexOf(currentTheme)
    const nextIndex = (currentIndex + 1) % themeKeys.length
    setTheme(themeKeys[nextIndex])
  }, [currentTheme, setTheme])

  const getThemeColors = useCallback(
    (themeKey?: ThemeKey) => getTheme(themeKey || currentTheme).colors,
    [currentTheme]
  )

  const getThemeSwatch = useCallback(
    (themeKey?: ThemeKey) => getTheme(themeKey || currentTheme).swatch,
    [currentTheme]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current)
    }
  }, [])

  return {
    currentTheme,
    theme,
    themes,
    themeList,
    isDark,
    isTransitioning,
    setTheme,
    toggleDarkMode,
    cycleTheme,
    getThemeColors,
    getThemeSwatch,
  }
}

export type { ThemeKey, Theme }
export { themes, themeList, defaultTheme, getTheme, isThemeDark }
export default useTheme
