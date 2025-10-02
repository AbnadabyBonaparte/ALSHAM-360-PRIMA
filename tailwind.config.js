/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import aspectRatio from '@tailwindcss/aspect-ratio';

export default {
  content: [
    './*.html',
    './public/**/*.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './public/js/**/*.js',
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
        primary: '#1E40AF',
        secondary: '#10B981',
        accent: '#F59E0B',
        danger: '#EF4444',
        neutral: '#6B7280',
      },
      boxShadow: {
        premium: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
      },
      transitionProperty: {
        'width-height': 'width, height',
      },
    },
  },
  plugins: [forms, typography, aspectRatio],
  safelist: [
    { pattern: /translate-(x|y)-\[(\d+(\.\d+)?(px|rem|%|vh|vw))\]/ },
    { pattern: /scale-(105|110|115|120)/ },
    { pattern: /(bg|text|border)-(primary|secondary|accent|danger|neutral)/ },
  ],
};
