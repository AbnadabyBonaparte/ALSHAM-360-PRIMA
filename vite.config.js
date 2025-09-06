import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  preview: {
    port: process.env.PORT || 4173,
    host: '0.0.0.0',
    allowedHosts: [
      'healthcheck.railway.app',
      '.railway.app',
      '.alshamglobal.com.br',
      'localhost'
    ]
  },
  server: {
    port: 5173,
    host: '0.0.0.0'
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'src/pages/login.html'),
        register: resolve(__dirname, 'src/pages/register.html'),
        dashboard: resolve(__dirname, 'src/pages/dashboard.html'),
        leads: resolve(__dirname, 'src/pages/leads-real.html'),
        relatorios: resolve(__dirname, 'src/pages/relatorios.html'),
        automacoes: resolve(__dirname, 'src/pages/automacoes.html'),
        configuracoes: resolve(__dirname, 'src/pages/configuracoes.html'),
        gamificacao: resolve(__dirname, 'src/pages/gamificacao.html')
      }
    }
  }
})

