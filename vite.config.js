import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        login: './login.html',
        dashboard: './dashboard.html',
        'init-supabase': './src/lib/init-supabase.js',
        'attach-supabase': './src/lib/attach-supabase.js'
      }
    }
  }
});
