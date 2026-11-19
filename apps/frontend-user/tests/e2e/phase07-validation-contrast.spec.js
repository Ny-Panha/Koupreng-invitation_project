import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openPhase06Fixture as open } from './support/phase06Fixtures.js';

for (const mode of ['light','dark']) for (const lang of ['en','km']) {
  test(`contact invalid state contrast ${mode}/${lang}`, async ({ page }, info) => {
    await open(page,'contact',{mode,lang,anonymous:true});
    await page.locator('button[type=submit]').click();
    await expect(page.locator('#contact-name')).toBeFocused();
    await expect(page.locator('.kp-field-error')).toHaveCount(3);
    const result = await new AxeBuilder({page}).include('#contact-form').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    await info.attach('invalid-form-axe',{body:JSON.stringify(result.violations,null,2),contentType:'application/json'});
    expect(result.violations).toEqual([]);
    const colors = await page.locator('.kp-field-error').first().evaluate(el=>({foreground:getComputedStyle(el).color,background:getComputedStyle(el.closest('.kp-contact-panel')).backgroundColor,border:getComputedStyle(document.querySelector('#contact-name')).borderColor}));
    await info.attach('error-colors',{body:JSON.stringify(colors),contentType:'application/json'});
  });
}
