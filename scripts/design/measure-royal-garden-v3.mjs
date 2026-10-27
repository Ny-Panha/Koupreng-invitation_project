// Reproducible local lab, not production field/Core Web Vitals certification.
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/frontend-user/package.json', import.meta.url));
const { chromium } = require('@playwright/test');
const origin = process.argv[2] || 'http://127.0.0.1:4186';
const output = new URL('../../docs/design/royal-garden-v3/evidence/performance.json', import.meta.url);
const browser = await chromium.launch();
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const template = { id: 4, code: 'royal-garden-cinematic', name: 'Royal Garden Cinematic', status: 'ACTIVE', supportedEventTypes: ['WEDDING'], supportedLanguages: ['KH', 'EN', 'BOTH'] };
  // Catalog data only; no live customer API or third-party font network is measured.
  await page.route('**/api/v1/**', route => {
    const path = new URL(route.request().url()).pathname;
    return route.fulfill({ json: { data: path === '/api/v1/templates' ? [template] : path.includes('/templates/') ? template : [] } });
  });
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1600000 / 8, uploadThroughput: 750000 / 8 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.addInitScript(() => {
    window.royalLab = { lcp: 0, cls: 0, eventDurations: [], longTasks: [] };
    for (const type of ['largest-contentful-paint', 'layout-shift', 'longtask', 'event']) {
      try {
        new PerformanceObserver(list => list.getEntries().forEach(entry => {
          if (type === 'largest-contentful-paint') window.royalLab.lcp = entry.startTime;
          if (type === 'layout-shift' && !entry.hadRecentInput) window.royalLab.cls += entry.value;
          if (type === 'longtask') window.royalLab.longTasks.push(entry.duration);
          if (type === 'event') window.royalLab.eventDurations.push(entry.duration);
        })).observe({ type, buffered: true, ...(type === 'event' ? { durationThreshold: 16 } : {}) });
      } catch { /* Unsupported entries are absent, never invented as a result. */ }
    }
  });
  await page.goto(`${origin}/templates/royal-garden-cinematic?lang=en`, { waitUntil: 'domcontentloaded' });
  await page.locator('.rg-open').waitFor();
  await page.waitForFunction(() => [...document.querySelectorAll('.rg-entrance-stage img')].every(image => image.complete && image.naturalWidth));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2000);
  const entrance = await page.evaluate(() => ({ ...window.royalLab, resources: performance.getEntriesByType('resource').map(entry => ({ name: new URL(entry.name).pathname, transferred: entry.transferSize, encoded: entry.encodedBodySize })), navigation: performance.getEntriesByType('navigation').map(entry => ({ domContentLoaded: entry.domContentLoadedEventEnd, load: entry.loadEventEnd })) }));
  await page.locator('.rg-open').click(); await page.locator('.cinematic-inline-stage').waitFor();
  await page.waitForTimeout(1000);
  const interaction = await page.evaluate(() => ({ eventDurations: window.royalLab.eventDurations, longTasks: window.royalLab.longTasks }));
  const report = { recordedAt: new Date().toISOString(), environment: { os: process.platform, browser: browser.version(), viewport: '390x844', dpr: 1, cpuSlowdown: 4, downstreamBitsPerSecond: 1600000, upstreamBitsPerSecond: 750000, latencyMs: 150, server: 'local Vite production preview', api: 'synthetic catalog responses' }, entrance, interaction, limits: ['One cold local lab sample, not production field data.', 'No physical mid-range device, INP percentile or battery/frame-rate certification.', 'Event Timing entries are individual observed event durations, not field INP.'] };
  await mkdir(new URL('.', output), { recursive: true }); await writeFile(output, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ lcpMs: entrance.lcp, cls: entrance.cls, entranceEncodedBytes: entrance.resources.reduce((sum, entry) => sum + entry.encoded, 0), largestRecordedEventMs: Math.max(0, ...interaction.eventDurations), output: fileURLToPath(output) }));
} finally { await browser.close(); }
