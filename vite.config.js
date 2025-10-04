import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'ALSHAM 360° PRIMA',
        short_name: 'ALSHAM 360',
        theme_color: '#1E40AF',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,json}'],
      },
    }),
  ],
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: './index.html',
        login: './login.html',
        dashboard: './dashboard.html',
        leads: './leads-real.html',
        pipeline: './pipeline.html',
        automacoes: './automacoes.html',
        gamificacao: './gamificacao.html',
        relatorios: './relatorios.html',
        configuracoes: './configuracoes.html',
      },
    },
  },
  // ✅ ADICIONAR ESTAS LINHAS:
  publicDir: 'public',
  resolve: {
    alias: {
      '@': '/src',
      '/js': '/public/js',
      '/css': '/public/css'
    }
  },
  // ✅ FIM DA ADIÇÃO
  server: {
    port: 5173,
    host: '0.0.0.0',
  },
});
