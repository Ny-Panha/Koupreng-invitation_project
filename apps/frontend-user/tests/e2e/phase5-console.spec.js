import { evidencePath } from './support/evidencePath';
import { test, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { installPhase5Fixtures } from './support/phase5Fixtures.js';

test('changed routes record console, network and overflow diagnostics in both languages', async ({ browser }) => {
  test.setTimeout(120000);
  const measurements = [], diagnostics = [];
  const safe = value => String(value).replace(/eyJ[\w-]+\.[\w-]+\.[\w-]+/g, '[redacted]').replace(/https?:\/\/[^\s)]+/g, raw => { try { const url = new URL(raw); return `${url.origin}${url.pathname}`; } catch { return '[url]'; } }).slice(0, 300);
  for (const lang of ['en', 'km']) {
    const context = await browser.newContext({ baseURL: 'http://127.0.0.1:4173' });
    const page = await context.newPage();
    await installPhase5Fixtures(page, { lang });
    let routeName = '';
    page.on('console', message => { if (message.type() === 'error') diagnostics.push({ lang, route: routeName, type: 'console-error', message: safe(message.text()) }); });
    page.on('pageerror', error => diagnostics.push({ lang, route: routeName, type: 'page-error', message: safe(error.message) }));
    page.on('requestfailed', request => diagnostics.push({ lang, route: routeName, type: 'request-failed', path: safe(request.url()), failure: request.failure()?.errorText }));
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 700 });
      for (const module of ['events', 'guests', 'seating', 'gifts', 'budget', 'settings', 'qr']) {
        routeName = module === 'events' ? '/app/events' : `/app/events/101/${module}`;
        await page.goto(routeName, { waitUntil: 'domcontentloaded' });
        const selector = { events: '.event-card', guests: '.guest-page-header', seating: '.seating-page', gifts: '.wg-page', budget: '.exp-page', settings: '.event-settings', qr: '.qr-card' }[module];
        await expect(page.locator(selector).first()).toBeVisible();
        await expect(page.locator('.kp-site-preloader')).toHaveCount(0);
        if (module === 'events' && width === 320 && lang === 'en') {
          await page.locator('.event-card').last().scrollIntoViewIfNeeded();
          await expect(page.locator('.event-card').last()).toHaveCSS('opacity', '1');
          await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
          await page.screenshot({ path: evidencePath('phase5/screenshots/after/events-en-320.png'), fullPage: true });
        }
        const geometry = await page.evaluate(() => ({ viewport: innerWidth, documentWidth: document.documentElement.scrollWidth, language: localStorage.getItem('koupreng.lang') }));
        expect(geometry.documentWidth).toBe(width); expect(geometry.language).toBe(lang);
        measurements.push({ route: routeName, lang, width, height: 700, ...geometry });
      }
    }
    await context.close();
  }
  await writeFile(evidencePath('phase5/metadata/console-network-review.json'), JSON.stringify({ provenance: 'Fictional browser contracts; no live data/provider assertion', measurements, diagnostics }, null, 2));
  expect(diagnostics.filter(item => item.type === 'page-error')).toEqual([]);
});
