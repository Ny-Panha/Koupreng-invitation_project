import { test, expect } from '@playwright/test';
import { phase8Fixtures, phase8Content } from './support/phase8Fixtures';

const content = {
  ...phase8Content,
  programDays: [{ id: 'morning', date: '2027-12-05', title: '', titleEn: '' }],
  schedule: [
    { id: 'arrival', dayId: 'morning', time: '06:00', title: 'ជួបជុំភ្ញៀវកិត្តិយសទាំងសងខាង', titleEn: 'Gathering of our families and guests' },
    { id: 'procession', dayId: 'morning', time: '07:00', title: 'ពិធីហែជំនូន', titleEn: 'Groom’s procession' },
  ],
  sketchMapImage: '/templates/khmer-floral-gold/demo-map.svg',
  venueName: 'សាលមង្គលការ សួនផ្កា', venueAddress: 'រាជធានីភ្នំពេញ',
  googleMapUrl: 'https://www.google.com/maps/search/?api=1&query=Phnom+Penh',
};

for (const width of [360, 390, 430, 512, 768, 1024, 1440]) test(`reference agenda and map composition at ${width}px`, async ({ page }, info) => {
  await page.setViewportSize({ width, height: 896 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const state = await phase8Fixtures(page, { code: 'khmer-floral-gold', lang: 'km', content });
  state.events.set(101, { ...state.events.get(101), status: 'PUBLISHED' });
  await page.goto('/i/review-celestial');
  await page.locator('.kfg-open').click();
  const agenda = page.locator('.kfg-schedule');
  await expect(agenda.locator('[data-program-style="gold-curve"]')).toBeVisible();
  await expect(agenda.locator('.kp-program-curve')).toHaveCount(2);
  const first = await agenda.locator('.kp-timeline-copy').nth(0).boundingBox();
  const second = await agenda.locator('.kp-timeline-copy').nth(1).boundingBox();
  expect(first.x).toBeGreaterThan(second.x);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('.kfg-map-directions')).toHaveAttribute('href', content.googleMapUrl);
  await expect(page.locator('.kfg-map-directions .kfg-gold-plaque')).toHaveCount(1);
  await page.evaluate(() => document.fonts.ready);
  if (info.project.name === 'desktop-chromium') {
    await agenda.screenshot({ path: `../../docs/design/khmer-floral-gold/screenshots/v2/agenda-reference-${width}.png` });
    await page.locator('section.kfg-map').screenshot({ path: `../../docs/design/khmer-floral-gold/screenshots/v2/map-reference-${width}.png` });
    const action = await page.locator('.kfg-map-directions').boundingBox();
    const dock = await page.getByRole('navigation', { name: 'ផ្នែកក្នុងធៀប', exact: true }).boundingBox();
    expect(action.y + action.height).toBeLessThanOrEqual(dock.y);
  }
});

test('English venue keeps owner map and native directions, and plain/compact frames remain distinct', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const state = await phase8Fixtures(page, { code: 'khmer-floral-gold', content: { ...content, invitationStyleV1: { program: 'gold-curve', map: 'plain' } } });
  state.events.set(101, { ...state.events.get(101), status: 'PUBLISHED' });
  await page.goto('/i/review-celestial');
  await page.locator('.kfg-open').click();
  await expect(page.locator('.kp-program')).toContainText('Gathering of our families');
  await expect(page.locator('figure.kfg-map>button')).toHaveCSS('border-top-width', '0px');
  await page.getByRole('button', { name: 'View larger venue map', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Venue diagram', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  const event = state.events.get(101), next = JSON.parse(event.contentJson);
  next.invitationStyleV1.map = 'compact'; state.events.set(101, { ...event, contentJson: JSON.stringify(next) });
  await page.reload(); await page.locator('.kfg-open').click();
  await expect(page.locator('figure.kfg-map')).toHaveCSS('max-width', '260px');
});
