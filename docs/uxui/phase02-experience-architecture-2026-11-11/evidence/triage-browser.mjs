// Read-only fictional-fixture investigation. Run from the repository root with Node 20+.
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const output = path.join(root, 'output/playwright/uxui-phase02-2026-11-11');
await mkdir(output, { recursive: true });
const { chromium, firefox, webkit } = await import(pathToFileURL(path.join(root, 'apps/frontend-user/node_modules/playwright/index.mjs')));
const { routeContracts, installRouteContractFixtures } = await import(pathToFileURL(path.join(root, 'apps/frontend-user/tests/e2e/support/batch12RouteContracts.js')));
const servers = [];
const results = [];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitFor(url) {
  for (let i = 0; i < 120; i++) {
    try { if ((await fetch(url)).ok) return; } catch { /* build/start pending */ }
    await delay(1000);
  }
  throw new Error(`Server did not start: ${url}`);
}
async function open(page, group, lang = 'en') {
  const contract = routeContracts.find(row => row.group === group);
  const state = await installRouteContractFixtures(page, contract, { lang });
  if (group === 'admin-template-edit') {
    const template = { id: 30, code: 'event-essential', name: 'Batch 11 fixture template', status: 'ACTIVE', category: 'MINIMALIST', premium: false,
      description: JSON.stringify({ invitationTitle: 'Preview celebration', extension: { retained: true } }) };
    for (const pattern of ['**/api/v1/templates/slug/event-essential', '**/api/v1/templates/event-essential', '**/api/v1/templates/30', '**/api/v1/admin/templates/30']) {
      await page.route(pattern, route => route.request().method() === 'GET' ? route.fulfill({ json: { data: template } }) : route.fallback());
    }
  }
  await page.route('**/*', route => ['127.0.0.1', 'localhost'].includes(new URL(route.request().url()).hostname) ? route.fallback() : route.abort());
  await page.goto((contract.application === 'frontend-admin' ? 'http://127.0.0.1:4174' : 'http://127.0.0.1:4173') + contract.concreteUrl);
  return state;
}
function geometry() {
  const selectors = ['.template-studio', '.template-studio-toolbar', '.studio-panel-switch', '.template-studio-workspace', '.studio-preview-panel', '.studio-preview-toolbar', '.studio-preview-stage', '.studio-preview-footprint', '.studio-preview-frame', 'iframe'];
  const rect = el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom, right: r.right }; };
  const body = Object.fromEntries(selectors.map(s => { const e = document.querySelector(s); return [s, e ? { rect: rect(e), clientHeight: e.clientHeight, scrollHeight: e.scrollHeight, scrollTop: e.scrollTop, clientWidth: e.clientWidth, scrollWidth: e.scrollWidth } : null]; }));
  const actionable = [...document.querySelectorAll('.template-studio button, .template-studio a')].filter(e => e.getClientRects().length).map(e => {
    const r = e.getBoundingClientRect(), x = Math.min(innerWidth - 1, Math.max(0, r.x + r.width / 2)), y = Math.min(innerHeight - 1, Math.max(0, r.y + r.height / 2));
    return { name: e.getAttribute('aria-label') || e.textContent.trim().replace(/\s+/g, ' ').slice(0, 70), rect: rect(e), inViewport: x >= 0 && x < innerWidth && y >= 0 && y < innerHeight, hit: document.elementFromPoint(x, y) === e || e.contains(document.elementFromPoint(x, y)) };
  });
  return { viewport: { innerWidth, innerHeight, visualWidth: visualViewport?.width, visualHeight: visualViewport?.height, documentScrollHeight: document.documentElement.scrollHeight, documentScrollWidth: document.documentElement.scrollWidth }, body, actionable };
}
try {
  for (const app of ['user', 'admin']) {
    const p = spawn(process.execPath, [path.join(root, 'scripts/qa/serve-phase02.mjs'), app], { cwd: path.join(root, 'apps/frontend-user'), windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    servers.push(p);
    p.stderr.on('data', () => {}); p.stdout.on('data', () => {});
  }
  await Promise.all([waitFor('http://127.0.0.1:4173'), waitFor('http://127.0.0.1:4174')]);
  for (const [engineName, engine] of Object.entries({ chromium, firefox, webkit })) {
    const browser = await engine.launch({ headless: true });
    try {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      await open(page, 'create-event', 'km');
      const next = page.getByRole('button', { name: 'បន្ត', exact: true }).first();
      const before = await page.locator('.event-mobile-bottom-bar').innerText();
      await next.click();
      const after = await page.locator('.event-mobile-bottom-bar').innerText();
      const stepHeading = await page.locator('main h2, main h3').allInnerTexts();
      const wizardStep = await page.locator('[aria-current="step"]').allInnerTexts();
      results.push({ engine: engineName, case: 'QA-NEW-01', version: browser.version(), nextVisible: await next.isVisible(), before, after, wizardStep, stepHeading, errors: [...errors] });
      await page.close();
      const adminPage = await context.newPage();
      const adminErrors = []; adminPage.on('pageerror', e => adminErrors.push(e.message));
      await open(adminPage, 'admin-template-edit', 'km');
      for (const width of [320, 390, 768, 1440]) {
        await adminPage.setViewportSize({ width, height: 844 });
        const link = adminPage.getByRole('link', { name: 'បើកគំរូសំបុត្រអញ្ជើញក្នុងផ្ទាំងថ្មី', exact: true });
        await link.waitFor({ state: 'visible', timeout: 10000 });
        const visible = await link.isVisible();
        const domLink = await adminPage.locator('a[aria-label="បើកគំរូសំបុត្រអញ្ជើញក្នុងផ្ទាំងថ្មី"]').evaluateAll(nodes => nodes.map(e => {
          const r = e.getBoundingClientRect(); const s = getComputedStyle(e);
          return { rect: { x: r.x, y: r.y, width: r.width, height: r.height }, display: s.display, visibility: s.visibility, parentWidth: e.parentElement.clientWidth, parentScrollWidth: e.parentElement.scrollWidth };
        }));
        const href = await link.getAttribute('href');
        const target = await link.getAttribute('target');
        let keyboardOpened = false, openedUrl = null;
        if (visible && width === 390) {
          await link.focus();
          const popupPromise = adminPage.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
          await adminPage.keyboard.press('Enter');
          const popup = await popupPromise;
          keyboardOpened = !!popup; openedUrl = popup?.url() || null; await popup?.close();
        }
        if (width === 320) await adminPage.screenshot({ path: path.join(output, `${engineName}-320x844-admin-link.png`) });
        results.push({ engine: engineName, case: 'QA-NEW-02', width, visible, domLink, href, target, keyboardOpened, openedUrl, errors: [...adminErrors] });
      }
      for (const [width, height] of [[844, 390], [820, 430], [768, 390], [1440, 900]]) {
        await adminPage.setViewportSize({ width, height });
        const preview = adminPage.getByRole('button', { name: 'មើលជាមុន', exact: true });
        if (await preview.isVisible()) await preview.click();
        const iframe = adminPage.frameLocator('iframe');
        await iframe.getByRole('heading', { name: 'Preview celebration', exact: true }).waitFor({ state: 'visible', timeout: 12000 });
        await adminPage.locator('.template-studio').evaluate(el => el.scrollTop = 0);
        const top = await adminPage.evaluate(geometry);
        const full = adminPage.getByRole('button', { name: /មាតិកាពេញ \(Full\)/ });
        await full.click();
        const fullPressed = await full.getAttribute('class');
        await adminPage.getByRole('button', { name: /ស្រោមសំបុត្រ \(Cover\)/ }).click();
        await adminPage.locator('iframe').scrollIntoViewIfNeeded();
        const initial = await adminPage.evaluate(geometry);
        await adminPage.screenshot({ path: path.join(output, `${engineName}-${width}x${height}-preview.png`) });
        await adminPage.locator('.template-studio').evaluate(el => el.scrollTop = el.scrollHeight);
        const bottom = await adminPage.evaluate(geometry);
        const frameReadable = await iframe.locator('body').isVisible();
        const frameScroll = await iframe.locator('html').evaluate(el => {
          const before = { scrollHeight: el.scrollHeight, clientHeight: el.clientHeight, scrollTop: el.scrollTop };
          el.scrollTop = el.scrollHeight;
          return { before, after: { scrollHeight: el.scrollHeight, clientHeight: el.clientHeight, scrollTop: el.scrollTop } };
        });
        const tabFocused = await adminPage.keyboard.press('Tab').then(() => adminPage.evaluate(() => ({ tag: document.activeElement?.tagName, label: document.activeElement?.getAttribute('aria-label'), title: document.activeElement?.getAttribute('title') })));
        results.push({ engine: engineName, case: 'QA-NEW-03', width, height, top, initial, bottom, fullPressed, frameReadable, frameScroll, tabFocused, errors: [...adminErrors] });
      }
      await context.close();
    } finally { await browser.close(); }
  }
} finally {
  for (const p of servers) p.kill();
  await writeFile(path.join(output, 'triage-results.json'), JSON.stringify(results, null, 2));
  console.log(`Wrote ${results.length} observations to ${path.join(output, 'triage-results.json')}`);
}
