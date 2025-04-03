import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    hmr: {
      clientPort: 443,
      path: "/_vite",
    },
    allowedHosts: [
      'localhost',
      '.replit.dev',
      '.repl.co'
    ]
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}); 