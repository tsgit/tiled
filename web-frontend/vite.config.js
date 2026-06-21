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

// The public base path the UI is served from. Defaults to "/ui/". For a
// deployment (or local dev) behind a reverse-proxy path prefix, set VITE_BASE,
// e.g. VITE_BASE=/tiled-dev/ui/. This is the single source of truth: both the
// built asset base and the dev-server proxy rules are derived from it, so they
// can never drift apart.
const base = process.env.VITE_BASE || "/ui/";
// Strip the trailing "ui/" to recover the proxy prefix, e.g. "" or "/tiled-dev".
const prefix = base.replace(/\/?ui\/?$/, "");

// Backend routes are served without the prefix (just as a real reverse proxy
// would forward them). With a prefix, the browser sends prefixed paths that we
// match and strip; without one, match the unprefixed API paths directly.
const proxyTarget = "http://127.0.0.1:8000";
const proxy = prefix
  ? {
      [prefix]: {
        target: proxyTarget,
        ws: true,
        rewrite: (path) => path.replace(new RegExp(`^${prefix}`), ""),
      },
    }
  : {
      "/api": { target: proxyTarget, ws: true },
      "/tiled-ui-settings": { target: proxyTarget },
    };

export default defineConfig({
  base,
  server: {
    proxy,
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
