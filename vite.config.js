import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022', // ATIVA top-level await
    rollupOptions: {
      input: {
        main: './index.html',
        login: './login.html',
        dashboard: './dashboard.html',
        'init-supabase': './src/lib/init-supabase.js',
        'attach-supabase': './src/lib/attach-supabase.js'
      }
    }
  },
  esbuild: {
    supported: {
      'top-level-await': true
    }
  }
});
