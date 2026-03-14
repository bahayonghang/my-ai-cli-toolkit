import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const targetPort = process.env.MCS_WEB_PORT || "23242";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 15173,
    proxy: {
      "/api": `http://localhost:${targetPort}`,
    },
  },
  build: {
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          mui: ["@mui/material"],
          "mui-icons": ["@mui/icons-material"],
          codemirror: [
            "codemirror",
            "@codemirror/lang-markdown",
            "@codemirror/theme-one-dark",
          ],
          markdown: ["react-markdown"],
        },
      },
    },
  },
});
