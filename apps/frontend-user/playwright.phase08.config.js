import { defineConfig } from '@playwright/test';
import base from './playwright.phase06.config.js';

// Six installed engine/viewport projects; mobile Firefox is a viewport/touch proxy.
export default defineConfig({ ...base, testMatch: ['phase08-identity-account.spec.js', 'phase08-codex-regression.spec.js'] });
