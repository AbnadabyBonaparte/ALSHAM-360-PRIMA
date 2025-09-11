import { defineConfig } from 'vite';
import { resolve } from 'path';
import legacy from '@vitejs/plugin-legacy';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // Todas as páginas estão agora na raiz
        main: resolve(__dirname, 'index.html'),
        'create-org': resolve(__dirname, 'create-org.html'),
        'test-supabase': resolve(__dirname, 'test-supabase.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        leads: resolve(__dirname, 'leads.html'),
        'leads-real': resolve(__dirname, 'leads-real.html'),
        login: resolve(__dirname, 'login.html'),
        register: resolve(__dirname, 'register.html'),
        automacoes: resolve(__dirname, 'automacoes.html'),
        gamificacao: resolve(__dirname, 'gamificacao.html'),
        relatorios: resolve(__dirname, 'relatorios.html'),
        configuracoes: resolve(__dirname, 'configuracoes.html')
      },
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    },
    target: 'es2015',
    sourcemap: false,
    minify: 'terser'
  },

  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
      renderLegacyChunks: true
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'ALSHAM 360 PRIMA',
        short_name: 'ALSHAM360',
        description: 'CRM Enterprise ALSHAM 360 PRIMA',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone'
      }
    })
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
