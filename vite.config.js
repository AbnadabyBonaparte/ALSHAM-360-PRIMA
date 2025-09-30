// vite.config.js
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  return {
    base: '/',
    root: 'public', // ✅ ADICIONAR ESTA LINHA
    publicDir: '../public', // ✅ ADICIONAR ESTA LINHA
    build: {
      outDir: '../dist', // ✅ MUDAR PARA ../dist
      emptyOutDir: true,
      minify: isProduction ? 'esbuild' : false,
      sourcemap: !isProduction,
      target: 'esnext',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'public/index.html'),
          dashboard: resolve(__dirname, 'public/dashboard.html'),
          leadsReal: resolve(__dirname, 'public/leads-real.html'),
          automacoes: resolve(__dirname, 'public/automacoes.html'),
          relatorios: resolve(__dirname, 'public/relatorios.html'),
          gamificacao: resolve(__dirname, 'public/gamificacao.html'),
          configuracoes: resolve(__dirname, 'public/configuracoes.html'),
          login: resolve(__dirname, 'public/login.html'),
          register: resolve(__dirname, 'public/register.html'),
          createOrg: resolve(__dirname, 'public/create-org.html'),
        },
      },
    },
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'ALSHAM 360° PRIMA',
          short_name: 'PRIMA',
          theme_color: '#3B82F6',
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}']
        }
      }),
    ],
    define: {
      __SUPABASE_URL__: JSON.stringify(SUPABASE_URL),
      __SUPABASE_ANON_KEY__: JSON.stringify(SUPABASE_KEY),
      __VERSION__: JSON.stringify(process.env.npm_package_version || '2.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
  };
});
