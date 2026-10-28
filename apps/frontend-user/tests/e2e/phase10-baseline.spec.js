import process from 'node:process';
import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import { phase9Fixtures } from './support/phase9Fixtures';

test('original Phase 9 build with identical Phase 10 fixtures', async ({ page }) => {
  test.skip(process.env.PHASE10_CAPTURE_BASELINE !== 'true','Historical baseline capture is opt-in');
  test.setTimeout(180000);
  await fs.mkdir('../../docs/phase10/evidence/before', { recursive: true });
  for (const lang of ['en', 'kh']) {
    await phase9Fixtures(page, { lang });
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 960 });
      for (const [name, route, ready] of [
        ['studio', '/app/events/101/invitation', '.pe-editor-column input'],
        ['settings', '/app/events/101/settings', '#event-title'],
        ['celestial', '/templates/khmer-celestial/preview', '.kc-root'],
      ]) {
        await page.goto(route); await expect(page.locator(ready).first()).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ path: `../../docs/phase10/evidence/before/${name}-${lang}-${width}.png`, fullPage: true });
      }
    }
  }
});
