import { test, expect } from '@playwright/test';
import { phase9Fixtures } from './support/phase9Fixtures';

test('separate authored values persist and switching does not replace the iframe', async ({ page }) => {
  const { events } = await phase9Fixtures(page, { content: { messageText: 'Khmer authored message', photos: [], schedule: [], storyChapters: [], party: [], faq: [] } });
  events.set(101, { ...events.get(101), storyText: 'Khmer authored message', languageMode: 'KH' });
  await page.goto('/app/events/101/invitation');
  await page.locator('[data-studio-tab="eventInformation"]').click(); await page.locator('[data-studio-section="invitation"] details').evaluate(node => { node.open = true; });
  const field = page.locator('[data-studio-section="invitation"] textarea');
  await expect(field).toHaveValue('Khmer authored message');
  const preview = page.locator('iframe');
  await preview.evaluate(node => { node.dataset.phase11Identity = 'retained'; });
  await page.locator('.pe-lang-pill-btn').nth(1).click();
  await expect(field).toHaveValue(''); await field.fill('English authored message');
  await page.locator('.pe-lang-pill-btn').nth(0).click();
  await expect(field).toHaveValue('Khmer authored message');
  await expect(preview).toHaveAttribute('data-phase11-identity', 'retained');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'saved');
  expect(JSON.parse(events.get(101).contentJson).localizedContentV1.en.messageText).toBe('English authored message');
  await page.reload(); await page.locator('[data-studio-tab="eventInformation"]').click(); await page.locator('[data-studio-section="invitation"] details').evaluate(node => { node.open = true; });
  await expect(field).toHaveValue('Khmer authored message');
  await page.locator('.pe-lang-pill-btn').nth(1).click(); await expect(field).toHaveValue('English authored message');
});

test('wording preview is deliberate and confirmed replacement can be undone', async ({ page }) => {
  const { events } = await phase9Fixtures(page, { lang: 'en', content: { messageText: 'My custom invitation', photos: [], schedule: [], storyChapters: [], party: [], faq: [] } });
  events.set(101, { ...events.get(101), languageMode: 'KH' });
  await page.goto('/app/events/101/invitation');
  await page.locator('[data-studio-tab="eventInformation"]').click();
  await page.locator('[data-studio-section="invitation"] details').evaluate(node => { node.open = true; });
  const field = page.locator('[data-studio-section="invitation"] textarea');
  await expect(field).toHaveValue('My custom invitation');
  await page.locator('[data-studio-section="invitation"]').getByLabel('Editable wording preset').selectOption('welcome');
  await expect(field).toHaveValue('My custom invitation');
  page.once('dialog', dialog => dialog.dismiss());
  await page.locator('[data-studio-section="invitation"]').getByRole('button', { name: 'Apply formal wording', exact: true }).click();
  await expect(field).toHaveValue('My custom invitation');
  page.once('dialog', dialog => dialog.accept());
  await page.locator('[data-studio-section="invitation"]').getByRole('button', { name: 'Apply formal wording', exact: true }).click();
  await expect(field).not.toHaveValue('My custom invitation');
  // UI stays English while authored text remains on the independent Khmer tab.
  await expect(page.locator('.pe-lang-pill-btn').nth(0)).toHaveAttribute('aria-pressed', 'true');
  await page.getByLabel('More studio actions', { exact: true }).click();
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(field).toHaveValue('My custom invitation');
});

test('single public link changes language while retaining RSVP input and guest token', async ({ page }) => {
  const km = { title: 'Khmer event', messageText: 'Khmer message', groomName: 'Host A', brideName: 'Host B', venueName: 'Venue', venueAddress: 'Address' };
  const en = { ...km, title: 'English event', messageText: 'English message' };
  const { events } = await phase9Fixtures(page, { code: 'event-essential', content: { ...km, schedule: [], localizedContentV1: { version: 1, km, en, enabledLocales: ['km', 'en'], defaultLocale: 'km' } } });
  events.set(101, { ...events.get(101), eventType: 'WEDDING', templateCode: 'event-essential', enabledSections: JSON.stringify({ rsvp: true }) });
  await page.goto('/i/review-celestial?token=fictional-phase11-guest&lang=km');
  await expect(page.getByRole('heading', { name: 'Khmer event', exact: true })).toBeVisible();
  const guestName = page.locator('.pub-rsvp-form textarea');
  await guestName.fill('Retained guest');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'English event', exact: true })).toBeVisible();
  await expect(guestName).toHaveValue('Retained guest');
  expect(new URL(page.url()).searchParams.get('token')).toBe('fictional-phase11-guest');
  await page.getByRole('button', { name: 'ខ្មែរ', exact: true }).click();
  await expect(guestName).toHaveValue('Retained guest');
});

test('query locale cannot activate an incomplete translation', async ({ page }) => {
  await phase9Fixtures(page, { code: 'event-essential', content: { title: 'Khmer event', localizedContentV1: { version: 1, km: { title: 'Khmer event' }, en: { title: 'Private English draft' }, enabledLocales: ['km'], defaultLocale: 'km' } } });
  await page.goto('/i/review-celestial?lang=en');
  await expect(page.getByRole('heading', { name: 'Khmer event', exact: true })).toBeVisible();
  await expect(page.getByText('Private English draft')).toHaveCount(0);
  await expect(page.locator('.public-locale-switch')).toHaveCount(0);
});
