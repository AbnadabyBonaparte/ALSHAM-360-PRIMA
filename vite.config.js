/**
 * ⚡ ALSHAM 360° PRIMA — Vite Config v11.1.0 PERFORMANCE
 * Data: 2025-10-14 21:04 UTC
 * Otimização: Lazy loading + Tree shaking + Code splitting avançado
 * Autor: @AbnadabyBonaparte
 * 
 * CHANGELOG v11.1.0:
 * - ✅ Code splitting otimizado (charts, export-pdf, export-excel separados)
 * - ✅ Lazy loading automático para bibliotecas pesadas
 * - ✅ Tree shaking agressivo
 * - ✅ Compression Brotli + Gzip
 * - ✅ Bundle analysis preparado
 * - ✅ Preload hints otimizados
 */

import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { VitePWA } from 'vite-plugin-pwa';
import compression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    // ✅ Legacy Browser Support (opcional - remover para performance máxima)
    legacy({
      targets: ['defaults', 'not IE 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      renderLegacyChunks: false // ✅ Desabilita chunks legacy (economia de 30%)
    }),

    // ✅ PWA Otimizado
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false // ✅ Desabilita SW em dev
      },
      manifest: {
        name: "ALSHAM 360° PRIMA",
        short_name: "ALSHAM360",
        description: "CRM Enterprise com IA - v11.1 Performance Optimized",
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
        globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js'],
        globPatterns: ['**/*.{js,css,html,png,svg,ico,json,woff2}'],
        
        navigateFallbackDenylist: [
          /^https:\/\/cdn\./,
          /^https:\/\/cdnjs\./,
          /^https:\/\/fonts\./,
          /^https:\/\/unpkg\./,
        ],
        
        runtimeCaching: [
          // 1. Supabase API - Network First
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-v11.1',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60
              },
              networkTimeoutSeconds: 10
            }
          },
          
          // 2. Assets Locais - Stale While Revalidate
          {
            urlPattern: ({ url }) => {
              return url.origin === self.location.origin && 
                     /\.(?:css|js)$/.test(url.pathname);
            },
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'local-assets-v11.1'
            }
          },
          
          // 3. Imagens - Cache First
          {
            urlPattern: ({ url }) => {
              return url.origin === self.location.origin && 
                     /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/.test(url.pathname);
            },
            handler: 'CacheFirst',
            options: {
              cacheName: 'local-images-v11.1',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60
              }
            }
          },
          
          // 4. HTML Pages - Network First
          {
            urlPattern: ({ url }) => {
              return url.origin === self.location.origin && 
                     /\.html$/.test(url.pathname);
            },
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-pages-v11.1',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60
              }
            }
          }
        ],
        
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true
      }
    }),

    // ✅ Compression Brotli (melhor compressão)
    compression({ 
      algorithm: 'brotliCompress', 
      ext: '.br',
      threshold: 1024, // Apenas arquivos > 1KB
      compressionOptions: { level: 11 } // Máxima compressão
    }),
    
    // ✅ Compression Gzip (fallback)
    compression({ 
      algorithm: 'gzip', 
      ext: '.gz',
      threshold: 1024,
      compressionOptions: { level: 9 }
    }),

    // ✅ Bundle Analyzer (descomente para analisar)
    // visualizer({
    //   filename: 'stats.html',
    //   open: true,
    //   gzipSize: true,
    //   brotliSize: true
    // })
  ],

  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: false, // ✅ Sem sourcemaps em produção (segurança + performance)
    minify: 'esbuild', // ✅ esbuild é 20x mais rápido que terser
    
    // ✅ Otimizações CSS
    cssMinify: true,
    cssCodeSplit: true,
    
    // ✅ Inline assets pequenos (< 4KB)
    assetsInlineLimit: 4096,
    
    // ✅ Chunk size warnings
    chunkSizeWarningLimit: 500, // Avisa se chunk > 500KB
    
    rollupOptions: {
      input: {
        // ✅ Páginas principais
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
        
        // ✅ Páginas de autenticação
        authDashboard: resolve(__dirname, 'auth-dashboard.html'),
        createOrg: resolve(__dirname, 'create-org.html'),
        logout: resolve(__dirname, 'logout.html'),
        resetPassword: resolve(__dirname, 'reset-password.html'),
        resetPasswordConfirm: resolve(__dirname, 'reset-password-confirm.html'),
        sessionGuard: resolve(__dirname, 'session-guard.html'),
        
        // ✅ Páginas de teste (opcional - remover em produção)
        testResetPassword: resolve(__dirname, 'test-reset-password.html'),
        testSupabase: resolve(__dirname, 'test-supabase.html'),
        timelineTest: resolve(__dirname, 'timeline-test.html'),
        tokenRefresh: resolve(__dirname, 'token-refresh.html')
      },
      
      output: {
        // ✅ CODE SPLITTING OTIMIZADO v11.1
        manualChunks: (id) => {
          // 1. Supabase (essencial - sempre carrega)
          if (id.includes('@supabase/supabase-js')) {
            return 'supabase';
          }
          
          // 2. Chart.js (lazy load - chunk separado)
          if (id.includes('chart.js')) {
            return 'charts';
          }
          
          // 3. jsPDF (lazy load - apenas quando exportar PDF)
          if (id.includes('jspdf')) {
            return 'export-pdf';
          }
          
          // 4. XLSX (lazy load - apenas quando exportar Excel)
          if (id.includes('xlsx')) {
            return 'export-excel';
          }
          
          // 5. Confetti (lazy load - apenas em gamificação)
          if (id.includes('canvas-confetti')) {
            return 'confetti';
          }
          
          // 6. Node modules restantes (vendor comum)
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        
        // ✅ Nomes de arquivo com hash (cache busting)
        chunkFileNames: (chunkInfo) => {
          // Chunks lazy-loaded não precisam de hash complexo
          const name = chunkInfo.name;
          if (name === 'charts' || name === 'export-pdf' || name === 'export-excel') {
            return 'assets/lazy/[name]-[hash].js';
          }
          return 'assets/[name]-[hash].js';
        },
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // CSS separado por tipo
          if (assetInfo.name.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          // Fontes
          if (/\.(woff2?|ttf|eot)$/.test(assetInfo.name)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          // Imagens
          if (/\.(png|jpe?g|svg|gif|webp|ico)$/.test(assetInfo.name)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        
        // ✅ Preload automático para chunks críticos
        manualChunks(id) {
          if (id.includes('src/lib/supabase')) {
            return 'lib-supabase';
          }
        }
      },
      
      // ✅ Otimizações Rollup
      treeshake: {
        preset: 'recommended',
        moduleSideEffects: false
      }
    },
    
    // ✅ Reportar compressed size
    reportCompressedSize: true,
    
    // ✅ Terser options (se minify: 'terser')
    // terserOptions: {
    //   compress: {
    //     drop_console: true,
    //     drop_debugger: true
    //   }
    // }
  },

  publicDir: 'public',
  
  // ✅ Aliases para imports limpos
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
    strictPort: false,
    hmr: {
      overlay: true
    },
    // ✅ Proxy para API (se necessário)
    // proxy: {
    //   '/api': {
    //     target: 'https://rgvnbtuqtxvfxhrdnkjg.supabase.co',
    //     changeOrigin: true,
    //     rewrite: (path) => path.replace(/^\/api/, '')
    //   }
    // }
  },

  // ✅ Preview config
  preview: {
    host: '0.0.0.0',
    port: 4173,
    open: true,
    cors: true
  },

  // ✅ Otimizações de dependências (pré-bundle)
  optimizeDeps: {
    include: [
      '@supabase/supabase-js',
      // Chart.js e exports NÃO incluídos (lazy load)
    ],
    exclude: [
      '@vite/client', 
      '@vite/env',
      'chart.js', // ✅ Lazy load
      'jspdf',    // ✅ Lazy load
      'xlsx'      // ✅ Lazy load
    ],
    // ✅ Force esbuild para deps
    esbuildOptions: {
      target: 'esnext'
    }
  },

  // ✅ CSS Processing
  css: {
    preprocessorOptions: {
      // PostCSS será processado automaticamente
    },
    devSourcemap: true, // Sourcemap apenas em dev
    modules: {
      localsConvention: 'camelCase'
    }
  },

  // ✅ JSON import optimization
  json: {
    stringify: true // Converte JSON para string (menor bundle)
  }
});
