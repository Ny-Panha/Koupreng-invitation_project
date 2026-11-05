import { chromium } from '../../apps/frontend-user/node_modules/playwright/index.mjs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import process from 'node:process';
import { installPhase4Fixtures } from '../../apps/frontend-user/tests/e2e/support/phase4Fixtures.js';
import { phase8Fixtures } from '../../apps/frontend-user/tests/e2e/support/phase8Fixtures.js';
import { installBatch11Admin } from '../../apps/frontend-user/tests/e2e/support/batch11AdminFixtures.js';

const label = process.argv[2];
if (!['before', 'after'].includes(label)) throw new Error('Use before or after');
const directory = `.cache/batch12/${label}`;
await mkdir(directory, { recursive: true });
const journeys = [
  ['home', '/', '.kp-marketing-shell h1'], ['marketplace', '/templates', '.kp-marketing-shell h1'],
  ['template-preview', '/templates/khmer-celestial?open=true', '.kc-opening, .kc-shell', 'wedding'],
  ['invitation-studio', '/app/events/101/invitation', '.invitation-studio, .studio-shell', 'wedding'],
  ['public-wedding', '/i/audit-event', '.kc-opening, .kc-shell', 'wedding'],
  ['guest-rsvp', '/i/audit-event?token=audit-guest', '.pub-rsvp-form'],
  ['check-in', '/app/events/101/check-in', '.checkin-kpi-label'],
  ['event-dashboard', '/app/events/101', '#event-module-content h1, #event-module-content h2'],
  ['admin-dashboard', '/dashboard', '#admin-main h1, #admin-main h2', 'admin'],
  ['admin-reports', '/reports', '#admin-main h1, #admin-main h2', 'admin'],
];
const samples = [], failures = [];
const browser = await chromium.launch();
try {
  for (const [name, path, selector, kind] of journeys) {
    for (let iteration = 0; iteration < 4; iteration++) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      // Fixture storage belongs to the app document, never sandboxed preview frames.
      const addInit = page.addInitScript.bind(page);
      page.addInitScript = (script, arg) => typeof script === 'function'
        ? addInit({ content: `if (window === window.top) { (${script.toString()})(${JSON.stringify(arg)}); }` })
        : addInit(script, arg);
      const origin = kind === 'admin' ? 'http://127.0.0.1:4174' : 'http://127.0.0.1:4173';
      const errors = [], requests = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', request => requests.push(new URL(request.url()).pathname));
      if (kind === 'admin') await installBatch11Admin(page);
      else if (kind === 'wedding') await phase8Fixtures(page, { lang: 'en' });
      else await installPhase4Fixtures(page, { count: 50 });
      // Avoid nondeterministic third-party fonts/media; local assets and API DTO fixtures remain.
      await page.route('**/*', route => new URL(route.request().url()).origin === origin ? route.fallback()
        : route.request().resourceType() === 'stylesheet' ? route.fulfill({ body: '', contentType: 'text/css' }) : route.abort());
      await page.addInitScript(() => {
        window.__batch12 = { lcpMs: null, cls: 0, longTaskMs: [] };
        for (const type of ['largest-contentful-paint', 'layout-shift', 'longtask']) {
          new PerformanceObserver(list => {
            for (const entry of list.getEntries()) {
              if (type === 'largest-contentful-paint') window.__batch12.lcpMs = entry.startTime;
              else if (type === 'layout-shift' && !entry.hadRecentInput) window.__batch12.cls += entry.value;
              else if (type === 'longtask') window.__batch12.longTaskMs.push(entry.duration);
            }
          }).observe({ type, buffered: true });
        }
      });
      const cdp = await context.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
      await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 20, downloadThroughput: 10_000_000, uploadThroughput: 10_000_000 });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 2 });
      try {
        await page.goto(origin + path, { waitUntil: 'domcontentloaded' });
        await page.locator(selector).first().waitFor({ timeout: 12_000 });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(700);
        const sample = await page.evaluate(() => {
          const navigation = performance.getEntriesByType('navigation')[0];
          const resources = performance.getEntriesByType('resource').filter(entry => entry.name.startsWith(location.origin));
          const sum = (items, field) => items.reduce((total, entry) => total + entry[field], 0);
          const js = resources.filter(entry => new URL(entry.name).pathname.endsWith('.js'));
          const css = resources.filter(entry => new URL(entry.name).pathname.endsWith('.css'));
          return { ...window.__batch12, domContentLoadedMs: navigation.domContentLoadedEventEnd,
            transferredBytes: sum(resources, 'transferSize'), encodedBytes: sum(resources, 'encodedBodySize'), decodedBytes: sum(resources, 'decodedBodySize'),
            jsDecodedBytes: sum(js, 'decodedBodySize'), cssDecodedBytes: sum(css, 'decodedBodySize'),
            imageEncodedBytes: sum(resources.filter(entry => entry.initiatorType === 'img'), 'encodedBodySize'),
            fontEncodedBytes: sum(resources.filter(entry => /\.(woff2?|ttf)(?:\?|$)/.test(entry.name)), 'encodedBodySize'),
            observedBlockingMs: window.__batch12.longTaskMs.reduce((total, ms) => total + Math.max(0, ms - 50), 0), domNodes: document.querySelectorAll('*').length,
            heapUsedBytes: performance.memory?.usedJSHeapSize ?? null };
        });
        if (errors.length) throw new Error(`Page error: ${errors.join('; ')}`);
        if (iteration > 0) samples.push({ name, iteration, ...sample, requestCount: requests.length, apiRequests: requests.filter(path => path.startsWith('/api/')), errors });
      } catch (error) {
        failures.push({ name, iteration, error: error.message.split('\n')[0], pageErrors: errors });
        break;
      } finally { await context.close(); }
    }
  }
  const assets = {};
  for (const app of ['frontend-user', 'frontend-admin']) {
    assets[app] = [];
    for (const name of await readdir(`apps/${app}/dist/assets`)) {
      if (!/\.(js|css)$/.test(name)) continue;
      const value = await readFile(`apps/${app}/dist/assets/${name}`);
      assets[app].push({ name, bytes: value.length, gzipBytes: gzipSync(value).length });
    }
  }
  const report = { recordedAt: new Date().toISOString(), label, browser: browser.version(),
    environment: { viewport: '1440x900', cache: 'disabled; fresh contexts', cpuSlowdown: 2, latencyMs: 20, bytesPerSecond: 10_000_000, warmupsPerRoute: 1, measuredSamplesPerRoute: 3, api: 'existing deterministic browser fixtures; no real backend', thirdParty: 'external stylesheets empty fixtures; other external requests blocked', motion: 'reduced' },
    limits: ['Synthetic lab observations, not field INP/CWV.', 'Three samples yield a maximum as the reported tail; no population p95 claim.', 'Heap is a point observation, not a leak proof.', 'Route fixture readiness is reported, including failures; no fallback metrics replace missing journeys.'], samples, failures, assets };
  await writeFile(`${directory}/browser-performance.json`, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ label, measuredSamples: samples.length, failures }));
if (failures.length || samples.length !== journeys.length * 3) process.exitCode = 1;
} finally { await browser.close(); }
