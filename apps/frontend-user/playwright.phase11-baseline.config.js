import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', testMatch: 'phase11-baseline.spec.js', workers: 1, retries: 0, timeout: 60000,
  outputDir: '../../output/playwright/phase11-baseline', reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:4312', reducedMotion: 'reduce', ...devices['Desktop Chrome'] },
  webServer: { cwd: 'D:/Koupreng-Phase11-baseline/apps/frontend-user', command: 'node ./node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4312 --strictPort', url: 'http://127.0.0.1:4312', reuseExistingServer: false },
});
