import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const targetPort = process.env.MCS_WEB_PORT || "13142";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": `http://localhost:${targetPort}`,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          mui: ["@mui/material"],
          markdown: ["react-markdown"],
        },
      },
    },
  },
});
