import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
const repo = process.cwd().replaceAll('\\', '/'), out = 'D:/Koupreng-UXUI-Phase4';
const require = createRequire(`${repo}/apps/frontend-user/package.json`);
const { chromium } = require('playwright');
const { installPhase4Fixtures } = await import(pathToFileURL(`${repo}/apps/frontend-user/tests/e2e/support/phase4Fixtures.js`));
const browser = await chromium.launch({ headless: true });
const scrollRecords = [], audit = [], images = [];
const base = 'http://127.0.0.1:4173';
await mkdir(`${out}/metadata`, { recursive: true });
await mkdir(`${out}/screenshots/after`, { recursive: true });
const geometry = () => {
  const box = selector => { const e = document.querySelector(selector), r = e.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, height: r.height, scrollTop: e.scrollTop, clientHeight: e.clientHeight, scrollHeight: e.scrollHeight }; };
  return { sidebar: box('.event-workspace-sidebar'), context: box('.event-navigation-header'), footer: box('.event-navigation-footer'), main: box('.event-workspace-main'), menu: box('.event-navigation-body'), windowY: scrollY };
};
async function shot(page, name) {
  await page.evaluate(() => document.fonts.ready);
  const path = `${out}/screenshots/after/${name}.png`;
  await page.screenshot({ path });
  images.push({ name, path, viewport: page.viewportSize(), route: new URL(page.url()).pathname, browser: browser.version() });
}
try {
  for (const module of ['', 'guests', 'rsvp', 'delivery', 'media', 'seating']) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 600 }, reducedMotion: 'reduce' });
    const state = await installPhase4Fixtures(page);
    state.tables = Array.from({ length: 16 }, (_, i) => ({ id: 100 + i, tableName: `Table ${i + 1}`, capacity: 8, tableLabel: i === 0 ? 'Family' : '', notes: '{}' }));
    await page.goto(`${base}/app/events/101${module ? '/' + module : ''}`);
    await page.getByRole('main').first().waitFor();
    await page.waitForTimeout(250);
    const samples = [await page.evaluate(geometry)];
    for (const distance of [400, 500, 100000]) {
      await page.locator('.event-workspace-main').evaluate((e, dy) => { e.scrollTop += dy; }, distance);
      samples.push(await page.evaluate(geometry));
    }
    for (const sample of samples) {
      assert(Math.abs(sample.sidebar.top - samples[0].sidebar.top) <= 1);
      assert(sample.context.top >= 80);
      assert(sample.footer.bottom <= 600);
      assert.equal(sample.windowY, 0);
    }
    assert(samples.at(-1).main.scrollTop > 0, `${module} content must scroll`);
    const position = samples.at(-1).main.scrollTop;
    await page.locator('.event-navigation-body').evaluate(e => { e.scrollTop = e.scrollHeight; });
    const menuSample = await page.evaluate(geometry);
    assert(menuSample.menu.scrollTop > 0);
    assert.equal(menuSample.main.scrollTop, position);
    scrollRecords.push({ module: module || 'dashboard', viewport: page.viewportSize(), samples, menuSample });
    await shot(page, `sidebar-${module || 'dashboard'}-bottom`);
    for (const [width, height] of [[1152, 720], [720, 450], [390, 667]]) {
      await page.setViewportSize({ width, height });
      await page.reload(); await page.getByRole('main').first().waitFor(); await page.waitForTimeout(150);
      const result = await page.evaluate(() => {
        const visible = e => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden' && !e.closest('[hidden],[inert]');
        const unnamed = [...document.querySelectorAll('button, input:not([type=hidden]), select, textarea')].filter(visible).filter(e => !(e.getAttribute('aria-label') || e.getAttribute('aria-labelledby') || [...(e.labels || [])].some(l => l.textContent.trim()) || e.textContent.trim() || e.getAttribute('title'))).map(e => ({ tag: e.tagName, id: e.id, class: e.className }));
        return { width: innerWidth, documentWidth: document.documentElement.scrollWidth, unnamed };
      });
      assert(result.documentWidth <= width, `${module} overflow at ${width}`);
      audit.push({ module: module || 'dashboard', viewport: { width, height }, ...result });
      if (width === 390) await shot(page, `${module || 'dashboard'}-en-mobile`);
    }
    await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const state = await installPhase4Fixtures(page, { count: 6 });
  state.tables = [{ id: 100, tableName: 'Table 1', tableLabel: 'Family', capacity: 8, notes: '{"x":25,"y":40}' }, { id: 101, tableName: 'Table 2', tableLabel: 'Friends', capacity: 6, notes: '{"x":75,"y":40}' }];
  state.assignments = [{ id: 1000, guestId: 501, guestName: 'Review Guest 1', tableId: 100, seatCount: 2 }, { id: 1001, guestId: 502, guestName: 'Review Guest 2', tableId: 101, seatCount: 3 }];
  state.guests[0].seatCount = 2; state.guests[1].seatCount = 3;
  await page.goto(`${base}/app/events/101/seating`); await page.getByRole('heading', { name: 'Table 1', exact: true }).waitFor();
  await shot(page, 'seating-populated');
  await page.getByTestId('tab-floor-plan').click();
  const table = page.getByRole('button', { name: 'Move table Table 1', exact: true });
  const x = await table.evaluate(e => parseFloat(e.style.left));
  await table.focus(); await page.keyboard.press('ArrowRight');
  assert.equal(await table.evaluate(e => parseFloat(e.style.left)), x + 1);
  await shot(page, 'seating-floor-plan');
  await page.getByRole('button', { name: 'Save floor plan', exact: true }).click();
  await page.waitForTimeout(200);
  assert(state.writes.some(w => w.method === 'PUT' && w.path.includes('/seating/tables/')));
  await page.setViewportSize({ width: 390, height: 667 }); await page.reload();
  await page.getByRole('button', { name: 'Assign guests', exact: true }).click();
  await shot(page, 'seating-mobile-assignment');
  await page.getByRole('button', { name: 'Create table', exact: true }).click();
  await page.getByRole('dialog').waitFor(); await shot(page, 'seating-mobile-create');
  await page.keyboard.press('Escape');
  await page.goto(`${base}/app/events/101/guests`);
  await page.getByRole('button', { name: 'Add guest', exact: true }).click();
  await page.getByRole('dialog').waitFor(); await shot(page, 'guest-mobile-create');
  await page.locator('.guest-form-details summary').click();
  await page.locator('.guest-form-footer').scrollIntoViewIfNeeded(); await shot(page, 'guest-mobile-save');
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${base}/app/events`); await page.getByRole('heading', { name: 'My Events', exact: true }).waitFor();
  await shot(page, 'my-events');
  await page.close();
  await writeFile(`${out}/metadata/browser-scroll-measurements.json`, JSON.stringify({ tolerancePx: 1, records: scrollRecords }, null, 2));
  await writeFile(`${out}/metadata/accessibility-dom-results.json`, JSON.stringify(audit, null, 2));
  await writeFile(`${out}/metadata/extra-captures.json`, JSON.stringify(images, null, 2));
  console.log(JSON.stringify({ scrollModules: scrollRecords.length, responsiveAudits: audit.length, unnamedControls: audit.reduce((sum, r) => sum + r.unnamed.length, 0), screenshots: images.length, status: 'passed' }));
} finally { await browser.close(); }
