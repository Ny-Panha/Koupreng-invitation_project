import { defineConfig } from '@playwright/test';
import base from './playwright.phase06.config.js';

export default defineConfig({ ...base, testMatch: ['phase07-marketing-audit.spec.js', 'phase07-state-edges.spec.js', 'phase07-featured-collection.spec.js', 'phase07-validation-contrast.spec.js'] });
