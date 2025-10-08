/**
 * ⚡ ALSHAM 360° PRIMA — Tailwind Config v6.0.4
 * Build Estável — Sem Warnings / Compatível com Tailwind 3.4.14
 * Autor: ALSHAM Design Core Team | 2025
 *
 * Ajustes:
 * - Corrigido regex da safelist para remover warning de classe inválida.
 * - Alinhado ao ALSHAM Visual System 360° (tipografia, cores, tokens).
 * - Compatível com Vercel e modo JIT ativo.
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

  theme: {
    extend: {
      scale: {
        105: '1.05',
        110: '1.10',
        115: '1.15',
        120: '1.20'
      },
      colors: {
        primary: '#1E40AF',      // azul-supremo
        secondary: '#10B981',    // verde equilíbrio
        accent: '#F59E0B',       // âmbar impacto
        danger: '#EF4444',       // vermelho alerta
        neutral: '#6B7280'       // cinza profissional
      },
      boxShadow: {
        premium: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
      },
      transitionProperty: {
        'width-height': 'width,height'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Poppins', 'ui-sans-serif', 'system-ui']
      }
    }
  },

  plugins: [forms, typography, aspectRatio],

  safelist: [
    // Padrões válidos (sem caracteres não suportados pelo Tailwind)
    { pattern: /translate-(x|y)-(0|1|2|3|4|5|6|7|8|9|10|12|16|20|24|32|40|48|56|64)/ },
    { pattern: /scale-(105|110|115|120)/ },
    { pattern: /(bg|text|border)-(primary|secondary|accent|danger|neutral)/ }
  ]
};
