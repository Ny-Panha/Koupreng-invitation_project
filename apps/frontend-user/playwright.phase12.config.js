import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', testMatch: 'phase12-*.spec.js', workers: 1, retries: 0, timeout: 90000,
  outputDir: '../../output/playwright/phase12',
  reporter: [['list'], ['json', { outputFile: '../../.cache/phase12/browser-results.json' }]],
  use: { baseURL: 'http://127.0.0.1:4312', reducedMotion: 'reduce', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: devices['Desktop Chrome'] }, { name: 'firefox', use: devices['Desktop Firefox'] }, { name: 'webkit', use: devices['Desktop Safari'] }],
  webServer: { command: 'node ./node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4312 --strictPort', url: 'http://127.0.0.1:4312', reuseExistingServer: false },
});
