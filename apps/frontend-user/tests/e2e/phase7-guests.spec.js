import { expect, test } from '@playwright/test';
import { installPhase4Fixtures } from './support/phase4Fixtures.js';

test('server pages, RSVP filters and selected exports keep record and seat units distinct', async ({ page }, info) => {
  const state = await installPhase4Fixtures(page, { count: 61 });
  const forbidden = [];
  page.on('request', request => {
    if (/\/api\/v1\/invitations\/101\/(guests|rsvps|check-in)$/.test(new URL(request.url()).pathname)) forbidden.push(request.url());
  });
  await page.goto('/app/events/101/guests');
  await expect(page.locator('.guest-results-summary')).toContainText('25 / 61 guests');
  await expect(page.locator('.pe-summary-card strong').first()).toHaveText('61');
  if (info.project.name === 'mobile-chromium') {
    for (const checkbox of await page.getByRole('checkbox', { name: /^Select guest:/ }).all()) await checkbox.check();
  } else await page.getByLabel('Select all guests on this page').check();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export selected (25)', exact: true }).click();
  await (await download).saveAs(info.outputPath('fictional-selected-guests.csv'));
  expect(state.selectionExports[0]).toHaveLength(25);
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Export selected (0)', exact: true })).toBeDisabled();
  await expect.poll(() => state.pageReads.at(-1)?.page).toBe('1');
  await page.getByRole('button', { name: /^Confirmed RSVP/ }).click();
  await expect(page.locator('.guest-results-summary')).toContainText('1 / 1 guests');
  await expect.poll(() => state.pageReads.at(-1)?.status).toBe('attending');
  expect(state.pageReads.at(-1).page).toBe('0');
  expect(forbidden).toEqual([]);
});

for (const lang of ['en', 'kh']) {
  test(`guest dashboard reflows in ${lang} with real labels and bounded rows`, async ({ page }, info) => {
    await installPhase4Fixtures(page, { count: 3, lang });
    await page.goto('/app/events/101/guests');
    await expect(page.locator('.guest-record-row')).toHaveCount(3);
    for (const width of [320, 375, 390, 430, 768, 1024, 1366, 1440, 1920]) {
      await page.setViewportSize({ width, height: width < 500 ? 780 : 950 });
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      await page.screenshot({ path: info.outputPath(`guests-${lang}-${width}.png`), fullPage: true });
    }
  });
}
