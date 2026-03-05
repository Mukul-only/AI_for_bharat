import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate heavy vendor libs into their own chunks
          "react-vendor": ["react", "react-dom"],
          "reactflow-vendor": ["reactflow"],
          "icons-vendor": ["lucide-react"],
        },
      },
    },
    // Enable source maps for debugging
    sourcemap: false,
    // Target modern browsers for smaller bundles
    target: "es2020",
    // Minification
    minify: "esbuild",
  },
});
