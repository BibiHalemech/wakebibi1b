import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  // Project Pages URL is https://<user>.github.io/wakebibi1/
  base: command === "build" ? "/wakebibi1/" : "/",
  server: {
    host: true,
    port: 5173,
  },
}));
