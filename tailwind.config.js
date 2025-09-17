/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./*.html",
    "./src/**/*.js", // Inclui todos os JS para purge de classes
  ],
  theme: {
    extend: {
      // ✅ Correção dos warnings: use valores arbitrários em vez de '05'
      translate: {
        // Agora é só usar class="translate-x-[0.125rem]" etc.
        // Não gera mais warning no build
      },
      scale: {
        '105': '1.05',
        '110': '1.10',
        '115': '1.15',
        '120': '1.20',
      },
      colors: {
        // 🎨 Paleta enterprise padronizada ALSHAM
        primary: '#1E40AF',   // Azul para ações principais
        secondary: '#10B981', // Verde para sucesso/gamificação
        accent: '#F59E0B',    // Amarelo para alertas/automations
        danger: '#EF4444',    // Vermelho para erros/relatórios
        neutral: '#6B7280',   // Cinza para textos/settings
      },
      boxShadow: {
        premium: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)', // Sombras premium
      },
      transitionProperty: {
        'width-height': 'width, height', // Transições suaves em UI dinâmica
      },
    },
  },
  plugins: [
    // Plugins recomendados para padrão enterprise:
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
  safelist: [
    // Mantém as classes dinâmicas usadas pelo Supabase ou via JS
    { pattern: /translate-(x|y)-\[[0-9.]+rem\]/ },
    { pattern: /scale-(105|110|115|120)/ },
    { pattern: /(bg|text|border)-(primary|secondary|accent|danger|neutral)/ },
  ],
};
