import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', testMatch: 'phase11-*.spec.js', testIgnore: ['phase11-baseline.spec.js'], workers: 1, retries: 0, timeout: 90000,
  reporter: 'list', outputDir: '../../output/playwright/phase11',
  use: { baseURL: 'http://127.0.0.1:4311', reducedMotion: 'reduce', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: devices['Desktop Chrome'] }, { name: 'firefox', use: devices['Desktop Firefox'] }, { name: 'webkit', use: devices['Desktop Safari'] }],
  webServer: { command: 'node ./node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4311 --strictPort', url: 'http://127.0.0.1:4311', reuseExistingServer: false },
});
