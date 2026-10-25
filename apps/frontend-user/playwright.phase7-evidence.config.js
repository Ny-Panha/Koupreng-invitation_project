import { defineConfig,devices } from '@playwright/test';
export default defineConfig({ testDir:'./tests/e2e',testMatch:'phase7-evidence.spec.js',fullyParallel:false,retries:0,workers:1,timeout:60000,reporter:'list',use:{ trace:'retain-on-failure' },projects:[{ name:'evidence-chromium',use:{ ...devices['Desktop Chrome'] } }] });
