/**
 * ⚡ ALSHAM 360° PRIMA — Tailwind Config v6.0.5
 * ✅ CORRIGIDO: Usa variáveis CSS do tokens.css como fonte única
 * 
 * Mudanças:
 * - Cores agora usam var(--alsham-*) do tokens.css
 * - Eliminada duplicação de definições
 * - Dark mode configurado como 'class'
 * - Sombras, bordas e fontes alinhadas com tokens
 * 
 * Build Estável — Sem Warnings / Compatível com Tailwind 3.4.14
 * Autor: ALSHAM Design Core Team | 2025
 */

import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import aspectRatio from '@tailwindcss/aspect-ratio';

export default {
  mode: 'jit',
  
  content: [
    './*.html',
    './public/**/*.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './public/js/**/*.js',
    './dist/**/*.html'
  ],
  
  // ✅ Dark mode controlado por classe (não automático)
  darkMode: 'class',
  
  theme: {
    extend: {
      // ========================================
      // 🎨 CORES - Usando variáveis CSS tokens
      // ========================================
      colors: {
        primary: {
          DEFAULT: 'var(--alsham-primary)',
          hover: 'var(--alsham-primary-hover)',
          light: 'var(--alsham-primary-light)',
          dark: 'var(--alsham-primary-dark)'
        },
        secondary: {
          DEFAULT: 'var(--alsham-secondary)',
          hover: 'var(--alsham-secondary-hover)',
          light: 'var(--alsham-secondary-light)'
        },
        accent: {
          DEFAULT: 'var(--alsham-accent)',
          hover: 'var(--alsham-accent-hover)'
        },
        success: {
          DEFAULT: 'var(--alsham-success)',
          bg: 'var(--alsham-success-bg)',
          border: 'var(--alsham-success-border)',
          text: 'var(--alsham-success-text)'
        },
        warning: {
          DEFAULT: 'var(--alsham-warning)',
          bg: 'var(--alsham-warning-bg)',
          border: 'var(--alsham-warning-border)',
          text: 'var(--alsham-warning-text)'
        },
        error: {
          DEFAULT: 'var(--alsham-error)',
          bg: 'var(--alsham-error-bg)',
          border: 'var(--alsham-error-border)',
          text: 'var(--alsham-error-text)'
        },
        info: {
          DEFAULT: 'var(--alsham-info)',
          bg: 'var(--alsham-info-bg)',
          border: 'var(--alsham-info-border)',
          text: 'var(--alsham-info-text)'
        },
        
        // ========================================
        // 🎨 CORES DE BACKGROUND E TEXTO
        // ========================================
        canvas: 'var(--alsham-bg-canvas)',
        surface: {
          DEFAULT: 'var(--alsham-bg-surface)',
          hover: 'var(--alsham-bg-hover)',
          active: 'var(--alsham-bg-active)'
        },
        'text-primary': 'var(--alsham-text-primary)',
        'text-secondary': 'var(--alsham-text-secondary)',
        'text-tertiary': 'var(--alsham-text-tertiary)',
        'text-disabled': 'var(--alsham-text-disabled)',
        
        // ========================================
        // 🎨 BORDAS
        // ========================================
        border: {
          light: 'var(--alsham-border-light)',
          DEFAULT: 'var(--alsham-border-default)',
          strong: 'var(--alsham-border-strong)'
        }
      },
      
      // ========================================
      // 🌫️ SOMBRAS - Usando tokens
      // ========================================
      boxShadow: {
        sm: 'var(--alsham-shadow-sm)',
        DEFAULT: 'var(--alsham-shadow-md)',
        md: 'var(--alsham-shadow-md)',
        lg: 'var(--alsham-shadow-lg)',
        xl: 'var(--alsham-shadow-xl)',
        '2xl': 'var(--alsham-shadow-2xl)',
        premium: 'var(--alsham-shadow-lg)'
      },
      
      // ========================================
      // 🧱 BORDAS ARREDONDADAS - Usando tokens
      // ========================================
      borderRadius: {
        sm: 'var(--alsham-radius-sm)',
        DEFAULT: 'var(--alsham-radius-md)',
        md: 'var(--alsham-radius-md)',
        lg: 'var(--alsham-radius-lg)',
        xl: 'var(--alsham-radius-xl)',
        '2xl': 'var(--alsham-radius-2xl)',
        full: 'var(--alsham-radius-full)'
      },
      
      // ========================================
      // 🔤 TIPOGRAFIA - Usando tokens
      // ========================================
      fontFamily: {
        sans: 'var(--alsham-font-sans)',
        display: 'var(--alsham-font-display)'
      },
      
      fontSize: {
        xs: 'var(--alsham-text-xs)',
        sm: 'var(--alsham-text-sm)',
        base: 'var(--alsham-text-base)',
        lg: 'var(--alsham-text-lg)',
        xl: 'var(--alsham-text-xl)',
        '2xl': 'var(--alsham-text-2xl)',
        '3xl': 'var(--alsham-text-3xl)',
        '4xl': 'var(--alsham-text-4xl)'
      },
      
      fontWeight: {
        normal: 'var(--alsham-font-normal)',
        medium: 'var(--alsham-font-medium)',
        semibold: 'var(--alsham-font-semibold)',
        bold: 'var(--alsham-font-bold)',
        extrabold: 'var(--alsham-font-extrabold)'
      },
      
      // ========================================
      // 🌀 TRANSIÇÕES - Usando tokens
      // ========================================
      transitionDuration: {
        instant: 'var(--alsham-motion-instant)',
        productive: 'var(--alsham-motion-productive)',
        expressive: 'var(--alsham-motion-expressive)',
        celebratory: 'var(--alsham-motion-celebratory)'
      },
      
      transitionTimingFunction: {
        productive: 'var(--alsham-ease-productive)',
        expressive: 'var(--alsham-ease-expressive)',
        bounce: 'var(--alsham-ease-bounce)'
      },
      
      // ========================================
      // 📏 ESPAÇAMENTO - Usando tokens
      // ========================================
      spacing: {
        1: 'var(--alsham-space-1)',
        2: 'var(--alsham-space-2)',
        3: 'var(--alsham-space-3)',
        4: 'var(--alsham-space-4)',
        5: 'var(--alsham-space-5)',
        6: 'var(--alsham-space-6)',
        8: 'var(--alsham-space-8)',
        10: 'var(--alsham-space-10)',
        12: 'var(--alsham-space-12)',
        16: 'var(--alsham-space-16)'
      },
      
      // ========================================
      // ⚙️ Z-INDEX - Usando tokens
      // ========================================
      zIndex: {
        base: 'var(--alsham-z-base)',
        dropdown: 'var(--alsham-z-dropdown)',
        sticky: 'var(--alsham-z-sticky)',
        fixed: 'var(--alsham-z-fixed)',
        modal: 'var(--alsham-z-modal)',
        toast: 'var(--alsham-z-toast)'
      },
      
      // ========================================
      // 📐 SCALE - Adicionais
      // ========================================
      scale: {
        105: '1.05',
        110: '1.10',
        115: '1.15',
        120: '1.20'
      },
      
      // ========================================
      // 🎬 ANIMAÇÕES CUSTOMIZADAS
      // ========================================
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        'pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        },
        'spin': {
          'to': { transform: 'rotate(360deg)' }
        }
      },
      
      animation: {
        'fade-in': 'fade-in 0.5s ease-in-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'slide-in-right': 'slide-in-right 0.5s ease-out',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin': 'spin 1s linear infinite'
      }
    }
  },
  
  // ========================================
  // 🔌 PLUGINS
  // ========================================
  plugins: [
    forms,
    typography,
    aspectRatio
  ],
  
  // ========================================
  // 🛡️ SAFELIST (classes sempre incluídas)
  // ========================================
  safelist: [
    // Traduções e transformações
    { 
      pattern: /translate-(x|y)-(0|1|2|3|4|5|6|7|8|9|10|12|16|20|24|32|40|48|56|64)/ 
    },
    // Escalas
    { 
      pattern: /scale-(95|100|105|110|115|120)/ 
    },
    // Cores principais
    { 
      pattern: /(bg|text|border)-(primary|secondary|accent|success|warning|error|info)(-hover|-light|-dark|-bg|-text|-border)?/ 
    },
    // Status colors
    'bg-blue-100', 'bg-yellow-100', 'bg-purple-100', 
    'bg-green-100', 'bg-red-100', 'bg-gray-100',
    'text-blue-800', 'text-yellow-800', 'text-purple-800',
    'text-green-800', 'text-red-800', 'text-gray-800'
  ]
};
