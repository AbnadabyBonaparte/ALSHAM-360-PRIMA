import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production';

  return {
    // Base path for deployment (adjust if deploying to a subpath)
    base: '/',

    // Root directory for source files
    root: '.', // Assuming HTMLs are at root or in a src/ folder; adjust if needed

    // Server configuration for development
    server: {
      port: 5173,
      open: true, // Auto-open browser
      host: true, // Expose to network
    },

    // Build options: Multi-page app support, optimization
    build: {
      outDir: 'dist', // Output directory
      emptyOutDir: true, // Clean dist before build
      minify: isProduction ? 'esbuild' : false, // Minify in prod for smaller bundles
      sourcemap: !isProduction, // Sourcemaps in dev for debugging
      target: 'esnext', // Target modern browsers for smaller code
      chunkSizeWarningLimit: 1000, // Increase limit to avoid warnings on large chunks
      rollupOptions: {
        // Multi-page entries: Specify all HTML files for the CRM pages
        input: {
          main: 'index.html', // Main entry (assume exists; e.g., dashboard)
          leads: 'leads.html',
          gamificacao: 'gamificacao.html',
          automacoes: 'automacoes.html',
          relatorios: 'relatorios.html',
          configuracoes: 'configuracoes.html',
          login: 'login.html',
          register: 'register.html',
          // Add more if needed, e.g., dashboard.html
        },
        output: {
          // Cache busting for assets in prod
          entryFileNames: isProduction ? 'assets/[name]-[hash].js' : 'assets/[name].js',
          chunkFileNames: isProduction ? 'assets/[name]-[hash].js' : 'assets/[name].js',
          assetFileNames: isProduction ? 'assets/[name]-[hash].[ext]' : 'assets/[name].[ext]',
        },
      },
    },

    // Dependency optimization: Pre-bundle for faster dev server starts
    optimizeDeps: {
      include: [
        '@supabase/supabase-js', // Pre-bundle Supabase client for real-time/auth
        'lodash', // Common util if used (add others like chart.js if in project)
      ],
      exclude: [
        // Exclude if causing issues, e.g., dynamic imports
      ],
    },

    // Plugins: PWA for offline support, installability
    plugins: [
      VitePWA({
        // Strategy: Generate service worker automatically
        strategies: 'generateSW',
        
        // Register type: Auto-update for seamless updates
        registerType: 'autoUpdate',
        
        // Dev options: Enable PWA in development to test warnings early
        devOptions: {
          enabled: true,
        },
        
        // Workbox options: Caching strategy to fix warnings about uncached assets
        workbox: {
          clientsClaim: true, // Take control immediately
          skipWaiting: true, // Activate new SW without waiting
          globPatterns: ['**/*.{js,css,html,png,svg,jpg,jpeg,gif,webp,woff,woff2,ttf,eot,ico}'], // Include all common assets to avoid warnings
          globDirectory: 'dist/', // Directory to scan for assets
          runtimeCaching: [
            {
              // Cache Supabase API responses for performance/offline (enterprise-grade)
              urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i, // Match Supabase URLs (adjust for your project URL)
              handler: 'NetworkFirst', // Try network, fallback to cache
              options: {
                cacheName: 'supabase-api-cache',
                expiration: {
                  maxEntries: 100, // Limit cache size
                  maxAgeSeconds: 60 * 60 * 24, // 24 hours expiration
                },
                networkTimeoutSeconds: 10, // Fallback to cache if network slow
              },
            },
            {
              // Cache static assets aggressively
              urlPattern: ({ request }) => request.destination === 'style' || request.destination === 'script' || request.destination === 'image',
              handler: 'StaleWhileRevalidate', // Serve from cache, update in background
              options: {
                cacheName: 'static-assets',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
              },
            },
          ],
        },
        
        // Manifest: Web App Manifest to fix installability warnings
        manifest: {
          name: 'ALSHAM 360° PRIMA',
          short_name: 'PRIMA CRM',
          description: 'Enterprise CRM system with leads, gamification, automations, and real-time data via Supabase.',
          theme_color: '#ffffff', // Adjust to your UI theme
          background_color: '#ffffff',
          display: 'standalone', // App-like experience
          scope: '/', // Restrict scope for security
          start_url: '/', // Starting point
          orientation: 'portrait', // For mobile
          icons: [
            // Add your icons here to avoid warnings (generate via tools like favicon.io)
            { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
            { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          ],
        },
      }),
    ],

    // Additional: Resolve aliases for cleaner imports (e.g., @/js for src/js)
    resolve: {
      alias: {
        '@': '/src', // Adjust if src/ is used
      },
    },
  };
});
