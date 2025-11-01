// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { youwareVitePlugin } from "@youware/vite-plugin-react";

export default defineConfig({
  root: "src", // ✅ novo: define a raiz real do React app
  plugins: [youwareVitePlugin(), react()],
  resolve: {
    alias: { "@": "/src" }
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
  build: {
    outDir: "../dist", // ✅ gera dist/index.html na raiz
    sourcemap: true,
    target: "es2022",
  },
});
