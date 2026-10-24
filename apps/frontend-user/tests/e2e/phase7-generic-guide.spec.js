import { expect, test } from '@playwright/test';
import { installUxFixtures, uxEvents } from './support/uxFixtures.js';

for (const lang of ['en','kh']) test(`generic invitation guided steps reflow in ${lang}`, async ({ page },info) => {
  await installUxFixtures(page,lang);
  let event={ ...uxEvents[0], eventType: 'BIRTHDAY', hostName: 'Sokha', title: 'Fictional birthday', venueAddress: 'Fictional address', updatedAt: '2026-10-24T10:00:00Z' };
  await page.route('**/api/v1/invitations/101', route => {
    if(route.request().method() === 'PUT') event={ ...event,...route.request().postDataJSON(),updatedAt: '2026-10-24T10:01:00Z' };
    return route.fulfill({ json: { data: event } });
  });
  await page.route('**/api/v1/invitations/101/publish', route => { event={ ...event,status:'PUBLISHED',slug:'fictional-birthday',updatedAt:'2026-10-24T10:02:00Z' }; return route.fulfill({ json:{ data:event } }); });
  await page.goto('/app/events/101/invitation?mode=guided');
  await expect(page.locator('.studio-guide-steps li')).toHaveCount(5);
  for(const width of [320,375,390,430,768,1024,1366,1440,1920]) {
    await page.setViewportSize({ width,height:900 }); await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await page.screenshot({ path:info.outputPath(`generic-guide-${lang}-${width}.png`),fullPage:true });
  }
  if(lang === 'en') {
    await page.getByRole('button',{ name:'Review publication',exact:true }).click();
    await page.getByRole('button',{ name:'Confirm publication',exact:true }).click();
    await expect(page.getByRole('link',{ name:'View invitation',exact:true })).toHaveAttribute('href', /\/i\/fictional-birthday$/);
  }
});
