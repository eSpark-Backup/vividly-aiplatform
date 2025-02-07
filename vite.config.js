import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default () => {
  return defineConfig({
    plugins: [react()],
    server: {
      watch: {
        usePolling: true,
      },
      host: true,
      strictPort: true,
      port: 8080,
    },
    preview: {
      host: true,
      port: 3000,
    },
  });
};