/**
 * 🚀 ALSHAM 360° PRIMA - Tailwind CSS Configuration Enterprise 10/10 NASA Standard
 * 
 * Configuração Tailwind CSS enterprise-grade com:
 * - Design system completo e consistente
 * - Tema escuro/claro otimizado
 * - Componentes customizados
 * - Animações e transições suaves
 * - Responsividade avançada
 * - Acessibilidade máxima
 * - Performance otimizada
 * 
 * @version 2.0.0
 * @author ALSHAM Team
 * @license MIT
 */

const { fontFamily } = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  // ===== CONFIGURAÇÕES DE CONTEÚDO =====
  content: [
    './index.html',
    './src/**/*.{html,js,ts,jsx,tsx,vue}',
    './src/pages/**/*.html',
    './src/components/**/*.{js,ts,jsx,tsx,vue}',
    './create-org.html',
    './test-supabase.html'
  ],

  // ===== MODO ESCURO =====
  darkMode: 'class',

  // ===== TEMA CUSTOMIZADO =====
  theme: {
    // ===== BREAKPOINTS RESPONSIVOS =====
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
      '4xl': '2560px',
      
      // Breakpoints para altura
      'h-sm': { 'raw': '(min-height: 640px)' },
      'h-md': { 'raw': '(min-height: 768px)' },
      'h-lg': { 'raw': '(min-height: 1024px)' },
      
      // Breakpoints para orientação
      'portrait': { 'raw': '(orientation: portrait)' },
      'landscape': { 'raw': '(orientation: landscape)' }
    },

    // ===== PALETA DE CORES ENTERPRISE =====
    colors: {
      // Cores básicas
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',
      
      // Escala de cinzas customizada
      white: '#ffffff',
      black: '#000000',
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
        950: '#030712'
      },

      // Cores primárias (azul)
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
        950: '#172554'
      },

      // Cores secundárias (índigo)
      secondary: {
        50: '#eef2ff',
        100: '#e0e7ff',
        200: '#c7d2fe',
        300: '#a5b4fc',
        400: '#818cf8',
        500: '#6366f1',
        600: '#4f46e5',
        700: '#4338ca',
        800: '#3730a3',
        900: '#312e81',
        950: '#1e1b4b'
      },

      // Cores de sucesso (verde)
      success: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
        950: '#052e16'
      },

      // Cores de aviso (amarelo)
      warning: {
        50: '#fefce8',
        100: '#fef9c3',
        200: '#fef08a',
        300: '#fde047',
        400: '#facc15',
        500: '#eab308',
        600: '#ca8a04',
        700: '#a16207',
        800: '#854d0e',
        900: '#713f12',
        950: '#422006'
      },

      // Cores de erro (vermelho)
      error: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
        950: '#450a0a'
      },

      // Cores de informação (azul claro)
      info: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e',
        950: '#082f49'
      },

      // Cores neutras
      neutral: colors.slate,
      
      // Cores de marca
      brand: {
        primary: '#3b82f6',
        secondary: '#6366f1',
        accent: '#8b5cf6',
        muted: '#64748b'
      }
    },

    // ===== TIPOGRAFIA =====
    fontFamily: {
      sans: ['Inter', 'system-ui', ...fontFamily.sans],
      serif: ['Merriweather', ...fontFamily.serif],
      mono: ['JetBrains Mono', ...fontFamily.mono],
      display: ['Poppins', 'Inter', ...fontFamily.sans],
      body: ['Inter', ...fontFamily.sans]
    },

    fontSize: {
      'xs': ['0.75rem', { lineHeight: '1rem' }],
      'sm': ['0.875rem', { lineHeight: '1.25rem' }],
      'base': ['1rem', { lineHeight: '1.5rem' }],
      'lg': ['1.125rem', { lineHeight: '1.75rem' }],
      'xl': ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
      '7xl': ['4.5rem', { lineHeight: '1' }],
      '8xl': ['6rem', { lineHeight: '1' }],
      '9xl': ['8rem', { lineHeight: '1' }]
    },

    fontWeight: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900'
    },

    // ===== ESPAÇAMENTO =====
    spacing: {
      px: '1px',
      0: '0px',
      0.5: '0.125rem',
      1: '0.25rem',
      1.5: '0.375rem',
      2: '0.5rem',
      2.5: '0.625rem',
      3: '0.75rem',
      3.5: '0.875rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      7: '1.75rem',
      8: '2rem',
      9: '2.25rem',
      10: '2.5rem',
      11: '2.75rem',
      12: '3rem',
      14: '3.5rem',
      16: '4rem',
      20: '5rem',
      24: '6rem',
      28: '7rem',
      32: '8rem',
      36: '9rem',
      40: '10rem',
      44: '11rem',
      48: '12rem',
      52: '13rem',
      56: '14rem',
      60: '15rem',
      64: '16rem',
      72: '18rem',
      80: '20rem',
      96: '24rem',
      
      // Espaçamentos customizados
      18: '4.5rem',
      22: '5.5rem',
      26: '6.5rem',
      30: '7.5rem',
      34: '8.5rem',
      38: '9.5rem',
      42: '10.5rem',
      46: '11.5rem',
      50: '12.5rem',
      54: '13.5rem',
      58: '14.5rem',
      62: '15.5rem',
      66: '16.5rem',
      70: '17.5rem',
      74: '18.5rem',
      78: '19.5rem',
      82: '20.5rem',
      86: '21.5rem',
      90: '22.5rem',
      94: '23.5rem',
      98: '24.5rem'
    },

    // ===== BORDAS =====
    borderRadius: {
      none: '0px',
      sm: '0.125rem',
      DEFAULT: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      '3xl': '1.5rem',
      '4xl': '2rem',
      full: '9999px'
    },

    borderWidth: {
      DEFAULT: '1px',
      0: '0px',
      2: '2px',
      4: '4px',
      8: '8px'
    },

    // ===== SOMBRAS =====
    boxShadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      none: 'none',
      
      // Sombras customizadas
      'soft': '0 2px 8px 0 rgb(0 0 0 / 0.08)',
      'medium': '0 4px 12px 0 rgb(0 0 0 / 0.12)',
      'hard': '0 8px 24px 0 rgb(0 0 0 / 0.16)',
      'glow': '0 0 20px rgb(59 130 246 / 0.3)',
      'glow-lg': '0 0 40px rgb(59 130 246 / 0.4)'
    },

    // ===== ANIMAÇÕES =====
    animation: {
      none: 'none',
      spin: 'spin 1s linear infinite',
      ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
      pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      bounce: 'bounce 1s infinite',
      
      // Animações customizadas
      'fade-in': 'fadeIn 0.5s ease-in-out',
      'fade-out': 'fadeOut 0.5s ease-in-out',
      'slide-in-right': 'slideInRight 0.3s ease-out',
      'slide-in-left': 'slideInLeft 0.3s ease-out',
      'slide-in-up': 'slideInUp 0.3s ease-out',
      'slide-in-down': 'slideInDown 0.3s ease-out',
      'scale-in': 'scaleIn 0.2s ease-out',
      'scale-out': 'scaleOut 0.2s ease-in',
      'float': 'float 3s ease-in-out infinite',
      'glow': 'glow 2s ease-in-out infinite alternate'
    },

    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' }
      },
      fadeOut: {
        '0%': { opacity: '1' },
        '100%': { opacity: '0' }
      },
      slideInRight: {
        '0%': { transform: 'translateX(100%)', opacity: '0' },
        '100%': { transform: 'translateX(0)', opacity: '1' }
      },
      slideInLeft: {
        '0%': { transform: 'translateX(-100%)', opacity: '0' },
        '100%': { transform: 'translateX(0)', opacity: '1' }
      },
      slideInUp: {
        '0%': { transform: 'translateY(100%)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' }
      },
      slideInDown: {
        '0%': { transform: 'translateY(-100%)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' }
      },
      scaleIn: {
        '0%': { transform: 'scale(0.9)', opacity: '0' },
        '100%': { transform: 'scale(1)', opacity: '1' }
      },
      scaleOut: {
        '0%': { transform: 'scale(1)', opacity: '1' },
        '100%': { transform: 'scale(0.9)', opacity: '0' }
      },
      float: {
        '0%, 100%': { transform: 'translateY(0px)' },
        '50%': { transform: 'translateY(-10px)' }
      },
      glow: {
        '0%': { boxShadow: '0 0 20px rgb(59 130 246 / 0.3)' },
        '100%': { boxShadow: '0 0 40px rgb(59 130 246 / 0.6)' }
      }
    },

    // ===== TRANSIÇÕES =====
    transitionDuration: {
      DEFAULT: '150ms',
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: '200ms',
      300: '300ms',
      500: '500ms',
      700: '700ms',
      1000: '1000ms'
    },

    transitionTimingFunction: {
      DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      'elastic': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    },

    // ===== EXTENSÕES =====
    extend: {
      // Z-index customizado
      zIndex: {
        60: '60',
        70: '70',
        80: '80',
        90: '90',
        100: '100'
      },

      // Larguras customizadas
      width: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '104': '26rem',
        '108': '27rem',
        '112': '28rem',
        '116': '29rem',
        '120': '30rem'
      },

      // Alturas customizadas
      height: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '104': '26rem',
        '108': '27rem',
        '112': '28rem',
        '116': '29rem',
        '120': '30rem'
      },

      // Máximas larguras
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem'
      },

      // Gradientes customizados
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'gradient-success': 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        'gradient-warning': 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
        'gradient-error': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
      },

      // Backdrop blur customizado
      backdropBlur: {
        xs: '2px'
      }
    }
  },

  // ===== PLUGINS =====
  plugins: [
    // Plugin para formulários
    require('@tailwindcss/forms')({
      strategy: 'class'
    }),

    // Plugin para tipografia
    require('@tailwindcss/typography'),

    // Plugin para aspect ratio
    require('@tailwindcss/aspect-ratio'),

    // Plugin para container queries
    require('@tailwindcss/container-queries'),

    // Plugin customizado para componentes
    function({ addComponents, theme }) {
      addComponents({
        // Botões customizados
        '.btn': {
          padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
          borderRadius: theme('borderRadius.md'),
          fontWeight: theme('fontWeight.medium'),
          fontSize: theme('fontSize.sm'),
          lineHeight: theme('lineHeight.5'),
          transition: 'all 150ms ease-in-out',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme('spacing.2'),
          '&:disabled': {
            opacity: '0.5',
            cursor: 'not-allowed'
          }
        },
        '.btn-primary': {
          backgroundColor: theme('colors.primary.600'),
          color: theme('colors.white'),
          '&:hover': {
            backgroundColor: theme('colors.primary.700')
          },
          '&:focus': {
            outline: 'none',
            boxShadow: `0 0 0 3px ${theme('colors.primary.200')}`
          }
        },
        '.btn-secondary': {
          backgroundColor: theme('colors.secondary.600'),
          color: theme('colors.white'),
          '&:hover': {
            backgroundColor: theme('colors.secondary.700')
          },
          '&:focus': {
            outline: 'none',
            boxShadow: `0 0 0 3px ${theme('colors.secondary.200')}`
          }
        },

        // Cards customizados
        '.card': {
          backgroundColor: theme('colors.white'),
          borderRadius: theme('borderRadius.lg'),
          boxShadow: theme('boxShadow.md'),
          padding: theme('spacing.6'),
          border: `1px solid ${theme('colors.gray.200')}`,
          '.dark &': {
            backgroundColor: theme('colors.gray.800'),
            borderColor: theme('colors.gray.700')
          }
        },

        // Inputs customizados
        '.input': {
          width: '100%',
          padding: `${theme('spacing.2')} ${theme('spacing.3')}`,
          borderRadius: theme('borderRadius.md'),
          border: `1px solid ${theme('colors.gray.300')}`,
          fontSize: theme('fontSize.sm'),
          lineHeight: theme('lineHeight.5'),
          transition: 'all 150ms ease-in-out',
          '&:focus': {
            outline: 'none',
            borderColor: theme('colors.primary.500'),
            boxShadow: `0 0 0 3px ${theme('colors.primary.100')}`
          },
          '.dark &': {
            backgroundColor: theme('colors.gray.700'),
            borderColor: theme('colors.gray.600'),
            color: theme('colors.white'),
            '&:focus': {
              borderColor: theme('colors.primary.400'),
              boxShadow: `0 0 0 3px ${theme('colors.primary.900')}`
            }
          }
        }
      });
    },

    // Plugin customizado para utilitários
    function({ addUtilities, theme }) {
      addUtilities({
        // Utilitários de texto
        '.text-balance': {
          textWrap: 'balance'
        },
        '.text-pretty': {
          textWrap: 'pretty'
        },

        // Utilitários de scroll
        '.scroll-smooth': {
          scrollBehavior: 'smooth'
        },

        // Utilitários de seleção
        '.select-none': {
          userSelect: 'none'
        },
        '.select-text': {
          userSelect: 'text'
        },
        '.select-all': {
          userSelect: 'all'
        },

        // Utilitários de foco
        '.focus-visible-ring': {
          '&:focus-visible': {
            outline: 'none',
            boxShadow: `0 0 0 2px ${theme('colors.primary.500')}`
          }
        }
      });
    }
  ]
};

