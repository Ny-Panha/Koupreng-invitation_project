import { defineConfig } from '@playwright/test';
import base from './playwright.phase06.config.js';

// Six installed engine/viewport projects; Phase 09.1 Marketplace, Discovery, Pricing, Checkout.
export default defineConfig({
  ...base,
  testMatch: ['phase09-marketplace-catalog.spec.js'],
});
