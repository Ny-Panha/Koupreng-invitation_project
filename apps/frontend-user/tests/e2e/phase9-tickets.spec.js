import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { phase9Fixtures } from './support/phase9Fixtures';
import { Buffer } from 'node:buffer';

test('ticket images use independent upload, persist cover/background, transform and export actual PNG', async ({ page }, info) => {
  const state = await phase9Fixtures(page);
  await page.goto('/app/events/101/tickets/design');
  const image = { name: 'ticket.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aAccAAAAASUVORK5CYII=', 'base64') };
  await page.getByLabel('Upload Cover image', { exact: true }).setInputFiles(image);
  await expect(page.getByText('Unsaved design', { exact: true })).toBeVisible();
  expect(state.uploads).toEqual(['/api/v1/invitations/101/media/ticket-image']);
  await page.getByLabel('Upload Background', { exact: true }).setInputFiles(image);
  await page.getByRole('combobox', { name: 'Cover fit', exact: true }).selectOption('CONTAIN');
  await page.getByLabel('Vertical focal point', { exact: true }).fill('75');
  await page.getByRole('button', { name: 'Save design', exact: true }).click();
  await expect(page.locator('.ticket-save-status')).toHaveText('Saved');
  const saved = state.design(); expect(saved.coverMediaId).toBeTruthy(); expect(saved.backgroundMediaId).toBeTruthy(); expect(saved.coverFocusY).toBe(75);
  await page.reload();
  await expect(page.getByRole('combobox', { name: 'Cover fit', exact: true })).toHaveValue('CONTAIN');
  await expect(page.getByLabel('Vertical focal point', { exact: true })).toHaveValue('75');
  if (!await page.getByRole('combobox', { name: 'Preview recipient', exact: true }).isVisible()) await page.getByRole('button', { name: 'Preview & export', exact: true }).click();
  await page.getByRole('combobox', { name: 'Preview recipient', exact: true }).selectOption('501');
  await expect(page.locator('.ticket-text-equivalent')).toContainText('Personal guest');
  const download = page.getByRole('button', { name: 'Download PNG · 2×', exact: true });
  await expect(download).toBeEnabled();
  const pending = page.waitForEvent('download'); await download.click(); const file = await pending;
  await file.saveAs(info.outputPath('ticket-with-independent-images.png'));
  expect(await page.locator('.ticket-preview canvas').evaluate(canvas => [canvas.width, canvas.height])).toEqual([1200,1800]);
  // The browser download resolves before WebKit finishes restoring action state.
  await expect(page.locator('.ticket-actions [role="status"]')).toHaveText('PNG ready · 1200 × 1800px');
  const copy = page.getByRole('button', { name: 'Copy invitation link', exact: true });
  await expect(copy).toBeEnabled();
  await expect(copy).toHaveCSS('opacity', '1');
  const axe = await new AxeBuilder({ page }).include('.ticket-studio').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(axe.violations).toEqual([]);
  if (info.project.name === 'chromium') {
    await page.locator('.ticket-studio h1').scrollIntoViewIfNeeded();
    await page.screenshot({ path: '../../docs/phase9/evidence/after/ticket-images-en-1440.png', fullPage: true, animations: 'disabled' });
  }
});

test('invalid upload, server failure and mobile Edit/Preview recover without losing unsaved design', async ({ page }) => {
  await phase9Fixtures(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/app/events/101/tickets/design');
  await page.getByLabel('Upload Cover image', { exact: true }).setInputFiles({ name: 'bad.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') });
  await expect(page.getByRole('alert')).toContainText('Choose a JPEG, PNG or WebP');
  await page.getByLabel('Header', { exact: true }).fill('Keep unsaved ticket header');
  await page.getByRole('button', { name: 'Preview & export', exact: true }).click();
  await expect(page.locator('.ticket-preview')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download PNG · 2×', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(page.getByLabel('Header', { exact: true })).toHaveValue('Keep unsaved ticket header');
  await page.route('**/api/v1/invitations/101/media/ticket-image', route => route.fulfill({ status: 503, json: { message: 'Storage unavailable; retry upload' } }));
  await page.getByLabel('Upload Cover image', { exact: true }).setInputFiles({ name: 'valid.png', mimeType: 'image/png', buffer: Buffer.from('89504e47', 'hex') });
  await expect(page.getByRole('alert')).toContainText('Storage unavailable');
  await expect(page.getByLabel('Header', { exact: true })).toHaveValue('Keep unsaved ticket header');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});
