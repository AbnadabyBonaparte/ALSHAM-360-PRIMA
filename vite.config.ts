import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { youwareVitePlugin } from "@youware/vite-plugin-react";

// ✅ Versão harmônica: respeita index.html na raiz, compila src normalmente
export default defineConfig({
  plugins: [youwareVitePlugin(), react()],
  root: ".", // usa a raiz como referência principal
  resolve: {
    alias: { "@": "/src" }
  },
  build: {
    outDir: "dist",
    emptyOutDir: true, // limpa antes de buildar (corrige o warning anterior)
    target: "es2022",
    sourcemap: true,
    minify: "esbuild",
    rollupOptions: {
      input: {
        main: "./index.html" // ✅ aponta pro HTML correto na raiz
      }
    }
  },
  esbuild: {
    supported: { "top-level-await": true }
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    cors: true
  },
  preview: {
    port: 4173,
    strictPort: true
  },
  optimizeDeps: {
    include: [
      "@supabase/supabase-js",
      "posthog-js",
      "react",
      "react-dom",
      "react-router-dom",
      "zustand",
      "framer-motion",
      "chart.js",
      "react-chartjs-2",
      "lucide-react"
    ]
  },
  define: {
    __APP_ENV__: JSON.stringify(process.env.NODE_ENV || "production")
  }
});
