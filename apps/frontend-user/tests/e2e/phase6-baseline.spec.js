import { test, expect } from '@playwright/test';
import process from 'node:process';
import { installIdentityFixtures } from './support/templateIdentityFixtures.js';

test('Phase 6 baseline: saved row dates are invisible and Celestial story editing is missing', async ({ page }) => {
  test.skip(process.env.PHASE6_BASELINE !== 'true', 'Historical reproduction; run only against the Phase 5 baseline.');
  const fixture = await installIdentityFixtures(page);
  await page.goto('/app/events/101/invitation', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.kp-site-preloader')).toBeHidden();
  await page.getByRole('button', { name: 'Schedule', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Our story', exact: true })).toHaveCount(0);
  const dates = page.locator('.pe-editor-column input[type=date]');
  await dates.first().fill('2028-02-29');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect.poll(() => fixture.writes.some(w => JSON.parse(w.payload.contentJson || '{}').schedule?.[0]?.date === '2028-02-29')).toBe(true);
  const frame = page.frameLocator('iframe[title="Live User Template Preview"]');
  await expect(frame.locator('[data-tx-section=schedule]')).toBeAttached();
  await expect(frame.locator('[data-tx-section=schedule]')).not.toContainText('2028-02-29');
  await page.screenshot({ path: 'D:/Koupreng-UXUI-Phase6/screenshots/before/studio-schedule-missing-date-story.png', fullPage: true });
});
