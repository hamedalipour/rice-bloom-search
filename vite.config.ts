import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // مسیر پایه؛ برای دامنه اختصاصی "/" و برای ساب‌پس (مثل github.io/repo)
  // مقدار VITE_BASE_PATH=/نام‌ریپو/ تنظیم شود
  base: process.env.VITE_BASE_PATH || "/",
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean,
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
    target: "esnext",
    rollupOptions: {
      external: [],
      output: {
        manualChunks: undefined,
      },
    },
  },
  esbuild: {
    target: "esnext",
    platform: "browser",
    // حذف کامل console و debugger از خروجی production برای پرفورمنس و تمیزی
    ...(mode === "production" ? { drop: ["console", "debugger"] } : {}),
  },
}));
