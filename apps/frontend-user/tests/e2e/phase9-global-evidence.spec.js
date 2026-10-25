import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile, mkdir } from 'node:fs/promises';
import process from 'node:process';
import { phase8Fixtures } from './support/phase8Fixtures';

for (const lang of ['en', 'kh']) for (const width of [390, 1440]) test(`current user route families ${lang} ${width}`, async ({ page }) => {
  await phase8Fixtures(page, { lang }); await page.setViewportSize({ width, height: 960 });
  await mkdir('../../docs/phase9/evidence/after', { recursive: true });
  for (const [name, route] of [['landing', '/'], ['login', '/login'], ['events', '/app/events'], ['dashboard', '/app/events/101'], ['marketplace', '/templates'], ['packages', '/app/packages'], ['public', '/i/review-celestial']]) {
    await page.goto(route);
    await expect(page.getByRole('heading').first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `../../docs/phase9/evidence/after/${name}-${lang}-${width}.png`, fullPage: true, animations: 'disabled' });
  }
});

for (const stage of ['before','after']) for (const lang of ['en','km']) test(`actual disposable admin ${stage} ${lang}`, async ({ page }, info) => {
  test.skip(!process.env.PHASE9_ADMIN_BROWSER_FIXTURES, 'Requires explicit fictional local admin credentials.');
  const fixture = JSON.parse(await readFile(process.env.PHASE9_ADMIN_BROWSER_FIXTURES, 'utf8'));
  expect(fixture.email).toMatch(/^phase9-admin-.*@example\.test$/);
  const origin = `http://127.0.0.1:${stage === 'before' ? 4293 : 4292}`;
  await page.addInitScript(lang => localStorage.setItem('koupreng.admin.lang', lang), lang);
  await page.goto(origin + '/login'); await page.locator('#identifier').fill(fixture.email); await page.locator('#password').fill(fixture.password);
  await page.locator('button[type=submit]').click(); await expect(page).toHaveURL(new RegExp(`${origin}/dashboard`));
  await mkdir('../../docs/phase9/evidence/live', { recursive: true });
  for (const width of [390,1440]) {
    await page.setViewportSize({ width, height: 960 });
    for (const screen of ['dashboard','reports']) {
      await page.goto(origin + '/' + screen);
      await expect(page.getByRole('main').getByRole('heading', { level: 2 }).first()).toBeVisible();
      if (screen === 'reports') {
        await expect(page.locator('.report-skeleton')).toHaveCount(0);
        await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
      }
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: `../../docs/phase9/evidence/live/admin-${stage}-${screen}-${lang}-${width}.png`, fullPage: true, animations: 'disabled' });
      if (stage === 'after') {
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
        const axe = await new AxeBuilder({ page }).include('main').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
        await info.attach(`admin-${screen}-${lang}-${width}-axe.json`, { body: JSON.stringify(axe), contentType: 'application/json' });
        expect(axe.violations).toEqual([]);
      }
    }
  }
});
