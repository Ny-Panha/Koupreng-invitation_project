import { expect, test } from '@playwright/test';
import { installPhase4Fixtures } from './support/phase4Fixtures.js';
import { readFile } from 'node:fs/promises';
import { Buffer } from 'node:buffer';

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

test('inline create and edit preserve optional and backend-owned values across refresh', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const state = await installPhase4Fixtures(page, { count: 1 });
  await page.goto('/app/events/101/guests');
  const form = page.locator('.guest-inline-form-row');
  await page.locator('#guestForm-name').fill('Phase 4 Review');
  await page.locator('#guestForm-count').fill('3');
  await page.locator('#guestForm-group').selectOption('Bride Side');
  await page.locator('#guestForm-category').selectOption('Family');
  await form.getByRole('button', { name: 'Add', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const row = page.locator('.guest-record-row').filter({ hasText: 'Phase 4 Review' });
  await expect(row).toBeVisible();
  // Existing optional details and tracked status come from the server, outside the simple entry row.
  const savedDetails = { phone: '012345678', email: 'phase4@example.test', note: 'Keep this note', companionName: 'Review Companion', tableNumber: 'A-01', sendStatus: 'OPENED', contributionStatus: 'PARTIAL', totalContributed: 25 };
  Object.assign(state.guests.find(g => g.guestName === 'Phase 4 Review'), savedDetails);
  await page.reload();
  await row.getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(page.locator('#guestForm-count')).toHaveValue('3');
  await expect(form.locator('.guest-group-tag')).toHaveText('Bride Side');
  await expect(form.locator('.guest-category')).toHaveText('Family');
  await expect(page.locator('#guestForm-sendStatus')).toHaveAttribute('readonly', '');
  for (const field of ['phone', 'email', 'note', 'companionName', 'seat']) await expect(page.locator(`#guestForm-${field}`)).toHaveCount(0);
  await page.locator('#guestForm-count').fill('4');
  await form.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('#guestForm-name')).toHaveValue('');
  await page.reload(); await row.getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(page.locator('#guestForm-count')).toHaveValue('4');
  await expect(form.locator('.guest-group-tag')).toHaveText('Bride Side');
  expect(state.guests.find(g => g.guestName === 'Phase 4 Review')).toMatchObject({ ...savedDetails, seatCount: 4, guestGroup: 'Bride Side', sideType: 'Family' });
});

test('inline validation and API failure keep entered guest data', async ({ page }) => {
  const state = await installPhase4Fixtures(page, { count: 1 });
  await page.goto('/app/events/101/guests');
  const form = page.locator('.guest-inline-form-row');
  await page.locator('#guestForm-name').fill('   ');
  await expect(form.getByRole('button', { name: 'Add', exact: true })).toBeDisabled();
  await page.locator('#guestForm-name').fill('Keep on failure');
  await page.locator('#guestForm-count').fill('0');
  await form.getByRole('button', { name: 'Add', exact: true }).click();
  expect(state.writes).toHaveLength(0);
  await page.locator('#guestForm-count').fill('2');
  await page.route('**/api/v1/invitations/101/guests', route => route.request().method() === 'POST' ? route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Review save failure' }) }) : route.fallback());
  await form.getByRole('button', { name: 'Add', exact: true }).click();
  await expect(form.getByRole('alert').first()).toContainText('Review save failure');
  await expect(page.locator('#guestForm-name')).toHaveValue('Keep on failure');
  await expect(page.locator('#guestForm-count')).toHaveValue('2');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('#guestForm-name')).toHaveValue('Keep on failure');
});

