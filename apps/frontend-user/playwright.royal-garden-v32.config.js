import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', testMatch: ['royal-garden-v32.spec.js', 'royal-garden-v3.spec.js'], workers: 2, retries: 0, timeout: 90000,
  outputDir: '../../.cache/royal-garden-v3-2/playwright',
  reporter: [['list'], ['json', { outputFile: '../../.cache/royal-garden-v3-2/browser-results.json' }]],
  use: { baseURL: 'http://127.0.0.1:4186', trace: 'retain-on-failure', actionTimeout: 15000 },
  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'] }, { name: 'mobile-chromium', use: devices['Pixel 7'] },
    { name: 'firefox', use: devices['Desktop Firefox'] }, { name: 'webkit', use: devices['Desktop Safari'] },
  ],
  webServer: { command: 'node ./node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4186 --strictPort', url: 'http://127.0.0.1:4186', reuseExistingServer: true },
});
