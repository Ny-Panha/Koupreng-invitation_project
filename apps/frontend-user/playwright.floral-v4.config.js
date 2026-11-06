import { defineConfig, devices } from '@playwright/test';
import process from 'node:process';

export default defineConfig({
  testDir: './tests/e2e', workers: 2, retries: 0, timeout: 90000,
  expect: { timeout: 15000 },
  outputDir: '../../output/playwright/floral-v4',
  reporter: [['list'], ['json', { outputFile: '../../.cache/floral-v4/browser-results.json' }]],
  use: { baseURL: process.env.FLORAL_V4_BASE_URL || 'http://127.0.0.1:4384', trace: 'retain-on-failure', screenshot: 'only-on-failure', actionTimeout: 15000 },
  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    { name: 'firefox', use: devices['Desktop Firefox'] },
    { name: 'webkit', use: devices['Desktop Safari'] },
    { name: 'mobile-chromium', use: devices['Pixel 7'] },
  ],
});
