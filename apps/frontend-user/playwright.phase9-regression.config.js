import config from './playwright.phase9.config';

export default {
  ...config,
  use: { ...config.use, baseURL: 'http://127.0.0.1:4296' },
  webServer: { command: 'node ./node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4296 --strictPort', url: 'http://127.0.0.1:4296', reuseExistingServer: false },
  testMatch: ['phase7-guided-studio.spec.js', 'phase7-keyboard-reflow.spec.js', 'studio-tickets.spec.js'],
  testIgnore: [], outputDir: '../../output/playwright/phase9-regression',
};
