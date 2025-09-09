import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // A seção 'root' diz ao Vite onde encontrar o index.html e os outros arquivos.
  // Como o Railway agora vai operar dentro de /frontend, não precisamos mais disso aqui,
  // mas é uma boa prática manter a configuração de build explícita.
  
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
        // 'main' agora aponta para o index.html DENTRO da pasta frontend
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'src/pages/login.html'),
        register: resolve(__dirname, 'src/pages/register.html'),
        dashboard: resolve(__dirname, 'src/pages/dashboard.html'),
        leads: resolve(__dirname, 'src/pages/leads-real.html'),
        leads_original: resolve(__dirname, 'src/pages/leads.html'),
        automacoes: resolve(__dirname, 'src/pages/automacoes.html'),
        configuracoes: resolve(__dirname, 'src/pages/configuracoes.html'),
        gamificacao: resolve(__dirname, 'src/pages/gamificacao.html')
        // REMOVIDO: 'relatorios.html' e 'relacionamentos.html' que não existem em src/pages
      }
    }
  }
})
