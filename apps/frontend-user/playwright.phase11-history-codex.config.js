import { defineConfig } from '@playwright/test';
import base from './playwright.phase11.config.js';
export default defineConfig({
  ...base,
  testDir: '../../output/playwright/phase11-codex-2026-11-19/historical',
  testMatch: ['phase11-baseline.spec.js','phase11-matrix.spec.js','phase11-bilingual.spec.js','phase11-features.spec.js'],
  testIgnore: [],
  reporter: [['list'],['json',{outputFile:'../../output/playwright/phase11-codex-2026-11-19/historical-results.json'}]],
  outputDir: '../../output/playwright/phase11-codex-2026-11-19/historical-artifacts',
});
