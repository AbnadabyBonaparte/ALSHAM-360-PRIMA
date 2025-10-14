/**
 * ⚡ ALSHAM 360° PRIMA — PostCSS Configuration
 * 
 * Configuração minimalista e funcional do PostCSS.
 * 
 * Plugins:
 * - tailwindcss: Processa diretivas @tailwind
 * - autoprefixer: Adiciona prefixos vendor automaticamente
 * 
 * Nota: Minificação é feita pelo Tailwind CLI (--minify flag)
 * Nota: cssnano removido (causa erro no Vercel build)
 * 
 * @version 2.0.4
 * @enterprise-grade
 * @author AbnadabyBonaparte
 */

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
