import { test, expect } from '@playwright/test';
import { phase8Fixtures } from './support/phase8Fixtures';
import { chooseStudioSection } from './support/studioNavigationActions';

for (const lang of ['en','kh']) for (const width of [320,375,390,430,768,1024,1366,1440,1920]) test(`event sections and Studio ${lang} at ${width}px`, async ({ page }, info) => {
  await page.setViewportSize({ width, height: 950 });
  await phase8Fixtures(page, { lang });
  await page.goto('/app/events/101/preview');
  await page.getByRole('button', { name: /^(Open invitation|បើកសំបុត្រអញ្ជើញ)$/ }).click();
  await expect(page.locator('.kp-calendar-event')).toBeVisible(); await page.evaluate(() => document.fonts.ready);
  for (const [name, selector] of [['program','.kp-program'],['save-date','.kp-save-date']]) {
    await page.locator(selector).screenshot({ path: info.outputPath(`${name}-${lang}-${width}.png`), animations: 'disabled' });
    expect(await page.locator(selector).evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  }
  await page.goto('/app/events/101/invitation?mode=advanced');
  await chooseStudioSection(page, 'scheduleVenue', lang === 'en' ? 'Schedule' : 'កាលវិភាគ');
  await expect(page.locator('.studio-program')).toBeVisible();
  await expect(page.locator('.studio-preview-recovery')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath(`program-editor-${lang}-${width}.png`), fullPage: true });
  await chooseStudioSection(page, 'scheduleVenue', lang === 'en' ? 'Save the date & calendar' : 'កំណត់ថ្ងៃ និងប្រតិទិន');
  await expect(page.locator('.studio-date-editor')).toBeVisible();
  await expect(page.locator('.studio-preview-recovery')).toHaveCount(0);
  await page.screenshot({ path: info.outputPath(`date-editor-${lang}-${width}.png`), fullPage: true });
});
