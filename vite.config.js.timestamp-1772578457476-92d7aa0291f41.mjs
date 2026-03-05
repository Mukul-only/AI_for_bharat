// vite.config.js
import { defineConfig } from "file:///c:/Users/mukul/Downloads/Amazon%20hakathon/proj/node_modules/vite/dist/node/index.js";
import react from "file:///c:/Users/mukul/Downloads/Amazon%20hakathon/proj/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///c:/Users/mukul/Downloads/Amazon%20hakathon/proj/node_modules/@tailwindcss/vite/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate heavy vendor libs into their own chunks
          "react-vendor": ["react", "react-dom"],
          "reactflow-vendor": ["reactflow"],
          "icons-vendor": ["lucide-react"]
        }
      }
    },
    // Enable source maps for debugging
    sourcemap: false,
    // Target modern browsers for smaller bundles
    target: "es2020",
    // Minification
    minify: "esbuild"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJjOlxcXFxVc2Vyc1xcXFxtdWt1bFxcXFxEb3dubG9hZHNcXFxcQW1hem9uIGhha2F0aG9uXFxcXHByb2pcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcImM6XFxcXFVzZXJzXFxcXG11a3VsXFxcXERvd25sb2Fkc1xcXFxBbWF6b24gaGFrYXRob25cXFxccHJvalxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vYzovVXNlcnMvbXVrdWwvRG93bmxvYWRzL0FtYXpvbiUyMGhha2F0aG9uL3Byb2ovdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XHJcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tIFwiQHRhaWx3aW5kY3NzL3ZpdGVcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcGx1Z2luczogW3JlYWN0KCksIHRhaWx3aW5kY3NzKCldLFxyXG4gIHNlcnZlcjoge1xyXG4gICAgcG9ydDogNTE3MyxcclxuICAgIG9wZW46IHRydWUsXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgLy8gQ2h1bmsgc3BsaXR0aW5nIGZvciBiZXR0ZXIgY2FjaGluZ1xyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICBtYW51YWxDaHVua3M6IHtcclxuICAgICAgICAgIC8vIFNlcGFyYXRlIGhlYXZ5IHZlbmRvciBsaWJzIGludG8gdGhlaXIgb3duIGNodW5rc1xyXG4gICAgICAgICAgXCJyZWFjdC12ZW5kb3JcIjogW1wicmVhY3RcIiwgXCJyZWFjdC1kb21cIl0sXHJcbiAgICAgICAgICBcInJlYWN0Zmxvdy12ZW5kb3JcIjogW1wicmVhY3RmbG93XCJdLFxyXG4gICAgICAgICAgXCJpY29ucy12ZW5kb3JcIjogW1wibHVjaWRlLXJlYWN0XCJdLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgLy8gRW5hYmxlIHNvdXJjZSBtYXBzIGZvciBkZWJ1Z2dpbmdcclxuICAgIHNvdXJjZW1hcDogZmFsc2UsXHJcbiAgICAvLyBUYXJnZXQgbW9kZXJuIGJyb3dzZXJzIGZvciBzbWFsbGVyIGJ1bmRsZXNcclxuICAgIHRhcmdldDogXCJlczIwMjBcIixcclxuICAgIC8vIE1pbmlmaWNhdGlvblxyXG4gICAgbWluaWZ5OiBcImVzYnVpbGRcIixcclxuICB9LFxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF1VSxTQUFTLG9CQUFvQjtBQUNwVyxPQUFPLFdBQVc7QUFDbEIsT0FBTyxpQkFBaUI7QUFFeEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sR0FBRyxZQUFZLENBQUM7QUFBQSxFQUNoQyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsT0FBTztBQUFBO0FBQUEsSUFFTCxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUE7QUFBQSxVQUVaLGdCQUFnQixDQUFDLFNBQVMsV0FBVztBQUFBLFVBQ3JDLG9CQUFvQixDQUFDLFdBQVc7QUFBQSxVQUNoQyxnQkFBZ0IsQ0FBQyxjQUFjO0FBQUEsUUFDakM7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFFQSxXQUFXO0FBQUE7QUFBQSxJQUVYLFFBQVE7QUFBQTtBQUFBLElBRVIsUUFBUTtBQUFBLEVBQ1Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
