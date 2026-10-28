import { defineConfig, devices } from '@playwright/test';
import base from './playwright.config';

export default defineConfig({ ...base, testMatch:['next-studio-ux.spec.js','project-wide-ui.spec.js'],
  grep:/contextual Premium|role revocation|confirmation cancellation|navbar theme/,
  outputDir:'test-results-studio', workers:2,
  projects:[
    { name:'desktop-firefox',use:{ ...devices['Desktop Firefox'] } },
    { name:'desktop-webkit',use:{ ...devices['Desktop Safari'] } },
  ],
});
