/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores dinâmicas dos temas (via CSS variables)
        primary: {
          from: 'var(--color-primary-from)',
          to: 'var(--color-primary-to)',
        },
        accent: {
          emerald: 'var(--accent-emerald)',
          sky: 'var(--accent-sky)',
          fuchsia: 'var(--accent-fuchsia)',
          amber: 'var(--accent-amber)',
          alert: 'var(--accent-alert)',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, var(--color-primary-from), var(--color-primary-to))',
        'gradient-secondary': 'linear-gradient(135deg, var(--color-secondary-from), var(--color-secondary-to))',
        'gradient-wash': 'var(--gradient-wash)',
        'gradient-veiled': 'var(--gradient-veiled)',
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
    },
  },
  plugins: [],
}
