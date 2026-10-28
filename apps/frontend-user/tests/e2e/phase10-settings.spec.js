import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import { phase9Fixtures } from './support/phase9Fixtures';

test('settings entry is read-only, edits persist, and access changes need confirmation', async ({ page }, info) => {
  const { events } = await phase9Fixtures(page);
  const writes = []; page.on('request', request => { if (request.method() === 'PUT') writes.push(request.url()); });
  await page.goto('/app/events/101/settings');
  await expect(page.locator('#event-title')).toBeVisible(); expect(writes).toEqual([]);
  await page.getByLabel('Event title', { exact: false }).fill('Phase 10 settings title');
  await page.getByLabel('RSVP deadline', { exact: true }).fill('2027-12-01');
  await page.getByRole('button', { name: 'Save details', exact: true }).click();
  await expect(page.getByText('Saved to event', { exact: true })).toBeVisible();
  expect(events.get(101).rsvpDeadline).toBe('2027-12-01');
  await page.reload(); await expect(page.getByLabel('RSVP deadline', { exact: true })).toHaveValue('2027-12-01');
  await expect(page.locator('#event-title')).toHaveValue('Phase 10 settings title');
  const savedVisibility = events.get(101).visibility;
  await page.getByRole('combobox', { name: 'Invitation visibility', exact: true }).selectOption(savedVisibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC');
  await page.getByRole('button', { name: 'Save details', exact: true }).click();
  await page.locator('.k-confirm-dialog').getByRole('button',{name:'Cancel',exact:true}).click();
  expect(events.get(101).visibility).toBe(savedVisibility);
  await page.getByRole('button', { name: 'Save details', exact: true }).click();
  await page.locator('.k-confirm-dialog').getByRole('button',{name:'Confirm',exact:true}).click();
  await expect(page.getByText('Saved to event', { exact: true })).toBeVisible();
  expect(events.get(101).visibility).not.toBe(savedVisibility);
  const axe = await new AxeBuilder({ page }).include('.event-settings').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  await info.attach('settings-axe', { body: JSON.stringify(axe), contentType: 'application/json' }); expect(axe.violations).toEqual([]);
});

test('settings reflow and shared values return to Studio', async ({ page }, info) => {
  await fs.mkdir('../../docs/phase10/evidence/after', { recursive: true });
  for (const lang of ['en','kh']) {
    await phase9Fixtures(page, { lang });
    for (const width of [320,390,768,1440]) {
      await page.setViewportSize({ width, height: 960 }); await page.goto('/app/events/101/settings');
      await expect(page.locator('#event-title')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      if (info.project.name === 'chromium' && [390,1440].includes(width)) await page.screenshot({ path: `../../docs/phase10/evidence/after/settings-${lang}-${width}.png`, fullPage: true });
    }
  }
});
