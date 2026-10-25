import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e', testMatch: 'phase9-global-evidence.spec.js', workers: 1, timeout: 180000,
  reporter: 'list', outputDir: '../../output/playwright/phase9-global',
  use: { baseURL: 'http://127.0.0.1:4294', reducedMotion: 'reduce', trace: 'off' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    { command: 'node ./node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4294 --strictPort', url: 'http://127.0.0.1:4294', reuseExistingServer: false },
    { command: 'node ../frontend-admin/node_modules/vite/bin/vite.js preview ../frontend-admin --outDir ../../.cache/phase9/admin-after-dist --host 127.0.0.1 --port 4292 --strictPort', url: 'http://127.0.0.1:4292', reuseExistingServer: false },
    { command: 'node ../frontend-admin/node_modules/vite/bin/vite.js preview ../frontend-admin --outDir ../../.cache/phase9/admin-before-dist --host 127.0.0.1 --port 4293 --strictPort', url: 'http://127.0.0.1:4293', reuseExistingServer: false },
  ],
});
