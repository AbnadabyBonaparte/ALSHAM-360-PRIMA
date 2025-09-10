/**
 * 🚀 ALSHAM 360° PRIMA - Vite Configuration Enterprise 10/10 NASA Standard
 * 
 * Configuração Vite enterprise-grade com:
 * - Multi-page application (MPA) otimizada
 * - Build otimizado para produção
 * - Code splitting inteligente
 * - PWA e Service Worker
 * - Otimizações de performance
 * - Suporte a TypeScript e JSX
 * - Hot Module Replacement (HMR)
 * - Análise de bundle
 * 
 * @version 2.0.0
 * @author ALSHAM Team
 * @license MIT
 */

import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig(({ command, mode }) => {
  // Carregar variáveis de ambiente
  const env = loadEnv(mode, process.cwd(), '');
  
  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';

  return {
    // ===== CONFIGURAÇÕES BÁSICAS =====
    root: '.',
    base: '/',
    publicDir: 'public',
    
    // ===== CONFIGURAÇÕES DE DESENVOLVIMENTO =====
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: false,
      open: false,
      cors: true,
      hmr: {
        overlay: true,
        clientPort: 5173
      },
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          ws: true
        },
        '/auth': {
          target: env.VITE_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false
        }
      }
    },

    // ===== CONFIGURAÇÕES DE PREVIEW =====
    preview: {
      host: '0.0.0.0',
      port: 4173,
      strictPort: false,
      open: false,
      cors: true
    },

    // ===== CONFIGURAÇÕES DE BUILD =====
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: !isProduction,
      minify: isProduction ? 'terser' : false,
      target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
      
      // Configurações de otimização
      chunkSizeWarningLimit: 1000,
      cssCodeSplit: true,
      
      // Configurações do Terser para produção
      terserOptions: isProduction ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug']
        },
        mangle: {
          safari10: true
        },
        format: {
          comments: false
        }
      } : {},

      // ===== CONFIGURAÇÃO MULTI-PAGE =====
      rollupOptions: {
        input: {
          // Página principal
          main: resolve(__dirname, 'index.html'),
          
          // Páginas de autenticação
          login: resolve(__dirname, 'src/pages/login.html'),
          register: resolve(__dirname, 'src/pages/register.html'),
          
          // Páginas principais do sistema
          dashboard: resolve(__dirname, 'src/pages/dashboard.html'),
          leads: resolve(__dirname, 'src/pages/leads.html'),
          'leads-real': resolve(__dirname, 'src/pages/leads-real.html'),
          relatorios: resolve(__dirname, 'src/pages/relatorios.html'),
          automacoes: resolve(__dirname, 'src/pages/automacoes.html'),
          gamificacao: resolve(__dirname, 'src/pages/gamificacao.html'),
          configuracoes: resolve(__dirname, 'src/pages/configuracoes.html'),
          
          // Páginas utilitárias
          'create-org': resolve(__dirname, 'create-org.html'),
          'test-supabase': resolve(__dirname, 'test-supabase.html')
        },
        
        output: {
          // Configuração de chunks
          manualChunks: {
            // Vendor chunks
            'vendor-core': ['@supabase/supabase-js'],
            'vendor-ui': ['lucide-react'],
            'vendor-utils': ['date-fns', 'lodash-es'],
            
            // Chunks por funcionalidade
            'auth': [
              './src/js/auth.js',
              './src/js/login.js',
              './src/js/register.js'
            ],
            'dashboard': [
              './src/js/dashboard.js',
              './src/js/leads.js',
              './src/js/leads-real.js'
            ],
            'reports': [
              './src/js/relatorios.js'
            ],
            'automation': [
              './src/js/automacoes.js'
            ],
            'gamification': [
              './src/js/gamificacao.js'
            ],
            'config': [
              './src/js/configuracoes.js'
            ]
          },
          
          // Nomeação de arquivos
          entryFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId;
            if (facadeModuleId && facadeModuleId.includes('src/js/')) {
              return 'assets/js/[name]-[hash].js';
            }
            return 'assets/[name]-[hash].js';
          },
          
          chunkFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            
            if (/\.(css)$/.test(assetInfo.name)) {
              return 'assets/css/[name]-[hash].[ext]';
            }
            if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
              return 'assets/images/[name]-[hash].[ext]';
            }
            if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
              return 'assets/fonts/[name]-[hash].[ext]';
            }
            
            return 'assets/[name]-[hash].[ext]';
          }
        },
        
        // Configurações de otimização
        external: [],
        
        // Plugins do Rollup
        plugins: []
      }
    },

    // ===== CONFIGURAÇÕES DE CSS =====
    css: {
      devSourcemap: isDevelopment,
      preprocessorOptions: {
        scss: {
          additionalData: `@import "./src/styles/variables.scss";`
        }
      },
      postcss: {
        plugins: [
          require('tailwindcss'),
          require('autoprefixer'),
          ...(isProduction ? [
            require('cssnano')({
              preset: ['default', {
                discardComments: { removeAll: true },
                normalizeWhitespace: true,
                minifySelectors: true
              }]
            })
          ] : [])
        ]
      }
    },

    // ===== CONFIGURAÇÕES DE RESOLVE =====
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
      },
      extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },

    // ===== CONFIGURAÇÕES DE OTIMIZAÇÃO =====
    optimizeDeps: {
      include: [
        '@supabase/supabase-js',
        'lucide-react',
        'date-fns',
        'lodash-es'
      ],
      exclude: [
        'fsevents'
      ]
    },

    // ===== PLUGINS =====
    plugins: [
      // Plugin Legacy para suporte a navegadores antigos
      legacy({
        targets: ['defaults', 'not IE 11']
      }),

      // Plugin PWA
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 ano
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 ano
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /\/api\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 5 // 5 minutos
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'ALSHAM 360° PRIMA',
          short_name: 'ALSHAM 360°',
          description: 'CRM Inteligente com IA, Gamificação e Automações',
          theme_color: '#3B82F6',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait-primary',
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
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      }),

      // Plugin de análise de bundle (apenas em produção)
      ...(isProduction && process.env.ANALYZE ? [
        visualizer({
          filename: 'dist/stats.html',
          open: true,
          gzipSize: true,
          brotliSize: true
        })
      ] : [])
    ],

    // ===== CONFIGURAÇÕES DE AMBIENTE =====
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __DEV__: isDevelopment,
      __PROD__: isProduction
    },

    // ===== CONFIGURAÇÕES DE LOG =====
    logLevel: isDevelopment ? 'info' : 'warn',
    clearScreen: false,

    // ===== CONFIGURAÇÕES DE WORKER =====
    worker: {
      format: 'es'
    },

    // ===== CONFIGURAÇÕES EXPERIMENTAIS =====
    experimental: {
      renderBuiltUrl(filename, { hostType }) {
        if (hostType === 'js') {
          return { js: `/${filename}` };
        } else {
          return { relative: true };
        }
      }
    }
  };
});

