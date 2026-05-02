import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/** Host público EC2 (preview / dev tras proxy de dominio amazonaws). */
const allowedHosts = [
  "ec2-107-20-102-87.compute-1.amazonaws.com",
] as const;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    allowedHosts: [...allowedHosts],
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  preview: {
    allowedHosts: [...allowedHosts],
  },
});
