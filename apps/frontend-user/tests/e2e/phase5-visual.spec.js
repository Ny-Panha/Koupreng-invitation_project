import { evidencePath } from './support/evidencePath';
import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { installPhase5Fixtures } from './support/phase5Fixtures.js';

test('Phase 5 responsive evidence uses isolated fictional browser contracts', async ({ page }) => {
  test.setTimeout(600000);
  const root = process.env.PHASE5_EVIDENCE || evidencePath('phase5');
  const stage = process.env.PHASE5_STAGE || 'after';
  const folder = path.join(root, 'screenshots', stage);
  await mkdir(folder, { recursive: true });
  const manifest = [], measurements = [], errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const state = await installPhase5Fixtures(page, { count: 8 });
  state.tables = [{ id: 100, tableName: 'Family A', capacity: 10, positionX: 30, positionY: 30 }, { id: 101, tableName: 'Friends', capacity: 8, positionX: 65, positionY: 55 }];
  state.assignments = [{ id: 1000, tableId: 100, guestId: 501, guestName: 'Review Guest 1', tableName: 'Family A', seatCount: 1 }];
  const routes = ['events', 'guests', 'seating', 'gifts', 'budget', 'settings', 'qr'];
  for (const lang of ['en', 'km']) {
    await page.addInitScript(value => localStorage.setItem('koupreng.lang', value), lang);
    for (const width of [320, 375, 390, 430, 768, 1024, 1366, 1440, 1920]) {
      const height = width < 500 ? 740 : width === 1366 ? 700 : 900;
      await page.setViewportSize({ width, height });
      for (const module of routes) {
        const route = module === 'events' ? '/app/events' : `/app/events/101/${module}`;
        await page.goto(route, { waitUntil: 'domcontentloaded' });
        await expect(page.locator('.event-card, .event-workspace-main').first()).toBeVisible();
        const ready = { guests: '.guest-page-header', seating: '.seating-page', gifts: '.wg-page', budget: '.exp-page', settings: '.event-settings', qr: '.qr-card' }[module];
        if (ready) await expect(page.locator(ready).first()).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        const file = `${module}-${lang}-${width}.png`;
        await page.screenshot({ path: path.join(folder, file), fullPage: true });
        const geometry = await page.evaluate(() => ({ documentWidth: document.documentElement.scrollWidth, viewport: innerWidth, documentScroll: scrollY, main: document.querySelector('.event-workspace-main')?.getBoundingClientRect().toJSON() }));
        measurements.push({ stage, route, lang, width, height, ...geometry });
        manifest.push({ file: `screenshots/${stage}/${file}`, route, viewport: { width, height }, lang, state: 'fictional contract fixture; two currencies in financial pages', browser: 'Chromium', provenance: 'phase5Fixtures.js; API intercepted; no live mutations' });
      }
    }
  }
  await mkdir(path.join(root, 'metadata'), { recursive: true });
  await writeFile(path.join(root, 'metadata', `screenshots-${stage}.json`), JSON.stringify(manifest, null, 2));
  await writeFile(path.join(root, 'metadata', `measurements-${stage}.json`), JSON.stringify({ measurements, errors }, null, 2));
});
