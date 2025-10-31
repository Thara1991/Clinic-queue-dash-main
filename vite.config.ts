import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// Removed lovable-tagger for Node 12 compatibility

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
