/**
 * ⚡ ALSHAM 360° PRIMA — Vite Config v11.1.4 HOTFIX ENTERPRISE FINAL
 * Data: 2025-10-15 01:50 UTC
 * Fix: writeBundle com timeout para copiar sw.js APÓS Vite PWA
 * Autor: @AbnadabyBonaparte
 */

import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { VitePWA } from 'vite-plugin-pwa';
import compression from 'vite-plugin-compression';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      renderLegacyChunks: false
    }),

    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      devOptions: { enabled: false },
      manifest: {
        name: "ALSHAM 360° PRIMA",
        short_name: "ALSHAM360",
        description: "CRM Enterprise com IA, automações e gamificação.",
        start_url: "/dashboard.html",
        display: "standalone",
        orientation: "portrait-primary",
        background_color: "#f9fafb",
        theme_color: "#0176D3",
        lang: "pt-BR",
        categories: ["business", "productivity", "crm", "automation", "analytics"],
        icons: [
          { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
        ],
        screenshots: [
          { src: "/screenshots/dashboard.png", sizes: "1280x720", type: "image/png", label: "Dashboard Principal" }
        ],
        shortcuts: [
          { name: "Dashboard", short_name: "Dashboard", description: "Acesso rápido ao dashboard", url: "/dashboard.html", icons: [{ src: "/pwa-192x192.png", sizes: "192x192" }] },
          { name: "Leads", short_name: "Leads", description: "Gerenciar leads", url: "/leads-real.html", icons: [{ src: "/pwa-192x192.png", sizes: "192x192" }] },
          { name: "Pipeline", short_name: "Pipeline", description: "Visualizar pipeline", url: "/pipeline.html", icons: [{ src: "/pwa-192x192.png", sizes: "192x192" }] }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,json,woff2}'],
        globIgnores: ['**/node_modules/**/*', 'sw-backup-manual.js', 'service-worker.js'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^https:\/\/cdn\./, /^https:\/\/cdnjs\./, /^https:\/\/fonts\./, /^https:\/\/unpkg\./],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'supabase-api-v11.1.4', expiration: { maxEntries: 50, maxAgeSeconds: 300 }, networkTimeoutSeconds: 10, cacheableResponse: { statuses: [0, 200] } }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-styles-v11.1.4', expiration: { maxEntries: 10, maxAgeSeconds: 31536000 }, cacheableResponse: { statuses: [0, 200] } }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-files-v11.1.4', expiration: { maxEntries: 20, maxAgeSeconds: 31536000 }, cacheableResponse: { statuses: [0, 200] } }
          },
          {
            urlPattern: /^https:\/\/(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net)\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'cdn-libs-v11.1.4', expiration: { maxEntries: 50, maxAgeSeconds: 2592000 }, cacheableResponse: { statuses: [0, 200] } }
          },
          {
            urlPattern: ({ url }) => url.origin === self.location.origin && /\.(?:css|js)$/.test(url.pathname),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'local-assets-v11.1.4', expiration: { maxEntries: 100, maxAgeSeconds: 604800 } }
          },
          {
            urlPattern: ({ url }) => url.origin === self.location.origin && /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/.test(url.pathname),
            handler: 'CacheFirst',
            options: { cacheName: 'local-images-v11.1.4', expiration: { maxEntries: 100, maxAgeSeconds: 2592000 } }
          },
          {
            urlPattern: ({ url }) => url.origin === self.location.origin && /\.html$/.test(url.pathname),
            handler: 'NetworkFirst',
            options: { cacheName: 'html-pages-v11.1.4', networkTimeoutSeconds: 5, expiration: { maxEntries: 50, maxAgeSeconds: 86400 } }
          }
        ],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true
      }
    }),

    compression({ algorithm: 'brotliCompress', ext: '.br', threshold: 1024, compressionOptions: { level: 11 } }),
    compression({ algorithm: 'gzip', ext: '.gz', threshold: 1024, compressionOptions: { level: 9 } }),

    // ✅ CORRIGIDO: writeBundle com timeout
    {
      name: 'copy-sw-root',
      writeBundle() {
        const src = path.resolve(process.cwd(), 'dist', 'sw.js');
        const dest = path.resolve(process.cwd(), 'public', 'sw.js');
        
        setTimeout(() => {
          try {
            if (fs.existsSync(src)) {
              fs.copyFileSync(src, dest);
              console.log('⚡ [ALSHAM BUILD] sw.js copiado para /public com sucesso!');
            } else {
              console.warn('⚠️ [ALSHAM BUILD] sw.js ainda não foi gerado pelo Vite PWA.');
            }
          } catch (error) {
            console.error('❌ [ALSHAM BUILD] Erro ao copiar sw.js:', error);
          }
        }, 1000);
      }
    }
  ],

  build: {
    target: 'esnext',
    outDir: 'dist',
    minify: 'esbuild',
    cssMinify: true,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        dashboard: resolve(process.cwd(), 'dashboard.html'),
        leadsReal: resolve(process.cwd(), 'leads-real.html'),
        pipeline: resolve(process.cwd(), 'pipeline.html'),
        automacoes: resolve(process.cwd(), 'automacoes.html'),
        gamificacao: resolve(process.cwd(), 'gamificacao.html'),
        relatorios: resolve(process.cwd(), 'relatorios.html'),
        configuracoes: resolve(process.cwd(), 'configuracoes.html'),
        login: resolve(process.cwd(), 'login.html'),
        register: resolve(process.cwd(), 'register.html'),
        authDashboard: resolve(process.cwd(), 'auth-dashboard.html'),
        createOrg: resolve(process.cwd(), 'create-org.html'),
        logout: resolve(process.cwd(), 'logout.html'),
        resetPassword: resolve(process.cwd(), 'reset-password.html'),
        resetPasswordConfirm: resolve(process.cwd(), 'reset-password-confirm.html'),
        sessionGuard: resolve(process.cwd(), 'session-guard.html'),
        testResetPassword: resolve(process.cwd(), 'test-reset-password.html'),
        testSupabase: resolve(process.cwd(), 'test-supabase.html'),
        timelineTest: resolve(process.cwd(), 'timeline-test.html'),
        tokenRefresh: resolve(process.cwd(), 'token-refresh.html')
      },
      output: {
        manualChunks: id => {
          if (id.includes('@supabase/supabase-js')) return 'supabase';
          if (id.includes('chart.js')) return 'charts';
          if (id.includes('jspdf')) return 'export-pdf';
          if (id.includes('xlsx')) return 'export-excel';
          if (id.includes('canvas-confetti')) return 'confetti';
          if (id.includes('node_modules')) return 'vendor';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: assetInfo => {
          if (assetInfo.name.endsWith('.css')) return 'assets/css/[name]-[hash][extname]';
          if (/\.(woff2?|ttf|eot)$/.test(assetInfo.name)) return 'assets/fonts/[name]-[hash][extname]';
          if (/\.(png|jpe?g|svg|gif|webp|ico)$/.test(assetInfo.name)) return 'assets/images/[name]-[hash][extname]';
          return 'assets/[name]-[hash][extname]';
        }
      },
      treeshake: { preset: 'recommended', moduleSideEffects: false }
    },
    reportCompressedSize: true
  },

  publicDir: 'public',
  resolve: {
    alias: {
      '@': resolve(process.cwd(), './src'),
      '@css': resolve(process.cwd(), './css'),
      '@js': resolve(process.cwd(), './src/js'),
      '@lib': resolve(process.cwd(), './src/lib'),
      '/js': resolve(process.cwd(), './src/js'),
      '/css': resolve(process.cwd(), './css')
    }
  },

  server: { host: '0.0.0.0', port: 5173, open: true, cors: true, strictPort: false, hmr: { overlay: true } },
  preview: { host: '0.0.0.0', port: 4173, open: true, cors: true },
  optimizeDeps: { include: ['@supabase/supabase-js'], exclude: ['@vite/client', '@vite/env', 'chart.js', 'jspdf', 'xlsx'], esbuildOptions: { target: 'esnext' } },
  css: { devSourcemap: true, modules: { localsConvention: 'camelCase' } },
  json: { stringify: true }
});
