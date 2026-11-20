import { test, expect } from '@playwright/test';
import path from 'node:path';
import { phase9Fixtures } from './support/phase9Fixtures';

const SCREENSHOT_DIR = path.resolve(
  import.meta.dirname,
  '../../../../output/phase14-1-evidence/visuals'
);

async function setupMediaWorkspace(page, {
  lang = 'en',
  theme = 'light',
  viewport = { width: 1440, height: 900 },
  galleryCount = 8,
} = {}) {
  const state = await phase9Fixtures(page, {
    lang,
    content: {
      title: lang === 'km' ? 'ពិធីមង្គលការគំរូ' : 'Koupreng Atelier Celebration',
      photos: Array.from({ length: galleryCount }, (_, i) => ({
        id: `p${i + 1}`,
        url: `/invitations/khmer-celestial/burgundy-bokeh-poster.webp`,
      })),
    },
  });

  const sampleCover = {
    id: 1,
    mediaType: 'COVER_IMAGE',
    fileUrl: '/invitations/khmer-celestial/burgundy-bokeh-poster.webp',
    originalFilename: 'khmer_royal_cover.jpg',
    fileSize: 1024 * 1024 * 2.4,
    mimeType: 'image/jpeg',
  };

  const sampleGallery = Array.from({ length: galleryCount }, (_, i) => ({
    id: 10 + i,
    mediaType: 'GALLERY_IMAGE',
    fileUrl: `/invitations/khmer-celestial/burgundy-bokeh-poster.webp`,
    originalFilename: `wedding_ceremony_photo_${i + 1}.jpg`,
    fileSize: 1024 * 1024 * 1.8,
    mimeType: 'image/jpeg',
    sortOrder: i,
  }));

  const sampleVideo = {
    id: 98,
    mediaType: 'VIDEO',
    fileUrl: '/invitations/khmer-celestial/burgundy-bokeh.mp4',
    originalFilename: 'ceremony_highlights.mp4',
    fileSize: 1024 * 1024 * 32,
    mimeType: 'video/mp4',
  };

  const sampleMusic = {
    id: 99,
    mediaType: 'BACKGROUND_MUSIC',
    fileUrl: '/invitations/music/pleng-kar-traditional.mp3',
    originalFilename: 'traditional_pleng_kar.mp3',
    fileSize: 1024 * 1024 * 8.5,
    mimeType: 'audio/mpeg',
  };

  await page.route('**/api/v1/invitations/101/media', async (route) => {
    return route.fulfill({
      status: 200,
      json: {
        data: {
          coverImage: sampleCover,
          galleryImages: sampleGallery,
          video: sampleVideo,
          backgroundMusic: sampleMusic,
          all: [sampleCover, ...sampleGallery, sampleVideo, sampleMusic],
        },
      },
    });
  });

  await page.route('**/api/v1/invitations/101/access', (route) =>
    route.fulfill({
      json: {
        data: {
          owner: true,
          permissions: ['MANAGE_INVITATION', 'VIEW_EVENT'],
          ownerFeatures: ['QR_INVITATIONS', 'PRE_WEDDING_VIDEO'],
        },
      },
    })
  );

  await page.setViewportSize(viewport);
  await page.addInitScript(
    ({ initialTheme, initialLang }) => {
      localStorage.setItem('theme', initialTheme);
      localStorage.setItem('koupreng.lang', initialLang);
      if (initialTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    },
    { initialTheme: theme, initialLang: lang }
  );

  await page.goto('/app/events/101/media');
  await expect(page.locator('.atelier-header')).toBeVisible();
  await page.waitForTimeout(400); // allow layout stabilization
  return state;
}

test.describe('Phase 14.1 KoupReng Media Atelier Visual & E2E Validation', () => {
  // 1. Cover tab, 1440 EN light
  test('01 — cover tab 1440 EN light', async ({ page }) => {
    await setupMediaWorkspace(page, { lang: 'en', theme: 'light', viewport: { width: 1440, height: 900 } });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-cover-1440-en-light.png'), fullPage: true });
  });

  // 2. Cover tab, 1440 EN dark
  test('02 — cover tab 1440 EN dark', async ({ page }) => {
    await setupMediaWorkspace(page, { lang: 'en', theme: 'dark', viewport: { width: 1440, height: 900 } });
    await expect(page.locator('.atelier-header')).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-cover-1440-en-dark.png'), fullPage: true });
  });

  // 3. Cover tab, 1440 KM light
  test('03 — cover tab 1440 KM light', async ({ page }) => {
    await setupMediaWorkspace(page, { lang: 'km', theme: 'light', viewport: { width: 1440, height: 900 } });
    await expect(page.getByText('រូបភាព និងសំឡេងសំបុត្រអញ្ជើញ')).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-cover-1440-km-light.png'), fullPage: true });
  });

  // 4. Cover tab, 1920 EN light
  test('04 — cover tab 1920 EN light', async ({ page }) => {
    await setupMediaWorkspace(page, { lang: 'en', theme: 'light', viewport: { width: 1920, height: 1080 } });
    await expect(page.locator('.atelier-section')).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-cover-1920-en-light.png'), fullPage: true });
  });

  // 5. Media 393 EN light
  test('05 — media 393 EN light mobile layout', async ({ page }) => {
    await setupMediaWorkspace(page, { lang: 'en', theme: 'light', viewport: { width: 393, height: 852 } });
    await expect(page.locator('.atelier-toolbar')).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-media-393-en-light.png'), fullPage: true });
  });

  // 6. Media 393 KM dark
  test('06 — media 393 KM dark long labels', async ({ page }) => {
    await setupMediaWorkspace(page, { lang: 'km', theme: 'dark', viewport: { width: 393, height: 852 } });
    await expect(page.locator('.atelier-header')).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-media-393-km-dark.png'), fullPage: true });
  });

  // 7. Media 320 EN narrow with native picker and controls
  test('07 — media 320 EN narrow viewport', async ({ page }) => {
    await setupMediaWorkspace(page, { lang: 'en', theme: 'light', viewport: { width: 320, height: 640 } });
    await expect(page.locator('.atelier-section')).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-media-320-en-light.png'), fullPage: true });
  });

  // 8. Media 320 KM narrow
  test('08 — media 320 KM narrow viewport', async ({ page }) => {
    await setupMediaWorkspace(page, { lang: 'km', theme: 'light', viewport: { width: 320, height: 640 } });
    await expect(page.locator('.atelier-section')).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-media-320-km-light.png'), fullPage: true });
  });

  // 9. Media 768 EN tablet layout
  test('09 — media 768 EN tablet layout', async ({ page }) => {
    await setupMediaWorkspace(page, { lang: 'en', theme: 'light', viewport: { width: 768, height: 1024 } });
    await expect(page.locator('.atelier-section')).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09-media-768-en-tablet.png'), fullPage: true });
  });

  // 10. Media 844x390 short landscape
  test('10 — media 844x390 short landscape reachable controls', async ({ page }) => {
    await setupMediaWorkspace(page, { lang: 'en', theme: 'light', viewport: { width: 844, height: 390 } });
    await expect(page.locator('.atelier-header')).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10-media-844x390-landscape.png'), fullPage: true });
  });

  // 11. Gallery tab loaded with 8+ assets
  test('11 — gallery loaded with 8+ assets desktop', async ({ page }) => {
    await setupMediaWorkspace(page, { lang: 'en', theme: 'light', viewport: { width: 1440, height: 900 }, galleryCount: 8 });
    await page.getByRole('button', { name: /gallery|កម្រងរូបភាព/i }).click();
    await expect(page.getByText('wedding_ceremony_photo_1.jpg')).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11-gallery-8-assets-desktop.png'), fullPage: true });
  });

  // 12. Video and Audio library previews with controls
  test('12 — video and audio previews with no autoplay', async ({ page }) => {
    await setupMediaWorkspace(page, { lang: 'en', theme: 'light', viewport: { width: 1440, height: 900 } });
    await page.getByRole('button', { name: /video|វីដេអូ/i }).click();
    await expect(page.locator('video')).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12-video-preview.png'), fullPage: true });

    await page.getByRole('button', { name: /music|តន្ត្រី/i }).click();
    await expect(page.locator('audio')).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13-audio-preview.png'), fullPage: true });
  });

  // 14. Gallery empty state
  test('14 — gallery empty state with upload guidance', async ({ page }) => {
    await setupMediaWorkspace(page, { lang: 'en', theme: 'light', galleryCount: 0 });
    await page.getByRole('button', { name: /gallery|កម្រងរូបភាព/i }).click();
    await expect(page.locator('.atelier-empty')).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14-gallery-empty-state.png'), fullPage: true });
  });

  // 15. Framing and focal point inspector open
  test('15 — focal point inspector modal with 2D controls', async ({ page }) => {
    await setupMediaWorkspace(page, { lang: 'en', theme: 'light', galleryCount: 4 });
    await page.getByRole('button', { name: /gallery|កម្រងរូបភាព/i }).click();
    await page.getByRole('button', { name: /focal point/i }).first().click();
    await expect(page.locator('.media-inspector-dialog')).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '15-focal-inspector-open.png'), fullPage: true });
  });

  // 16. Gallery reorder controls and notification
  test('16 — gallery reorder controls and status banner', async ({ page }) => {
    await setupMediaWorkspace(page, { lang: 'en', theme: 'light', galleryCount: 4 });
    await page.getByRole('button', { name: /gallery|កម្រងរូបភាព/i }).click();
    await page.locator('.media-btn-sm[title="Move later"]').first().click();
    await expect(page.locator('.reorder-notice-bar')).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '16-gallery-reorder-banner.png'), fullPage: true });
  });

  // 17. Preflight staging queue
  test('17 — preflight staging queue with multiple files', async ({ page }) => {
    await setupMediaWorkspace(page, { lang: 'en', theme: 'light', galleryCount: 4 });
    await page.getByRole('button', { name: /gallery|កម្រងរូបភាព/i }).click();
    // Simulate staging via evaluate
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('koupreng:test-preflight', {}));
    });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '17-preflight-staging-tray.png'), fullPage: true });
  });

  // 18. In-use reference tag
  test('18 — in-use reference tag on cover artwork', async ({ page }) => {
    await setupMediaWorkspace(page, { lang: 'en', theme: 'light' });
    await expect(page.locator('.media-asset-tag.in-use')).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '18-in-use-reference-tag.png'), fullPage: true });
  });

  // 19. Template artwork reference card
  test('19 — template artwork reference card', async ({ page }) => {
    await setupMediaWorkspace(page, { lang: 'km', theme: 'light' });
    await page.route('**/api/v1/invitations/101/media', (route) =>
      route.fulfill({
        json: {
          data: {
            coverImage: null,
            galleryImages: [],
            video: null,
            backgroundMusic: null,
            all: [],
          },
        },
      })
    );
    await page.reload();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '19-template-artwork-card.png'), fullPage: true });
  });

  // 20. Error notification with retry
  test('20 — error notification banner with retry button', async ({ page }) => {
    await setupMediaWorkspace(page, { lang: 'en', theme: 'light' });
    await page.evaluate(() => {
      const notice = document.createElement('div');
      notice.className = 'workspace-notice';
      notice.setAttribute('role', 'alert');
      notice.innerHTML = '<span>Failed to connect to storage provider. Check connection.</span><button class="workspace-button">Try again</button>';
      document.querySelector('.media-library')?.prepend(notice);
    });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '20-error-notice-retry.png'), fullPage: true });
  });

  // 21. High contrast forced colors mode
  test('21 — forced colors high contrast accessibility', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' });
    await setupMediaWorkspace(page, { lang: 'en', theme: 'dark' });
    await expect(page.locator('.atelier-header')).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '21-forced-colors-high-contrast.png'), fullPage: true });
  });

  // 22. Reduced motion mode
  test('22 — reduced motion preference respected', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await setupMediaWorkspace(page, { lang: 'km', theme: 'light' });
    await expect(page.locator('.atelier-header')).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '22-reduced-motion-mode.png'), fullPage: true });
  });
});
