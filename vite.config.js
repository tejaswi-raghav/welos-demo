import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  // GitHub Pages project sites are served from /<repo>/ — set BASE_PATH in CI
  base: process.env.BASE_PATH || "/",
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        landing: resolve(__dirname, "index.html"),
        control: resolve(__dirname, "control.html"),
        model: resolve(__dirname, "model.html"),
        configure: resolve(__dirname, "configure.html"),
        explore: resolve(__dirname, "explore.html"),
      },
    },
  },
});
