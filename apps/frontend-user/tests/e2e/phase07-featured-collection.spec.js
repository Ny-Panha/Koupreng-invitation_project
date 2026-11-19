import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openPhase06Fixture as open } from './support/phase06Fixtures.js';

for (const mode of ['light', 'dark']) for (const lang of ['en', 'km']) {
  test(`featured collection hover and discovery ${mode}/${lang}`, async ({ page }, info) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: info.project.name.startsWith('mobile') ? 390 : 1440, height: 900 });
    await open(page, 'home', { lang, mode, anonymous: true });
    await page.route('**/api/v1/templates', route => route.fulfill({ json: { data:
      [['silk-heritage','Silk Heritage'],['khmer-celestial','Khmer Celestial'],['emerald-canva-luxe-wedding','Emerald Luxe']]
        .map(([code,name],i) => ({ id:31+i,code,slug:code,name,status:'ACTIVE',category:'TRADITIONAL',premium:true,price:null })),
    } }));
    for (const path of ['/', '/templates']) {
      await page.goto(path);
      await expect(page.locator('.kp-design-card')).toHaveCount(3);
      await page.evaluate(() => document.fonts.ready);
      const preview = page.locator('.kp-design-card .kp-action-preview').first();
      await preview.hover();
      const axe = await new AxeBuilder({ page }).include('.kp-design-grid').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
      await info.attach(`collection-axe-${path.replaceAll('/','_')}`, { body:JSON.stringify(axe.violations,null,2),contentType:'application/json' });
      expect(axe.violations).toEqual([]);
      await expect(preview).toHaveAttribute('href','/templates/silk-heritage');
      await preview.focus(); await page.keyboard.press('Enter');
      await expect(page.locator('.sh-cover .sh-button')).toBeVisible();
    }
  });
}
