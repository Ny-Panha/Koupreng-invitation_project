import { defineConfig, devices } from '@playwright/test';

// Separate build and port from the user's running development application.
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:4288', trace: 'retain-on-failure' },
  projects: [{ name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
    { name: 'desktop-firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'desktop-webkit', use: { ...devices['Desktop Safari'] } }],
  webServer: { command: 'node ./node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4288 --strictPort',
    url: 'http://127.0.0.1:4288', reuseExistingServer: false },
});
