import { defineConfig } from 'vite';
import { resolve } from 'path';
import legacy from '@vitejs/plugin-legacy';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // JUSTIFICATIVA: Adicionada a seção 'resolve.alias' para mapear os caminhos de importação.
  // Isso instrui o Vite a encontrar os arquivos corretos na pasta 'src' durante o build,
  // resolvendo o erro "failed to resolve import" sem precisar alterar os arquivos HTML.
  resolve: {
    alias: {
      // Mapeia arquivos que estão na raiz de 'src'
      '/style.css': resolve(__dirname, 'src/style.css'),
      '/main.js': resolve(__dirname, 'src/main.js'),
      // Mapeia o arquivo de navegação que está em 'src/components'
      '/navigation.js': resolve(__dirname, 'src/components/navigation.js'),
      // Mapeia os scripts que estão em 'src/js'
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
      registerType: 'autoUpdate'
    })
  ]
});
