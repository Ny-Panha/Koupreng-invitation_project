import { test, expect } from '@playwright/test';
import { installPhase2Fixtures } from './support/phase2Fixtures.js';

test('public sample is opt-in, uses the real renderer and releases the frame on close', async ({ page }, testInfo) => {
  await installPhase2Fixtures(page, { anonymous: true });
  await page.goto('/');
  const open = page.getByRole('button', { name: 'Try the invitation', exact: true });
  await expect(open).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);
  await page.screenshot({ path: `D:/Koupreng-UXUI-Phase2/screenshots/milestone3/hero-${testInfo.project.name}.png` });
  await open.click();
  const frame = page.locator('iframe.public-demo-iframe');
  await expect(frame).toHaveCount(1);
  await expect(page.frameLocator('iframe.public-demo-iframe').locator('[data-template-renderer="silk-heritage"]')).toBeAttached({ timeout: 25000 });
  await expect(frame).toHaveClass(/is-ready/);
  expect(await frame.evaluate(e => ({ width: e.offsetWidth, height: e.offsetHeight }))).toEqual({ width: 440, height: 860 });
  expect(await frame.evaluate(e => ({ width: e.parentElement.offsetWidth, height: e.parentElement.offsetHeight }))).toEqual({ width: 440, height: 860 });
  await page.screenshot({ path: `D:/Koupreng-UXUI-Phase2/screenshots/milestone3/live-${testInfo.project.name}.png` });
  await frame.focus();
  await page.keyboard.press('Escape');
  await expect(frame).toHaveCount(0);
  await expect(open).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('sample timeout provides retry and a full-demo escape route', async ({ page }) => {
  await installPhase2Fixtures(page, { anonymous: true });
  await page.route('**/templates/silk-heritage?embed=demo', route => route.fulfill({ contentType: 'text/html', body: '<p>Fixture: renderer unavailable</p>' }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Try the invitation', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'The sample could not open here' })).toBeVisible({ timeout: 25000 });
  const region = page.viewportSize().width < 768 ? page.getByRole('dialog') : page.locator('.public-invitation-demo');
  await expect(region.getByRole('link', { name: 'View the full demo' })).toHaveAttribute('href', '/templates/silk-heritage');
  await region.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(region.getByRole('status')).toHaveText('Opening the invitation…');
});
