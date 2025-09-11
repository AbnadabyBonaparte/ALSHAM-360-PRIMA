import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  root: './',
  base: './',
  
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
          if (/woff|woff2|eot|ttf|otf/i.test(extType)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: (chunkInfo) => {
          // Gerar arquivos HTML na raiz da pasta dist
          if (chunkInfo.name === 'dashboard') return 'dashboard.html';
          if (chunkInfo.name === 'leads') return 'leads.html';
          if (chunkInfo.name === 'leads-real') return 'leads-real.html';
          if (chunkInfo.name === 'login') return 'login.html';
          if (chunkInfo.name === 'register') return 'register.html';
          if (chunkInfo.name === 'relatorios') return 'relatorios.html';
          if (chunkInfo.name === 'automacoes') return 'automacoes.html';
          if (chunkInfo.name === 'gamificacao') return 'gamificacao.html';
          if (chunkInfo.name === 'configuracoes') return 'configuracoes.html';
          return 'assets/js/[name]-[hash].js';
        }
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
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheKeyWillBeUsed: async ({ request }) => {
                return `${request.url}`;
              }
            }
          }
        ]
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'ALSHAM 360° PRIMA',
        short_name: 'ALSHAM360',
        description: 'CRM Enterprise com IA, Gamificação e Automações',
        theme_color: '#6366f1',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
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
      }
    })
  ],
  
  css: {
    postcss: './postcss.config.js'
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@js': resolve(__dirname, 'src/js'),
      '@lib': resolve(__dirname, 'src/lib'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@public': resolve(__dirname, 'public')
    }
  }
});

