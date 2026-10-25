import { test, expect } from '@playwright/test';
import { phase8Fixtures } from './support/phase8Fixtures';
import fs from 'node:fs/promises';

for (const lang of ['en', 'kh']) for (const width of [390, 1440]) {
  test(`initial production build ${lang} ${width}`, async ({ page }) => {
    await phase8Fixtures(page, { lang });
    await page.setViewportSize({ width, height: 960 });
    await fs.mkdir('../../docs/phase9/evidence/before', { recursive: true });
    for (const [name, route] of [['landing', '/'], ['login', '/login'], ['events', '/app/events'], ['dashboard', '/app/events/101'], ['marketplace', '/templates'], ['studio', '/app/events/101/invitation'], ['packages', '/app/packages'], ['public', '/i/review-celestial']]) {
      await page.goto(route);
      await expect(page.getByRole('heading').first()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: `../../docs/phase9/evidence/before/${name}-${lang}-${width}.png`, fullPage: true, animations: 'disabled' });
    }
  });
}
