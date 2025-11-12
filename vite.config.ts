import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { youwareVitePlugin } from "@youware/vite-plugin-react";
import { resolve } from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  root: ".",
  plugins: [youwareVitePlugin(), react()],
  resolve: {
    alias: [
      {
        find: "./src/main.tsx",
        replacement: resolve(__dirname, "src/main.tsx"),
      },
    ],
  },
  server: {
    port: 5173,
    strictPort: false,
    open: true,
    host: true,
    cors: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },
  publicDir: "public",
  build: {
    sourcemap: true,
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, "src/index.html"),
    },
  },
  logLevel: 'warn',
  clearScreen: false
})
