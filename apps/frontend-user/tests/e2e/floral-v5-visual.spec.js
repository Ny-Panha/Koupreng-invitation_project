import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import process from 'node:process';
import { phase8Fixtures } from './support/phase8Fixtures';

test('Regal cover at all seven requested widths', async ({ page }, info) => {
  test.skip(info.project.name !== 'chromium', 'One deterministic visual set.');
  const pass = process.env.FLORAL_V5_PASS || 'after';
  const directory = `../../docs/design/khmer-floral-gold/screenshots/v5/${pass}`;
  await mkdir(directory, { recursive: true });
  await phase8Fixtures(page, { code: 'khmer-floral-gold' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [360, 390, 430, 512, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 896 });
    await page.goto('/templates/khmer-floral-gold/demo?lang=km');
    await expect(page.locator('.kfg-monogram')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.kfg-monogram img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const monogram = await page.locator('.kfg-monogram').boundingBox();
    const heading = await page.locator('.kfg-opening h1').boundingBox();
    expect(monogram.y + monogram.height).toBeLessThanOrEqual(heading.y);
    if (pass !== 'before') {
      await expect(page.locator('.kfg-monogram')).toHaveAttribute('data-frame', 'regal-scroll-gold');
      await expect(page.locator('.kfg-monogram-art')).toHaveCSS('object-fit', 'contain');
    }
    await page.screenshot({ path: `${directory}/cover-km-${width}.png`, fullPage: true });
    await page.locator('.kfg-language select').selectOption('en');
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${directory}/cover-en-${width}.png`, fullPage: true });
  }
});

test('export the actual opening cover for the catalog preview', async ({ browser }, info) => {
  test.skip(info.project.name !== 'chromium', 'One authored preview asset.');
  const context = await browser.newContext({ viewport: { width: 512, height: 896 }, deviceScaleFactor: 2, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  try {
    await phase8Fixtures(page, { code: 'khmer-floral-gold' });
    await page.goto('/templates/khmer-floral-gold/demo?lang=km&embed=demo');
    const names = page.locator('.kfg-monogram-staircase > span');
    await expect(names).toHaveText(['វីរៈ', '&', 'សុមាលី']);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.kfg-monogram-art').evaluate(node => node.decode());
    await mkdir('../../output/floral-v5', { recursive: true });
    await page.locator('.kfg-opening').screenshot({ path: '../../output/floral-v5/cover-preview.png', style: '.kfg-toolbar { visibility: hidden; } .kfg-invitation *, .kfg-paper-art::before, .kfg-paper-art::after { animation-play-state: paused !important; transition: none !important; }' });
  } finally { await context.close(); }
});
