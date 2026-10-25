import { test,expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.use({ reducedMotion:'reduce' });
for(const lang of ['en','km']) for(const route of ['/login','/register']) test(`authentication accessibility ${route} ${lang}`,async ({ page },info) => {
  await page.addInitScript(lang => localStorage.setItem('koupreng.lang',lang),lang);
  await page.route('**/api/**',route => {
    const path=new URL(route.request().url()).pathname;
    if(!path.startsWith('/api/')) return route.fallback();
    return route.fulfill({ json:{ data:path.includes('/i18n/messages')?{ messages:{} }:[] } });
  });
  await page.goto(route); await expect(page.locator('form')).toBeVisible(); await page.evaluate(() => document.fonts.ready);
  const results=await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
  await info.attach('axe-auth.json',{ body:JSON.stringify(results,null,2),contentType:'application/json' });
  expect(results.violations.map(v => ({ rule:v.id,nodes:v.nodes.map(n => ({ target:n.target,summary:n.failureSummary })) }))).toEqual([]);
});
