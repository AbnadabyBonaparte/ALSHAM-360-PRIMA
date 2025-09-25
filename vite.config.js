// vite.config.js - CONFIGURAÇÃO CORRIGIDA E COMPLETA
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    base: '/',
    server: {
      port: 5173,
      open: true,
      host: true,
      headers: {
        'Content-Security-Policy': [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://unpkg.com https://cdn.tailwindcss.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: https: blob:",
          "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://fonts.googleapis.com https://cdn.jsdelivr.net https://cdn.tailwindcss.com",
          "frame-src 'self'",
          "worker-src 'self' blob:",
          "manifest-src 'self'"
        ].join('; '),
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      }
    },

    build: {
      outDir: 'dist',
      emptyOutDir: true,
      minify: isProduction ? 'esbuild' : false,
      sourcemap: !isProduction,
      target: 'esnext',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        input: {
          index:        'index.html',
          dashboard:    'dashboard.html',
          leads:        'leads-real.html',
          gamificacao:  'gamificacao.html',
          automacoes:   'automacoes.html',
          relatorios:   'relatorios.html',
          configuracoes:'configuracoes.html',
          login:        'login.html',
          register:     'register.html',
          createOrg:    'create-org.html',
          'test-supabase': 'test-supabase.html' // opcional
        },
        output: {
          entryFileNames: isProduction ? 'assets/[name]-[hash].js' : 'assets/[name].js',
          chunkFileNames: isProduction ? 'assets/[name]-[hash].js' : 'assets/[name].js',
          assetFileNames: isProduction ? 'assets/[name]-[hash].[ext]' : 'assets/[name].[ext]',
          manualChunks: {
            vendor: ['@supabase/supabase-js'],
            charts: ['chart.js'],
            utils: ['papaparse', 'xlsx', 'jspdf']
          }
        },
      },
    },

    optimizeDeps: {
      include: [
        '@supabase/supabase-js',
        'chart.js',
        'chart.js/auto',
        'papaparse',
        'canvas-confetti'
      ],
      force: !isProduction
    },

    esbuild: {
      target: 'esnext',
      supported: { 'top-level-await': true }
    },

    plugins: [
      VitePWA({
        strategies: 'generateSW',
        registerType: 'autoUpdate',
        devOptions: { enabled: true },
        workbox: {
          clientsClaim: true,
          skipWaiting: true,
          globPatterns: ['**/*.{js,css,html,png,svg,webp,woff2,ico}'],
          globDirectory: 'dist/',
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/rgvnbtuqtxvfxhrdnkjg\.supabase\.co\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'supabase-api-cache',
                expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 2 },
                networkTimeoutSeconds: 10,
                cacheableResponse: { statuses: [0, 200] }
              },
            },
            {
              urlPattern: /^https:\/\/cdn\.(jsdelivr\.net|cdnjs\.cloudflare\.com)\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'cdn-cache',
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 }
              },
            },
            {
              urlPattern: ({ request }) =>
                ['style', 'script', 'image', 'font'].includes(request.destination),
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
          description: 'Enterprise CRM system with leads, gamification, automations, and real-time data via Supabase.',
          theme_color: '#3B82F6',
          background_color: '#ffffff',
          display: 'standalone',
          scope: '/',
          start_url: '/',
          orientation: 'portrait',
          icons: [
            { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
            { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          ],
        },
      }),
    ],

    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
        '@lib': new URL('./src/lib', import.meta.url).pathname,
        '@js': new URL('./js', import.meta.url).pathname,
      },
    },

    define: {
      __SUPABASE_URL__: JSON.stringify(import.meta.env.VITE_SUPABASE_URL),
      __VERSION__: JSON.stringify(process.env.npm_package_version || '2.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    },

    css: {
      postcss: { plugins: [] }
    },

    preview: {
      port: 4173,
      host: true,
      headers: {
        'Content-Security-Policy': [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://unpkg.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: https: blob:",
          "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
          "frame-src 'self'",
          "worker-src 'self' blob:"
        ].join('; ')
      }
    }
  };
});
