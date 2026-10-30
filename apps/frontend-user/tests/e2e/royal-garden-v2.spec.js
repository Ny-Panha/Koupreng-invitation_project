import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import { phase9Fixtures, chooseStudioSection } from './support/phase9Fixtures';

const code = 'royal-garden-cinematic';
const image = '/templates/silk-heritage/portrait.webp', second = '/templates/silk-heritage/together.webp';
const content = {
  messageText: 'A fictional wedding invitation.', messageTitle: 'With our families',
  cinematicIntro: { version: 1, style: 'oval', duration: 2, slides: [{ id: 'first', src: image, alt: 'First portrait', x: 50, y: 50 }, { id: 'second', src: second, alt: 'Second portrait', x: 50, y: 50 }] },
  gallery: [{ id: 'a', preview: image }, { id: 'b', preview: second }],
  schedule: [{ id: 'one', time: '07:00', title: 'First ceremony', titleEn: 'First ceremony' }, { id: 'two', time: '08:00', title: 'Second ceremony', titleEn: 'Second ceremony' }],
  saveTheDate: { enabled: true, showCountdown: true, showCalendar: true, showAddToCalendar: true },
};
async function setup(page, override = {}) {
  const state = await phase9Fixtures(page, { code, content: { ...content, ...override } });
  state.events.set(101, { ...state.events.get(101), designJson: '{}', groomName: 'Fictional groom', brideName: 'Fictional bride', hostName: 'Fictional groom', partnerName: 'Fictional bride',
    enabledSections: JSON.stringify({ gallery: true, schedule: true, countdown: true, rsvp: true, gift: false }) });
  await page.route('**/api/v1/invitations/101/media/gallery', route => route.fulfill({ json: { data: [{ id: 501, fileUrl: image, mediaType: 'GALLERY_IMAGE', mimeType: 'image/webp' }] } }));
  await page.route('**/api/v1/invitations/101/publish', route => { state.events.set(101, { ...state.events.get(101), status: 'PUBLISHED' }); return route.fulfill({ json: { data: state.events.get(101) } }); });
  return state;
}
async function studio(page) {
  await page.goto('/app/events/101/invitation');
  await expect(page.locator('.invitation-studio')).toBeVisible();
  await page.getByRole('button', { name: 'Advanced editor', exact: true }).click();
}
async function full(page) {
  const frame = page.frameLocator('iframe');
  if (page.viewportSize().width < 1024) await page.getByRole('button', { name: 'Preview invitation', exact: true }).click();
  await page.getByRole('tab', { name: 'Full invitation', exact: true }).click();
  await expect(frame.locator('.tpl-royal-garden[data-stage=CONTENT]')).toBeVisible();
  return frame;
}
async function save(page) { await page.getByRole('button', { name: 'Save', exact: true }).click(); await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'saved'); }
async function shot(page, name, info) { const dir = '../../docs/design/royal-garden-v2/evidence'; await fs.mkdir(dir, { recursive: true }); await page.screenshot({ path: `${dir}/${info.project.name}-${name}.png`, fullPage: false }); }

