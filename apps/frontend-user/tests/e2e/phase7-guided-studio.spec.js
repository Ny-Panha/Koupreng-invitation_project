import { test, expect } from '@playwright/test';
import { installIdentityFixtures } from './support/templateIdentityFixtures.js';

test.use({ reducedMotion: 'reduce' });
for (const width of [320, 360, 375, 390, 430, 768, 1024, 1366, 1440, 1920]) {
  test(`guided Studio at ${width}px preserves editing and preview focus`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await installIdentityFixtures(page);
    await page.goto('/app/events/101/invitation?mode=guided', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.invitation-studio')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Creation steps' })).toBeVisible();
    const title = page.getByRole('textbox', { name: 'Main Title', exact: true });
    await title.fill(`Draft at ${width}`);
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'saved');
    await title.focus();
    await page.getByRole('button', { name: 'Preview invitation', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Invitation preview' })).toBeVisible();
    await page.getByRole('button', { name: 'Return to editing', exact: true }).click();
    await expect(title).toBeFocused();
    await expect(title).toHaveValue(`Draft at ${width}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    if (width < 768) {
      const save = await page.getByRole('button', { name: 'Save', exact: true }).boundingBox();
      expect(save.y + save.height).toBeLessThanOrEqual(900);
      expect(save.height).toBeGreaterThanOrEqual(44);
    }
    await page.screenshot({ path: info.outputPath(`guided-studio-${width}.png`), fullPage: true });
    await page.getByRole('button', { name: 'Advanced editor', exact: true }).click();
    if (width < 1024) await expect(page.locator('.studio-section-select select')).toBeVisible();
    else await expect(page.getByRole('button', { name: 'Schedule', exact: true })).toBeVisible();
  });
}

test('a newer server version preserves the draft and suspends write retries', async ({ page }) => {
  await installIdentityFixtures(page);
  let writes = 0;
  await page.route('**/api/v1/invitations/101', async route => {
    if (route.request().method() !== 'PUT') return route.fallback();
    writes++;
    await route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ message: 'Invitation was updated elsewhere' }) });
  });
  await page.goto('/app/events/101/invitation?mode=guided', { waitUntil: 'domcontentloaded' });
  const title = page.getByRole('textbox', { name: 'Main Title', exact: true });
  await title.fill('Keep my conflicting draft');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'conflict');
  await expect(title).toHaveValue('Keep my conflicting draft');
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Download unsaved draft' })).toBeVisible();
  await title.fill('Still retained');
  expect(writes).toBe(1);
});
