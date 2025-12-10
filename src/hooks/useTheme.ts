// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚜️ ALSHAM 360° PRIMA - HOOK DE TEMAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 DOMINAÇÃO VISUAL TOTAL - Sistema de Temas Neon Insanos
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  themes,
  themeList,
  defaultTheme,
  getTheme,
  isThemeDark,
  type ThemeKey,
  type Theme,
} from '../lib/themes';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const STORAGE_KEY = 'alsham-theme';
const TRANSITION_DURATION = 300;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 HOOK INTERFACE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface UseThemeReturn {
  // Current theme
  currentTheme: ThemeKey;
  theme: Theme;

  // Theme lists
  themes: typeof themes;
  themeList: Theme[];

  // State
  isDark: boolean;
  isTransitioning: boolean;

  // Actions
  setTheme: (theme: ThemeKey) => void;
  toggleDarkMode: () => void;
  cycleTheme: () => void;

  // Utilities
  getThemeColors: (themeKey?: ThemeKey) => Theme['colors'];
  getThemeSwatch: (themeKey?: ThemeKey) => string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Detecta o tema salvo no localStorage ou retorna o padrão
 */
function detectSavedTheme(): ThemeKey {
  if (typeof window === 'undefined') return defaultTheme;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && themes[saved as ThemeKey]) {
      return saved as ThemeKey;
    }
  } catch {
    // localStorage not available
  }

  return defaultTheme;
}

/**
 * Aplica o tema ao documento
 */
function applyThemeToDocument(themeKey: ThemeKey): void {
  if (typeof document === 'undefined') return;

  // Set data-theme attribute
  document.documentElement.dataset.theme = themeKey;

  // Update body class for backwards compatibility
  Object.keys(themes).forEach((key) => {
    document.body.classList.remove(key);
  });
  document.body.classList.add(themeKey);

  // Update meta theme-color for mobile browsers
  const theme = getTheme(themeKey);
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme.colors.background);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 MAIN HOOK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function useTheme(): UseThemeReturn {
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>(defaultTheme);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Memoized theme object
  const theme = useMemo(() => getTheme(currentTheme), [currentTheme]);
  const isDark = useMemo(() => isThemeDark(currentTheme), [currentTheme]);

  // Initial theme detection
  useEffect(() => {
    const savedTheme = detectSavedTheme();
    setCurrentTheme(savedTheme);
    applyThemeToDocument(savedTheme);
  }, []);

  // Apply theme changes
  useEffect(() => {
    applyThemeToDocument(currentTheme);
  }, [currentTheme]);

  // Set theme with transition
  const setTheme = useCallback((newTheme: ThemeKey) => {
    if (!themes[newTheme] || newTheme === currentTheme) return;

    setIsTransitioning(true);

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // localStorage not available
    }

    // Apply theme
    setCurrentTheme(newTheme);

    // End transition
    setTimeout(() => {
      setIsTransitioning(false);
    }, TRANSITION_DURATION);
  }, [currentTheme]);

  // Toggle between dark and light themes
  const toggleDarkMode = useCallback(() => {
    const darkThemes: ThemeKey[] = ['cyber-vivid', 'neon-energy', 'midnight-aurora', 'glass-dark'];
    const lightThemes: ThemeKey[] = ['platinum-glass', 'desert-quartz'];

    if (isDark) {
      // Switch to first light theme
      setTheme(lightThemes[0]);
    } else {
      // Switch to first dark theme
      setTheme(darkThemes[0]);
    }
  }, [isDark, setTheme]);

  // Cycle through all themes
  const cycleTheme = useCallback(() => {
    const themeKeys = Object.keys(themes) as ThemeKey[];
    const currentIndex = themeKeys.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setTheme(themeKeys[nextIndex]);
  }, [currentTheme, setTheme]);

  // Get colors for a specific theme (defaults to current)
  const getThemeColors = useCallback((themeKey?: ThemeKey) => {
    return getTheme(themeKey || currentTheme).colors;
  }, [currentTheme]);

  // Get swatch for a specific theme (defaults to current)
  const getThemeSwatch = useCallback((themeKey?: ThemeKey) => {
    return getTheme(themeKey || currentTheme).swatch;
  }, [currentTheme]);

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
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type { ThemeKey, Theme };
export { themes, themeList, defaultTheme, getTheme, isThemeDark };
export default useTheme;
