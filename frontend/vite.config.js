import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  root: '.',
  base: '/',
  
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 5173,
    cors: true,
    strictPort: false
  },
  
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT || 4173,
    strictPort: false,
    allowedHosts: [
      'healthcheck.railway.app',
      '.railway.app',
      '.alshamglobal.com.br',
      'localhost',
      'app.alshamglobal.com.br'
    ]
  },
  
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    target: 'es2015',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'create-org': resolve(__dirname, 'create-org.html'),
        'test-supabase': resolve(__dirname, 'test-supabase.html'),
        dashboard: resolve(__dirname, 'src/pages/dashboard.html'),
        'leads-real': resolve(__dirname, 'src/pages/leads-real.html'),
        leads: resolve(__dirname, 'src/pages/leads.html'),
        login: resolve(__dirname, 'src/pages/login.html'),
        register: resolve(__dirname, 'src/pages/register.html'),
        relatorios: resolve(__dirname, 'src/pages/relatorios.html'),
        automacoes: resolve(__dirname, 'src/pages/automacoes.html'),
        gamificacao: resolve(__dirname, 'src/pages/gamificacao.html'),
        configuracoes: resolve(__dirname, 'src/pages/configuracoes.html')
      },
      output: {
        manualChunks: {
          vendor: ['@supabase/supabase-js'],
          charts: ['chart.js'],
          utils: ['canvas-confetti', 'jspdf', 'xlsx', 'papaparse']
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(extType)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    }
  },
  
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.railway\.app\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'railway-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 12 // 12 hours
              }
            }
          }
        ]
      },
      manifest: {
        name: 'ALSHAM 360° PRIMA',
        short_name: 'ALSHAM360',
        description: 'CRM Enterprise com IA, Gamificação e Automações',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@js': resolve(__dirname, 'src/js'),
      '@lib': resolve(__dirname, 'src/lib'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@assets': resolve(__dirname, 'src/assets')
    }
  },
  
  css: {
    postcss: './postcss.config.js'
  },
  
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '2.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    'process.env.RAILWAY_ENVIRONMENT': JSON.stringify(process.env.RAILWAY_ENVIRONMENT || 'production')
  },
  
  // Otimizações específicas para Railway
  optimizeDeps: {
    include: [
      '@supabase/supabase-js',
      'chart.js',
      'canvas-confetti',
      'jspdf',
      'xlsx',
      'papaparse'
    ]
  },
  
  // Configurações de ambiente
  envPrefix: ['VITE_', 'SUPABASE_', 'OPENAI_'],
  
  // Configurações de performance
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  }
});

