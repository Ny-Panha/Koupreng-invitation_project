import { defineConfig } from '@playwright/test';
import base from './playwright.phase06.config.js';
import process from 'node:process';

export default defineConfig({
  ...base,
  testMatch: ['phase10-codex-renderers.spec.js'],
  outputDir: `../../output/playwright/phase10-codex-2026-11-18/${process.env.PHASE10_STAGE || 'after'}-traces`,
  reporter: [['list'], ['json', { outputFile: `../../output/playwright/phase10-codex-2026-11-18/${process.env.PHASE10_STAGE || 'after'}-results.json` }]],
});
