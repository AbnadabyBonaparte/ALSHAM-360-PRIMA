/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        // Tokens dinâmicos (SSOT: runtime injection -> CSS variables)
        primary: {
          from: "var(--color-primary-from)",
          to: "var(--color-primary-to)",
        },

        accent: {
          primary: "var(--accent-1)",
          secondary: "var(--accent-2)",
          tertiary: "var(--accent-3)",
          warm: "var(--accent-warm)",
          alert: "var(--accent-alert)",
        },

        text: {
          primary: "var(--text)",
          secondary: "var(--text-2)",
        },

        surface: {
          base: "var(--surface)",
          strong: "var(--surface-strong)",
          elev: "var(--surface-elev)",
        },

        border: {
          base: "var(--border)",
          strong: "var(--border-strong)",
        },
      },

      backgroundImage: {
        // Compatibilidade com o setup atual (gradiente via legacy tokens)
        "gradient-primary":
          "linear-gradient(135deg, var(--color-primary-from), var(--color-primary-to))",

        // Tokens do contrato (aliases mantidos pelo themes.css consumer)
        "gradient-wash": "var(--gradient-wash)",
        "gradient-veiled": "var(--gradient-veiled)",
      },

      screens: {
        xs: "475px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
        "3xl": "1920px",
      },

      spacing: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)",
      },
    },
  },
  plugins: [],
}
