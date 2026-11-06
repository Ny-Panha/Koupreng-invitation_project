import { defineConfig } from '@playwright/test';
import floralV4 from './playwright.floral-v4.config';

export default defineConfig({
  ...floralV4,
  outputDir: '../../output/playwright/floral-v5',
  reporter: [['list'], ['json', { outputFile: '../../.cache/floral-v5-browser-results.json' }]],
});
