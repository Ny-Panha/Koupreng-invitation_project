import { defineConfig } from '@playwright/test';
const output = '../../output/playwright/phase11-codex-2026-11-19';
export default defineConfig({
  testDir: './tests/e2e', testMatch: 'phase11-codex.spec.js', workers: 2, retries: 0, timeout: 45000,
  reporter: [['list'], ['json', { outputFile: `${output}/browser-results.json` }]],
  outputDir: `${output}/browser-artifacts`,
  use: { baseURL: 'http://127.0.0.1:4313', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'chromium-desktop', use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } } },
    { name: 'chromium-320', use: { browserName: 'chromium', viewport: { width: 320, height: 568 } } },
    { name: 'chromium-360', use: { browserName: 'chromium', viewport: { width: 360, height: 640 } } },
    { name: 'chromium-393', use: { browserName: 'chromium', viewport: { width: 393, height: 851 } } },
    { name: 'chromium-tablet', use: { browserName: 'chromium', viewport: { width: 768, height: 1024 } } },
    { name: 'chromium-landscape', use: { browserName: 'chromium', viewport: { width: 844, height: 390 } } },
    { name: 'chromium-short', use: { browserName: 'chromium', viewport: { width: 820, height: 430 } } },
    { name: 'firefox', use: { browserName: 'firefox', viewport: { width: 393, height: 851 } } },
    { name: 'webkit', use: { browserName: 'webkit', viewport: { width: 393, height: 851 } } },
  ],
  webServer: { command: 'node ./node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4313 --strictPort', url: 'http://127.0.0.1:4313', reuseExistingServer: false, timeout: 30000 },
});
