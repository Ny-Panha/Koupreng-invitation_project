import { test, expect } from '@playwright/test';
import { phase9Fixtures } from './support/phase9Fixtures';

test('N13-06 dirty Studio exit honors cancel and explicit leave', async ({ page }) => {
  await phase9Fixtures(page, { lang: 'en', content: { title: 'Original event', photos: [] } });
  await page.goto('/app/events/101/invitation');
  const title = page.locator('[name="title"]');
  await expect(title).toBeVisible();
  // Keep the document dirty even if autosave starts before the pointer action.
  await page.route('**/api/v1/invitations/101', route => route.request().method() === 'PUT'
    ? route.fulfill({ status: 503, json: { message: 'Fixture save unavailable' } }) : route.fallback());
  await title.fill('Keep this unsaved title');
  let allowLeave = false;
  const messages = [];
  page.on('dialog', async dialog => {
    messages.push(dialog.message());
    if (allowLeave) await dialog.accept(); else await dialog.dismiss();
  });
  const exit = page.getByRole('button', { name: 'Back to Event', exact: true });
  await exit.click();
  await expect.poll(() => messages.length).toBe(1);
  expect(messages[0]).toMatch(/not reached the server/i);
  await expect(page).toHaveURL(/\/app\/events\/101\/invitation$/);
  await expect(title).toHaveValue('Keep this unsaved title');
  allowLeave = true;
  await exit.click();
  await expect(page).toHaveURL(/\/app\/events\/101$/);
  expect(messages.length).toBeGreaterThanOrEqual(2);
});
