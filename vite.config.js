// vite.config.js - CONFIGURAÇÃO CORRIGIDA
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    // Caminho raiz da aplicação
    base: '/',
    
    // Servidor de desenvolvimento com CSP corrigido
    server: {
      port: 5173,
      open: true,
      host: true,
      // ADICIONADO: Headers de segurança para resolver CSP
      headers: {
        // CSP que permite os recursos necessários
        'Content-Security-Policy': [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://unpkg.com https://cdn.tailwindcss.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: https: blob:",
          "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://fonts.googleapis.com https://cdn.jsdelivr.net https://cdn.tailwindcss.com",
          "frame-src 'self'",
          "worker-src 'self' blob:",
          "manifest-src 'self'"
        ].join('; '),
        
        // Headers adicionais de segurança
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      }
    },

    // Configuração de build (multi-page app)
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      minify: isProduction ? 'esbuild' : false,
      sourcemap: !isProduction,
      target: 'esnext',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        input: {
          main: 'index.html',
          leads: 'leads.html',
          gamificacao: 'gamificacao.html',
          automacoes: 'automacoes.html',
          relatorios: 'relatorios.html',
          configuracoes: 'configuracoes.html',
          login: 'login.html',
          register: 'register.html',
        },
        output: {
          entryFileNames: isProduction ? 'assets/[name]-[hash].js' : 'assets/[name].js',
          chunkFileNames: isProduction ? 'assets/[name]-[hash].js' : 'assets/[name].js',
          assetFileNames: isProduction ? 'assets/[name]-[hash].[ext]' : 'assets/[name].[ext]',
          
          // ADICIONADO: Configuração para resolver problemas de módulos
          manualChunks: {
            vendor: ['@supabase/supabase-js'],
            charts: ['chart.js'],
            utils: ['papaparse', 'xlsx', 'jspdf']
          }
        },
      },
    },

    // CORRIGIDO: Dependências otimizadas
    optimizeDeps: {
      include: [
        '@supabase/supabase-js',
        'chart.js',
        'chart.js/auto',
        'papaparse',
        'canvas-confetti'
      ],
      // Forçar re-bundling de dependências problemáticas
      force: !isProduction
    },

    // ADICIONADO: Configuração para resolver erros de módulos
    esbuild: {
      target: 'esnext',
      supported: {
        'top-level-await': true
      }
    },

    // Plugins
    plugins: [
      VitePWA({
        strategies: 'generateSW',
        registerType: 'autoUpdate',
        devOptions: { enabled: true },
        workbox: {
          clientsClaim: true,
          skipWaiting: true,
          globPatterns: [
            '**/*.{js,css,html,png,svg,webp,woff2,ico}'
          ],
          globDirectory: 'dist/',
          
          // CORRIGIDO: Runtime caching para Supabase
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/rgvnbtuqtxvfxhrdnkjg\.supabase\.co\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'supabase-api-cache',
                expiration: { 
                  maxEntries: 100, 
                  maxAgeSeconds: 60 * 60 * 2 // 2 horas
                },
                networkTimeoutSeconds: 10,
                cacheableResponse: {
                  statuses: [0, 200]
                }
              },
            },
            {
              urlPattern: /^https:\/\/cdn\.(jsdelivr\.net|cdnjs\.cloudflare\.com)\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'cdn-cache',
                expiration: { 
                  maxEntries: 50, 
                  maxAgeSeconds: 60 * 60 * 24 * 7 // 1 semana
                }
              },
            },
            {
              urlPattern: ({ request }) =>
                ['style', 'script', 'image', 'font'].includes(request.destination),
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'static-assets',
                expiration: { 
                  maxEntries: 200, 
                  maxAgeSeconds: 60 * 60 * 24 * 30 
                },
              },
            },
          ],
        },
        manifest: {
          name: 'ALSHAM 360° PRIMA',
          short_name: 'PRIMA CRM',
          description: 'Enterprise CRM system with leads, gamification, automations, and real-time data via Supabase.',
          theme_color: '#3B82F6',
          background_color: '#ffffff',
          display: 'standalone',
          scope: '/',
          start_url: '/',
          orientation: 'portrait',
          icons: [
            { 
              src: '/icons/icon-192x192.png', 
              sizes: '192x192', 
              type: 'image/png' 
            },
            { 
              src: '/icons/icon-512x512.png', 
              sizes: '512x512', 
              type: 'image/png' 
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
      }),
    ],

    // CORRIGIDO: Aliases para imports
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
        '@lib': new URL('./src/lib', import.meta.url).pathname,
        '@js': new URL('./js', import.meta.url).pathname,
      },
    },

    // ADICIONADO: Configuração de environment variables
    define: {
      __SUPABASE_URL__: JSON.stringify('https://rgvnbtuqtxvfxhrdnkjg.supabase.co'),
      __VERSION__: JSON.stringify(process.env.npm_package_version || '2.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    },

    // ADICIONADO: Configuração de CSS
    css: {
      postcss: {
        plugins: [
          // Plugins do PostCSS se necessário
        ]
      }
    },

    // ADICIONADO: Preview settings para produção
    preview: {
      port: 4173,
      host: true,
      headers: {
        'Content-Security-Policy': [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://unpkg.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: https: blob:",
          "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
          "frame-src 'self'",
          "worker-src 'self' blob:"
        ].join('; ')
      }
    }
  };
});
