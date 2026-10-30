import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import { phase9Fixtures } from './support/phase9Fixtures';
import { activateOpening } from './support/activateOpening';

test('Celestial heritage, loaded fonts and scoped concept comparison', async ({ page }, info) => {
  test.setTimeout(120000);
  await fs.mkdir('../../docs/phase10/evidence/after', { recursive: true });
  for (const lang of ['en','kh']) {
    await phase9Fixtures(page, { lang });
    for (const width of [320,390,768,1440]) {
      await page.setViewportSize({ width, height: 960 });
      await page.goto('/templates/khmer-celestial/preview');
      const root = page.locator('.kc-root'); await expect(root).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('.kc-romduol').first()).toHaveAttribute('aria-hidden','true');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      if (info.project.name === 'chromium' && [390,1440].includes(width)) {
        await page.screenshot({ path: `../../docs/phase10/evidence/after/celestial-cover-${lang}-${width}.png` });
      }
      await activateOpening(page);
      await expect(page.locator('.kc-main')).toHaveAttribute('aria-hidden','false');
      await page.evaluate(() => document.fonts.ready);
      if (info.project.name === 'chromium' && [390,1440].includes(width)) {
        await page.screenshot({ path: `../../docs/phase10/evidence/after/celestial-${lang}-${width}.png`, fullPage: true });
        const budget = await page.locator('.kc-root').evaluate(node => ({ svgNodes: node.querySelectorAll('svg').length, activeAnimations: document.getAnimations().filter(animation => animation.playState === 'running').length, gardens: [...node.querySelectorAll('.kc-live-garden')].map(garden => ({ class: garden.className, butterflies: garden.querySelectorAll('.kc-garden__butterfly').length, flowers: garden.querySelectorAll('.kc-garden__flower').length, petals: garden.querySelectorAll('.kc-garden__petal').length, svgNodes: garden.querySelectorAll('svg').length })) }));
        await fs.writeFile(`../../docs/phase10/evidence/after/celestial-budget-${lang}-${width}.json`, JSON.stringify(budget,null,2));
        await page.locator('.kc-countdown').scrollIntoViewIfNeeded();
        await page.screenshot({ path: `../../docs/phase10/evidence/after/celestial-calendar-${lang}-${width}.png` });
      }
    }
  }
  if (info.project.name === 'chromium') {
    await page.setViewportSize({ width: 390, height: 960 }); await page.goto('/templates/khmer-celestial/preview');
    await activateOpening(page);
    await expect(page.locator('.kc-main')).toHaveAttribute('aria-hidden','false');
    await page.locator('.kc-hero').scrollIntoViewIfNeeded();
    await page.screenshot({ path: '../../docs/phase10/evidence/after/concept-angkor-romduol.png' });
    await page.locator('.kc-root').evaluate(node => { node.style.setProperty('--kc-ivory','#fffdf5'); node.style.setProperty('--kc-green','#665a43'); node.style.setProperty('--kc-gold','#9e804c'); });
    await page.screenshot({ path: '../../docs/phase10/evidence/after/concept-ivory-romduol.png' });
  }
});
