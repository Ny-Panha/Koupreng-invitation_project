import { expect, test } from '@playwright/test';
import { installPhase4Fixtures } from './support/phase4Fixtures.js';

test('task scroll leaves desktop context and footer stationary; menu scroll is independent', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 700 });
  await installPhase4Fixtures(page);
  await page.goto('/app/events/101/guests');
  const sidebar = page.locator('.event-workspace-sidebar'), main = page.locator('.event-workspace-main');
  await expect(page.getByText('Review Guest 1', { exact: true })).toBeVisible();
  const start = await sidebar.boundingBox();
  for (const distance of [400, 500, 100000]) {
    await main.evaluate((e, dy) => { e.scrollTop += dy; }, distance);
    expect((await sidebar.boundingBox()).y).toBeCloseTo(start.y, 0);
    expect(await main.evaluate(e => e.scrollTop)).toBeGreaterThan(0);
    await expect(page.getByLabel('Switch event', { exact: true })).toBeInViewport();
    await expect(page.getByRole('button', { name: 'Collapse navigation', exact: true })).toBeInViewport();
  }
  const scroll = await main.evaluate(e => e.scrollTop);
  await page.locator('.event-navigation-body').evaluate(e => { e.scrollTop = e.scrollHeight; });
  expect(await main.evaluate(e => e.scrollTop)).toBe(scroll);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(1440);
});

test('create and edit share fields and preserve optional and backend-owned values across refresh', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const state = await installPhase4Fixtures(page, { count: 1 });
  await page.goto('/app/events/101/guests');
  await page.getByRole('button', { name: 'Add guest', exact: true }).click();
  await page.locator('#guestForm-name').fill('Phase 4 Review');
  await page.locator('#guestForm-phone').fill('012345678');
  await page.locator('#guestForm-count').fill('3');
  await page.locator('#guestForm-group').selectOption('Bride Side');
  await page.locator('#guestForm-category').selectOption('Family');
  await page.locator('.guest-form-details summary').click();
  await page.locator('#guestForm-email').fill('phase4@example.test');
  await page.locator('#guestForm-note').fill('Keep this note');
  await page.locator('#guestForm-companionName').fill('Review Companion');
  await page.getByRole('dialog').getByRole('button', { name: 'Add guest', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.reload();
  const row = page.locator('tr').filter({ hasText: 'Phase 4 Review' });
  await row.getByRole('button', { name: 'Edit', exact: true }).click();
  for (const [field, value] of Object.entries({ phone: '012345678', count: '3', group: 'Bride Side', category: 'Family', email: 'phase4@example.test', note: 'Keep this note', companionName: 'Review Companion' })) await expect(page.locator(`#guestForm-${field}`)).toHaveValue(value);
  await page.locator('#guestForm-phone').fill('+855 98 765 432');
  await page.locator('#guestForm-count').fill('4');
  await page.locator('#guestForm-group').selectOption('Groom Side');
  await page.getByRole('dialog').getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.reload(); await row.getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(page.locator('#guestForm-phone')).toHaveValue('+855 98 765 432');
  await expect(page.locator('#guestForm-group')).toHaveValue('Groom Side');
  await expect(page.locator('#guestForm-count')).toHaveValue('4');
  await expect(page.locator('#guestForm-email')).toHaveValue('phase4@example.test');
  expect(state.guests.find(g => g.guestName === 'Phase 4 Review').note).toBe('Keep this note');
});

test('validation, dirty cancellation and API failure keep entered guest data', async ({ page }) => {
  await installPhase4Fixtures(page, { count: 1 });
  await page.goto('/app/events/101/guests');
  await page.getByRole('button', { name: 'Add guest', exact: true }).click();
  await page.locator('#guestForm-name').fill('Keep on failure');
  await page.locator('#guestForm-phone').fill('123');
  await page.getByRole('dialog').getByRole('button', { name: 'Add guest', exact: true }).click();
  await expect(page.locator('#guestForm-phone')).toBeFocused();
  await expect(page.locator('#guest-phone-error')).toBeVisible();
  await page.locator('#guestForm-phone').fill('012345678');
  await page.route('**/api/v1/invitations/101/guests', route => route.request().method() === 'POST' ? route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Review save failure' }) }) : route.fallback());
  await page.getByRole('dialog').getByRole('button', { name: 'Add guest', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('alert').first()).toBeVisible();
  await expect(page.locator('#guestForm-name')).toHaveValue('Keep on failure');
  page.once('dialog', dialog => dialog.dismiss());
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeVisible();
});
