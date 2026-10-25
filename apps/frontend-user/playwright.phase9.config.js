import { defineConfig, devices } from '@playwright/test';
import process from 'node:process';

const baseline = process.env.PHASE9_BASELINE === 'true';
const port = baseline ? 4297 : 4290;
export default defineConfig({
  testDir: './tests/e2e', testMatch: baseline ? 'phase9-baseline.spec.js' : 'phase9-*.spec.js',
  testIgnore: baseline ? [] : ['phase9-baseline.spec.js', 'phase9-live.spec.js', 'phase9-global-evidence.spec.js'],
  workers: 1, retries: 0, timeout: 60000, reporter: 'list',
  outputDir: '../../output/playwright/phase9',
  use: { baseURL: `http://127.0.0.1:${port}`, reducedMotion: 'reduce', trace: 'retain-on-failure' },
  projects: baseline ? [{ name: 'baseline', use: { ...devices['Desktop Chrome'] } }] : [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: `node ./node_modules/vite/bin/vite.js preview ${baseline ? '--outDir ../../.cache/phase9/baseline-dist' : ''} --host 127.0.0.1 --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}`, reuseExistingServer: false,
  },
});
