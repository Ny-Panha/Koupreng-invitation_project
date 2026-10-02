import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "happy-dom",
    environmentOptions: {
      happyDOM: {
        settings: {
          disableCSSFileLoading: true,
          disableIframePageLoading: true,
          disableJavaScriptFileLoading: true,
        },
      },
    },
    setupFiles: "./src/test/setup.js",
    exclude: ["tests/e2e/**", "node_modules/**", "dist/**"],
  },

});
