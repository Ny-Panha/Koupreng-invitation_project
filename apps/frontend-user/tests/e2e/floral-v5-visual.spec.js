import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import process from 'node:process';
import { phase8Fixtures } from './support/phase8Fixtures';

const decodeCoverBorders = page => page.evaluate(async () => Promise.all(['.kfg-guest-frame','.kfg-open'].map(async selector => {
  const source = getComputedStyle(document.querySelector(selector)).borderImageSource.match(/url\(["']?(.*?)["']?\)/)?.[1];
  if (source) { const image = new Image(); image.src = source; await image.decode(); }
})));

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
    await page.locator('.kfg-cover-side').evaluateAll(images => Promise.all(images.map(image => image.decode())));
    await decodeCoverBorders(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const monogram = await page.locator('.kfg-monogram').boundingBox();
    const heading = await page.locator('.kfg-opening h1').boundingBox();
    expect(heading.y + heading.height).toBeLessThanOrEqual(monogram.y);
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
    await expect(names).toHaveCount(3);
    await expect(names.nth(0)).toHaveText(/\S/);
    await expect(names.nth(1)).toHaveText('&');
    await expect(names.nth(2)).toHaveText(/\S/);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.kfg-monogram-art').evaluate(node => node.decode());
    await expect(page.locator('.kfg-invitation')).toHaveAttribute('data-motion-stage','closed');
    await expect(page.locator('.kfg-invitation')).toHaveAttribute('data-motion-settled','true');
    await page.locator('.kfg-ambience img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
    await decodeCoverBorders(page);
    await mkdir('../../output/floral-v5', { recursive: true });
    await page.locator('.kfg-opening').screenshot({ path: '../../output/floral-v5/cover-preview.png', style: '.kfg-toolbar { visibility: hidden; } .kfg-invitation *, .kfg-paper-art::before, .kfg-paper-art::after { animation-play-state: paused !important; transition: none !important; }' });
  } finally { await context.close(); }
});

test('the full closed cover fits the first viewport without scrolling', async ({ page }, info) => {
  await phase8Fixtures(page, { code: 'khmer-floral-gold' });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const [width, height] of [[360,640], [360,720], [390,844], [560,720], [1440,600], [1440,720]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/templates/khmer-floral-gold/demo?lang=km');
    await expect(page.locator('.kfg-monogram')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('.kfg-invitation')).toHaveAttribute('data-motion-stage','closed');
    await expect(page.locator('.kfg-invitation')).toHaveAttribute('data-motion-settled','true');
    const metrics = await page.locator('.kfg-invitation').evaluate(root => {
      const paper = root.querySelector('.kfg-paper-art'), box = root.getBoundingClientRect();
      const top = parseFloat(getComputedStyle(paper, '::before').height), bottom = parseFloat(getComputedStyle(paper, '::after').height);
      const frame = root.querySelector('.kfg-monogram').getBoundingClientRect();
      const guest = root.querySelector('.kfg-guest-frame').getBoundingClientRect();
      const salutation = root.querySelector('.kfg-guest > p').getBoundingClientRect();
      const heading = root.querySelector('.kfg-opening h1').getBoundingClientRect();
      const button = root.querySelector('.kfg-open').getBoundingClientRect();
      const topFlourish = root.querySelector('.kfg-guest-frame > .kfg-flourish')?.getBoundingClientRect() || guest;
      const bottomFlourish = root.querySelector('.kfg-flourish-bottom')?.getBoundingClientRect() || guest;
      const flowers = [...root.querySelectorAll('.kfg-cover-side')].map(image => image.getBoundingClientRect());
      const clearSides = [frame,heading,guest,button].every(element => flowers.every(flower => flower.right + 8 <= element.left || flower.left - 8 >= element.right || flower.bottom + 8 <= element.top || flower.top - 8 >= element.bottom));
      return { clearSides, frameHeadingGap: frame.top - heading.bottom, headingGap: salutation.top - frame.bottom, salutationGap: topFlourish.top - salutation.bottom, openGap: button.top - bottomFlourish.bottom, frameGap: heading.top - box.top - top, buttonGap: box.bottom - 44 - bottom - button.bottom, guestGap: box.bottom - 44 - bottom - guest.bottom, overflow: document.documentElement.scrollWidth > innerWidth, scroll: document.documentElement.scrollHeight > innerHeight + 1 };
    });
    expect(metrics.frameGap).toBeGreaterThan(8);
    expect(metrics.buttonGap).toBeGreaterThan(12);
    expect(metrics.guestGap).toBeGreaterThan(12);
    expect(metrics.clearSides).toBe(true);
    expect(metrics.frameHeadingGap).toBeGreaterThan(13.9);
    expect(metrics.headingGap).toBeGreaterThan(13.9);
    expect(metrics.salutationGap).toBeGreaterThanOrEqual(12);
    expect(metrics.openGap).toBeGreaterThanOrEqual(12);
    expect(metrics.overflow).toBe(false);
    expect(metrics.scroll).toBe(false);
    await expect(page.locator('.kfg-open')).toBeInViewport({ ratio: 1 });
    if (width === 390 && info.project.name === 'chromium') await page.screenshot({ path: '../../docs/design/khmer-floral-gold/screenshots/v5/responsive-mobile-opaque-border.png', fullPage: true });
  }
});
