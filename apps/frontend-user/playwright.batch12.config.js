import { defineConfig, devices } from '@playwright/test';
import process from 'node:process';
export default defineConfig({
  testDir: './tests/e2e', testMatch: /batch12-.*\.spec\.js/,
  fullyParallel: true, workers: 2, timeout: 90000, retries: process.env.CI ? 1 : 0,
  outputDir: './test-results/batch12',
  reporter: [['list'], ['json', { outputFile: './test-results/batch12-results.json' }]],
  use: { baseURL: 'http://127.0.0.1:4173', reducedMotion: 'reduce', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'batch12-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'batch12-firefox', testIgnore: /batch12-route-content\.spec\.js/, use: { ...devices['Desktop Firefox'] } },
    { name: 'batch12-webkit', testIgnore: /batch12-route-content\.spec\.js/, use: { ...devices['Desktop Safari'] } },
  ],
  webServer: [
    { command: 'node ./node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4173 --strictPort', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI },
    { command: 'node ../frontend-admin/node_modules/vite/bin/vite.js preview ../frontend-admin --host 127.0.0.1 --port 4174 --strictPort', url: 'http://127.0.0.1:4174', reuseExistingServer: !process.env.CI },
  ],
});
