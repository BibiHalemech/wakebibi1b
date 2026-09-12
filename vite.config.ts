import { defineConfig, type Plugin } from "vite";

function injectViteEntry(): Plugin {
  return {
    name: "inject-vite-entry",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        if (html.includes("/src/main.ts")) {
          return html;
        }
        return html.replace(
          "</body>",
          '    <script type="module" src="./src/main.ts"></script>\n  </body>',
        );
      },
    },
  };
}

export default defineConfig(({ command }) => ({
  // Relative base keeps project Pages and local preview on the same URLs.
  base: command === "build" ? "./" : "/",
  plugins: [injectViteEntry()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "assets/game.js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: (asset) =>
          asset.name?.endsWith(".css") ? "assets/game.css" : "assets/[name][extname]",
      },
    },
  },
  server: {
    host: true,
    port: 5173,
  },
}));
