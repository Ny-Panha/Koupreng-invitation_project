import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { installPhase4Fixtures } from './support/phase4Fixtures.js';

test('CSV/XLSX downloads, mapping, validation, duplicate skip, confirmation and uncertain retry', async ({ page }) => {
  const state = await installPhase4Fixtures(page, { count: 1 });
  const receipts = new Map(); let loseResponse = true; const committedIds = [];
  await page.route('**/api/v1/invitations/101/guests/import-batch**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/inspect')) return route.fulfill({ json: { data: { worksheets: [{ name: 'Guests', headers: ['ឈ្មោះភ្ញៀវ', 'Phone', 'Guest Count', 'Email', 'Notes'], rows: [
      { rowNumber: 2, values: ['ភ្ញៀវគំរូ ក', '012000001', '2', 'fictional@example.test', 'Fictional multiline\nnote'], issues: [] },
      { rowNumber: 3, values: ['', '12000002', '0', 'bad-email', 'Correct source or skip'], issues: [] },
      { rowNumber: 4, values: ['Contact match', '012340000', '1', '', ''], issues: [] },
    ] }] } } });
    const payload = route.request().postDataJSON();
    const rows = payload.rows.map(row => ({ rowNumber: row.rowNumber, status: row.skip ? 'SKIPPED' : !row.guest.guestName ? 'INVALID' : row.guest.phone === '012340000' ? 'DUPLICATE' : 'READY', issues: row.skip ? ['Skipped by host'] : !row.guest.guestName ? ['Guest name is required; phone must start with 0 or +country code'] : row.guest.phone === '012340000' ? ['Shared contact; no automatic merge'] : [] }));
    if (path.endsWith('/preview')) return route.fulfill({ json: { data: { batchId: payload.batchId, committed: false, rows } } });
    committedIds.push(payload.batchId);
    if (!receipts.has(payload.batchId)) {
      for (const row of payload.rows.filter(row => !row.skip)) state.guests.push({ ...row.guest, seatCount: Number(row.guest.seatCount), id: 900 + state.guests.length, invitationId: 101 });
      receipts.set(payload.batchId, { batchId: payload.batchId, committed: true, importedCount: 1, updatedCount: 0, skippedCount: 2, failedCount: 0, rows: rows.map(row => ({ ...row, status: row.status === 'READY' ? 'IMPORTED' : row.status })) });
    }
    if (loseResponse) { loseResponse = false; return route.abort('failed'); }
    return route.fulfill({ json: { data: receipts.get(payload.batchId) } });
  });
  await page.goto('/app/events/101/guests', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Import/ }).first().click();
  const dialog = page.getByRole('dialog', { name: 'Import guests' });
  await expect(dialog).toBeVisible();
  await mkdir('D:/Koupreng-UXUI-Phase5/screenshots/guest-import', { recursive: true });
  const capture = async state => {
    for (const width of [320, 375, 390, 430, 768, 1024, 1366, 1440, 1920]) {
      await page.setViewportSize({ width, height: width === 1366 ? 700 : width < 500 ? 700 : 900 });
      await page.screenshot({ path: `D:/Koupreng-UXUI-Phase5/screenshots/guest-import/${state}-${width}.png` });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    }
  };
  await capture('source');
  for (const ext of ['CSV', 'XLSX']) {
    const download = page.waitForEvent('download'); await dialog.getByRole('link', { name: ext, exact: true }).click();
    const file = await download; expect(file.suggestedFilename()).toBe(`Koupreng-Guest-Import-Template.${ext.toLowerCase()}`);
    await file.saveAs(`D:/Koupreng-UXUI-Phase5/examples/browser-${file.suggestedFilename()}`);
  }
  await dialog.getByLabel('Guest import file').setInputFiles('public/downloads/Koupreng-Guest-Import-Template.xlsx');
  await expect(dialog.getByLabel('Map ឈ្មោះភ្ញៀវ')).toHaveValue('guestName');
  await expect(dialog.getByLabel('Map Phone')).toHaveValue('phone');
  await capture('mapping');
  await dialog.getByRole('button', { name: 'Validate rows', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'Review import', exact: true })).toBeDisabled();
  expect(committedIds).toHaveLength(0);
  await dialog.getByLabel('Show rows').selectOption('issues');
  await capture('errors-duplicates');
  await dialog.getByRole('button', { name: 'Skip rows needing review', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'Review import', exact: true })).toBeEnabled();
  await dialog.getByRole('button', { name: 'Review import', exact: true }).click();
  expect(committedIds).toHaveLength(0); await capture('confirm');
  await dialog.getByRole('button', { name: 'Confirm import', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'Retry same batch' })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Back', exact: true })).toBeDisabled();
  await dialog.getByRole('button', { name: 'Retry same batch' }).click();
  await expect(dialog.getByText('Import saved to this event')).toBeVisible();
  expect(committedIds).toHaveLength(2); expect(committedIds[0]).toBe(committedIds[1]);
  expect(state.guests.filter(guest => guest.guestName === 'ភ្ញៀវគំរូ ក')).toHaveLength(1);
  await capture('result');
  const download = page.waitForEvent('download'); await dialog.getByRole('button', { name: 'Download error report' }).click();
  expect((await download).suggestedFilename()).toBe('Koupreng-Guest-Import-Errors.csv');
  await dialog.getByRole('button', { name: 'View guests' }).click();
  await page.reload({ waitUntil: 'domcontentloaded' }); await expect(page.getByText('ភ្ញៀវគំរូ ក', { exact: true })).toBeVisible();
});
