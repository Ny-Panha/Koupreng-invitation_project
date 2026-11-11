// Fictional, read-only fixture screenshots from current local Vite preview builds.
// Start both preview servers on 127.0.0.1:4173/4174 before running from repo root.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '../../../..');
const require = createRequire(path.join(root, 'apps/frontend-user/package.json'));
const { chromium } = require('@playwright/test');
const { routeContracts, installRouteContractFixtures } = await import(pathToFileURL(path.join(root, 'apps/frontend-user/tests/e2e/support/batch12RouteContracts.js')));
const output = path.join(root, 'output/playwright/uxui-phase01-2026-11-11/visual-baseline');
await fs.mkdir(output, { recursive: true });
const sha = (await (await import('node:child_process')).execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root })).toString().trim();
const browser = await chromium.launch();
const records = [];
for (const group of ['home', 'catalog', 'create-event', 'dashboard', 'admin-template-edit', 'public-invitation', 'admin-dashboard']) {
  const contract = routeContracts.find(row => row.group === group && (group.startsWith('admin-') ? row.application === 'frontend-admin' : row.application === 'frontend-user'));
  if (!contract) throw new Error(`No route contract for ${group}`);
  for (const width of [320, 390, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: width === 320 ? 640 : width === 1440 ? 900 : 844 }, hasTouch: width < 768, reducedMotion: 'reduce', deviceScaleFactor: 1 });
    const page = await context.newPage();
    const failures = [];
    page.on('pageerror', error => failures.push(error.message));
    await installRouteContractFixtures(page, contract, { lang: 'km' });
    await page.route('**/*', route => ['127.0.0.1', 'localhost'].includes(new URL(route.request().url()).hostname) ? route.fallback() : route.abort());
    const port = contract.application === 'frontend-admin' ? 4174 : 4173;
    const url = `http://127.0.0.1:${port}${contract.concreteUrl}`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 7000 }).catch(() => {});
    await page.evaluate(() => document.fonts.ready);
    const file = `${group}-${width}-km.png`;
    await page.screenshot({ path: path.join(output, file), fullPage: true });
    records.push({ sha, group, application: contract.application, pattern: contract.pattern, url, viewport: context.pages()[0].viewportSize(), browser: 'Playwright Chromium on Windows', locale: 'km', fixture: 'batch12RouteContracts fictional DTOs', reducedMotion: true, file: `output/playwright/uxui-phase01-2026-11-11/visual-baseline/${file}`, pageErrors: failures, capturedAt: new Date().toISOString() });
    await context.close();
  }
}
await browser.close();
await fs.writeFile(path.join(output, 'metadata.json'), JSON.stringify(records, null, 2));
console.log(JSON.stringify({ screenshots: records.length, pageErrors: records.filter(row => row.pageErrors.length).length, output }));
