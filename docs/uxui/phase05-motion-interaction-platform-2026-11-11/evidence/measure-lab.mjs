// Isolated before/after Chromium fixture lab. Run after both capture stages.
// This is local comparative data, never field Core Web Vitals or INP.
import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '../../../..');
const base = path.join(root, 'output/playwright/uxui-phase05-2026-11-11');
const require = createRequire(path.join(root, 'apps/frontend-user/package.json'));
const { chromium } = require('@playwright/test');
const { routeContracts, installRouteContractFixtures } = await import(pathToFileURL(path.join(root, 'apps/frontend-user/tests/e2e/support/batch12RouteContracts.js')));
const surfaces = [
  ['home'], ['catalog'], ['auth-login'], ['create-event'], ['dashboard'], ['invitation'],
  ['admin-dashboard', 'frontend-admin'], ['admin-template-edit', 'frontend-admin'],
  ['ordinary-invitation', 'frontend-user', '/templates/event-essential'],
  ['cinematic-invitation', 'frontend-user', '/templates/emerald-canva-luxe-wedding'],
  ['checkout'], ['payment-status'], ['rsvp'],
];
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitFor(port) {
  for (let i = 0; i < 80; i++) {
    try { if ((await fetch(`http://127.0.0.1:${port}/`)).ok) return; } catch { /* starting */ }
    await sleep(250);
  }
  throw new Error(`Preview ${port} did not start`);
}
async function list(dir) {
  const result = [];
  for (const item of await fs.readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, item.name);
    result.push(...item.isDirectory() ? await list(file) : [file]);
  }
  return result;
}
const bundles = [];
for (const stage of ['before', 'after']) for (const app of ['user', 'admin']) {
  const dir = path.join(base, stage, `${app}-build`);
  for (const file of await list(path.join(dir, 'assets'))) {
    if (!/\.(?:js|css)$/.test(file)) continue;
    const bytes = await fs.readFile(file);
    bundles.push({ stage, app, file: path.relative(dir, file).replaceAll('\\', '/'), bytes: bytes.length,
      gzip: zlib.gzipSync(bytes).length, brotli: zlib.brotliCompressSync(bytes).length });
  }
}
const browser = await chromium.launch();
const progressPath = path.join(base, 'lab-progress.json');
const prior = await fs.readFile(progressPath, 'utf8').then(JSON.parse).catch(() => null);
const samples = prior?.samples || [], errors = prior?.errors || [];
async function saveProgress() {
  await fs.writeFile(progressPath, JSON.stringify({ browser: browser.version(), samples, errors }, null, 2) + '\n');
}
try {
  for (const stage of ['before', 'after']) {
    const children = [];
    try {
      for (const [app, port] of [['user', 4183], ['admin', 4184]]) {
        const appRoot = path.join(root, `apps/frontend-${app}`);
        children.push(spawn(process.execPath, [path.join(appRoot, 'node_modules/vite/bin/vite.js'), 'preview',
          '--host', '127.0.0.1', '--port', String(port), '--strictPort', '--outDir', path.join(base, stage, `${app}-build`)],
        { cwd: appRoot, windowsHide: true, stdio: 'ignore' }));
      }
      await Promise.all([waitFor(4183), waitFor(4184)]);
      for (const [name, application = 'frontend-user', override] of surfaces) {
        const group = override ? 'template-demo' : name;
        const contract = routeContracts.find(row => row.group === group && row.application === application);
        if (!contract) { errors.push({ stage, name, reason: 'missing fixture contract' }); continue; }
        for (const width of [390, 1440]) for (const motion of ['reduce', 'no-preference']) for (let trial = 1; trial <= 3; trial++) {
          if (['cold', 'warm'].every(cache => samples.some(item => item.stage === stage && item.name === name &&
            item.width === width && item.motion === motion && item.trial === trial && item.cache === cache))) continue;
          const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 },
            deviceScaleFactor: 1, reducedMotion: motion });
          const page = await context.newPage();
          try {
            const cdp = await context.newCDPSession(page);
            await cdp.send('Emulation.setCPUThrottlingRate', { rate: 2 });
            await cdp.send('Network.enable');
            await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 20,
              downloadThroughput: 10 * 1024 * 1024 / 8, uploadThroughput: 5 * 1024 * 1024 / 8 });
            // Playwright's clock clears navigation/paint/resource entries in
            // Chromium. Freeze wall-clock dates without replacing performance.
            await page.addInitScript(timestamp => {
              const NativeDate = Date;
              class FixedDate extends NativeDate {
                constructor(...args) { super(...(args.length ? args : [timestamp])); }
                static now() { return timestamp; }
              }
              window.Date = FixedDate;
            }, Date.parse('2026-11-11T12:00:00Z'));
            await installRouteContractFixtures(page, contract, { lang: 'km' });
            if (name === 'admin-template-edit') {
              const template = { id: 30, code: 'event-essential', name: 'Motion lab fixture', status: 'ACTIVE', category: 'MINIMALIST', premium: false,
                description: JSON.stringify({ invitationTitle: 'Preview celebration', extension: { retained: true } }) };
              for (const pattern of ['**/api/v1/templates/slug/event-essential', '**/api/v1/templates/event-essential', '**/api/v1/templates/30', '**/api/v1/admin/templates/30']) {
                await page.route(pattern, route => route.request().method() === 'GET' ? route.fulfill({ json: { data: template } }) : route.fallback());
              }
            }
            await page.route('**/*', route => ['127.0.0.1', 'localhost'].includes(new URL(route.request().url()).hostname)
              ? route.fallback() : route.abort());
            await page.addInitScript(() => {
              window.__motionLab = { lcp: null, lcpElement: null, cls: 0, longTasks: [] };
              try { new PerformanceObserver(list => { for (const entry of list.getEntries()) {
                window.__motionLab.lcp = entry.startTime;
                const element = entry.element;
                window.__motionLab.lcpElement = element ? `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}` : null;
              } }).observe({ type: 'largest-contentful-paint', buffered: true }); } catch { /* unsupported */ }
              try { new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__motionLab.cls += entry.value; }).observe({ type: 'layout-shift', buffered: true }); } catch { /* unsupported */ }
              try { new PerformanceObserver(list => { for (const entry of list.getEntries()) window.__motionLab.longTasks.push(entry.duration); }).observe({ type: 'longtask', buffered: true }); } catch { /* unsupported */ }
            });
            const port = application === 'frontend-admin' ? 4184 : 4183;
            const url = `http://127.0.0.1:${port}${override || contract.concreteUrl}`;
            for (const cache of ['cold', 'warm']) {
              await page.goto(url, { waitUntil: 'load', timeout: 20000 });
              await page.evaluate(() => document.fonts.ready);
              await page.waitForTimeout(400);
              // Headless Chromium can defer a paint until a frame is consumed.
              await page.screenshot();
              const result = await page.evaluate(() => {
                const nav = performance.getEntriesByType('navigation')[0];
                const resources = performance.getEntriesByType('resource');
                const paint = performance.getEntriesByType('paint');
                return { load: nav?.loadEventEnd ?? null, fcp: paint.find(item => item.name === 'first-contentful-paint')?.startTime ?? null,
                  lcp: window.__motionLab?.lcp, lcpElement: window.__motionLab?.lcpElement, cls: window.__motionLab?.cls,
                  longTaskCount: window.__motionLab?.longTasks.length ?? null,
                  longTaskTotal: window.__motionLab?.longTasks.reduce((a, b) => a + b, 0) ?? null,
                  resources: resources.filter(item => /\.(?:js|css|woff2?|png|jpe?g|webp|mp4|mp3)(?:$|\?)/.test(item.name))
                    .map(item => ({ url: new URL(item.name).pathname, transferSize: item.transferSize, duration: item.duration })) };
              });
              samples.push({ stage, name, application, width, motion, trial, cache, ...result });
            }
          } catch (error) { errors.push({ stage, name, width, motion, trial, reason: error.message }); }
          finally { await context.close(); }
        }
        console.log(`${stage} ${name}: ${samples.filter(item => item.stage === stage && item.name === name).length} observations`);
        await saveProgress();
      }
    } finally {
      for (const child of children) child.kill();
      await sleep(500);
    }
  }
} finally { await browser.close(); }
const result = { browser: browser.version(), fixture: 'Batch 12 fictional read-only DTOs; no external requests',
  conditions: { viewports: ['390x844', '1440x900'], dpr: 1, cpu: 'Chromium CDP 2x throttle',
    network: 'CDP 20ms latency, 10Mbps down, 5Mbps up; loopback preview', cache: 'new context cold, second navigation warm',
    motions: ['reduce', 'no-preference'], repeats: 3, clock: 'Date wall clock fixed 2026-11-11T12:00:00Z; performance clock native' }, bundles, samples, errors };
await fs.writeFile(path.join(base, 'lab-results.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ samples: samples.length, errors: errors.length, browser: browser.version() }));
