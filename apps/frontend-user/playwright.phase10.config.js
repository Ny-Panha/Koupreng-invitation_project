import { defineConfig } from '@playwright/test';
import base from './playwright.phase06.config.js';

// Phase 10.1 — Full Bespoke Art, Opening Choreography, and Mobile Accessibility
export default defineConfig({
  ...base,
  testMatch: ['phase10-renderer-art.spec.js'],
});
