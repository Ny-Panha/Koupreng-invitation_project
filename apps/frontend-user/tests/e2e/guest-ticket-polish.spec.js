import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import jsQR from 'jsqr';
import fs from 'node:fs/promises';
import { phase9Fixtures } from './support/phase9Fixtures';
import { installGuestDashboardFixtures } from './support/guestDashboardFixtures';

const output = '../../output/skeleton-loading/polish-after';
test.use({ reducedMotion: 'reduce' });

for (const lang of ['en', 'kh']) test(`guest filters and ticket studio stay clean across widths: ${lang}`, async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop-chromium', 'Viewport matrix runs once');
  test.setTimeout(120000);
  await phase9Fixtures(page, { lang });
  await installGuestDashboardFixtures(page, { guests: Array.from({ length: 6 }, (_, i) => ({ id: 501 + i, guestName: `Review guest ${i + 1}`, seatCount: 2, guestGroup: 'Family', sideType: 'Groom' })) });
  await fs.mkdir(output, { recursive: true });
  for (const route of ['guests', 'tickets/design']) {
    await page.goto(`/app/events/101/${route}`);
    await expect(page.locator(route === 'guests' ? '.guest-record-row' : '.ticket-design-controls').first()).toBeVisible();
    for (const width of [320, 375, 390, 430, 768, 1024, 1366, 1440]) {
      await page.setViewportSize({ width, height: 960 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      if (route === 'guests') {
        const geometry = await page.locator('.k-search-input').evaluate(input => {
          const icon = input.parentElement.querySelector('.k-search-icon').getBoundingClientRect();
          const box = input.getBoundingClientRect();
          return { textStart: box.left + parseFloat(getComputedStyle(input).paddingLeft), iconRight: icon.right, width: box.width };
        });
        expect(geometry.textStart).toBeGreaterThan(geometry.iconRight + 4);
        expect(geometry.width).toBeGreaterThan(180);
      }
      await page.screenshot({ path: `${output}/${route.replace('/', '-')}-${lang}-${width}.png`, animations: 'disabled' });
    }
    const include = route === 'guests' ? '.guest-workspace' : '.ticket-studio';
    expect((await new AxeBuilder({ page }).include(include).analyze()).violations).toEqual([]);
    await page.locator('.app-theme-toggle:visible').click();
    await page.setViewportSize({ width: 390, height: 960 });
    await page.screenshot({ path: `${output}/${route.replace('/', '-')}-${lang}-dark-390.png`, animations: 'disabled' });
    expect((await new AxeBuilder({ page }).include(include).analyze()).violations).toEqual([]);
    await page.locator('.app-theme-toggle:visible').click();
  }
});

test('one language switch persists without profile-menu duplication or draft loss', async ({ page }) => {
  await phase9Fixtures(page, { preservePreferences: true });
  await page.goto('/app/events/101/guests');
  const toggle = page.locator('.app-language-toggle:visible');
  await expect(toggle).toHaveCount(1);
  await expect(page.locator('.app-language-control select')).toHaveCount(0);
  await toggle.focus(); await page.keyboard.press('Space');
  await expect(page.locator('html')).toHaveAttribute('lang', 'km');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'km');
  await page.locator('.host-profile-pill').click();
  await expect(page.locator('.host-profile-menu')).toBeVisible();
  await expect(page.locator('.host-profile-menu .host-language-flag')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('premium ticket canvas exports a readable QR at full resolution', async ({ page }, info) => {
  await phase9Fixtures(page);
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto('/app/events/101/tickets/design');
  await expect(page.getByRole('button', { name: 'Download PNG · 2×', exact: true })).toBeEnabled();
  const result = await page.locator('.ticket-preview canvas').evaluate(canvas => {
    const image = canvas.getContext('2d').getImageData(396, 1280, 408, 408);
    return Array.from(image.data);
  });
  expect(jsQR(new Uint8ClampedArray(result), 408, 408)).not.toBeNull();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PNG · 2×', exact: true }).click();
  const download = await pending;
  await download.saveAs(info.outputPath('premium-ticket.png'));
  await fs.mkdir(output, { recursive: true });
  await download.saveAs(`${output}/premium-ticket-${info.project.name}.png`);
  expect(await page.locator('.ticket-preview canvas').evaluate(canvas => [canvas.width, canvas.height])).toEqual([1200, 1800]);
});
