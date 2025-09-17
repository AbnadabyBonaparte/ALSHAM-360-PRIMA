/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./*.html",
    "./src/**/*.js", // Inclui todos JS para purge de classes
  ],
  theme: {
    extend: {
      translate: {
        '05': '0.125rem', // Fix: '0.5' → '05' para evitar warnings
        '15': '0.375rem',
        '25': '0.625rem',
        '35': '0.875rem',
      },
      scale: {
        '105': '1.05', // Extensões para animations suaves
        '110': '1.10',
        '115': '1.15',
        '120': '1.20',
      },
      colors: {
        // Temas custom enterprise para CRM (ajuste conforme UI)
        primary: '#1E40AF', // Azul para ações principais (leads, auth)
        secondary: '#10B981', // Verde para sucesso/gamificação
        accent: '#F59E0B', // Amarelo para warnings/automations
        danger: '#EF4444', // Vermelho para errors/relatórios
        neutral: '#6B7280', // Cinza para texts/settings
      },
      boxShadow: {
        'premium': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // Sombras premium para cards
      },
      transitionProperty: {
        'width-height': 'width, height', // Para animations em UI
      },
    },
  },
  plugins: [
    // Adicione plugins se necessário, ex.: require('@tailwindcss/forms') para forms premium
  ],
  safelist: [
    // Opcional: Safe classes usadas dinamicamente (ex.: de Supabase data)
    { pattern: /translate-(x|y)-[0-9]+/ },
  ],
};
