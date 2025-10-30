import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
        login: './login.html',
        dashboard: './dashboard.html'
      }
    }
  },
  server: { port: 3000 }
});
