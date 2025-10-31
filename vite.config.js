// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "es2022", // Suporte total a top-level await
    rollupOptions: {
      input: {
        main: "./index.html",
        login: "./login.html",
        dashboard: "./dashboard.html",
        "init-supabase": "./src/lib/init-supabase.js",
        "attach-supabase": "./src/lib/attach-supabase.js",
      },
      output: {
        // Evita erro de inline workers (importante para PostHog Recorder)
        inlineDynamicImports: false,
        manualChunks: undefined,
      },
    },
    sourcemap: false,
    minify: "esbuild",
  },

  esbuild: {
    supported: {
      "top-level-await": true,
    },
  },

  worker: {
    format: "es", // garante que workers respeitam o CSP (sem inline)
  },

  server: {
    port: 5173,
    strictPort: true,
    cors: true,
  },

  preview: {
    port: 4173,
    strictPort: true,
  },

  optimizeDeps: {
    include: [
      "@supabase/supabase-js",
      "posthog-js",
    ],
  },

  define: {
    __APP_ENV__: JSON.stringify(process.env.NODE_ENV || "production"),
  },
});
