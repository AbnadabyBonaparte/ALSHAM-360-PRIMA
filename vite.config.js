import { defineConfig } from 'vite';
import { resolve } from 'path';
import legacy from '@vitejs/plugin-legacy';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  resolve: {
    alias: {
      '/style.css': resolve(__dirname, 'src/style.css'),
      '/main.js': resolve(__dirname, 'src/main.js'),
      '/navigation.js': resolve(__dirname, 'src/components/navigation.js'),
      '/auth.js': resolve(__dirname, 'src/js/auth.js'),
      '/automacoes.js': resolve(__dirname, 'src/js/automacoes.js'),
      '/configuracoes.js': resolve(__dirname, 'src/js/configuracoes.js'),
      '/dashboard.js': resolve(__dirname, 'src/js/dashboard.js'),
      '/gamificacao.js': resolve(__dirname, 'src/js/gamificacao.js'),
      '/leads.js': resolve(__dirname, 'src/js/leads.js'),
      '/leads-real.js': resolve(__dirname, 'src/js/leads-real.js'),
      '/login.js': resolve(__dirname, 'src/js/login.js'),
      '/register.js': resolve(__dirname, 'src/js/register.js'),
      '/relatorios.js': resolve(__dirname, 'src/js/relatorios.js'),
    }
  },
  build: {
    rollupOptions: {
      input: {
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
      }
    }
  },
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'ALSHAM 360° PRIMA',
        short_name: 'ALSHAM360',
        description: 'CRM Inteligente com IA, Gamificação e Automações. Dashboard enterprise para gestão completa de leads e vendas.',
        start_url: '.',
        display: 'standalone',
        background_color: '#3B82F6',
        theme_color: '#3B82F6',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
