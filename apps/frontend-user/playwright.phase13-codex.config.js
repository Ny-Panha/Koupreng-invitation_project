import { defineConfig, devices } from '@playwright/test';
import process from 'node:process';

const run = process.env.PHASE13_RUN || 'final';
export default defineConfig({
  testDir: './tests/e2e', testMatch: 'phase13-codex-*.spec.js',
  workers: 2, retries: 0, timeout: 45000,
  outputDir: `../../output/phase13-codex-revalidation/${run}/artifacts`,
  reporter: [['list'], ['json', { outputFile: `../../output/phase13-codex-revalidation/${run}/results.json` }]],
  use: { baseURL: 'http://127.0.0.1:4313', reducedMotion: 'reduce', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    { name: 'firefox', use: devices['Desktop Firefox'] },
    { name: 'webkit', use: devices['Desktop Safari'] },
  ],
  webServer: { command: 'node ./node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4313 --strictPort', url: 'http://127.0.0.1:4313', reuseExistingServer: false, timeout: 30000 },
});
