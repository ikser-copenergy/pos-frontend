import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/** Hosts permitidos para preview / dev (EC2 + dominio público). */
const allowedHosts = [
  "ec2-107-20-102-87.compute-1.amazonaws.com",
  "vendoyaa.com",
  "www.vendoyaa.com",
] as const;

/** Deriva el origin (http://host:port) a partir de VITE_API_URL (que termina en /api). */
function resolveBackendOrigin(env: Record<string, string>): string {
  const explicit = env.VITE_BACKEND_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const apiUrl = env.VITE_API_URL?.trim();
  if (apiUrl) {
    try {
      return new URL(apiUrl).origin;
    } catch {
      // Cae al fallback
    }
  }
  return "http://localhost:3000";
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendOrigin = resolveBackendOrigin(env);

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
    server: {
      allowedHosts: [...allowedHosts],
      port: 5173,
      proxy: {
        "/api": {
          target: backendOrigin,
          changeOrigin: true,
        },
        "/uploads": {
          target: backendOrigin,
          changeOrigin: true,
        },
      },
    },
    preview: {
      allowedHosts: [...allowedHosts],
    },
  };
});
