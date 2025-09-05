import { defineConfig } from 'vite'

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
    assetsDir: 'assets'
  }
})

