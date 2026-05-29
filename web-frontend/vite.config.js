import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteRequire } from "vite-require";
import { webcrypto as crypto } from "crypto";

// vite.config.js
if (!global.crypto) {
  global.crypto = require("crypto");
  global.crypto.getRandomValues = (arr) =>
    require("crypto").randomFillSync(arr);
}

export default defineConfig({
  base: "/ui/",
  server: {
    proxy: {
      // The base path is "/tiled-dev/ui/", so the frontend sends all API
      // requests to paths prefixed with "/tiled-dev/". The dev-server proxy
      // must match those prefixed paths and strip the prefix before forwarding
      // to the backend (which routes without the prefix, just as a real reverse
      // proxy would).
      "/tiled-dev": {
        target: "http://127.0.0.1:8000",
        ws: true,
        rewrite: (path) => path.replace(/^\/tiled-dev/, ""),
      },
    },
  },
  plugins: [
    viteRequire(),
    react({
      jsxRuntime: "automatic",
      babel: {
        plugins: [],
      },
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./test/setup.ts",
    include: ["src/components/**/*.test.tsx", "src/**/*.test.tsx"],
  },
});
