import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e', testMatch: 'phase12-codex-*.spec.js',
  workers: 2, retries: 0, timeout: 60000,
  reporter: [['list'], ['json', { outputFile: '../../output/phase12-codex/browser-results.json' }]],
  outputDir: '../../output/phase12-codex/browser-artifacts',
  use: { baseURL: 'http://127.0.0.1:4313', trace: 'retain-on-failure', screenshot: 'only-on-failure', timezoneId: 'Asia/Phnom_Penh' },
  projects: ['chromium', 'firefox', 'webkit'].map(name => ({ name, use: { ...devices['Desktop Chrome'], browserName: name, viewport: { width: 1440, height: 900 } } })),
  webServer: { command: 'node ./node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4313 --strictPort', url: 'http://127.0.0.1:4313', reuseExistingServer: false },
});