test('seating supports full party capacity, moves, unassignment and safe deletion across reload', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const state = await installPhase4Fixtures(page, { count: 3 });
  await page.goto('/app/events/101/seating');
  await expect(page.getByText('Create your first table to start arranging guests.')).toBeVisible();
  await expect(page.locator('.sfp-canvas-wrapper')).toHaveCount(0);
  for (const [name, capacity] of [['Family A', '2'], ['Family B', '4']]) {
    await page.getByRole('button', { name: 'Create table', exact: true }).first().click();
    await page.getByRole('dialog').getByLabel('Table name').fill(name);
    await page.getByRole('dialog').getByLabel('Capacity').fill(capacity);
    await page.getByRole('dialog').getByRole('button', { name: 'Create table', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  }
  const panel = page.locator('.seating-assignment-panel');
  await panel.getByLabel('Guest', { exact: true }).selectOption('503');
  await expect(panel.getByLabel('seats', { exact: true })).toHaveValue('3');
  await panel.getByLabel('Table', { exact: true }).selectOption('100');
  await expect(panel.getByRole('button', { name: 'Assign guest', exact: true })).toBeDisabled();
  await expect(panel.getByRole('alert')).toContainText('exceeds');
  await panel.getByLabel('Table', { exact: true }).selectOption('101');
  await panel.getByRole('button', { name: 'Assign guest', exact: true }).click();
  await expect(page.locator('.seating-table-card').filter({ hasText: 'Family B' }).getByText('Review Guest 3')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Delete table: Family B' })).toBeDisabled();
  await page.getByRole('button', { name: 'Move guest: Review Guest 3' }).click();
  await panel.getByLabel('Table', { exact: true }).selectOption('100');
  await panel.getByLabel('seats', { exact: true }).fill('2');
  await panel.getByRole('button', { name: 'Move guest', exact: true }).click();
  await expect(page.locator('.seating-table-card').filter({ hasText: 'Family A' }).getByText('Review Guest 3')).toBeVisible();
  expect(state.assignments).toHaveLength(1);
  expect(state.assignments[0].tableId).toBe(100);
  await page.getByRole('button', { name: 'Unassign: Review Guest 3' }).click();
  await expect(panel.getByRole('button', { name: /Review Guest 3/ })).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Delete table: Family A' }).click();
  await expect(page.getByRole('heading', { name: 'Family A', exact: true })).toHaveCount(0);
  await page.reload();
  expect(state.tables).toHaveLength(1);
});

test('RSVP pending guests, confirmed attendee totals, editing and deletion stay consistent', async ({ page }) => {
  const state = await installPhase4Fixtures(page, { count: 3 });
  await page.goto('/app/events/101/rsvp');
  await expect(page.getByText(/1 confirmed attendees/)).toBeVisible();
  await page.getByLabel('Response status').selectOption('PENDING');
  await expect(page.getByText('Review Guest 2', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Edit RSVP', exact: true })).toHaveCount(0);
  await page.getByLabel('Response status').selectOption('ATTENDING');
  await page.getByRole('button', { name: 'Edit RSVP', exact: true }).click();
  await page.getByRole('dialog').getByLabel('Attendee count').fill('3');
  await page.getByRole('button', { name: 'Save RSVP', exact: true }).click();
  await expect(page.getByText(/3 confirmed attendees/)).toBeVisible();
  await page.getByRole('button', { name: 'Delete RSVP', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm deletion', exact: true }).click();
  await expect(page.getByText(/0 confirmed attendees/)).toBeVisible();
  expect(state.rsvps).toHaveLength(0);
});

test('delivery records copied shares without claiming provider acceptance and reports email failures', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => {} } }));
  const state = await installPhase4Fixtures(page, { count: 3 });
  await page.goto('/app/events/101/delivery?guestId=502');
  await expect(page.getByText('1 selected', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Copy message', exact: true }).first().click();
  await expect.poll(() => state.writes.filter(w => w.path.endsWith('mark-shared')).length).toBe(1);
  expect(state.writes[0]).toMatchObject({ method: 'POST', path: '/api/v1/invitations/101/delivery/guests/501/mark-shared' });
  await page.getByText('Email & reminders', { exact: false }).click();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Send to selected email recipients', exact: true }).click();
  await expect(page.locator('.delivery-methods').getByRole('status')).toContainText('0 accepted by the mail service; 1 failed');
  expect(state.writes.find(w => w.path.endsWith('/email')).body).toMatchObject({ guestIds: [502], allEligible: false });
  expect(state.writes.filter(w => w.path.endsWith('mark-shared'))).toHaveLength(1);
});

test('media validates formats, uploads, replaces, removes and reloads the same library', async ({ page }) => {
  const state = await installPhase4Fixtures(page, { count: 1 });
  await page.goto('/app/events/101/media');
  await expect(page.getByRole('heading', { name: 'Template artwork', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Gallery', exact: true }).click();
  const picker = page.locator('input[type=file]');
  await picker.setInputFiles({ name: 'bad.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') });
  await expect(page.getByRole('alert')).toContainText('file format');
  expect(state.writes).toHaveLength(0);
  const png = await readFile(new URL('./support/fixtures/general-qr.png', import.meta.url));
  await picker.setInputFiles({ name: 'review.png', mimeType: 'image/png', buffer: png });
  await expect(page.getByRole('heading', { name: 'review-image.png', exact: true })).toBeVisible();
  await page.reload(); await page.getByRole('button', { name: 'Gallery', exact: true }).click();
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Replace', exact: true }).click();
  await (await chooser).setFiles({ name: 'replace.png', mimeType: 'image/png', buffer: png });
  await expect(page.getByRole('button', { name: 'Remove', exact: true })).toBeEnabled();
  expect(state.writes.some(w => w.method === 'PUT')).toBe(true);
  await page.getByRole('button', { name: 'Remove', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(page.getByText('No uploaded files here yet', { exact: true })).toBeVisible();
  await page.reload(); expect(state.media).toHaveLength(0);
});

test('uploaded cover reaches the dashboard and reload; referenced design assets stay managed in Studio', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const state = await installPhase4Fixtures(page, { count: 1 });
  await page.goto('/app/events/101/media');
  await expect(page.getByRole('heading', { name: 'Template artwork', exact: true })).toBeVisible();
  const png = await readFile(new URL('./support/fixtures/general-qr.png', import.meta.url));
  await page.locator('input[type=file]').setInputFiles({ name: 'cover.png', mimeType: 'image/png', buffer: png });
  await expect(page.getByRole('heading', { name: 'review-image.png' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Event navigation', exact: true }).getByRole('link', { name: 'Dashboard', exact: true }).click();
  await expect(page.locator('.overview-cover img')).toHaveAttribute('src', '/templates/event-essential.svg');
  await page.reload();
  await expect(page.locator('.overview-cover img')).toHaveAttribute('src', '/templates/event-essential.svg');
  state.eventOverrides = { designJson: JSON.stringify({ coverImage: '/templates/event-essential.svg' }) };
  await page.goto('/app/events/101/media');
  await expect(page.getByText(/Used in the invitation design/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Replace', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Remove', exact: true })).toHaveCount(0);
  expect(state.media).toHaveLength(1);
});

for (const module of ['', 'guests', 'rsvp', 'delivery', 'media', 'seating']) test(`sidebar remains stationary at successive scroll offsets on ${module || 'dashboard'}`, async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 460 });
  await installPhase4Fixtures(page);
  await page.goto('/app/events/101' + (module ? '/' + module : ''));
  await expect(page.getByRole('main').first()).toBeVisible();
  await expect(page.locator('.event-workspace-main')).toBeVisible();
  const main = page.locator('.event-workspace-main');
  await expect.poll(() => main.evaluate(e => e.scrollHeight - e.clientHeight)).toBeGreaterThan(0);
  const start = await page.locator('.event-workspace-sidebar').boundingBox();
  for (const dy of [400, 500, 100000]) {
    await main.evaluate((e, distance) => { e.scrollTop += distance; }, dy);
    expect((await page.locator('.event-workspace-sidebar').boundingBox()).y).toBeCloseTo(start.y, 0);
    expect(await main.evaluate(e => e.scrollTop)).toBeGreaterThan(0);
  }
  await expect(page.getByRole('button', { name: 'Collapse navigation', exact: true })).toBeInViewport();
  expect(await page.evaluate(() => scrollY)).toBe(0);
});

test('event switching clears private module rows and mobile assignment remains reachable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 667 });
  await installPhase4Fixtures(page, { count: 3 });
  await page.goto('/app/events/101/seating');
  await page.getByRole('button', { name: 'Assign guests', exact: true }).click();
  await expect(page.getByLabel('Guest', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Toggle modules menu' }).click();
  await page.getByLabel('Switch event', { exact: true }).selectOption('102');
  await expect(page).toHaveURL(/102\/seating/);
  await expect(page.getByText('Review Guest 1', { exact: true })).toHaveCount(0);
});
