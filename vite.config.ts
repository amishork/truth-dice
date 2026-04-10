import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('framer-motion')) return 'framer';
          if (id.includes('@sentry')) return 'sentry';
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) return 'forms';
          if (id.includes('@radix-ui')) return 'radix';
        },
      },
    },
  },
}));
