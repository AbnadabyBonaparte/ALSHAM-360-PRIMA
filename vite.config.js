/**
 * ⚡ ALSHAM 360° PRIMA — Configuração Oficial de Build (v6.0)
 * Ambiente: Produção — Node 22.x / Vite 5.4.20
 * Autor: ALSHAM Development Team | 2025
 * 
 * Inclui:
 * - Compatibilidade com navegadores modernos e fallback legacy
 * - PWA autoUpdate + Workbox precache otimizado
 * - Compressão Brotli + Gzip automática
 * - Alias e estrutura multi-página (MPA)
 */

import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import legacy from '@vitejs/plugin-legacy';
import compression from 'vite-plugin-compression';

// ============================================================================
// ⚙️ CONFIGURAÇÃO PRINCIPAL
// ============================================================================
export default defineConfig({
  plugins: [
    // 🔹 Suporte a navegadores modernos e fallback legacy
    legacy({
      targets: ['defaults', 'not IE 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    }),

    // 🔹 Progressive Web App (PWA) com atualização automática
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'pwa-192x192.png',
        'pwa-512x512.png'
      ],
      manifest: {
        name: 'ALSHAM 360° PRIMA',
        short_name: 'ALSHAM 360',
        description: 'CRM Enterprise com IA, Gamificação e Automações Inteligentes',
        theme_color: '#1E40AF',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,json}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // 5MB
      }
    }),

    // 🔹 Compressão Brotli e Gzip automática
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240
    }),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240
    })
  ],

  // ========================================================================
  // ⚡ BUILD CONFIG
  // ========================================================================
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: false,
    cssMinify: true,
    reportCompressedSize: true,
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
        configuracoes: './configuracoes.html'
      },
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },

  // ========================================================================
  // 📂 ESTRUTURA E RESOLUÇÃO DE CAMINHOS
  // ========================================================================
