import { evidencePath } from './support/evidencePath';
import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { installPhase5Fixtures } from './support/phase5Fixtures.js';

test.use({ actionTimeout: 10000 });
async function capture(page, name) {
  const folder = evidencePath('phase5/states');
  await mkdir(folder, { recursive: true });
  await expect(page.locator('.kp-site-preloader')).toHaveCount(0);
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: width === 390 ? 700 : 900 });
    const covers = /cover|one-event/.test(name);
    if (covers) {
      await page.locator('.event-card').first().scrollIntoViewIfNeeded();
      await expect(page.locator('.event-card').first()).toHaveCSS('opacity', '1');
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    }
    await page.screenshot({ path: `${folder}/${name}-${width}.png`, fullPage: covers });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  }
}
test('one event, long Khmer title, saved invitation cover and fallback render independently', async ({ page }) => {
  await installPhase5Fixtures(page, { lang: 'km' });
  const event = { id: 101, title: 'សិរីមង្គលអាពាហ៍ពិពាហ៍ ភ្ញៀវគំរូនិងគ្រួសារសម្រាប់ការពិនិត្យរចនា', templateCode: 'khmer-celestial', status: 'DRAFT', coverSource: 'template', templateThumbnailUrl: '/facebook/all/06-card/cover-card.jpg' };
  await page.route('**/api/v1/invitations/my', route => route.fulfill({ json: { data: [event] } }));
  await page.goto('/app/events', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.event-card')).toHaveCount(1);
  await capture(page, 'one-event-long-khmer');
  event.invitationCoverUrl = '/images/wedding/couple-hero-meadow.webp';
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('.event-card img')).toHaveAttribute('src', event.invitationCoverUrl);
  await capture(page, 'saved-studio-cover');
  event.coverSource = 'owner'; event.coverUrl = '/images/wedding/couple-studio-cake.webp';
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('.event-card img')).toHaveAttribute('src', event.coverUrl);
  await capture(page, 'owner-media-cover');
  event.coverUrl = '/missing-phase5-image.jpg'; event.invitationCoverUrl = null;
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('.event-card img')).toHaveAttribute('src', event.templateThumbnailUrl);
  await capture(page, 'broken-cover-fallback');
});
test('seating empty, full table, assignment and selected canvas states', async ({ page }) => {
  const state = await installPhase5Fixtures(page, { count: 3 });
  await page.goto('/app/events/101/seating', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.seating-empty-state')).toBeVisible();
  await capture(page, 'seating-empty');
  state.tables = [{ id: 100, tableName: 'Full family table', capacity: 2 }, { id: 101, tableName: 'Friends table', capacity: 8 }];
  state.assignments = [{ id: 1000, tableId: 100, guestId: 501, guestName: 'Review Guest 1', tableName: 'Full family table', seatCount: 2 }];
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Full family table', { exact: true }).first()).toBeVisible();
  await capture(page, 'seating-full-table');
  await page.setViewportSize({ width: 390, height: 700 });
  await page.locator('.seating-mobile-tabs button').nth(1).click();
  await expect(page.locator('#seating-assignment-guest')).toBeVisible();
  await page.screenshot({ path: evidencePath('phase5/states/seating-assignment-mobile-390.png') });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByTestId('tab-floor-plan').click();
  const table = page.getByRole('button', { name: 'Move table Friends table' });
  await table.focus(); await page.keyboard.press('Enter');
  await page.locator('.sfp-canvas-wrapper').scrollIntoViewIfNeeded();
  await page.screenshot({ path: evidencePath('phase5/states/seating-selected-canvas-1440.png') });
});
test('Khmer import source, explicit mapping and validation errors', async ({ page }) => {
  await installPhase5Fixtures(page, { lang: 'km', empty: true });
  await page.route('**/guests/import-batch/inspect', route => route.fulfill({ json: { data: { worksheets: [{ name: 'Guests', headers: ['ឈ្មោះភ្ញៀវ', 'Phone'], rows: [{ rowNumber: 2, values: ['', '12000001'], issues: [] }] }] } } }));
  await page.route('**/guests/import-batch/preview', route => route.fulfill({ json: { data: { committed: false, rows: [{ rowNumber: 2, status: 'INVALID', issues: ['Guest name is required', 'Phone must start with 0 or +country code; correct the source instead of guessing missing digits'] }] } } }));
  await page.goto('/app/events/101/guests', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.guest-list-panel')).toHaveAttribute('aria-busy', 'false');
  await page.locator('.guest-header-actions button').first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible(); await capture(page, 'import-khmer-source');
  await dialog.locator('input[type="file"]').setInputFiles('public/downloads/Koupreng-Guest-Import-Template.csv');
  await expect(dialog.locator('.import-mapping')).toBeVisible(); await capture(page, 'import-khmer-mapping');
  await dialog.locator('.import-actions button.primary').click();
  await expect(dialog.locator('.import-row-issue').first()).toBeVisible(); await capture(page, 'import-khmer-errors');
});
