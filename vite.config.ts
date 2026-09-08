import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  // Project Pages URL is https://bibihalemech.github.io/wakebibi1b/
  base: command === "build" ? "/wakebibi1b/" : "/",
  server: {
    host: true,
    port: 5173,
  },
}));
