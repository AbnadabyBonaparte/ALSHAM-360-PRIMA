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

const STORAGE_KEY = 'alsham-theme'
const TRANSITION_DURATION = 320
const TRANSITION_CLASS = 'theme-switching'

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
 * SSOT: DOM state aqui; CSS variables exclusivamente via theme-variables.ts
 */
function applyThemeToDOM(themeKey: ThemeKey): void {
  if (typeof document === 'undefined') return

  const theme = getTheme(themeKey)
  const root = document.documentElement

  root.setAttribute('data-theme', themeKey)
  root.style.colorScheme = theme.isDark ? 'dark' : 'light'

  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) metaThemeColor.setAttribute('content', theme.colors.background)

  injectThemeVariables(theme)
}

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

export function useTheme(): UseThemeReturn {
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>(defaultTheme)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const transitionTimerRef = useRef<number | null>(null)

  const theme = useMemo(() => getTheme(currentTheme), [currentTheme])
  const isDark = useMemo(() => isThemeDark(currentTheme), [currentTheme])

  useEffect(() => {
    const savedTheme = detectSavedTheme()
    setCurrentTheme(savedTheme)
    applyThemeToDOM(savedTheme)
  }, [])

  useEffect(() => {
    applyThemeToDOM(currentTheme)
  }, [currentTheme])

  const setTheme = useCallback(
    (newTheme: ThemeKey) => {
      if (!themes[newTheme] || newTheme === currentTheme) return
      if (typeof document === 'undefined') return

      try {
        localStorage.setItem(STORAGE_KEY, newTheme)
      } catch {
        // ignore
      }

      setIsTransitioning(true)

      const root = document.documentElement
      root.classList.add(TRANSITION_CLASS)

      setCurrentTheme(newTheme)

      if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current)

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
