import { chromium } from '../../apps/frontend-user/node_modules/playwright/index.mjs';
import { mkdir, writeFile, readdir, stat } from 'node:fs/promises';
import process from 'node:process';

const phase = process.argv[2] || 'baseline';
const dir = `docs/qa/silk-heritage/${phase}`;
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const routes = phase === 'baseline'
  ? ['/', '/templates', '/templates/khmer-celestial', '/templates/the-digital-yes-wedding', '/templates/emerald-canva-luxe-wedding', '/templates/bliss-editorial-wedding', '/templates/withjoy-modern-portal', '/templates/khmer-golden-canva-inspired-wedding']
  : ['/', '/templates', '/templates/silk-heritage'];
const findings = [];
for (const path of routes) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.route(/\/api\//, r => r.fulfill({ status: 404, contentType: 'application/json', body: '{}' }));
  await page.goto(`http://127.0.0.1:4173${path}`);
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${dir}/${path.replaceAll('/', '-') || 'home'}-390.png`, fullPage: false });
  if (phase === 'final' && path.endsWith('silk-heritage')) {
    await page.getByRole('button', { name: /Skip opening/ }).click();
    await page.locator('.sh-hero').screenshot({ path: `${dir}/hero-390.png` });
    await page.locator('.sh-program').screenshot({ path: `${dir}/program-390.png` });
    await page.locator('.sh-gallery').screenshot({ path: `${dir}/album-390.png` });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator('.sh-hero').screenshot({ path: `${dir}/hero-1440.png` });
    await page.locator('.sh-closing button').click();
    await page.locator('.sh-cover').screenshot({ path: `${dir}/cover-1440.png` });
  }
  findings.push({ path, ...(await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: innerWidth, headings: [...document.querySelectorAll('h1,h2')].map(n => n.textContent).slice(0, 5), buttons: [...document.querySelectorAll('button')].map(n => n.textContent).slice(0, 6) }))) });
  await page.close();
}
const metrics = [];
for (let run = 0; run < 3; run++) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 200000, uploadThroughput: 93750 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.route(/\/api\//, r => r.fulfill({ status: 404, contentType: 'application/json', body: '{}' }));
  await page.addInitScript(() => {
    window.vitals = { lcp: null, cls: 0, longestTask: 0 };
    new PerformanceObserver(l => { for (const e of l.getEntries()) window.vitals.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.vitals.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver(l => { for (const e of l.getEntries()) window.vitals.longestTask = Math.max(window.vitals.longestTask, e.duration); }).observe({ type: 'longtask', buffered: true });
  });
  const path = phase === 'baseline' ? '/templates/khmer-celestial' : '/templates/silk-heritage';
  await page.goto(`http://127.0.0.1:4173${path}`, { waitUntil: 'networkidle' });
  await page.locator(phase === 'baseline' ? '.kc-root' : '.sh-cover').waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1000);
  metrics.push({ run: run + 1, path, ...(await page.evaluate(() => ({ ...window.vitals, resourceBytes: performance.getEntriesByType('resource').reduce((s, e) => s + e.transferSize, 0) }))) });
  await page.close();
}
const assets = [];
for (const name of await readdir('apps/frontend-user/dist/assets')) {
  if (name.endsWith('.js') || name.endsWith('.css')) assets.push({ name, bytes: (await stat(`apps/frontend-user/dist/assets/${name}`)).size });
}
await writeFile(`${dir}/measurements.json`, JSON.stringify({ profile: 'Chromium headless; 390x844; 4x CPU; 1.6Mbps down; 150ms latency; cache disabled; API 404 mocked; 3 cold contexts; fonts live; INP not measured', metrics, findings, assets }, null, 2));
console.log(JSON.stringify({ phase, metrics, findings }));
await browser.close();
