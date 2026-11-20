import { test, expect } from '@playwright/test';
import path from 'node:path';
import { phase9Fixtures } from './support/phase9Fixtures';

const SCREENSHOT_DIR = path.resolve(
  import.meta.dirname,
  '../../../../output/phase13-codex-revalidation/gemini-replay'
);

async function setupStudio(page, { lang = 'en', theme = 'light', viewport = { width: 1440, height: 900 } } = {}) {
  const state = await phase9Fixtures(page, {
    lang,
    content: {
      title: lang === 'km' ? 'ពិធីមង្គលការគំរូ' : 'Celestial Celebration',
      messageText: lang === 'km' ? 'សូមគោរពអញ្ជើញ' : 'We invite you to celebrate with us',
      photos: [],
      schedule: [],
      storyChapters: [],
      party: [],
      faq: [],
    },
  });

  state.events.set(101, {
    ...state.events.get(101),
    languageMode: lang === 'km' ? 'KH' : 'EN',
  });

  await page.route('**/api/v1/invitations/101/access', (route) =>
    route.fulfill({
      json: {
        data: {
          owner: true,
          permissions: ['MANAGE_INVITATION', 'MANAGE_GUESTS'],
          ownerFeatures: ['COUPLE_MONOGRAM', 'ILLUSTRATED_VENUE_MAP', 'QR_INVITATIONS', 'PRE_WEDDING_VIDEO'],
        },
      },
    })
  );

  await page.setViewportSize(viewport);
  await page.addInitScript(({ initialTheme, initialLang }) => {
    localStorage.setItem('theme', initialTheme);
    localStorage.setItem('koupreng.lang', initialLang);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, { initialTheme: theme, initialLang: lang });

  await page.goto('/app/events/101/invitation');
  await expect(page.locator('.studio-toolbar')).toBeVisible();
  await page.waitForTimeout(600); // allow layout stabilization
  return state;
}

test.describe('Phase 13.1 Creator Studio Visual Evidence Capture', () => {

  test('01: desktop 1440 EN light', async ({ page }) => {
    await setupStudio(page, { lang: 'en', theme: 'light', viewport: { width: 1440, height: 900 } });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-desktop-1440-en-light.png'), fullPage: false });
  });

  test('02: desktop 1440 EN dark', async ({ page }) => {
    await setupStudio(page, { lang: 'en', theme: 'dark', viewport: { width: 1440, height: 900 } });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-desktop-1440-en-dark.png'), fullPage: false });
  });

  test('03: desktop 1440 KM light', async ({ page }) => {
    await setupStudio(page, { lang: 'km', theme: 'light', viewport: { width: 1440, height: 900 } });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-desktop-1440-km-light.png'), fullPage: false });
  });

  test('04: desktop 1440 KM dark', async ({ page }) => {
    await setupStudio(page, { lang: 'km', theme: 'dark', viewport: { width: 1440, height: 900 } });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-desktop-1440-km-dark.png'), fullPage: false });
  });

  test('05: desktop 1920 EN light', async ({ page }) => {
    await setupStudio(page, { lang: 'en', theme: 'light', viewport: { width: 1920, height: 1080 } });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-desktop-1920-en-light.png'), fullPage: false });
  });

  test('06: tablet 768 EN light', async ({ page }) => {
    await setupStudio(page, { lang: 'en', theme: 'light', viewport: { width: 768, height: 1024 } });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-tablet-768-en-light.png'), fullPage: false });
  });

  test('07: tablet 768 KM light', async ({ page }) => {
    await setupStudio(page, { lang: 'km', theme: 'light', viewport: { width: 768, height: 1024 } });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-tablet-768-km-light.png'), fullPage: false });
  });

  test('08: mobile 393 EN light', async ({ page }) => {
    await setupStudio(page, { lang: 'en', theme: 'light', viewport: { width: 393, height: 851 } });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-mobile-393-en-light.png'), fullPage: false });
  });

  test('09: mobile 393 KM light', async ({ page }) => {
    await setupStudio(page, { lang: 'km', theme: 'light', viewport: { width: 393, height: 851 } });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09-mobile-393-km-light.png'), fullPage: false });
  });

  test('10: mobile 393 preview sheet open', async ({ page }) => {
    await setupStudio(page, { lang: 'en', theme: 'light', viewport: { width: 393, height: 851 } });
    const previewBtn = page.getByRole('button', { name: 'Preview' });
    if (await previewBtn.isVisible()) {
      await previewBtn.click();
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10-mobile-393-preview-sheet.png'), fullPage: false });
  });

  test('11: narrow mobile 320 EN light', async ({ page }) => {
    await setupStudio(page, { lang: 'en', theme: 'light', viewport: { width: 320, height: 568 } });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11-narrow-mobile-320-en-light.png'), fullPage: false });
  });

  test('12: narrow mobile 320 KM light', async ({ page }) => {
    await setupStudio(page, { lang: 'km', theme: 'light', viewport: { width: 320, height: 568 } });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12-narrow-mobile-320-km-light.png'), fullPage: false });
  });

  test('13: short landscape 844x390 EN', async ({ page }) => {
    await setupStudio(page, { lang: 'en', theme: 'light', viewport: { width: 844, height: 390 } });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13-short-landscape-844x390-en.png'), fullPage: false });
  });

  test('14: short landscape 844x390 KM', async ({ page }) => {
    await setupStudio(page, { lang: 'km', theme: 'light', viewport: { width: 844, height: 390 } });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14-short-landscape-844x390-km.png'), fullPage: false });
  });

  test('15: template chooser modal open', async ({ page }) => {
    await setupStudio(page, { lang: 'en', theme: 'light', viewport: { width: 1440, height: 900 } });
    const tplBtn = page.locator('.studio-template-button');
    if (await tplBtn.isVisible()) {
      await tplBtn.click();
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '15-template-chooser-modal.png'), fullPage: false });
  });

  test('16: publish review modal open', async ({ page }) => {
    await setupStudio(page, { lang: 'en', theme: 'light', viewport: { width: 1440, height: 900 } });
    const publishBtn = page.getByRole('button', { name: 'Publish' });
    if (await publishBtn.isVisible()) {
      await publishBtn.click();
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '16-publish-review-modal.png'), fullPage: false });
  });

});
