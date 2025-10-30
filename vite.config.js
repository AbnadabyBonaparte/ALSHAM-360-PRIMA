import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
        login: './login.html',
        dashboard: './dashboard.html',
        pipeline: './pipeline.html',
        supabase: './src/lib/attach-supabase.js'
      }
    }
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'ALSHAM 360° PRIMA',
        short_name: 'ALSHAM 360°',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1a73e8'
      }
    })
  ],
  server: {
    port: 3000
  }
});
