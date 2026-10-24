import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import process from 'node:process';

// Opt in only to a deliberately isolated backend. No traces or auth files are saved.
test.use({ trace: 'off', actionTimeout: 15000, navigationTimeout: 20000 });
test('real CSV/XLSX imports and cover changes round-trip through isolated MySQL and storage', async ({ page, request }) => {
  test.skip(process.env.PHASE5_LIVE_API !== 'http://127.0.0.1:8185', 'Requires the isolated Phase 5 MySQL API');
  expect(process.env.BACKEND_PORT).toBe('8185');
  test.setTimeout(120000);
  const api = process.env.PHASE5_LIVE_API;
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const unwrap = async response => { expect(response.ok()).toBeTruthy(); const body = await response.json(); return body.data ?? body; };
  const register = async () => unwrap(await request.post(`${api}/api/v1/auth/register`, { data: {
    fullName: 'Fictional Browser Host', email: `phase5-${randomUUID()}@example.test`, password: `ExampleA1!${randomUUID()}`,
  } }));
  const auth = await register();
  expect(typeof auth.accessToken).toBe('string');
  const headers = { Authorization: `Bearer ${auth.accessToken}` };
  const catalog = await unwrap(await request.get(`${api}/api/v1/templates`));
  const template = catalog.find(item => item.code === 'khmer-celestial' && !item.premium) || catalog.find(item => !item.premium);
  expect(template).toBeTruthy();
  const event = await unwrap(await request.post(`${api}/api/v1/invitations`, { headers, data: {
    templateId: template.id, clientRequestId: randomUUID(), title: 'Fictional MySQL Import Review', eventType: 'WEDDING',
    brideName: 'Fictional Bride', groomName: 'Fictional Groom', eventDate: '2027-01-12', eventTime: '17:00',
    venueName: 'Fictional Review Hall', venueAddress: 'Fictional venue, Phnom Penh', visibility: 'PUBLIC',
  } }));
  const eventId = event.id;
  expect(Number.isInteger(eventId)).toBeTruthy();
  const root = `${api}/api/v1/invitations/${eventId}`;
  let batch;
  await page.addInitScript(value => { sessionStorage.setItem('koupreng.auth', JSON.stringify(value)); localStorage.setItem('koupreng.lang', 'en'); }, auth);
  page.on('request', req => {
    const url = new URL(req.url());
    if (req.method() === 'POST' && url.pathname.endsWith('/guests/import-batch')) batch = req.postDataJSON();
  });
  await page.goto('/app/events', { waitUntil: 'domcontentloaded' });
  const card = page.getByRole('article', { name: 'Fictional MySQL Import Review' });
  await expect(card).toBeVisible();
  await expect(card.locator('img')).toHaveAttribute('src', template.thumbnailUrl);
  const screenshots = 'D:/Koupreng-UXUI-Phase5/screenshots/after';
  await mkdir(screenshots, { recursive: true });
  await page.screenshot({ path: `${screenshots}/live-mysql-draft-cover-1280.png`, fullPage: true });
  // Real owner uploads use the API's isolated local storage, then reconcile list/detail views.
  await page.goto(`/app/events/${eventId}/media`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.media-reference-card')).toBeVisible();
  await page.locator('input[type=file]').setInputFiles('public/images/wedding/couple-hero-meadow.webp');
  await expect(page.getByRole('heading', { name: 'couple-hero-meadow.webp', exact: true })).toBeVisible();
  const uploaded = await unwrap(await request.get(`${api}/api/v1/invitations/my`, { headers }));
  const cover = uploaded.find(item => item.id === eventId);
  expect(cover.coverSource).toBe('owner');
  await page.goto('/app/events', { waitUntil: 'domcontentloaded' });
  await expect(card.locator('img')).toHaveAttribute('src', cover.coverUrl);
  await expect.poll(() => card.locator('img').evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
  await page.screenshot({ path: `${screenshots}/live-mysql-owner-cover-1280.png`, fullPage: true });
  await page.goto(`/app/events/${eventId}/media`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'couple-hero-meadow.webp', exact: true })).toBeVisible();
  const replacement = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Replace', exact: true }).click();
  await (await replacement).setFiles('public/images/wedding/couple-studio-cake.webp');
  await expect(page.getByRole('heading', { name: 'couple-studio-cake.webp', exact: true })).toBeVisible();
  const changedCover = (await unwrap(await request.get(`${api}/api/v1/invitations/my`, { headers }))).find(item => item.id === eventId);
  expect(changedCover.coverUrl).not.toBe(cover.coverUrl);
  await page.goto('/app/events', { waitUntil: 'domcontentloaded' });
  await expect(card.locator('img')).toHaveAttribute('src', changedCover.coverUrl);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(card.locator('img')).toHaveAttribute('src', changedCover.coverUrl);
  await page.screenshot({ path: `${screenshots}/live-mysql-cover-replaced-1280.png`, fullPage: true });
  await page.goto(`/app/events/${eventId}/media`, { waitUntil: 'domcontentloaded' });
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Remove', exact: true }).click();
  await expect(page.locator('.media-reference-card')).toBeVisible();
  await page.goto('/app/events', { waitUntil: 'domcontentloaded' });
  await expect(card.locator('img')).toHaveAttribute('src', template.thumbnailUrl);
  await page.screenshot({ path: `${screenshots}/live-mysql-cover-removed-1280.png`, fullPage: true });
  await page.goto(`/app/events/${eventId}/guests`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.guest-list-panel')).toHaveAttribute('aria-busy', 'false');
  await page.locator('.guest-header-actions button').first().click();
  const dialog = page.getByRole('dialog', { name: 'Import guests' });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('Guest import file').setInputFiles('public/downloads/Koupreng-Guest-Import-Template.xlsx');
  await expect(dialog.getByLabel('Map guestName')).toHaveValue('guestName');
  await dialog.getByRole('button', { name: 'Validate rows', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'Review import', exact: true })).toBeEnabled();
  const before = await unwrap(await request.get(`${root}/guests`, { headers }));
  expect(before).toHaveLength(0);
  await dialog.getByRole('button', { name: 'Review import', exact: true }).click();
  await dialog.getByRole('button', { name: 'Confirm import', exact: true }).click();
  await expect(dialog.getByText('Import saved to this event')).toBeVisible();
  await page.screenshot({ path: `${screenshots}/live-mysql-import-result-1280.png` });
  const replay = await unwrap(await request.post(`${root}/guests/import-batch`, { headers, data: batch }));
  expect(replay.importedCount).toBe(2);
  const guests = await unwrap(await request.get(`${root}/guests`, { headers }));
  expect(guests).toHaveLength(2);
  expect(guests.map(guest => guest.phone)).toEqual(expect.arrayContaining(['012000001', '098000002']));
  expect(guests.every(guest => guest.invitationId === eventId)).toBeTruthy();
  await dialog.getByRole('button', { name: 'View guests' }).click();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByText(guests[0].guestName, { exact: true }).first()).toBeVisible();
  await page.screenshot({ path: `${screenshots}/live-mysql-imported-guests-1280.png` });
  await page.locator('.guest-header-actions button').first().click();
  await dialog.getByLabel('Guest import file').setInputFiles({ name: 'fictional-extra.csv', mimeType: 'text/csv', buffer: Buffer.from('\uFEFFguestName,phone,seatCount,note\r\nភ្ញៀវគំរូ គ,012000003,2,"Fictional CSV, quoted note"\r\n') });
  await expect(dialog.getByLabel('Map guestName')).toHaveValue('guestName');
  await dialog.getByRole('button', { name: 'Validate rows', exact: true }).click();
  await dialog.getByRole('button', { name: 'Review import', exact: true }).click();
  await dialog.getByRole('button', { name: 'Confirm import', exact: true }).click();
  await expect(dialog.getByText('Import saved to this event')).toBeVisible();
  await page.screenshot({ path: `${screenshots}/live-mysql-csv-result-1280.png` });
  const other = await register();
  const forbidden = await request.post(`${root}/guests/import-batch/preview`, { headers: { Authorization: `Bearer ${other.accessToken}` }, data: batch });
  expect([403, 404]).toContain(forbidden.status());
  const after = await unwrap(await request.get(`${root}/guests`, { headers }));
  expect(after).toHaveLength(3);
  expect(after.find(guest => guest.phone === '012000003')?.note).toBe('Fictional CSV, quoted note');
  await writeFile('D:/Koupreng-UXUI-Phase5/metadata/live-import-check.json', JSON.stringify({
    environment: 'Chromium -> actual HTTP JWT/owner guard -> Spring Boot 4.0.8/JPA -> isolated MySQL 8.0.39 on port 3407',
    fixtureProvenance: 'New disposable fictional accounts/event; production database untouched',
    importedXlsx: 2, importedCsv: 1, finalTotal: 3, previewWrites: 0, replayTotal: 2, leadingZeroPhonesPreserved: true, eventIsolation: true,
    foreignOwnerRejected: true, foreignOwnerStatus: forbidden.status(), selectedTemplateArtwork: true, realOwnerCoverUpload: true,
    coverReplacedAndReloaded: true, coverRemovedToTemplate: true, storage: 'Isolated local filesystem; no cloud provider',
    tracesSaved: false, externalProviders: false, pageErrors: errors,
  }, null, 2));
});
