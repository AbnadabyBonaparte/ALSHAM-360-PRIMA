// src/hooks/useTheme.ts
import { useState, useEffect } from 'react';

export type ThemeName = 
  | 'glass-dark'
  | 'platinum-glass'
  | 'midnight-aurora'
  | 'desert-quartz'
  | 'neon-energy'
  | 'cyber-vivid';

interface Theme {
  name: ThemeName;
  displayName: string;
  colors: {
    // Cores principais
    primary: string;
    primaryHover: string;
    secondary: string;
    secondaryHover: string;
    accent: string;
    accentHover: string;
    
    // Backgrounds
    bgPrimary: string;
    bgSecondary: string;
    bgTertiary: string;
    
    // Borders
    border: string;
    borderHover: string;
    
    // Text
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    
    // Status colors
    success: string;
    successHover: string;
    warning: string;
    warningHover: string;
    error: string;
    errorHover: string;
    info: string;
    infoHover: string;
    
    // Gradientes
    gradientPrimary: string;
    gradientSecondary: string;
    gradientAccent: string;
  };
}

const themes: Record<ThemeName, Theme> = {
  'glass-dark': {
    name: 'glass-dark',
    displayName: 'Glass Dark',
    colors: {
      primary: 'from-emerald-500 to-teal-500',
      primaryHover: 'from-emerald-600 to-teal-600',
      secondary: 'from-blue-500 to-cyan-500',
      secondaryHover: 'from-blue-600 to-cyan-600',
      accent: 'from-purple-500 to-pink-500',
      accentHover: 'from-purple-600 to-pink-600',
      
      bgPrimary: 'bg-neutral-900',
      bgSecondary: 'bg-neutral-950',
      bgTertiary: 'bg-neutral-800',
      
      border: 'border-neutral-800',
      borderHover: 'border-emerald-500',
      
      textPrimary: 'text-white',
      textSecondary: 'text-gray-400',
      textTertiary: 'text-gray-600',
      
      success: 'from-green-600 to-emerald-600',
      successHover: 'from-green-700 to-emerald-700',
      warning: 'from-yellow-500 to-orange-500',
      warningHover: 'from-yellow-600 to-orange-600',
      error: 'from-red-500 to-pink-500',
      errorHover: 'from-red-600 to-pink-600',
      info: 'from-blue-600 to-indigo-600',
      infoHover: 'from-blue-700 to-indigo-700',
      
      gradientPrimary: 'from-emerald-500/10 to-teal-500/10',
      gradientSecondary: 'from-blue-500/10 to-cyan-500/10',
      gradientAccent: 'from-purple-500/10 to-pink-500/10',
    }
  },
  
  'platinum-glass': {
    name: 'platinum-glass',
    displayName: 'Platinum Glass',
    colors: {
      primary: 'from-slate-400 to-slate-300',
      primaryHover: 'from-slate-500 to-slate-400',
      secondary: 'from-gray-400 to-gray-300',
      secondaryHover: 'from-gray-500 to-gray-400',
      accent: 'from-zinc-400 to-zinc-300',
      accentHover: 'from-zinc-500 to-zinc-400',
      
      bgPrimary: 'bg-slate-900',
      bgSecondary: 'bg-slate-950',
      bgTertiary: 'bg-slate-800',
      
      border: 'border-slate-700',
      borderHover: 'border-slate-400',
      
      textPrimary: 'text-slate-100',
      textSecondary: 'text-slate-400',
      textTertiary: 'text-slate-600',
      
      success: 'from-green-600 to-emerald-600',
      successHover: 'from-green-700 to-emerald-700',
      warning: 'from-amber-500 to-yellow-500',
      warningHover: 'from-amber-600 to-yellow-600',
      error: 'from-red-500 to-rose-500',
      errorHover: 'from-red-600 to-rose-600',
      info: 'from-sky-600 to-blue-600',
      infoHover: 'from-sky-700 to-blue-700',
      
      gradientPrimary: 'from-slate-400/10 to-slate-300/10',
      gradientSecondary: 'from-gray-400/10 to-gray-300/10',
      gradientAccent: 'from-zinc-400/10 to-zinc-300/10',
    }
  },
  
  'midnight-aurora': {
    name: 'midnight-aurora',
    displayName: 'Midnight Aurora',
    colors: {
      primary: 'from-violet-500 to-purple-500',
      primaryHover: 'from-violet-600 to-purple-600',
      secondary: 'from-indigo-500 to-blue-500',
      secondaryHover: 'from-indigo-600 to-blue-600',
      accent: 'from-fuchsia-500 to-pink-500',
      accentHover: 'from-fuchsia-600 to-pink-600',
      
      bgPrimary: 'bg-slate-900',
      bgSecondary: 'bg-slate-950',
      bgTertiary: 'bg-slate-800',
      
      border: 'border-violet-900',
      borderHover: 'border-violet-500',
      
      textPrimary: 'text-violet-50',
      textSecondary: 'text-violet-300',
      textTertiary: 'text-violet-600',
      
      success: 'from-green-600 to-emerald-600',
      successHover: 'from-green-700 to-emerald-700',
      warning: 'from-amber-500 to-yellow-500',
      warningHover: 'from-amber-600 to-yellow-600',
      error: 'from-red-500 to-rose-500',
      errorHover: 'from-red-600 to-rose-600',
      info: 'from-blue-600 to-indigo-600',
      infoHover: 'from-blue-700 to-indigo-700',
      
      gradientPrimary: 'from-violet-500/10 to-purple-500/10',
      gradientSecondary: 'from-indigo-500/10 to-blue-500/10',
      gradientAccent: 'from-fuchsia-500/10 to-pink-500/10',
    }
  },
  
  'desert-quartz': {
    name: 'desert-quartz',
    displayName: 'Desert Quartz',
    colors: {
      primary: 'from-amber-500 to-orange-500',
      primaryHover: 'from-amber-600 to-orange-600',
      secondary: 'from-yellow-500 to-amber-500',
      secondaryHover: 'from-yellow-600 to-amber-600',
      accent: 'from-orange-500 to-red-500',
      accentHover: 'from-orange-600 to-red-600',
      
      bgPrimary: 'bg-stone-900',
      bgSecondary: 'bg-stone-950',
      bgTertiary: 'bg-stone-800',
      
      border: 'border-amber-900',
      borderHover: 'border-amber-500',
      
      textPrimary: 'text-amber-50',
      textSecondary: 'text-amber-300',
      textTertiary: 'text-amber-600',
      
      success: 'from-green-600 to-emerald-600',
      successHover: 'from-green-700 to-emerald-700',
      warning: 'from-yellow-500 to-orange-500',
      warningHover: 'from-yellow-600 to-orange-600',
      error: 'from-red-500 to-rose-500',
      errorHover: 'from-red-600 to-rose-600',
      info: 'from-blue-600 to-cyan-600',
      infoHover: 'from-blue-700 to-cyan-700',
      
      gradientPrimary: 'from-amber-500/10 to-orange-500/10',
      gradientSecondary: 'from-yellow-500/10 to-amber-500/10',
      gradientAccent: 'from-orange-500/10 to-red-500/10',
    }
  },
  
  'neon-energy': {
    name: 'neon-energy',
    displayName: 'Neon Energy',
    colors: {
      primary: 'from-cyan-500 to-blue-500',
      primaryHover: 'from-cyan-600 to-blue-600',
      secondary: 'from-blue-500 to-indigo-500',
      secondaryHover: 'from-blue-600 to-indigo-600',
      accent: 'from-pink-500 to-rose-500',
      accentHover: 'from-pink-600 to-rose-600',
      
      bgPrimary: 'bg-gray-900',
      bgSecondary: 'bg-gray-950',
      bgTertiary: 'bg-gray-800',
      
      border: 'border-cyan-900',
      borderHover: 'border-cyan-500',
      
      textPrimary: 'text-cyan-50',
      textSecondary: 'text-cyan-300',
      textTertiary: 'text-cyan-600',
      
      success: 'from-green-600 to-emerald-600',
      successHover: 'from-green-700 to-emerald-700',
      warning: 'from-yellow-500 to-orange-500',
      warningHover: 'from-yellow-600 to-orange-600',
      error: 'from-red-500 to-pink-500',
      errorHover: 'from-red-600 to-pink-600',
      info: 'from-cyan-600 to-blue-600',
      infoHover: 'from-cyan-700 to-blue-700',
      
      gradientPrimary: 'from-cyan-500/10 to-blue-500/10',
      gradientSecondary: 'from-blue-500/10 to-indigo-500/10',
      gradientAccent: 'from-pink-500/10 to-rose-500/10',
    }
  },
  
  'cyber-vivid': {
    name: 'cyber-vivid',
    displayName: 'Cyber Vivid',
    colors: {
      primary: 'from-fuchsia-500 to-purple-500',
      primaryHover: 'from-fuchsia-600 to-purple-600',
      secondary: 'from-purple-500 to-violet-500',
      secondaryHover: 'from-purple-600 to-violet-600',
      accent: 'from-pink-500 to-rose-500',
      accentHover: 'from-pink-600 to-rose-600',
      
      bgPrimary: 'bg-purple-950',
      bgSecondary: 'bg-purple-900',
      bgTertiary: 'bg-purple-800',
      
      border: 'border-fuchsia-900',
      borderHover: 'border-fuchsia-500',
      
      textPrimary: 'text-fuchsia-50',
      textSecondary: 'text-fuchsia-300',
      textTertiary: 'text-fuchsia-600',
      
      success: 'from-green-600 to-emerald-600',
      successHover: 'from-green-700 to-emerald-700',
      warning: 'from-yellow-500 to-orange-500',
      warningHover: 'from-yellow-600 to-orange-600',
      error: 'from-red-500 to-rose-500',
      errorHover: 'from-red-600 to-rose-600',
      info: 'from-blue-600 to-indigo-600',
      infoHover: 'from-blue-700 to-indigo-700',
      
      gradientPrimary: 'from-fuchsia-500/10 to-purple-500/10',
      gradientSecondary: 'from-purple-500/10 to-violet-500/10',
      gradientAccent: 'from-pink-500/10 to-rose-500/10',
    }
  }
};

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('glass-dark');
  const [theme, setTheme] = useState<Theme>(themes['glass-dark']);

  useEffect(() => {
    // Detectar tema do localStorage ou do sistema
    const detectTheme = () => {
      // 1. Tentar pegar do localStorage
      const savedTheme = localStorage.getItem('alsham-theme') as ThemeName;
      if (savedTheme && themes[savedTheme]) {
        return savedTheme;
      }

      // 2. Tentar detectar pelo body class
      const bodyClasses = document.body.className;
      for (const themeName of Object.keys(themes)) {
        if (bodyClasses.includes(themeName)) {
          return themeName as ThemeName;
        }
      }

      // 3. Default
      return 'glass-dark';
    };

    const detectedTheme = detectTheme();
    setCurrentTheme(detectedTheme);
    setTheme(themes[detectedTheme]);

    // Observer para detectar mudanças no tema
    const observer = new MutationObserver(() => {
      const newTheme = detectTheme();
      if (newTheme !== currentTheme) {
        setCurrentTheme(newTheme);
        setTheme(themes[newTheme]);
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, [currentTheme]);

  const changeTheme = (newTheme: ThemeName) => {
    setCurrentTheme(newTheme);
    setTheme(themes[newTheme]);
    localStorage.setItem('alsham-theme', newTheme);
    
    // Atualizar class do body
    Object.keys(themes).forEach(t => {
      document.body.classList.remove(t);
    });
    document.body.classList.add(newTheme);
  };

  return {
    currentTheme,
    theme,
    themes: Object.values(themes),
    changeTheme
  };
}
