import { defineConfig, type Plugin } from "vite";

function stripPagesRedirect(): Plugin {
  return {
    name: "strip-pages-redirect",
    transformIndexHtml(html, ctx) {
      if (ctx.server) {
        return html;
      }
      return html.replace(
        /<!--pages-branch-redirect-->[\s\S]*?<!--\/pages-branch-redirect-->\s*/g,
        "",
      );
    },
  };
}

export default defineConfig(({ command }) => ({
  // Relative base keeps project Pages and local preview on the same URLs.
  base: command === "build" ? "./" : "/",
  plugins: [stripPagesRedirect()],
  server: {
    host: true,
    port: 5173,
  },
}));
