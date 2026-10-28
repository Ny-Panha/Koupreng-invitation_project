import { chromium } from '../../apps/frontend-user/node_modules/playwright/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import process from 'node:process';

const name = process.argv[2] || 'after';
const out = 'docs/design/royal-garden-v3-2/evidence';
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const samples = [];
try {
  for (let run = 1; run <= 3; run++) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    const page = await context.newPage(), cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 200000, uploadThroughput: 93750 });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.route('**/api/v1/**', route => route.fulfill({ json: { data: [] } }));
    await page.addInitScript(() => {
      window.royalVitals = { lcp: null, cls: 0, events: [], longTasks: [] };
      new PerformanceObserver(list => { for (const e of list.getEntries()) { window.royalVitals.lcp = e.startTime; window.royalVitals.lcpDetails = { url: e.url, element: e.element?.className, loadTime: e.loadTime, renderTime: e.renderTime, size: e.size }; } }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver(list => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.royalVitals.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
      new PerformanceObserver(list => { for (const e of list.getEntries()) window.royalVitals.events.push(e.duration); }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
      new PerformanceObserver(list => { for (const e of list.getEntries()) window.royalVitals.longTasks.push(e.duration); }).observe({ type: 'longtask', buffered: true });
    });
    await page.goto(`${process.env.ROYAL_PREVIEW_URL || 'http://127.0.0.1:4186'}/templates/royal-garden-cinematic?lang=en`, { waitUntil: 'networkidle' });
    await page.locator('.rg-open').waitFor();
    await page.locator('.rg-royal-entrance img').evaluateAll(images => Promise.all(images.map(img => img.decode().catch(() => {}))));
    await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(1000);
    const entrance = await page.evaluate(() => ({ ...window.royalVitals,
      resources: performance.getEntriesByType('resource').map(e => ({ name: new URL(e.name).pathname, startTime: e.startTime, responseStart: e.responseStart, responseEnd: e.responseEnd, duration: e.duration, initiator: e.initiatorType, encoded: e.encodedBodySize, transferred: e.transferSize })),
      images: [...document.querySelectorAll('.rg-royal-entrance img')].map(img => ({ source: img.currentSrc, width: img.width, height: img.height, naturalWidth: img.naturalWidth, priority: img.fetchPriority })),
    }));
    await page.locator('.rg-open').click(); await page.locator('.cinematic-inline-stage').waitFor();
    await page.getByRole('button', { name: 'Skip video', exact: true }).click(); await page.locator('[data-stage=CONTENT]').waitFor();
    const interaction = await page.evaluate(() => ({ events: window.royalVitals.events, longTasks: window.royalVitals.longTasks }));
    samples.push({ run, entrance, interaction }); await context.close();
  }
  const environment = { os: process.platform, browser: browser.version(), viewport: '390x844', dpr: 1, cpuSlowdown: 4, downstreamBitsPerSecond: 1600000, upstreamBitsPerSecond: 750000, latencyMs: 150, server: 'local Vite production preview', api: 'synthetic empty catalog API; local template fallback', cache: 'disabled; three fresh contexts' };
  await writeFile(`${out}/performance-${name}.json`, JSON.stringify({ recordedAt: new Date().toISOString(), environment, samples, limits: ['Local laboratory measurements, not field INP or physical-device FPS.', 'Before/after use the same explicit profile; provider/network environment may still vary.'] }, null, 2));
  console.log(JSON.stringify(samples.map(({ run, entrance, interaction }) => ({ run, lcp: entrance.lcp, cls: entrance.cls, encodedBytes: entrance.resources.reduce((sum, r) => sum + r.encoded, 0), videoBeforeClick: entrance.resources.some(r => /\.mp4$/.test(r.name)), audioBeforeClick: entrance.resources.some(r => /\.(mp3|m4a)$/.test(r.name)), maximumObservedEventMs: Math.max(0, ...interaction.events) }))));
} finally { await browser.close(); }
