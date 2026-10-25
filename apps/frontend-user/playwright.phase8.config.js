import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e', fullyParallel: false, workers: 1, retries: 0, timeout: 60000,
  outputDir: '../../output/playwright/phase8', reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:4288', reducedMotion: 'reduce', trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium', testMatch: /phase8-(functional|visual|reference)\.spec\.js/, use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', testMatch: 'phase8-functional.spec.js', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', testMatch: 'phase8-functional.spec.js', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: { command: 'node ./node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4288 --strictPort', url: 'http://127.0.0.1:4288', reuseExistingServer: false },
});
