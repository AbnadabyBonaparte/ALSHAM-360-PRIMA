import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  base: '/',
  
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'src/pages/dashboard.html'),
        leads: resolve(__dirname, 'src/pages/leads.html'),
        login: resolve(__dirname, 'src/pages/login.html'),
        register: resolve(__dirname, 'src/pages/register.html'),
        relatorios: resolve(__dirname, 'src/pages/relatorios.html'),
        automacoes: resolve(__dirname, 'src/pages/automacoes.html'),
        gamificacao: resolve(__dirname, 'src/pages/gamificacao.html'),
        configuracoes: resolve(__dirname, 'src/pages/configuracoes.html')
      }
    }
  }
});
