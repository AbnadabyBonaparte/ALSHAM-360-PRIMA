// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2022", // Permite top-level await e suporte moderno
    rollupOptions: {
      input: {
        main: "./index.html",
        login: "./login.html",
        dashboard: "./dashboard.html",
        app: "./app.html", // 🆕 Nova dashboard React
        "init-supabase": "./src/lib/init-supabase.js",
        "attach-supabase": "./src/lib/attach-supabase.js"
      },
      output: {
        // Mantém compatibilidade com CSP (sem inline workers)
        inlineDynamicImports: false,
        manualChunks: undefined
      }
    },
    sourcemap: false,
    minify: "esbuild"
  },

  esbuild: {
    supported: {
      "top-level-await": true
    }
  },

  worker: {
    format: "es" // Evita falhas CSP em workers
  },

  server: {
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
