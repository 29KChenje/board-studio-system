import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("@react-three") || id.includes("three")) {
            return "three-vendor";
          }

          if (id.includes("react-router-dom") || id.includes("react-router")) {
            return "router-vendor";
          }

          if (id.includes("react")) {
            return "react-vendor";
          }
        }
      }
    }
  },
  server: {
    host: true,
    port: 5173
  },
  preview: {
    host: true,
    port: 4173
  }
});
