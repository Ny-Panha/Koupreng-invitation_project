import { defineConfig, devices } from '@playwright/test';
import base from './playwright.config.js';

export default defineConfig({
  ...base,
  testMatch: ['phase06-layout-navigation.spec.js'],
  projects: [
    { name: 'desktop-chromium', use: devices['Desktop Chrome'] },
    { name: 'mobile-chromium', use: devices['Pixel 7'] },
    { name: 'desktop-webkit', use: devices['Desktop Safari'] },
    { name: 'mobile-webkit', use: devices['iPhone 13'] },
    { name: 'desktop-firefox', use: devices['Desktop Firefox'] },
    { name: 'mobile-firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 390, height: 844 }, hasTouch: true } },
  ],
});
