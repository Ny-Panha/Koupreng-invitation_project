import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import { phase9Fixtures } from './support/phase9Fixtures';
import { phase8Content } from './support/phase8Fixtures';
for (const locale of ['km', 'en']) test(`controlled initial main capture ${locale}`, async ({ page }) => {
  const { events } = await phase9Fixtures(page, { content: { ...phase8Content, groomFather: 'Fictional guardian', groomName: 'សុវណ្ណ វិសាល សិរីមង្គល', brideName: 'សុភ័ក្រ ស្រីពេជ្រ សិរីមង្គល', title: 'Phase 11 fictional celebration', messageText: 'Authored invitation for visual review', photos: [] } });
  events.set(101, { ...events.get(101), languageMode: locale === 'en' ? 'EN' : 'KH' });
  await page.goto('/i/review-celestial');
  await page.getByRole('button', { name: /^(Open invitation|\u1794\u17be\u1780\u179f\u17c6\u1794\u17bb\u178f\u17d2\u179a)/ }).click();
  await expect(page.locator('.kc-main')).toHaveAttribute('aria-hidden', 'false'); await page.evaluate(() => document.fonts.ready);
  await fs.mkdir('../../docs/phase11/evidence/before', { recursive: true });
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [key, selector] of [['family', '.kc-family'], ['program', '.kp-program'], ['venue', '.kc-venue']]) {
      const section = page.locator(selector).first(); await section.scrollIntoViewIfNeeded();
      await section.screenshot({ path: `../../docs/phase11/evidence/before/celestial-${key}-${locale}-${width}.png` });
    }
  }
});
