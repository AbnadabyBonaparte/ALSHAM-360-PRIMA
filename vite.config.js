import { defineConfig } from 'vite';
import { resolve } from 'path';
import legacy from '@vitejs/plugin-legacy';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // CONFIGURAÇÃO MULTI-PAGE APPLICATION (MPA)
  build: {
    rollupOptions: {
      input: {
        // Páginas na raiz
        main: resolve(__dirname, 'index.html'),
        'create-org': resolve(__dirname, 'create-org.html'),
        'test-supabase': resolve(__dirname, 'test-supabase.html'),
        
        // Páginas em src/pages/ - MAPEAMENTO CORRETO
        dashboard: resolve(__dirname, 'src/pages/dashboard.html'),
        leads: resolve(__dirname, 'src/pages/leads.html'),
        'leads-real': resolve(__dirname, 'src/pages/leads-real.html'),
        login: resolve(__dirname, 'src/pages/login.html'),
        register: resolve(__dirname, 'src/pages/register.html'),
        automacoes: resolve(__dirname, 'src/pages/automacoes.html'),
        gamificacao: resolve(__dirname, 'src/pages/gamificacao.html'),
        relatorios: resolve(__dirname, 'src/pages/relatorios.html'),
        configuracoes: resolve(__dirname, 'src/pages/configuracoes.html')
      },
      output: {
        // CONFIGURAÇÃO PARA MOVER HTMLs PARA A RAIZ DO DIST
        assetFileNames: (assetInfo) => {
          // Manter CSS e outros assets em assets/
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: (chunkInfo) => {
          // Apenas para JS, não HTML
          return 'assets/js/[name]-[hash].js';
        }
      }
    },
    // Configurações adicionais
    target: 'es2015',
    cssTarget: 'chrome80',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },

  // CONFIGURAÇÃO PARA DEVELOPMENT
  server: {
    open: '/',
    port: 3000,
    // Configuração para SPA fallback em desenvolvimento
    middlewareMode: false
  },

  // PLUGINS
  plugins: [
    // Plugin Legacy para compatibilidade
    legacy({
      targets: ['defaults', 'not IE 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      renderLegacyChunks: true,
      polyfills: [
        'es.symbol',
        'es.array.filter',
        'es.promise',
        'es.promise.finally',
        'es/map',
        'es/set',
        'es.array.for-each',
        'es.object.define-properties',
        'es.object.define-property',
        'es.object.get-own-property-descriptor',
        'es.object.get-own-property-descriptors',
        'es.object.keys',
        'es.object.to-string',
        'web.dom-collections.for-each',
        'esnext.global-this',
        'esnext.string.match-all'
      ]
    }),

    // PWA Plugin
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'ALSHAM 360 PRIMA',
        short_name: 'ALSHAM360',
        description: 'CRM Enterprise ALSHAM 360 PRIMA',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 ano
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],

  // RESOLUÇÃO DE PATHS
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@js': resolve(__dirname, 'src/js'),
      '@lib': resolve(__dirname, 'src/lib'),
      '@assets': resolve(__dirname, 'src/assets')
    }
  },

  // CONFIGURAÇÕES DE CSS
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      css: {
        charset: false
      }
    }
  },

  // CONFIGURAÇÕES DE OTIMIZAÇÃO
  optimizeDeps: {
    include: ['@supabase/supabase-js', 'chart.js']
  }
});

