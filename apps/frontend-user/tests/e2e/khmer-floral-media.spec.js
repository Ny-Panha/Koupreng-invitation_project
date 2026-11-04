import { expect, test } from '@playwright/test';
import { installIdentityFixtures } from './support/templateIdentityFixtures.js';
import { chooseStudioSection } from './support/studioNavigationActions.js';

test('Free studio uploads portraits and a venue diagram and restores durable URLs after refresh', async ({ page }) => {
  const template = { id: 81, code: 'khmer-floral-gold', name: 'Khmer Floral Gold', status: 'ACTIVE', price: 0, currency: 'USD', premium: false, supportedEventTypes: ['WEDDING'], supportedLanguages: ['KH','EN','BOTH'] };
  const { events, writes } = await installIdentityFixtures(page, { catalog: [template] });
  events.set(101, { ...events.get(101), templateId: 81, templateCode: template.code, designJson: '{}', contentJson: '{}' });
  const urls = ['groom', 'bride', 'venue-map'].map(name => `/uploads/floral-${name}.webp`);
  let uploads = 0;
  await page.route('**/api/v1/invitations/101/media/gallery', route => {
    uploads++;
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ data: urls.map((fileUrl, id) => ({ id: id + 1, fileUrl, mediaType: 'GALLERY_IMAGE' })) }) });
  });
  await page.route('**/uploads/floral-*.webp', route => route.fulfill({ path: 'public/templates/khmer-floral-gold/groom.webp', contentType: 'image/webp' }));
  await page.goto('/app/events/101/invitation');
  await chooseStudioSection(page, 'mediaOpening');
  const portraits = page.locator('[data-studio-section="couplePhoto"] input[type="file"]');
  await portraits.nth(0).setInputFiles('public/templates/khmer-floral-gold/groom.webp');
  await portraits.nth(1).setInputFiles('public/templates/khmer-floral-gold/bride.webp');
  await chooseStudioSection(page, 'scheduleVenue', 'Venue');
  await page.locator('[data-studio-section="venue"] input[type="file"]').setInputFiles('public/templates/khmer-floral-gold/couple-480.webp');
  await expect(page.locator('[data-studio-section="venue"] img')).toHaveAttribute('src', /^data:/);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect.poll(() => writes.at(-1)?.payload.contentJson || '').toContain(urls[2]);
  const content = JSON.parse(writes.at(-1).payload.contentJson), design = JSON.parse(writes.at(-1).payload.designJson);
  expect(content).toMatchObject({ invitationImage: urls[0], invitationImage2: urls[1], sketchMapImage: urls[2] });
  expect(design.sketchMapImage).toBe(urls[2]); expect(uploads).toBe(1);
  await page.reload();
  await chooseStudioSection(page, 'scheduleVenue', 'Venue');
  await expect(page.locator('[data-studio-section="venue"] img')).toHaveAttribute('src', urls[2]);
});
