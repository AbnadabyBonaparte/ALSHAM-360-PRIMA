// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚜️ ALSHAM 360° PRIMA - HOOK DE TEMAS (SSOT Compliant)
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

// Alinhado ao “warp” de troca de tema
const TRANSITION_DURATION = 320
const TRANSITION_CLASS = 'theme-switching'

/**
 * Detecta o tema salvo no localStorage ou retorna o padrão.
 */
function detectSavedTheme(): ThemeKey {
  if (typeof window === 'undefined') return defaultTheme

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    console.log('🔎 detectSavedTheme:', { saved, exists: saved && themes[saved as ThemeKey] })
    if (saved && themes[saved as ThemeKey]) return saved as ThemeKey
  } catch (error) {
    console.error('❌ detectSavedTheme error:', error)
  }

  return defaultTheme
}

/**
 * SSOT: aplica somente “estado” no DOM (data-theme + color-scheme + meta),
 * e delega 100% das CSS variables ao adapter público injectThemeVariables(theme).
 */
function applyThemeToDOM(themeKey: ThemeKey): void {
  if (typeof document === 'undefined') return

  const theme = getTheme(themeKey)
  const root = document.documentElement

  console.log('🎨 applyThemeToDOM chamado:', {
    themeKey,
    themeName: theme.name,
    isDark: theme.isDark,
    primaryColor: theme.colors.background
  })

  // 1) Fonte da verdade: atributo + color-scheme
  root.setAttribute('data-theme', themeKey)
  root.style.colorScheme = theme.isDark ? 'dark' : 'light'

  // 2) Meta theme-color (mobile)
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) metaThemeColor.setAttribute('content', theme.colors.background)

  // 3) CSS Variables (Contrato Público)
  injectThemeVariables(theme)

  console.log('✅ Tema aplicado no DOM:', themeKey)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 HOOK INTERFACE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface UseThemeReturn {
  currentTheme: ThemeKey
  theme: Theme

  themes: typeof themes
  themeList: typeof themeList

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
  // Inicializa direto com o tema detectado (síncrono, sem flash)
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>(() => {
    const detected = detectSavedTheme()
    console.log('🎨 useState initializer - tema detectado:', detected)
    return detected
  })
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Cancela transição se o usuário trocar tema rápido
  const transitionTimerRef = useRef<number | null>(null)

  const theme = useMemo(() => getTheme(currentTheme), [currentTheme])
  const isDark = useMemo(() => isThemeDark(currentTheme), [currentTheme])

  // Apply theme changes
  useEffect(() => {
    applyThemeToDOM(currentTheme)
  }, [currentTheme])

  const setTheme = useCallback(
    (newTheme: ThemeKey) => {
      console.log('🎨 setTheme called:', { newTheme, currentTheme, blocked: newTheme === currentTheme })

      if (!themes[newTheme] || newTheme === currentTheme) return
      if (typeof document === 'undefined') return

      // Persist
      try {
        localStorage.setItem(STORAGE_KEY, newTheme)
        console.log('💾 localStorage.setItem:', newTheme)
      } catch (error) {
        console.error('❌ localStorage.setItem failed:', error)
      }

      // Start transition
      setIsTransitioning(true)

      const root = document.documentElement
      root.classList.add(TRANSITION_CLASS)

      // Atualiza tema (dispara applyThemeToDOM pelo effect)
      setCurrentTheme(newTheme)
      console.log('✅ setCurrentTheme called:', newTheme)

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
    // Mantém seu comportamento atual (tema “âncora” dark/light).
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
