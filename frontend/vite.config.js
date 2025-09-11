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
    strictPort: false
  },
  
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    target: 'es2015',
    chunkSizeWarningLimit: 1000,
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        'create-org': resolve(process.cwd(), 'create-org.html'),
        'test-supabase': resolve(process.cwd(), 'test-supabase.html'),
        dashboard: resolve(process.cwd(), 'src/pages/dashboard.html'),
        'leads-real': resolve(process.cwd(), 'src/pages/leads-real.html'),
        leads: resolve(process.cwd(), 'src/pages/leads.html'),
        login: resolve(process.cwd(), 'src/pages/login.html'),
        register: resolve(process.cwd(), 'src/pages/register.html'),
        relatorios: resolve(process.cwd(), 'src/pages/relatorios.html'),
        automacoes: resolve(process.cwd(), 'src/pages/automacoes.html'),
        gamificacao: resolve(process.cwd(), 'src/pages/gamificacao.html'),
        configuracoes: resolve(process.cwd(), 'src/pages/configuracoes.html')
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
      '@': resolve(process.cwd(), 'src'),
      '@components': resolve(process.cwd(), 'src/components'),
      '@pages': resolve(process.cwd(), 'src/pages'),
      '@js': resolve(process.cwd(), 'src/js'),
      '@lib': resolve(process.cwd(), 'src/lib'),
      '@styles': resolve(process.cwd(), 'src/styles'),
      '@assets': resolve(process.cwd(), 'src/assets')
    }
  },
  
  css: {
    postcss: './postcss.config.js'
  },
  
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '2.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  },
  
  // Otimizações para build
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
