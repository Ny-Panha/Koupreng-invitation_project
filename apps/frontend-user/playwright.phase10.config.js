import { defineConfig, devices } from '@playwright/test';
import process from 'node:process';

const baseline = process.env.PHASE10_BASELINE === 'true';
const port = baseline ? 4317 : 4310;
export default defineConfig({
  testDir: './tests/e2e', testMatch: baseline ? 'phase10-baseline.spec.js' : 'phase10-*.spec.js',
  testIgnore: baseline ? [] : ['phase10-baseline.spec.js', 'phase10-live.spec.js'],
  workers: 1, retries: 0, timeout: 90000, reporter: 'list',
  outputDir: '../../output/playwright/phase10',
  use: { baseURL: `http://127.0.0.1:${port}`, reducedMotion: 'reduce', trace: 'retain-on-failure' },
  projects: baseline ? [{ name: 'baseline', use: devices['Desktop Chrome'] }] : [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    { name: 'firefox', use: devices['Desktop Firefox'] },
    { name: 'webkit', use: devices['Desktop Safari'] },
  ],
  webServer: {
    command: `node ./node_modules/vite/bin/vite.js preview --outDir ../../.cache/phase10/${baseline ? 'baseline-dist' : 'browser-dist'} --host 127.0.0.1 --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}`, reuseExistingServer: false,
  },
});
