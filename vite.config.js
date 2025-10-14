/**
 * ⚡ ALSHAM 360° PRIMA — Vite Config v11.1.1 HOTFIX
 * Data: 2025-10-14 21:08 UTC
 * Fix: Removed duplicate manualChunks + visualizer dependency
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
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      renderLegacyChunks: false
    }),

    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false
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

    compression({ 
      algorithm: 'brotliCompress', 
      ext: '.br',
      threshold: 1024,
      compressionOptions: { level: 11 }
    }),
    
    compression({ 
      algorithm: 'gzip', 
      ext: '.gz',
      threshold: 1024,
      compressionOptions: { level: 9 }
    })
  ],

  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    cssMinify: true,
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 500,
    
    rollupOptions: {
      input: {
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
        // ✅ CODE SPLITTING OTIMIZADO (sem duplicação)
        manualChunks: (id) => {
          // 1. Supabase
          if (id.includes('@supabase/supabase-js')) {
            return 'supabase';
          }
          
          // 2. Chart.js
          if (id.includes('chart.js')) {
            return 'charts';
          }
          
          // 3. jsPDF
          if (id.includes('jspdf')) {
            return 'export-pdf';
          }
          
          // 4. XLSX
          if (id.includes('xlsx')) {
            return 'export-excel';
          }
          
          // 5. Confetti
          if (id.includes('canvas-confetti')) {
            return 'confetti';
          }
          
          // 6. Vendor comum
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name;
          if (name === 'charts' || name === 'export-pdf' || name === 'export-excel') {
            return 'assets/lazy/[name]-[hash].js';
          }
          return 'assets/[name]-[hash].js';
        },
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          if (/\.(woff2?|ttf|eot)$/.test(assetInfo.name)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          if (/\.(png|jpe?g|svg|gif|webp|ico)$/.test(assetInfo.name)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      },
      
      treeshake: {
        preset: 'recommended',
        moduleSideEffects: false
      }
    },
    
    reportCompressedSize: true
  },

  publicDir: 'public',
  
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

  server: {
    host: '0.0.0.0',
    port: 5173,
    open: true,
    cors: true,
    strictPort: false,
    hmr: {
      overlay: true
    }
  },

  preview: {
    host: '0.0.0.0',
    port: 4173,
    open: true,
    cors: true
  },

  optimizeDeps: {
    include: [
      '@supabase/supabase-js'
    ],
    exclude: [
      '@vite/client', 
      '@vite/env',
      'chart.js',
      'jspdf',
      'xlsx'
    ],
    esbuildOptions: {
      target: 'esnext'
    }
  },

  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase'
    }
  },

  json: {
    stringify: true
  }
});
