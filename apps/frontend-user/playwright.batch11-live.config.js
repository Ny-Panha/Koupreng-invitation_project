import { defineConfig, devices } from "@playwright/test";
import process from "node:process";

// Uses the same built apps and Playwright runner, with dedicated loopback ports.
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "batch11-live-journey.spec.js",
  workers: 1,
  retries: 0,
  outputDir: "../../.cache/batch11/live-browser-artifacts",
  use: { baseURL: "http://127.0.0.1:4175", trace: "off", screenshot: "off", video: "off", reducedMotion: "reduce" },
  projects: [{ name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    { command: "node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4175 --strictPort", url: "http://127.0.0.1:4175", reuseExistingServer: false, env: { BACKEND_PORT: process.env.BACKEND_PORT } },
    { command: "node ../frontend-admin/node_modules/vite/bin/vite.js preview ../frontend-admin --host 127.0.0.1 --port 4176 --strictPort", url: "http://127.0.0.1:4176", reuseExistingServer: false, env: { BACKEND_PORT: process.env.BACKEND_PORT } },
  ],
});
