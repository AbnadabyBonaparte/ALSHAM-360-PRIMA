/**
 * ⚡ ALSHAM 360° PRIMA — Vite Config v6.2.0 (CORRIGIDO - CSS NA RAIZ)
 * Data: 2025-01-13
 * Última atualização: 2025-01-13 14:06 UTC
 */

import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { VitePWA } from 'vite-plugin-pwa';
import compression from 'vite-plugin-compression';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    }),

    // ✅ PWA com versionamento
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: "ALSHAM 360° PRIMA",
        short_name: "ALSHAM360",
        start_url: "/dashboard.html",
        display: "standalone",
        background_color: "#f9fafb",
        theme_color: "#0176D3",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,json}'],
        globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: { maxEntries: 50, maxAgeSeconds: 300 }
            }
          },
          {
            urlPattern: /^https:\/\/(cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|unpkg\.com)\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          },
          {
            urlPattern: /\.(?:css|js)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'assets-v6.2.0' // ✅ Versionamento atualizado
            }
          }
        ],
        cleanupOutdatedCaches: true
      }
    }),

    compression({ algorithm: 'brotliCompress', ext: '.br' }),
    compression({ algorithm: 'gzip', ext: '.gz' })
  ],

  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        // ✅ ARQUIVOS CRÍTICOS (10)
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        leads: resolve(__dirname, 'leads-real.html'),
        pipeline: resolve(__dirname, 'pipeline.html'),
        automacoes: resolve(__dirname, 'automacoes.html'),
        gamificacao: resolve(__dirname, 'gamificacao.html'),
        relatorios: resolve(__dirname, 'relatorios.html'),
        configuracoes: resolve(__dirname, 'configuracoes.html'),
        
        // ✅ ARQUIVOS SECUNDÁRIOS (11)
        'auth-dashboard': resolve(__dirname, 'auth-dashboard.html'),
        'create-org': resolve(__dirname, 'create-org.html'),
        logout: resolve(__dirname, 'logout.html'),
        register: resolve(__dirname, 'register.html'),
        'reset-password-confirm': resolve(__dirname, 'reset-password-confirm.html'),
        'reset-password': resolve(__dirname, 'reset-password.html'),
        'session-guard': resolve(__dirname, 'session-guard.html'),
        'test-reset-password': resolve(__dirname, 'test-reset-password.html'),
        'test-supabase': resolve(__dirname, 'test-supabase.html'),
        'timeline-test': resolve(__dirname, 'timeline-test.html'),
        'token-refresh': resolve(__dirname, 'token-refresh.html'),
      },
      output: {
        manualChunks: {
          'supabase': ['@supabase/supabase-js'],
          'charts': ['chart.js'],
          'vendor': ['jspdf', 'xlsx']
        }
      }
    }
  },

  publicDir: 'public',
  
  // ✅ CORRIGIDO: Aliases apontam para /css/ na raiz
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@css': resolve(__dirname, './css'),      // ✅ CORREÇÃO CRÍTICA: CSS na raiz
      '@js': resolve(__dirname, './src/js'),
      '@lib': resolve(__dirname, './src/lib'),
      '/js': resolve(__dirname, './src/js'),
      '/css': resolve(__dirname, './css')       // ✅ CORREÇÃO CRÍTICA: CSS na raiz
    }
  },

  server: {
    host: '0.0.0.0',
    port: 5173,
    open: true,
    cors: true
  },

  optimizeDeps: {
    include: [
      'chart.js',
      '@supabase/supabase-js',
      'jspdf',
      'xlsx'
    ],
    exclude: ['@vite/client', '@vite/env']
  }
});
