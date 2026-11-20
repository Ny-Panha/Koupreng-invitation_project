import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "phase14-1-*.spec.js",
  workers: 1,
  retries: 0,
  timeout: 60000,
  reporter: [
    ["list"],
    ["json", { outputFile: "../../output/playwright/phase14-1/test-results.json" }],
  ],
  outputDir: "../../output/playwright/phase14-1/artifacts",
  use: {
    baseURL: "http://127.0.0.1:4314",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
  webServer: {
    command: "node ./node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4314 --strictPort",
    url: "http://127.0.0.1:4314",
    reuseExistingServer: false,
    timeout: 30000,
  },
});
