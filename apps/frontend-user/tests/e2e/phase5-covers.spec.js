import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { installPhase4Fixtures } from './support/phase4Fixtures.js';

test('selected-template cover, saved replacements, removal and event switching stay isolated', async ({ page }) => {
  await installPhase4Fixtures(page);
  const event = { id: 101, title: 'Fictional Khmer Celebration', status: 'DRAFT', templateCode: 'khmer-celestial', coverSource: 'template', coverUrl: '/facebook/all/06-card/cover-card.jpg', templateThumbnailUrl: '/facebook/all/06-card/cover-card.jpg' };
  await page.route('**/api/v1/invitations/my', route => route.fulfill({ json: { data: [event, { id: 102, title: 'Fictional birthday', eventType: 'BIRTHDAY', templateCode: 'event-essential' }] } }));
  await page.goto('/app/events');
  const card = page.getByRole('article', { name: event.title });
  await expect(card.locator('img')).toHaveAttribute('src', event.templateThumbnailUrl);
  await expect(card.getByRole('button', { name: 'Manage event', exact: true })).toBeVisible();
  await mkdir('D:/Koupreng-UXUI-Phase5/screenshots/after', { recursive: true });
  await page.screenshot({ path: 'D:/Koupreng-UXUI-Phase5/screenshots/after/cover-draft-template-1440.png', fullPage: true });
  for (const cover of ['/images/wedding/couple-hero-meadow.webp', '/images/wedding/couple-studio-cake.webp']) {
    event.coverSource = 'owner'; event.coverUrl = cover;
    await page.reload();
    await expect(card.locator('img')).toHaveAttribute('src', cover);
    await expect(page.getByRole('article', { name: 'Fictional birthday' }).locator('img')).toHaveAttribute('src', '/templates/event-essential.svg');
  }
  event.coverUrl = '/missing-review-image.jpg';
  await page.reload();
  await expect(card.locator('img')).toHaveAttribute('src', event.templateThumbnailUrl);
  event.coverSource = 'template'; event.coverUrl = event.templateThumbnailUrl;
  await page.reload();
  await expect(card.locator('img')).toHaveAttribute('src', event.templateThumbnailUrl);
  await page.setViewportSize({ width: 390, height: 740 });
  await page.screenshot({ path: 'D:/Koupreng-UXUI-Phase5/screenshots/after/cover-template-mobile-390.png', fullPage: true });
  await page.goto('/app/events/101');
  await expect(page.locator('.overview-cover img')).toHaveAttribute('src', event.templateThumbnailUrl);
});
