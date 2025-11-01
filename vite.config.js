// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": "/src" }
  },
  build: {
    target: "es2022",
    sourcemap: false,
    minify: "esbuild",
    rollupOptions: {
      external: ["@supabase/supabase-js", "posthog-js"]
    }
  },
  esbuild: {
    supported: { "top-level-await": true }
  },
  worker: { format: "es" },
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
