/** @type {import('tailwindcss').Config} */
module.exports = {
  // Escaneia todos os arquivos relevantes para classes do Tailwind
  content: [
    './index.html',
    './src/**/*.{html,js,ts,jsx,tsx}',
    './src/pages/**/*.html'
  ],

  // Ativa dark mode via classe "dark"
  darkMode: 'class',

  theme: {
    extend: {
      // Paleta de cores customizadas
      colors: {
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Azul principal
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a'
        },
        // Exemplo de cor secundária e de alerta
        secondary: {
          500: '#f59e42'
        },
        danger: {
          500: '#ef4444'
        }
      },
      // Fonte customizada (opcional)
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      // Exemplo de spacing customizado (opcional)
      spacing: {
        '128': '32rem',
        '144': '36rem'
      }
      // Adicione outras extensões conforme necessário (boxShadow, borderRadius, etc)
    }
  },

  // Plugins utilitários recomendados para produção enterprise
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio')
  ]
};
