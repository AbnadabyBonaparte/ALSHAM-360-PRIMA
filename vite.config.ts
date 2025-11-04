import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: ".",
  resolve: {
    alias: { "@": "/src" }
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "es2022",
    sourcemap: true,
    minify: "esbuild",
    rollupOptions: {
      input: {
        main: "./index.html",
        login: "./login.html",
        dashboard: "./dashboard.html"
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
