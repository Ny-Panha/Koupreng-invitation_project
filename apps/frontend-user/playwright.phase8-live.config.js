import { defineConfig, devices } from '@playwright/test';

// Opt-in only: current source API on 8188 uses the owned loopback disposable DB.
export default defineConfig({
  testDir: './tests/e2e', testMatch: 'phase8-live.spec.js', workers: 1, retries: 0, timeout: 180000, reporter: 'list',
  outputDir: '../../output/playwright/phase8-live',
  use: { baseURL: 'http://127.0.0.1:4285', reducedMotion: 'reduce', trace: 'off', screenshot: 'only-on-failure' },
  projects: [{ name: 'owned-chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: { command: 'node ./node_modules/vite/bin/vite.js preview --outDir ../../.cache/phase8/live-dist --host 127.0.0.1 --port 4285 --strictPort', url: 'http://127.0.0.1:4285', reuseExistingServer: false },
});
