import { chromium } from '../../apps/frontend-user/node_modules/playwright/index.mjs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import assert from 'node:assert/strict';

// Synthetic local-only browser experiment; no credentials or real invitation data.
const label = process.argv[2] || 'before';
const checkBudget = process.argv.includes('--check-budget');
if (!/^[a-z0-9-]+$/.test(label)) throw new Error('Use a simple artifact label');
const origin = 'http://127.0.0.1:4173';
const evidence = 'docs/performance/evidence';
const screenshots = 'output/playwright/performance';
await mkdir(evidence, { recursive: true });
await mkdir(screenshots, { recursive: true });
const catalog = [{ id: 100, code: 'silk-heritage', name: 'Performance wedding', status: 'ACTIVE', price: 0 }];
const invitation = {
  slug: 'performance-fixture', templateId: 100, templateCode: 'silk-heritage',
  title: 'Performance wedding', groomName: 'Dara', brideName: 'Sophea',
  languageMode: 'EN', eventDate: '2026-12-20', eventTime: '17:00:00',
  venueName: 'Fixture venue', enabledSections: JSON.stringify({ rsvp: false }),
  contentJson: JSON.stringify({ groomName: 'Dara', brideName: 'Sophea' }),
};
const browser = await chromium.launch({ headless: true });
const samples = [];
try {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    for (let run = 0; run < 3; run++) {
      const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(() => {
        localStorage.setItem('koupreng.lang', 'en');
        window.__perf = { lcp: null, cls: 0, longTasks: 0 };
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) window.__perf.lcp = entry.startTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__perf.cls += entry.value;
        }).observe({ type: 'layout-shift', buffered: true });
        new PerformanceObserver(list => { window.__perf.longTasks += list.getEntries().length; })
          .observe({ type: 'longtask', buffered: true });
      });
      await page.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (url.origin !== origin) {
          if (route.request().resourceType() === 'stylesheet') return route.fulfill({ body: '', contentType: 'text/css' });
          return route.abort();
        }
        if (!url.pathname.startsWith('/api/')) return route.continue();
        let data = {};
        if (url.pathname.endsWith('/templates')) data = catalog;
        else if (url.pathname.includes('/media')) data = { galleryImages: [] };
        else if (url.pathname.endsWith('/performance-fixture')) data = invitation;
        else if (url.pathname.endsWith('/wishes')) data = [];
        else if (url.pathname.includes('summary')) data = { totalGuests: 0, attending: 0, pending: 0 };
        await route.fulfill({ json: { success: true, data } });
      });
      await page.goto(`${origin}/i/performance-fixture`, { waitUntil: 'domcontentloaded' });
      await page.locator('.sh-cover').waitFor({ timeout: 10000 }).catch(async error => {
        console.error(JSON.stringify({ url: page.url(), body: (await page.locator('body').innerText()).slice(0, 1200), errors }));
        throw error;
      });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(500);
      const sample = await page.evaluate(() => ({
        ...window.__perf,
        navigationMs: performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd,
        resources: performance.getEntriesByType('resource').map(r => ({
          path: new URL(r.name).pathname, bytes: r.decodedBodySize, durationMs: r.duration,
        })),
      }));
      sample.viewport = viewport;
      sample.run = run;
      sample.errors = errors;
      if (errors.length) throw new Error(errors.join('\n'));
      assert.equal(await page.locator('.sh-cover').getByRole('heading', { level: 1 }).textContent(), 'Wedding invitation');
      if (run === 0) await page.screenshot({ path: `${screenshots}/${label}-${viewport.width}.png`, animations: 'disabled' });
      await page.getByRole('button', { name: 'Open invitation' }).click();
      await page.locator('.sh-hero').waitFor();
      samples.push(sample);
      await context.close();
    }
  }
  const assetDir = 'apps/frontend-user/dist/assets';
  const assets = [];
  for (const file of await readdir(assetDir)) {
    if (!/\.(js|css)$/.test(file)) continue;
    const bytes = await readFile(path.join(assetDir, file));
    assets.push({ file, bytes: bytes.length, gzipBytes: gzipSync(bytes).length });
  }
  const result = { browser: browser.version(), fixture: 'silk-heritage; mocked API; local assets; external requests blocked; reduced motion; cold browser contexts; no throttling', samples, assets };
  await writeFile(`${evidence}/frontend-${label}.json`, JSON.stringify(result, null, 2));
  for (const sample of samples) {
    const js = sample.resources.filter(r => r.path.endsWith('.js'));
    const css = sample.resources.filter(r => r.path.endsWith('.css'));
    if (checkBudget) {
      assert.ok(js.reduce((n, r) => n + r.bytes, 0) <= 1_000_000, 'Public fixture JavaScript exceeds 1,000,000 decoded bytes');
      assert.ok(css.reduce((n, r) => n + r.bytes, 0) <= 480_000, 'Public fixture CSS exceeds 480,000 decoded bytes');
    }
    console.log(JSON.stringify({ label, width: sample.viewport.width, run: sample.run, lcpMs: sample.lcp, cls: sample.cls, jsBytes: js.reduce((n,r) => n+r.bytes,0), cssBytes: css.reduce((n,r) => n+r.bytes,0), longTasks: sample.longTasks }));
  }
} finally {
  await browser.close();
}
