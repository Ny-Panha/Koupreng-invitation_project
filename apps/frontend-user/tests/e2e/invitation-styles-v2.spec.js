import { test, expect } from '@playwright/test';
import { phase8Fixtures, phase8Content } from './support/phase8Fixtures';
import { chooseStudioSection } from './support/studioNavigationActions';

const codes = ['khmer-floral-gold', 'khmer-celestial', 'royal-khmer-wedding', 'silk-heritage', 'the-digital-yes-wedding', 'emerald-canva-luxe-wedding', 'withjoy-modern-portal', 'bliss-editorial-wedding', 'khmer-golden-canva-inspired-wedding', 'cover-khmer-golden-wedding', 'event-essential', 'koupreng-demo-wedding'];
for (const code of codes) test(`saved presentation reaches published ${code}`, async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const state = await phase8Fixtures(page, { code });
  await page.goto('/app/events/101/invitation');
  if (code !== 'event-essential') await chooseStudioSection(page, 'designCover', 'Invitation styles');
  const editor = page.locator('.studio-invitation-styles');
  await editor.getByRole('radio', { name: 'Horizontal date', exact: true }).check();
  await editor.getByRole('radio', { name: 'Numbered ceremonies', exact: true }).check();
  await page.getByRole('button', { name: code === 'event-essential' ? 'Save details' : 'Save', exact: true }).click();
  await expect.poll(() => JSON.parse(state.events.get(101).contentJson).invitationStyleV1?.program).toBe('numbered');
  state.events.set(101, { ...state.events.get(101), status: 'PUBLISHED' });
  await page.goto('/i/review-celestial');
  if (code === 'khmer-floral-gold') await page.locator('.kfg-open').click();
  else {
    const opener = page.getByRole('button', { name: /Open invitation|View invitation details|Open Invitation|Tap seal|\u1794\u17be\u1780\u179f|\u1785\u17bb\u1785/ }).first();
    if (!['withjoy-modern-portal', 'bliss-editorial-wedding', 'event-essential'].includes(code)) { await expect(opener).toBeVisible(); await opener.focus(); await opener.press('Enter'); }
  }
  await expect(page.locator('[data-date-style="horizontal"]')).toBeVisible();
  await expect(page.locator('[data-program-style="numbered"]')).toBeVisible();
  await expect(page.locator('[data-program-style]')).toContainText('Family ceremony');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

const dates = ['traditional', 'minimal', 'gold-calendar', 'watercolor', 'tear-off', 'typographic', 'horizontal', 'floral'];
const programs = ['classic', 'gold-curve', 'alternating', 'ceremonial', 'editorial', 'numbered', 'floral-list', 'multi-day'];
const frames = ['khmer', 'floral-gold', 'engraved', 'double-gold', 'vintage', 'royal', 'minimal', 'champagne'];
for (const [index, date] of dates.entries()) test(`Floral renders the ${date} / ${programs[index]} / ${frames[index]} combination`, async ({ page }, info) => {
  const state = await phase8Fixtures(page, { code: 'khmer-floral-gold', content: { ...phase8Content, invitationStyleV1: { version: 1, date, program: programs[index], guestFrame: frames[index], motion: 'none' } } });
  state.events.set(101, { ...state.events.get(101), status: 'PUBLISHED' });
  await page.goto('/i/review-celestial');
  await expect(page.locator(`.kfg-guest-frame--${frames[index]}`)).toBeVisible();
  await page.locator('.kfg-open').click();
  await expect(page.locator(`[data-date-style="${date}"]`)).toBeVisible();
  await expect(page.locator(`[data-program-style="${programs[index]}"]`)).toBeVisible();
  if (info.project.name === 'desktop-chromium') await page.locator('.kfg-content').screenshot({ path: `../../docs/design/khmer-floral-gold/screenshots/v2/styles-${date}.png` });
});

test('Floral style gallery saves, reopens, previews and publishes actual choices', async ({ page }, info) => {
  test.setTimeout(60000);
  const state = await phase8Fixtures(page, { code: 'khmer-floral-gold' });
  await page.goto('/app/events/101/invitation');
  await chooseStudioSection(page, 'designCover', 'Invitation styles');
  const editor = page.locator('.studio-invitation-styles');
  await expect(editor.locator('.kfg-guest-frame--royal')).toHaveCSS('border-top-width', '3px');
  await expect(editor.locator('.kfg-guest-frame--minimal')).toHaveCSS('border-top-width', '0px');
  await page.evaluate(() => document.fonts.ready);
  if (info.project.name === 'desktop-chromium') await editor.screenshot({ path: '../../docs/design/khmer-floral-gold/screenshots/v2/studio-style-gallery.png' });
  await editor.getByRole('radio', { name: 'Tear-off date', exact: true }).check();
  await editor.getByRole('radio', { name: 'Alternating timeline', exact: true }).check();
  await editor.getByRole('radio', { name: 'Royal', exact: true }).check();
  await editor.getByRole('combobox', { name: 'Motion', exact: true }).selectOption('none');
  await editor.getByRole('combobox', { name: 'Photo layout', exact: true }).selectOption('grid');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect.poll(() => JSON.parse(state.events.get(101).contentJson).invitationStyleV1?.date).toBe('tear-off');
  await page.reload();
  await chooseStudioSection(page, 'designCover', 'Invitation styles');
  await expect(editor.getByRole('radio', { name: 'Tear-off date', exact: true })).toBeChecked();
  await expect(editor.getByRole('radio', { name: 'Alternating timeline', exact: true })).toBeChecked();
  if (page.viewportSize().width < 1024) await page.getByRole('button', { name: 'Preview invitation', exact: true }).click();
  const phone = page.frameLocator('iframe[title="Live User Template Preview"]');
  await expect(phone.locator('.kfg-invitation')).toBeVisible();
  if (await phone.locator('.kfg-open').count()) await phone.locator('.kfg-open').click();
  await expect(phone.locator('[data-date-style="tear-off"]')).toBeVisible();
  state.events.set(101, { ...state.events.get(101), status: 'PUBLISHED' });
  await page.goto('/i/review-celestial');
  await expect(page.locator('.kfg-guest-frame--royal')).toBeVisible();
  await page.locator('.kfg-open').click();
  await expect(page.locator('[data-date-style="tear-off"]')).toBeVisible();
  await expect(page.locator('[data-program-style="alternating"]')).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Invitation sections' })).toBeVisible();
});

test('Floral heading art, couple logo and background upload, publish and remove without demo fallback', async ({ page }) => {
  const state = await phase8Fixtures(page, { code: 'khmer-floral-gold' });
  const urls = ['heading', 'logo', 'background'].map(role => `/uploads/owner-floral-${role}.webp`);
  let uploads = 0;
  await page.route('**/api/v1/invitations/101/media/gallery', route => route.fulfill({
    contentType: 'application/json', body: JSON.stringify({ data: [{ id: 600 + uploads, mediaType: 'GALLERY_IMAGE', fileUrl: urls[uploads++] }] }),
  }));
  await page.route('**/uploads/owner-floral-*.webp', route => route.fulfill({ path: 'public/templates/khmer-floral-gold/groom.webp', contentType: 'image/webp' }));
  await page.goto('/app/events/101/invitation');
  await chooseStudioSection(page, 'designCover', 'Invitation styles');
  const editor = page.locator('.studio-invitation-styles');
  await editor.getByRole('combobox', { name: 'Cover heading', exact: true }).selectOption('image');
  await editor.getByLabel('Heading artwork', { exact: true }).setInputFiles('public/templates/khmer-floral-gold/groom.webp');
  await expect(editor.locator('img[alt="Heading artwork"]')).toHaveAttribute('src', urls[0]);
  await editor.getByRole('combobox', { name: 'Couple initials / logo', exact: true }).selectOption('image');
  await editor.getByLabel('Couple logo', { exact: true }).setInputFiles('public/templates/khmer-floral-gold/groom.webp');
  await expect(editor.locator('img[alt="Couple logo"]')).toHaveAttribute('src', urls[1]);
  await editor.getByLabel('Cover background image', { exact: true }).setInputFiles('public/templates/khmer-floral-gold/groom.webp');
  await expect(editor.locator('img[alt="Cover background image"]')).toHaveAttribute('src', urls[2]);
  await editor.getByRole('combobox', { name: 'Background fit', exact: true }).selectOption('contain');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect.poll(() => JSON.parse(state.events.get(101).contentJson).invitationStyleV1?.monogramImage).toBe(urls[1]);
  expect(uploads).toBe(3);
  state.events.set(101, { ...state.events.get(101), status: 'PUBLISHED' });
  await page.goto('/i/review-celestial');
  await expect(page.locator('.kfg-heading-art')).toHaveAttribute('src', urls[0]);
  await expect(page.locator('.kfg-monogram-logo')).toHaveAttribute('src', urls[1]);
  await expect(page.locator('.kfg-cover-background img')).toHaveAttribute('src', urls[2]);
  await expect(page.locator('.kfg-cover-background')).toHaveCSS('--kfg-cover-fit', 'contain');
  await page.goto('/app/events/101/invitation');
  await chooseStudioSection(page, 'designCover', 'Invitation styles');
  await expect(editor.locator('img[alt="Heading artwork"]')).toHaveAttribute('src', urls[0]);
  for (let i = 0; i < 3; i++) await editor.getByRole('button', { name: 'Remove image', exact: true }).first().click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect.poll(() => JSON.parse(state.events.get(101).contentJson).invitationStyleV1?.headingImage).toBe('');
  await page.goto('/i/review-celestial');
  await expect(page.locator('.kfg-monogram')).toBeVisible();
  await expect(page.locator('.kfg-heading-art, .kfg-monogram-logo, .kfg-cover-background img')).toHaveCount(0);
});
