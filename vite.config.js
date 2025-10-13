/**
 * ⚡ ALSHAM 360° PRIMA — Vite Config v9.2.1 ENTERPRISE
 * Data: 2025-01-13 15:58 UTC
 * Correção: Service Worker NÃO cacheia CDNs externos (resolve CSP violations)
 * Autor: @AbnadabyBonaparte
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

    // ✅ PWA CORRIGIDO - NÃO cacheia CDNs externos
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false // ✅ Desabilita SW em dev (evita confusão)
      },
      manifest: {
        name: "ALSHAM 360° PRIMA",
        short_name: "ALSHAM360",
        description: "CRM Enterprise com IA, Multi-tenant, Segurança CSP Level 3",
        start_url: "/dashboard.html",
        display: "standalone",
        orientation: "portrait-primary",
        background_color: "#f9fafb",
        theme_color: "#0176D3",
        categories: ["business", "productivity", "crm"],
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
        // ✅ Ignora node_modules e arquivos do próprio SW
        globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js'],
        
        // ✅ Cache apenas arquivos LOCAIS (mesmo origin)
        globPatterns: ['**/*.{js,css,html,png,svg,ico,json,woff2}'],
        
        // ✅ URLs que o SW deve IGNORAR completamente
        navigateFallbackDenylist: [
          /^https:\/\/cdn\./,
          /^https:\/\/cdnjs\./,
          /^https:\/\/fonts\./,
          /^https:\/\/unpkg\./,
        ],
        
        // ✅ Runtime caching SÓ para recursos permitidos no CSP
        runtimeCaching: [
          // 1. API Supabase - Network First (dados sempre atualizados)
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-v9.2.1',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60 // 5 minutos
              },
              networkTimeoutSeconds: 10
            }
          },
          
          // 2. Assets LOCAIS (CSS/JS próprios) - Stale While Revalidate
          {
            urlPattern: ({ url }) => {
              // ✅ SÓ cacheia se for do mesmo origin
              return url.origin === self.location.origin && 
                     /\.(?:css|js)$/.test(url.pathname);
            },
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'local-assets-v9.2.1'
            }
          },
          
          // 3. Imagens LOCAIS - Cache First
          {
            urlPattern: ({ url }) => {
              return url.origin === self.location.origin && 
                     /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/.test(url.pathname);
            },
            handler: 'CacheFirst',
            options: {
              cacheName: 'local-images-v9.2.1',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 dias
              }
            }
          },
          
          // 4. HTML Pages - Network First (sempre tenta buscar versão nova)
          {
            urlPattern: ({ url }) => {
              return url.origin === self.location.origin && 
                     /\.html$/.test(url.pathname);
            },
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-pages-v9.2.1',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60 // 1 dia
              }
            }
          }
          
          // ❌ REMOVIDO: Qualquer padrão que tente cachear CDNs externos
          // CDNs são carregados diretamente via <script src> no HTML
          // Não precisam de cache do Service Worker
        ],
        
        // ✅ Limpa caches antigos automaticamente
        cleanupOutdatedCaches: true,
        
        // ✅ SW ativo imediatamente (sem esperar reload)
        skipWaiting: true,
        clientsClaim: true
      }
    }),

    // ✅ Compressão Brotli e Gzip
    compression({ algorithm: 'brotliCompress', ext: '.br' }),
    compression({ algorithm: 'gzip', ext: '.gz' })
  ],

  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: false, // ✅ Desabilita sourcemaps em produção (segurança)
    minify: 'esbuild',
    assetsInlineLimit: 4096, // ✅ Inline assets < 4KB
    
    rollupOptions: {
      input: {
        // ✅ 20 ARQUIVOS HTML (todos os seus arquivos)
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        register: resolve(__dirname, 'register.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        leadsReal: resolve(__dirname, 'leads-real.html'),
        pipeline: resolve(__dirname, 'pipeline.html'),
        automacoes: resolve(__dirname, 'automacoes.html'),
        gamificacao: resolve(__dirname, 'gamificacao.html'),
        relatorios: resolve(__dirname, 'relatorios.html'),
        configuracoes: resolve(__dirname, 'configuracoes.html'),
        authDashboard: resolve(__dirname, 'auth-dashboard.html'),
        createOrg: resolve(__dirname, 'create-org.html'),
        logout: resolve(__dirname, 'logout.html'),
        resetPassword: resolve(__dirname, 'reset-password.html'),
        resetPasswordConfirm: resolve(__dirname, 'reset-password-confirm.html'),
        sessionGuard: resolve(__dirname, 'session-guard.html'),
        testResetPassword: resolve(__dirname, 'test-reset-password.html'),
        testSupabase: resolve(__dirname, 'test-supabase.html'),
        timelineTest: resolve(__dirname, 'timeline-test.html'),
        tokenRefresh: resolve(__dirname, 'token-refresh.html')
      },
      
      output: {
        // ✅ Code splitting inteligente
        manualChunks: {
          'supabase': ['@supabase/supabase-js'],
          'charts': ['chart.js'],
          'vendor': ['jspdf', 'xlsx']
        },
        
        // ✅ Nomes de arquivo com hash para cache busting
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },

  publicDir: 'public',
  
  // ✅ Aliases para imports
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@css': resolve(__dirname, './css'),
      '@js': resolve(__dirname, './src/js'),
      '@lib': resolve(__dirname, './src/lib'),
      '/js': resolve(__dirname, './src/js'),
      '/css': resolve(__dirname, './css')
    }
  },

  // ✅ Server config para desenvolvimento
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: true,
    cors: true,
    strictPort: false, // ✅ Tenta próxima porta se 5173 ocupada
    hmr: {
      overlay: true // ✅ Mostra erros na tela
    }
  },

  // ✅ Preview config (após build)
  preview: {
    host: '0.0.0.0',
    port: 4173,
    open: true,
    cors: true
  },

  // ✅ Otimizações de dependências
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
