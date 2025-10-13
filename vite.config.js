/**
 * ⚡ ALSHAM 360° PRIMA — Vite Config v6.1.0 (CORRIGIDO)
 * Data: 2025-01-13
 */

import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { VitePWA } from 'vite-plugin-pwa';
import compression from 'vite-plugin-compression';

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
            urlPattern: /\.(?:css|js)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'assets-v6.1.0' // ✅ Versionamento
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
    rollupOptions: {
      input: {
        main: './index.html',
        login: './login.html',
        dashboard: './dashboard.html',
        leads: './leads-real.html',
        pipeline: './pipeline.html',
        automacoes: './automacoes.html',
        gamificacao: './gamificacao.html',
        relatorios: './relatorios.html',
        configuracoes: './configuracoes.html'
      }
    }
  },

  publicDir: 'public',
  
  // ✅ CORRIGIDO: Aliases apontam para caminhos reais
  resolve: {
    alias: {
      '@': '/src',
      '/js': '/src/js',      // ✅ CORREÇÃO CRÍTICA
      '/css': '/public/css'
    }
  },

  server: {
    host: '0.0.0.0',
    port: 5173,
    open: true
  },

  optimizeDeps: {
    include: ['chart.js', '@supabase/supabase-js']
  }
});