test('E2E-01 complete the cinematic sequence and capture its stages', async ({ page }, info) => {
  await setup(page, { cinematicIntro: { ...content.cinematicIntro, duration: 4.3 } }); await page.clock.install(); await page.goto('/i/review-celestial');
  await expect(page.locator('[data-stage=COVER]')).toBeVisible(); await shot(page, 'intro-cover', info);
  await page.locator('.rg-open').click(); await page.clock.runFor(2400);
  await expect(page.locator('[data-stage=TITLE_REVEAL]')).toBeVisible(); await shot(page, 'intro-title', info);
  await page.clock.runFor(4200); await expect(page.locator('[data-stage=PHOTO_SLIDESHOW]')).toBeVisible(); await page.clock.runFor(1100); await shot(page, 'intro-photo-1', info);
  await page.clock.runFor(4300); await shot(page, 'intro-photo-2', info);
  await page.clock.runFor(4400); await expect(page.locator('[data-stage=INVITATION_REVEAL]')).toBeVisible(); await page.clock.runFor(800);
  await expect(page.locator('[data-stage=CONTENT]')).toBeVisible();
});
test('E2E-02 skip the intro without a stale timer reopening it', async ({ page }) => {
  await setup(page); await page.clock.install(); await page.goto('/i/review-celestial'); await page.locator('.rg-open').click();
  await page.locator('.rg-intro-controls button').last().click(); await page.clock.runFor(40000);
  await expect(page.locator('[data-stage=CONTENT]')).toBeVisible();
});
test('E2E-03 names synchronize into the same live preview', async ({ page }) => {
  await setup(page); await page.setViewportSize({ width: 1440, height: 960 }); await studio(page);
  await page.locator('input[id$="-groom"]').fill('Owner edited groom');
  const frame = await full(page); await expect(frame.locator('.rg-names')).toContainText('Owner edited groom');
});
test('E2E-04 upload and reorder intro images with real save references', async ({ page }) => {
  const { events } = await setup(page); await studio(page); await chooseStudioSection(page, 'mediaOpening', 'Cinematic intro');
  await page.getByLabel('Add slideshow images').setInputFiles('public/templates/silk-heritage/together.webp');
  await expect(page.locator('.studio-intro-slides li')).toHaveCount(3);
  await page.getByRole('button', { name: 'Move slide 3 up', exact: true }).click();
  await save(page); expect(JSON.parse(events.get(101).contentJson).cinematicIntro.slides[1].src).toBe(image);
});
test('E2E-05 canonical date updates the calendar and Khmer countdown', async ({ page }) => {
  const { events } = await setup(page); await page.setViewportSize({ width: 1440, height: 960 }); await studio(page);
  await chooseStudioSection(page, 'scheduleVenue', 'Save the date');
  await page.locator('[data-studio-section=countdown] input[type=date]').first().fill('2028-02-29');
  await page.getByRole('combobox', { name: 'Numerals', exact: true }).selectOption('khmer');
  const frame = await full(page); await expect(frame.locator('.kp-calendar-event')).toHaveAttribute('datetime', '2028-02-29');
  await expect(frame.locator('.kp-countdown')).toContainText(/[០-៩]/); await save(page); expect(events.get(101).eventDate).toBe('2028-02-29');
});
test('E2E-06 all reordered ceremonies follow the multi-day program', async ({ page }) => {
  await setup(page); await page.setViewportSize({ width: 1440, height: 960 }); await studio(page);
  await chooseStudioSection(page, 'scheduleVenue', 'Schedule');
  await page.getByRole('button', { name: 'Add ceremony', exact: true }).first().click();
  await page.getByLabel('Ceremony / Khmer', { exact: true }).last().fill('Added ceremony');
  await page.getByLabel('Ceremony in English', { exact: true }).last().fill('Added ceremony');
  await page.getByRole('button', { name: 'Move ceremony 3 up', exact: true }).click();
  const frame = await full(page); await expect(frame.locator('.kp-timeline li')).toHaveCount(3); await expect(frame.locator('.kp-timeline li').nth(1)).toContainText('Added ceremony');
});
test('E2E-07 venue uses the saved Google Maps CTA', async ({ page }) => {
  const { events } = await setup(page); await studio(page); await chooseStudioSection(page, 'scheduleVenue', 'Venue');
  await page.locator('[data-studio-section=venue] input').filter({ visible: true }).first().fill('Edited venue');
  const mapInput = page.locator('[data-studio-section=venue] input').filter({ hasNot: page.locator('[type=file]') });
  await page.getByPlaceholder('Google Maps link or venue name').fill('https://maps.google.com/?q=Phnom+Penh');
  await save(page); expect(events.get(101).googleMapUrl).toContain('maps.google.com');
  expect(await mapInput.count()).toBeGreaterThan(0);
  await page.goto('/i/review-celestial'); await page.locator('.rg-open').click(); await page.locator('.rg-intro-controls button').last().click();
  await expect(page.locator('#rg-venue .rg-button')).toHaveAttribute('href', /maps.google.com/);
});
test('E2E-08 reordered gallery images reach the public carousel', async ({ page }) => {
  const { events } = await setup(page); await studio(page); await chooseStudioSection(page, 'mediaOpening', 'Gallery');
  await page.getByRole('button', { name: 'Move photo 2 up', exact: true }).click(); await save(page);
  expect(JSON.parse(events.get(101).contentJson).gallery[0].preview).toBe(second);
  await page.goto('/i/review-celestial'); await page.locator('.rg-open').click(); await page.locator('.rg-intro-controls button').last().click();
  await expect(page.locator('.rg-current-photo img')).toHaveAttribute('src', second);
  await page.locator('.rg-carousel').focus(); await page.keyboard.press('ArrowRight'); await expect(page.locator('.rg-photo-counter')).toHaveText('2 / 2');
});
test('E2E-09 language switching keeps authored names and the guest token', async ({ page }) => {
  const km = { title: 'ពិធីមង្គលការ', groomName: 'សុវណ្ណ', brideName: 'សុភា', messageText: 'សូមគោរពអញ្ជើញ', venueName: 'ទីតាំង', venueAddress: 'ភ្នំពេញ' };
  const en = { title: 'Our wedding', groomName: 'Sovann', brideName: 'Sophea', messageText: 'Please join us', venueName: 'Venue', venueAddress: 'Phnom Penh' };
  await setup(page, { ...km, schedule: [], gallery: [], cinematicIntro: { enabled: false }, localizedContentV1: { version: 1, km, en, enabledLocales: ['km','en'], defaultLocale: 'km' } });
  await page.goto('/i/review-celestial?token=fictional-guest&lang=km'); await expect(page.locator('.rg-names')).toContainText('សុវណ្ណ');
  await page.locator('.rg-language select').selectOption('en'); await expect(page.locator('.rg-names')).toContainText('Sovann');
  expect(new URL(page.url()).searchParams.get('token')).toBe('fictional-guest');
});
test('E2E-10 save and reload retain intro customization', async ({ page }, info) => {
  const { events } = await setup(page); await studio(page); await chooseStudioSection(page, 'mediaOpening', 'Cinematic intro');
  await page.getByLabel('Intro heading', { exact: true }).fill('Our new chapter'); await page.getByLabel('Seconds per slide').fill('3.5'); await save(page);
  expect(JSON.parse(events.get(101).contentJson).cinematicIntro.heading).toBe('Our new chapter');
  await page.reload(); await chooseStudioSection(page, 'mediaOpening', 'Cinematic intro'); await expect(page.getByLabel('Intro heading', { exact: true })).toHaveValue('Our new chapter');
  await shot(page, 'studio-intro', info);
});
test('E2E-11 publish through Studio and render the saved public invitation', async ({ page }) => {
  const { events } = await setup(page, { cinematicIntro: { enabled: false }, messageText: 'Ready to celebrate' }); await studio(page);
  await page.getByRole('button', { name: 'Publish', exact: true }).click(); await page.getByRole('button', { name: 'Confirm publication', exact: true }).click();
  await expect.poll(() => events.get(101).status).toBe('PUBLISHED'); await page.goto('/i/review-celestial');
  await expect(page.locator('[data-stage=CONTENT]')).toBeVisible(); await expect(page.locator('#rg-invitation')).toContainText('Ready to celebrate');
});
test('E2E-12 reduced motion reveals content immediately after opening', async ({ page }) => {
  await setup(page); await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto(`/templates/${code}`); await page.locator('.rg-open').click(); await expect(page.locator('[data-stage=CONTENT]')).toBeVisible();
});
test('E2E-13 empty owner content never restores demo portraits or ceremonies', async ({ page }) => {
  await setup(page, { gallery: [], schedule: [], cinematicIntro: { enabled: false, slides: [], heading: '' }, messageTitle: '' }); await page.goto('/i/review-celestial');
  await expect(page.locator('[data-stage=CONTENT]')).toBeVisible(); await expect(page.locator('.rg-gallery img')).toHaveCount(0); await expect(page.locator('.kp-timeline li')).toHaveCount(0); await expect(page.locator('#rg-invitation .rg-heading h2')).toBeEmpty();
});
test('E2E-14 save errors and conflicts retain the unsaved intro', async ({ page }) => {
  await setup(page); let conflict = false;
  await page.route('**/api/v1/invitations/101', route => route.request().method() === 'PUT' ? route.fulfill({ status: conflict ? 409 : 500, json: { message: conflict ? 'Updated elsewhere' : 'Synthetic save failure' } }) : route.fallback());
  await studio(page); await chooseStudioSection(page, 'mediaOpening', 'Cinematic intro'); await page.getByLabel('Intro heading', { exact: true }).fill('Retain this intro'); await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'failed'); await expect(page.getByLabel('Intro heading', { exact: true })).toHaveValue('Retain this intro');
  conflict = true; await page.getByRole('button', { name: 'Save', exact: true }).click(); await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'conflict'); await expect(page.getByLabel('Intro heading', { exact: true })).toHaveValue('Retain this intro');
});
test('E2E-15 unrelated templates retain their renderer', async ({ page }) => {
  await phase9Fixtures(page, { code: 'silk-heritage' }); await page.goto('/i/review-celestial'); await expect(page.locator('.tpl-silk-heritage')).toBeVisible(); await expect(page.locator('.tpl-royal-garden')).toHaveCount(0);
});
test('responsive reference surfaces, long program and accessibility', async ({ page }, info) => {
  test.setTimeout(120000); const { events } = await setup(page, { cinematicIntro: { enabled: false }, messageTitle: 'យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ', messageText: 'សូមគោរពអញ្ជើញលោក លោកស្រី អ្នកនាង កញ្ញា ព្រមទាំងញាតិមិត្តជិតឆ្ងាយ ចូលរួមជាភ្ញៀវកិត្តិយស ក្នុងពិធីអាពាហ៍ពិពាហ៍កូនប្រុស កូនស្រីរបស់យើងខ្ញុំ។',
    groomFather: 'លោក សុខ ដារ៉ា', groomMother: 'លោកស្រី ចាន់ សុធី', brideFather: 'លោក ចន្ទ វណ្ណា', brideMother: 'លោកស្រី សុខ លក្ខិណា',
    schedule: [{ id: 'khmer', time: '07:00', title: 'ពិធីហែជំនូន', description: 'សូមអញ្ជើញចូលរួមពិធីមង្គលការ។' }, ...content.schedule, { id: 'long', time: '18:00', title: 'A long ceremony', description: 'A detailed family ceremony. '.repeat(35) }] });
  events.set(101, { ...events.get(101), title: 'សិរីមង្គលអាពាហ៍ពិពាហ៍', groomName: 'សុវណ្ណ វិសាល', brideName: 'សុភា ស្រីពេជ្រ', languageMode: 'KH' });
  for (const width of [320,375,390,430,512,768,1024,1440]) {
    await page.setViewportSize({ width, height: 900 }); await page.goto('/i/review-celestial'); await expect(page.locator('[data-stage=CONTENT]')).toBeVisible(); await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await shot(page, `invitation-${width}`, info);
    if (width === 512) for (const key of ['countdown','schedule','venue','gallery','wishes']) { await page.locator(`#rg-${key}`).evaluate(node => node.scrollIntoView({ block: 'start', behavior: 'instant' })); await shot(page, key, info); }
  }
  const audit = await new AxeBuilder({ page }).include('.tpl-royal-garden').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(audit.violations).toEqual([]);
});
