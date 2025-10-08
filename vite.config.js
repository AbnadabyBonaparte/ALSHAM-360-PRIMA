/**
 * ⚡ ALSHAM 360° PRIMA — Configuração Oficial de Build (v6.0.7)
 * Ambiente: Produção — Node 22.x / Vite 5.4.20
 * Autor: ALSHAM Development Team | 2025
 *
 * Inclui:
 * - Compatibilidade moderna + fallback legacy
 * - PWA autoUpdate + cache inteligente
 * - Compressão Brotli + Gzip
 * - Estrutura multi-página (MPA) e alias enterprise
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

    // Progressive Web App (PWA)
    VitePWA({
      srcDir: 'src',
      filename: 'service-worker.js',
      registerType: 'autoUpdate',
      manifest: false, // usa o manifest.json externo
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'icons/icon-192x192.png',
        'icons/icon-512x512.png'
      ],
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,json}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.supabase\.co\//,
            handler: 'NetworkFirst',
            options: { cacheName: 'supabase-api-cache' }
          },
          {
            urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: { cacheName: 'image-cache' }
          }
        ]
      }
    }),

    // Compressão Brotli + Gzip
    compression({ algorithm: 'brotliCompress', ext: '.br', threshold: 10240 }),
    compression({ algorithm: 'gzip', ext: '.gz', threshold: 10240 })
  ],

  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    reportCompressedSize: true,
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
      },
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },

  publicDir: 'public',
  resolve: {
    alias: {
      '@': '/src',
      '/js': '/public/js',
      '/css': '/public/css'
    }
  },

  server: {
    host: '0.0.0.0',
    port: 5173,
    open: true,
    strictPort: true
  },

  optimizeDeps: {
    include: ['chart.js', '@supabase/supabase-js']
  },

  define: {
    __APP_ENV__: JSON.stringify(process.env.NODE_ENV || 'production')
  }
});
