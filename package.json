/**
 * ⚡ ALSHAM 360° PRIMA — PostCSS Configuration
 * 
 * Configuração do processador CSS para Tailwind e otimizações.
 * 
 * @version 2.0.4
 * @enterprise-grade
 */

export default {
  plugins: {
    // Tailwind CSS processing
    tailwindcss: {},
    
    // Autoprefixer para compatibilidade cross-browser
    autoprefixer: {
      overrideBrowserslist: [
        '>0.2%',
        'not dead',
        'not op_mini all',
        'last 2 versions',
        'iOS >= 12',
        'Safari >= 12'
      ],
      grid: 'autoplace'
    },
    
    // Minificação em produção
    ...(process.env.NODE_ENV === 'production' ? {
      cssnano: {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          normalizeWhitespace: true,
          colormin: true,
          minifyFontValues: true,
          minifyGradients: true,
        }]
      }
    } : {})
  }
};
