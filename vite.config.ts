import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const rootDir = path.resolve(__dirname, 'src')

export default defineConfig({
  plugins: [react()],
  root: rootDir,
  publicDir: path.resolve(__dirname, 'public'),
  resolve: {
    alias: {
      '@': rootDir,
      '@/lib': path.resolve(rootDir, 'lib'),
      '@/components': path.resolve(rootDir, 'components'),
      '@/pages': path.resolve(rootDir, 'pages'),
      '@/assets': path.resolve(rootDir, 'assets'),
    }
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    sourcemap: false,
    minify: 'esbuild',
    target: 'esnext',
    cssCodeSplit: true,
    reportCompressedSize: false,
    rollupOptions: {
      input: path.resolve(rootDir, 'index.html'),
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.')
          const ext = info?.[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
            return 'assets/images/[name]-[hash][extname]'
          }
          if (/woff2?|ttf|eot/i.test(ext || '')) {
            return 'assets/fonts/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        manualChunks: (id) => {
          if (id.includes('supabase-full') || id.includes('@supabase/supabase-js')) {
            return 'supabase';
          }
          if (id.includes('node_modules/react')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/chart.js') || id.includes('react-chartjs-2')) {
            return 'charts';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'motion';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1500,
    assetsInlineLimit: 4096,
  },
  server: {
    port: 5173,
    strictPort: false,
    open: true,
    host: true,
    cors: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },
  preview: {
    port: 4173,
    strictPort: false,
    open: true,
    host: true
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'framer-motion',
      'lucide-react',
      'zustand',
      'chart.js',
      'react-chartjs-2'
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  logLevel: 'warn',
  clearScreen: false
})

