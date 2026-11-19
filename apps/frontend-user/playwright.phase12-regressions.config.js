import { defineConfig } from '@playwright/test';
import base from './playwright.phase06.config.js';

export default defineConfig({
  ...base,
  workers: 2, retries: 0, timeout: 60000,
  testMatch: ['phase06-layout-navigation.spec.js','phase08-identity-account.spec.js','phase08-codex-regression.spec.js','phase09-marketplace-catalog.spec.js','phase10-codex-renderers.spec.js'],
  outputDir: '../../output/phase12-codex/regression-artifacts',
  reporter: [['list'], ['json', {outputFile:'../../output/phase12-codex/regression-results.json'}]],
});
