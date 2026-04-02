import { defineConfig } from "vite";
import solid            from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  resolve: { alias: { "@": "/src" } },
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:3000", changeOrigin: true },
    },
  },
});
