import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: ['phase02-foundations.spec.js', 'batch12-route-content.spec.js', 'batch12-core-hardening.spec.js', 'batch12-security-journeys.spec.js', 'phase2-intent.spec.js', 'phase2-studio.spec.js', 'phase2-payment.spec.js', 'phase2-operations.spec.js', 'phase7-auth-accessibility.spec.js', 'phase8-functional.spec.js'],
  workers: 2,
  retries: 0,
  timeout: 60000,
  outputDir: '../../output/playwright/phase02-foundations/results',
  reporter: [['list'], ['json', { outputFile: '../../output/playwright/phase02-foundations/results.json' }]],
  use: { baseURL: 'http://127.0.0.1:4173', reducedMotion: 'reduce', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'desktop-chromium', use: devices['Desktop Chrome'] },
    { name: 'mobile-chromium', use: devices['Pixel 7'] },
    { name: 'desktop-webkit', use: devices['Desktop Safari'] },
    { name: 'mobile-webkit', use: devices['iPhone 13'] },
    { name: 'desktop-firefox', use: devices['Desktop Firefox'] },
    { name: 'mobile-firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 390, height: 844 }, hasTouch: true } },
  ],
  webServer: ['user', 'admin'].map(app => ({
    command: `node ../../scripts/qa/serve-phase02.mjs ${app}`,
    url: `http://127.0.0.1:${app === 'user' ? 4173 : 4174}`,
    timeout: 120000,
    reuseExistingServer: false,
  })),
});
