import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir:'./tests/e2e', testMatch:'royal-garden-mobile-navigation.spec.js', workers:1, retries:0, timeout:90000,
  outputDir:'../../.cache/royal-garden-mobile/playwright', reporter:'list',
  use:{baseURL:'http://127.0.0.1:4186',trace:'retain-on-failure'},
  projects:[
    {name:'mobile-chromium',use:{...devices['Pixel 7']}},
    {name:'mobile-webkit',use:{...devices['iPhone 13']}},
  ],
  webServer:{command:'node ./node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4186 --strictPort',url:'http://127.0.0.1:4186',reuseExistingServer:true},
});
