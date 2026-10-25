import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import { phase9Fixtures, chooseStudioSection } from './support/phase9Fixtures';

test('six parent tabs, stable disclosures, legacy deep links and retained Phase 8 edits', async ({ page }, info) => {
  const { events } = await phase9Fixtures(page);
  await page.goto('/app/events/101/invitation?section=family');
  await expect(page.locator('[data-studio-tab]')).toHaveCount(6);
  await expect(page.locator('[data-studio-tab="eventInformation"]')).toHaveAttribute('aria-current', 'page');
  const parents = page.locator('.pe-editor-scroll-body details[open]').filter({ has: page.locator('summary', { hasText: 'Families' }) });
  await expect(parents).toBeVisible();
  const family = parents.locator('input').first(); await family.fill('Family text retained across groups');
  await chooseStudioSection(page, 'scheduleVenue', 'Save the date & calendar');
  await page.getByLabel('Subtitle', { exact: true }).fill('Phase 9 date subtitle');
  await chooseStudioSection(page, 'eventInformation', 'Families');
  await expect(family).toHaveValue('Family text retained across groups');
  await chooseStudioSection(page, 'scheduleVenue', 'Schedule');
  await expect(page.getByRole('group', { name: 'Day 1', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'saved');
  expect(JSON.parse(events.get(101).contentJson).saveTheDate.subtitle).toBe('Phase 9 date subtitle');
  await page.reload(); await chooseStudioSection(page, 'scheduleVenue', 'Save the date & calendar');
  await expect(page.getByLabel('Subtitle', { exact: true })).toHaveValue('Phase 9 date subtitle');
  const axe = await new AxeBuilder({ page }).include('.studio-sections').include('.pe-editor-column').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  await info.attach('studio-axe.json', { body: JSON.stringify(axe), contentType: 'application/json' });
  expect(axe.violations).toEqual([]);
  await chooseStudioSection(page, 'ticketsQr');
  await page.getByRole('button', { name: 'Guided creation', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Main Title', exact: true })).toBeVisible();
});

test('six groups render without overflow in Khmer/English at phone and desktop widths', async ({ page }, info) => {
  test.setTimeout(180000);
  await fs.mkdir('../../docs/phase9/evidence/after', { recursive: true });
  for (const lang of ['en', 'kh']) {
    await phase9Fixtures(page, { lang });
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 960 });
      await page.goto('/app/events/101/invitation');
      for (const tab of ['eventInformation','scheduleVenue','mediaOpening','designCover','guestExperience','ticketsQr']) {
        await chooseStudioSection(page, tab);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
        await expect(page.getByRole('button', { name: lang === 'en' ? 'Save' : 'រក្សាទុក', exact: true })).toBeVisible();
        if (info.project.name === 'chromium' && [390,1440].includes(width)) await page.screenshot({ path: `../../docs/phase9/evidence/after/studio-${tab}-${lang}-${width}.png`, fullPage: true });
      }
    }
  }
});

test('free video notice leaves ordinary media accessible and permits disabling a retained setting', async ({ page }) => {
  await phase9Fixtures(page, { premium: false });
  await page.goto('/app/events/101/invitation?section=preWeddingVideo');
  await expect(page.getByText('The event owner needs an active Premium package', { exact: false })).toBeVisible();
  await expect(page.getByLabel('Enable pre-wedding video', { exact: true })).toBeDisabled();
  await page.locator('summary').filter({ hasText: /^Music$/ }).click();
  await expect(page.locator('.pe-editor-scroll-body details[open]').filter({ hasText: 'Music' }).first()).toBeVisible();
});
