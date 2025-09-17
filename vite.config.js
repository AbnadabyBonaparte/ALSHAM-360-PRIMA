import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    base: '/', // Caminho raiz da aplicação

    server: {
      port: 5173,
      open: true,
      host: true,
    },

    build: {
      outDir: 'dist',
      emptyOutDir: true,
      minify: isProduction ? 'esbuild' : false,
      sourcemap: !isProduction,
      target: 'esnext',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        // Multi-Page App: cada HTML precisa estar aqui
        input: {
          main: 'index.html',
          leads: 'leads.html',
          gamificacao: 'gamificacao.html',
          automacoes: 'automacoes.html',
          relatorios: 'relatorios.html',
          configuracoes: 'configuracoes.html',
          login: 'login.html',
          register: 'register.html',
        },
        output: {
          entryFileNames: isProduction ? 'assets/[name]-[hash].js' : 'assets/[name].js',
          chunkFileNames: isProduction ? 'assets/[name]-[hash].js' : 'assets/[name].js',
          assetFileNames: isProduction ? 'assets/[name]-[hash].[ext]' : 'assets/[name].[ext]',
        },
      },
    },

    optimizeDeps: {
      include: ['@supabase/supabase-js', 'lodash', 'chart.js'],
    },

    plugins: [
      VitePWA({
        strategies: 'generateSW',
        registerType: 'autoUpdate',
        devOptions: { enabled: true },
        workbox: {
          clientsClaim: true,
          skipWaiting: true,
          globPatterns: [
            '**/*.{js,css,html,png,svg,jpg,jpeg,gif,webp,woff,woff2,ttf,eot,ico}',
          ],
          globDirectory: 'dist/',
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'supabase-api-cache',
                expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
                networkTimeoutSeconds: 10,
              },
            },
            {
              urlPattern: ({ request }) =>
                ['style', 'script', 'image'].includes(request.destination),
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'static-assets',
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
          ],
        },
        manifest: {
          name: 'ALSHAM 360° PRIMA',
          short_name: 'PRIMA CRM',
          description:
            'Enterprise CRM system with leads, gamification, automations, and real-time data via Supabase.',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          scope: '/',
          start_url: '/',
          orientation: 'portrait',
          icons: [
            { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
      }),
    ],

    resolve: {
      alias: {
        '@': '/src',
      },
    },
  };
});
