import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { youwareVitePlugin } from "@youware/vite-plugin-react";
import { resolve } from "node:path";

// https://vite.dev/config/
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
    host: "127.0.0.1",
    port: 5173,
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
});
