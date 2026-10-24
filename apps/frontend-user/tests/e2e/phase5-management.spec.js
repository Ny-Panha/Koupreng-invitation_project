import { expect, test } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { installPhase5Fixtures } from './support/phase5Fixtures.js';
import { installIdentityFixtures } from './support/templateIdentityFixtures.js';
test.use({ actionTimeout: 10000 });

async function capture(page, name) {
  await mkdir('D:/Koupreng-UXUI-Phase5/screenshots/after/management', { recursive: true });
  for (const width of [320, 375, 390, 430, 768, 1024, 1366, 1440, 1920]) {
    await page.setViewportSize({ width, height: width === 1366 ? 700 : width < 500 ? 700 : 900 });
    await page.screenshot({ path: `D:/Koupreng-UXUI-Phase5/screenshots/after/management/${name}-${width}.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  }
}

test('manual gift dialog preserves KHR entries and reuses the retry identity after an uncertain save', async ({ page }) => {
  test.setTimeout(120000);
  const state = await installPhase5Fixtures(page);
  await page.goto('/app/events/101/gifts', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.wg-inline-form-row')).toHaveCount(0);
  await capture(page, 'gifts-populated');
  await page.getByRole('button', { name: 'Record New Gift', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Contributor Name', exact: true }).click();
  await dialog.getByPlaceholder(/Search|enter|name/i).fill('Fictional aunt');
  await dialog.getByRole('button', { name: /Use new name/ }).click();
  await dialog.getByLabel('Amount', { exact: true }).fill('40000');
  await dialog.getByRole('combobox', { name: 'Currency', exact: true }).selectOption('KHR');
  await dialog.getByRole('combobox', { name: 'Payment Method', exact: true }).selectOption('ABA');
  await capture(page, 'gift-dialog');
  state.loseGiftResponse = true;
  await dialog.getByRole('button', { name: 'Record gift', exact: true }).click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(dialog.getByLabel('Amount', { exact: true })).toHaveValue('40000');
  await dialog.getByRole('button', { name: 'Record gift', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  expect(state.giftRequests).toHaveLength(2); expect(state.giftRequests[0].clientRequestId).toBe(state.giftRequests[1].clientRequestId);
  expect(state.gifts.filter(gift => gift.name === 'Fictional aunt')).toHaveLength(1);
  const row = page.locator('.wg-table tbody tr').filter({ hasText: 'Fictional aunt' });
  await expect(row).toContainText('Manual record'); await expect(row).toContainText('៛');
  await row.getByRole('button', { name: 'Edit', exact: true }).click();
  await dialog.getByLabel('Wishes / Notes').fill('Edited fictional record');
  await dialog.getByRole('button', { name: 'Save Gift Record', exact: true }).click();
  await expect(dialog).toHaveCount(0); await expect(row).toContainText('Edited fictional record');
  page.once('dialog', dialog => dialog.accept()); await row.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(row).toHaveCount(0);
});

test('budget keeps separate currencies and an accessible expense dialog', async ({ page }) => {
  test.setTimeout(120000);
  await installPhase5Fixtures(page);
  await page.goto('/app/events/101/budget', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Fictional venue', { exact: true })).toBeVisible();
  await capture(page, 'budget-populated');
  await page.getByRole('button', { name: 'Add Expense', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Expense Item Name').fill('Fictional catering');
  await dialog.getByLabel('Currency', { exact: true }).selectOption('KHR');
  await dialog.getByLabel(/Estimated Budget/).fill('200000');
  await dialog.getByRole('button', { name: 'Add Payment Entry' }).click();
  await dialog.locator('.exp-payment-amount').fill('40000');
  await capture(page, 'expense-dialog');
  await dialog.getByRole('button', { name: 'Save Expense', exact: true }).click();
  await expect(dialog).toHaveCount(0); await expect(page.getByText('Fictional catering', { exact: true })).toBeVisible();
  const row = page.locator('.exp-table tbody tr').filter({ hasText: 'Fictional catering' });
  await row.getByRole('button', { name: 'Edit', exact: true }).click();
  await dialog.getByLabel('Expense Item Name').fill('Fictional catering updated');
  await dialog.getByRole('button', { name: 'Save Expense', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  const updated = page.locator('.exp-table tbody tr').filter({ hasText: 'Fictional catering updated' });
  page.once('dialog', dialog => dialog.accept()); await updated.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(updated).toHaveCount(0);
});

test('settings preserve address and maps separately through refresh and Studio publishing', async ({ page }) => {
  const fixture = await installIdentityFixtures(page);
  const event = fixture.events.get(101);
  Object.assign(event, { eventDate: '2026-12-20', eventTime: '17:30:00', venueName: 'Fictional Garden', venueAddress: 'Old fictional address', googleMapUrl: 'https://maps.google.com/?q=Old', contentJson: JSON.stringify({ venueAddress: 'Old fictional address', googleMapUrl: 'https://maps.google.com/?q=Old', event: { venueAddress: 'Old fictional address', mapLink: 'https://maps.google.com/?q=Old' } }) });
  await page.route('**/api/v1/invitations/101/publish', route => {
    const saved = fixture.events.get(101);
    if (!saved.venueAddress) return route.fulfill({ status: 400, json: { message: 'Publish requirements missing: venueAddress' } });
    fixture.events.set(101, { ...saved, status: 'PUBLISHED' });
    return route.fulfill({ json: { data: fixture.events.get(101) } });
  });
  await page.goto('/app/events/101/settings', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Address (optional)', { exact: false }).fill('Fictional Garden, Phnom Penh');
  await page.getByLabel('Google Maps link (optional)', { exact: true }).fill('https://maps.google.com/?q=Phnom+Penh');
  await page.getByRole('button', { name: 'Save details', exact: true }).click();
  await expect(page.getByText('Saved to event', { exact: true })).toBeVisible();
  const originalViewport = page.viewportSize();
  await capture(page, 'settings-saved');
  await page.setViewportSize(originalViewport);
  await page.reload({ waitUntil: 'domcontentloaded' }); await expect(page.getByLabel('Address (optional)', { exact: false })).toHaveValue('Fictional Garden, Phnom Penh');
  const content = JSON.parse(fixture.events.get(101).contentJson); expect(content.event.mapLink).toBe('https://maps.google.com/?q=Phnom+Penh');
  await page.getByRole('link', { name: 'Open invitation Studio' }).click();
  if (page.viewportSize().width < 1024) await page.locator('.studio-section-select select').selectOption('venue');
  else await page.getByRole('button', { name: 'Venue & map', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Venue address', exact: true })).toHaveValue('Fictional Garden, Phnom Penh');
  await page.getByRole('button', { name: 'Publish', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Publish', exact: true })).toHaveCount(0);
});

test('general invitation QR downloads a decodable PNG for the exact public destination', async ({ page }) => {
  await installPhase5Fixtures(page);
  await page.goto('/app/events/101/qr', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.qr-image')).toBeVisible(); await capture(page, 'qr');
  const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download QR Code (PNG)' }).click();
  const file = await download, saved = 'D:/Koupreng-UXUI-Phase5/examples/general-invitation-qr.png'; await file.saveAs(saved);
  const require = createRequire(import.meta.url);
  await page.addScriptTag({ path: require.resolve('jsqr') });
  const png = (await readFile(saved)).toString('base64');
  const decoded = await page.evaluate(async encoded => {
    const image = new Image(); image.src = `data:image/png;base64,${encoded}`; await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
    const context = canvas.getContext('2d'); context.drawImage(image,0,0); const pixels = context.getImageData(0,0,image.width,image.height);
    return window.jsQR(pixels.data,image.width,image.height)?.data;
  },png);
  expect(decoded).toBe('https://koupreng.example/i/audit-event');
  await writeFile('D:/Koupreng-UXUI-Phase5/metadata/qr-decoder.json',JSON.stringify({ decoder:'jsQR in Chromium canvas',decoded,source:'downloaded PNG; fictional public invitation fixture',physicalScan:false },null,2));
});

test('empty gift and expense workspaces remain compact and offer real creation actions', async ({ page }) => {
  await installPhase5Fixtures(page,{empty:true});
  for (const module of ['gifts','budget']) {
    await page.goto(`/app/events/101/${module}`, { waitUntil: 'domcontentloaded' }); await expect(page.getByRole('heading',{level:1})).toBeVisible();
    if (module === 'budget') await expect(page.locator('.exp-filter-bar')).toHaveCount(0);
    await capture(page,`${module}-empty`);
  }
});
