import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default () => {
  return defineConfig({
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      allowedHosts: true,
      watch: {
        usePolling: true,
      },
      host: true,
      strictPort: true,
      // port: 8080,
    },
    preview: {
      host: true,
      port: 3000,
    },
  });
};