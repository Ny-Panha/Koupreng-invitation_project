// Reproducible, read-only fictional-fixture capture. Run `node .../capture-visual.mjs before|after`.
// Builds both apps into isolated ignored output paths and serves only loopback previews.
import fs from 'node:fs/promises';
import { spawn, execFileSync } from 'node:child_process';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '../../../..');
const stage = process.argv[2];
if (!['before', 'after'].includes(stage)) throw new Error('Expected before or after');
const only = process.argv[3]?.startsWith('--only=') ? process.argv[3].slice('--only='.length).split(',') : null;
const output = path.join(root, 'output/playwright/uxui-phase03-2026-11-11', stage);
await fs.mkdir(output, { recursive: true });
const require = createRequire(path.join(root, 'apps/frontend-user/package.json'));
const { chromium } = require('@playwright/test');
const { routeContracts, installRouteContractFixtures } = await import(pathToFileURL(path.join(root, 'apps/frontend-user/tests/e2e/support/batch12RouteContracts.js')));
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root }).toString().trim();
const children = [];
const run = (command, args, cwd, logName) => new Promise((resolve, reject) => {
  const child = spawn(command, args, { cwd, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let combined = '';
  child.stdout.on('data', d => combined += d.toString()); child.stderr.on('data', d => combined += d.toString());
  child.on('exit', async code => { await fs.writeFile(path.join(output, logName), combined); code === 0 ? resolve() : reject(new Error(`${logName} exit ${code}: ${combined.slice(-2000)}`)); });
  child.on('error', reject);
});
for (const app of only ? [] : ['user', 'admin']) {
  const appRoot = path.join(root, `apps/frontend-${app}`);
  const build = path.join(output, `${app}-build`);
  await run(process.execPath, [path.join(appRoot, 'node_modules/vite/bin/vite.js'), 'build', '--outDir', build, '--emptyOutDir'], appRoot, `${app}-build.log`);
}
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitFor(port) {
  for (let attempt = 0; attempt < 100; attempt++) {
    try { if ((await fetch(`http://127.0.0.1:${port}/`)).ok) return; } catch { /* starting */ }
    await sleep(300);
  }
  throw new Error(`Preview ${port} did not start`);
}
for (const [app, port] of [['user', 4173], ['admin', 4174]]) {
  const appRoot = path.join(root, `apps/frontend-${app}`);
  const child = spawn(process.execPath, [path.join(appRoot, 'node_modules/vite/bin/vite.js'), 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort', '--outDir', path.join(output, `${app}-build`)], { cwd: appRoot, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  children.push(child);
  child.stdout.on('data', () => {}); child.stderr.on('data', () => {});
}
let browser;
const records = [];
const rendererKeys = ['khmer-floral-gold','royal-garden-cinematic','silk-heritage','template-boilerplate','khmer-celestial','the-digital-yes-wedding','emerald-canva-luxe-wedding','withjoy-modern-portal','bliss-editorial-wedding','khmer-golden-canva-inspired-wedding','event-essential','koupreng-demo-wedding'];
try {
  await Promise.all([waitFor(4173), waitFor(4174)]);
  browser = await chromium.launch();
  const jobs = [];
  for (const group of ['home','catalog','auth-login','create-event','dashboard','guests','rsvp','admin-login','admin-dashboard','admin-users','admin-template-edit']) {
    for (const width of [390, 1440]) jobs.push({ group, width, mode: 'light' });
  }
  for (const group of ['home','auth-login','dashboard','admin-dashboard','admin-users','admin-template-edit']) jobs.push({ group, width: 390, mode: 'dark' });
  for (const key of rendererKeys) for (const width of [390, 1440]) jobs.push({ group: 'template-demo', key, width, mode: 'light' });
  const selectedJobs = only ? jobs.filter(job => only.includes(job.key || job.group)) : jobs;
  for (const job of selectedJobs) {
    const contractGroup = job.group === 'admin-login' ? 'auth-login' : job.group;
    const contract = routeContracts.find(row => row.group === contractGroup && (job.group.startsWith('admin-') ? row.application === 'frontend-admin' : row.application === 'frontend-user'));
    if (!contract) throw new Error(`Missing route contract ${job.group}`);
    const context = await browser.newContext({ viewport: { width: job.width, height: job.width === 390 ? 844 : 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce', hasTouch: job.width < 768 });
    const page = await context.newPage();
    const errors = [], fonts = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('request', r => { if (/font|\.woff/i.test(r.url())) fonts.push(r.url()); });
    const state = await installRouteContractFixtures(page, contract, { lang: 'km' });
    if (job.group === 'admin-template-edit') {
      const template = { id: 30, code: 'event-essential', name: 'Batch 11 fixture template', status: 'ACTIVE', category: 'MINIMALIST', premium: false,
        description: JSON.stringify({ invitationTitle: 'Preview celebration', extension: { retained: true } }) };
      for (const pattern of ['**/api/v1/templates/slug/event-essential', '**/api/v1/templates/event-essential', '**/api/v1/templates/30', '**/api/v1/admin/templates/30']) {
        await page.route(pattern, route => route.request().method() === 'GET' ? route.fulfill({ json: { data: template } }) : route.fallback());
      }
    }
    if (['template-boilerplate', 'koupreng-demo-wedding'].includes(job.key)) {
      const template = { id: 903, code: job.key, slug: job.key, name: `Phase 03 ${job.key}`, status: 'ACTIVE', category: 'OTHER', premium: false, price: 0 };
      await page.route(`**/api/v1/templates/slug/${job.key}`, route => route.fulfill({ json: { data: template } }));
    }
    await page.addInitScript(({ mode, admin }) => {
      if (admin) localStorage.setItem('theme', mode);
      else localStorage.setItem('koupreng.colorMode', mode);
    }, { mode: job.mode, admin: contract.application === 'frontend-admin' });
    await page.route('**/*', route => ['127.0.0.1', 'localhost'].includes(new URL(route.request().url()).hostname) ? route.fallback() : route.abort());
    const port = contract.application === 'frontend-admin' ? 4174 : 4173;
    const pathname = job.key ? `/templates/${job.key}` : contract.concreteUrl;
    await page.goto(`http://127.0.0.1:${port}${pathname}`, { waitUntil: 'domcontentloaded' });
    if (job.group === 'admin-template-edit') {
      await page.locator('.template-studio').waitFor({ state: 'visible', timeout: 12000 });
    } else if (job.key) {
      await page.locator('[data-template-renderer]').first().waitFor({ state: 'visible', timeout: 12000 }).catch(() => {});
    } else await page.locator('main').first().waitFor({ state: 'visible', timeout: 12000 }).catch(() => {});
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    await page.evaluate(() => document.fonts.ready);
    const file = `${job.key || job.group}-${job.width}-${job.mode}.png`;
    await page.screenshot({ path: path.join(output, file), fullPage: false });
    const computed = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      const selectors = ['.kp-marketing-shell','.auth-shell','.dash-wrapper','.admin-shell','.template-studio','[data-template-renderer]','h1','button','input'];
      const elements = Object.fromEntries(selectors.map(selector => {
        const el = document.querySelector(selector);
        if (!el) return [selector, null];
        const s = getComputedStyle(el), r = el.getBoundingClientRect();
        return [selector, { color: s.color, background: s.backgroundColor, border: s.borderColor, font: s.fontFamily, fontSize: s.fontSize, lineHeight: s.lineHeight, width: r.width, height: r.height, x: r.x, y: r.y }];
      }));
      const navigation = performance.getEntriesByType('navigation')[0];
      return { appearance: { customer: document.documentElement.dataset.colorMode, admin: document.documentElement.classList.contains('dark') }, tokens: Object.fromEntries(['--ui-canvas','--ui-surface','--ui-ink','--ui-muted','--ui-action','--ui-focus','--ui-warning','--ui-warning-soft','--ui-theme-canvas','--ui-theme-surface','--ui-theme-ink','--ui-theme-muted','--ui-theme-action','--ui-theme-focus','--ui-studio-canvas','--app-canvas','--app-ink','--background','--foreground','--primary'].map(key => [key, root.getPropertyValue(key).trim()])), elements, documentWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth, renderer: document.querySelector('[data-template-renderer]')?.getAttribute('data-template-renderer') || null, fontFaces: [...document.fonts].map(face => ({family:face.family,status:face.status,weight:face.weight})), navigation: navigation ? { domContentLoaded: navigation.domContentLoadedEventEnd, load: navigation.loadEventEnd, transferSize: navigation.transferSize } : null, paint: Object.fromEntries(performance.getEntriesByType('paint').map(entry => [entry.name, entry.startTime])) };
    });
    records.push({ sha, stage, ...job, application: contract.application, pathname, browser: browser.version(), locale: 'km', motion: 'reduce', fixture: 'batch12RouteContracts fictional read-only DTOs', screenshot: `output/playwright/uxui-phase03-2026-11-11/${stage}/${file}`, errors, unexpectedReads: state.unexpected, writes: state.writes, fontRequests: fonts, computed, capturedAt: new Date().toISOString() });
    await context.close();
    console.log(`${stage}: ${records.length}/${selectedJobs.length} ${file}`);
  }
} finally {
  await browser?.close();
  for (const child of children) child.kill();
  const previous = only ? JSON.parse(await fs.readFile(path.join(output, 'manifest.json'), 'utf8')) : [];
  const keys = new Set(records.map(r => `${r.key || r.group}:${r.width}:${r.mode}`));
  const complete = [...previous.filter(r => !keys.has(`${r.key || r.group}:${r.width}:${r.mode}`)), ...records];
  await fs.writeFile(path.join(output, 'manifest.json'), JSON.stringify(complete, null, 2));
}
console.log(JSON.stringify({ stage, count: records.length, errors: records.filter(r => r.errors.length).length, output }));
