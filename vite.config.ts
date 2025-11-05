import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: "./src/react",
  publicDir: "../../public",
  resolve: {
    alias: { 
      "@": "/src",
      "@/lib": "/src/lib",
      "@/components": "/src/components"
    }
  },
  build: {
    outDir: "../../dist",
    emptyOutDir: true,
    target: "es2022",
    sourcemap: true,
    minify: "esbuild"
  },
  esbuild: {
    supported: { "top-level-await": true }
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: false,
    cors: true
  },
  preview: {
    port: 4173,
    strictPort: false
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
