/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import aspectRatio from '@tailwindcss/aspect-ratio';

export default {
  content: [
    './*.html',
    './public/**/*.html', // inclui páginas públicas
    './src/**/*.{js,ts,jsx,tsx}', // inclui código fonte
    './public/js/**/*.js', // inclui scripts de produção
  ],
  theme: {
    extend: {
      scale: {
        '105': '1.05',
        '110': '1.10',
        '115': '1.15',
        '120': '1.20',
      },
      colors: {
        primary: '#1E40AF',   // azul institucional
        secondary: '#10B981', // verde de sucesso
        accent: '#F59E0B',    // destaque (amarelo/laranja)
        danger: '#EF4444',    // erro/alerta
        neutral: '#6B7280',   // cinza neutro
      },
      boxShadow: {
        premium: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
      },
      transitionProperty: {
        'width-height': 'width, height',
      },
    },
  },
  plugins: [
    forms,       // estiliza formulários
    typography,  // estiliza texto (prose)
    aspectRatio, // facilita proporções de imagens/vídeos
  ],
  safelist: [
    { pattern: /translate-(x|y)-\[[0-9.]+rem\]/ }, // garante animações de translate
    { pattern: /scale-(105|110|115|120)/ },         // garante as escalas customizadas
    { pattern: /(bg|text|border)-(primary|secondary|accent|danger|neutral)/ }, // garante classes de cor
  ],
};
