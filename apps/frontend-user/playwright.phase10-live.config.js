import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', testMatch: 'phase10-live.spec.js', workers: 1, retries: 0, timeout: 180000,
  reporter: 'list', outputDir: '../../output/playwright/phase10-live',
  use: { baseURL: 'http://127.0.0.1:4291', reducedMotion: 'no-preference', trace: 'off', screenshot: 'only-on-failure' },
  projects: [{ name: 'owned-chromium', use: devices['Desktop Chrome'] }],
  webServer: { command: 'node ./node_modules/vite/bin/vite.js preview --outDir ../../.cache/phase10/live-dist --host 127.0.0.1 --port 4291 --strictPort', url: 'http://127.0.0.1:4291', reuseExistingServer: false, env: { BACKEND_PORT: '8189' } },
});
