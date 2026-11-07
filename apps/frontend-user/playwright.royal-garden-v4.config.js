import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e', testMatch: ['royal-garden-v4.spec.js', 'royal-garden-v33.spec.js', 'royal-garden-video-footer.spec.js', 'royal-garden-polish.spec.js'], workers: 2, retries: 0, timeout: 60000,
  outputDir: '../../.cache/royal-garden-v4/playwright',
  reporter: [['list'], ['json', { outputFile: '../../.cache/royal-garden-v4/browser-results.json' }]],
  use: { baseURL: 'http://127.0.0.1:4186', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: devices['Desktop Chrome'] }],
  webServer: { command: 'node ./node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4186 --strictPort', url: 'http://127.0.0.1:4186', reuseExistingServer: true },
});
