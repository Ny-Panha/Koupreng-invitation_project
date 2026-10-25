import { defineConfig, devices } from '@playwright/test';

// Explicitly launched, isolated API/UI. No provider interception or main-workspace services.
export default defineConfig({ testDir:'./tests/e2e',testMatch:'phase7-live.spec.js',fullyParallel:false,retries:0,workers:1,timeout:90000,reporter:'list',
  use:{ baseURL:'http://127.0.0.1:4286',trace:'off',screenshot:'only-on-failure' },projects:[{ name:'owned-chromium',use:{ ...devices['Desktop Chrome'] } }] });
