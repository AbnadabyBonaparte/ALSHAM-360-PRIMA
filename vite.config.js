// vite.config.js
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

// Pegar env com fallback
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    base: '/',

    build: {
      outDir: 'dist',
      emptyOutDir: true,
      minify: isProduction ? 'esbuild' : false,
      sourcemap: !isProduction,
      target: 'esnext',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'index.html'),
          dashboard: resolve(__dirname, 'dashboard.html'),
          leads: resolve(__dirname, 'leads.html'),
          leadsReal: resolve(__dirname, 'leads-real.html'),
          automacoes: resolve(__dirname, 'automacoes.html'),
          relatorios: resolve(__dirname, 'relatorios.html'),
          gamificacao: resolve(__dirname, 'gamificacao.html'),
          configuracoes: resolve(__dirname, 'configuracoes.html'),
          login: resolve(__dirname, 'login.html'),
          register: resolve(__dirname, 'register.html'),
          createOrg: resolve(__dirname, 'create-org.html'),
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
