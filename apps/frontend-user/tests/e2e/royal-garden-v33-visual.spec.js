import { test, expect } from '@playwright/test';
import { phase9Fixtures, chooseStudioSection } from './support/phase9Fixtures';
import { royalGardenDemoContent } from '../../src/features/templates/shared/royalGardenDemo';

for(const width of [375,1440]){
  test(`V33 visual baseline: map designer at ${width}px`,async({page},info)=>{
    test.skip(info.project.name!=='desktop-chromium','Explicit viewport baseline is shared.');
    await page.clock.setFixedTime(new Date('2026-10-29T12:00:00Z'));await page.setViewportSize({width,height:900});
    await phase9Fixtures(page,{code:'royal-garden-cinematic',content:{...royalGardenDemoContent(),cinematicIntro:{enabled:false}}});
    await page.route('**/api/v1/invitations/101/access',route=>route.fulfill({json:{data:{owner:true,permissions:['MANAGE_INVITATION'],ownerFeatures:['ILLUSTRATED_VENUE_MAP']}}}));
    await page.goto('/app/events/101/invitation');await page.locator('.pe-lang-pill-btn').nth(1).click();await chooseStudioSection(page,'scheduleVenue','Venue');
    await page.locator('[data-map-entry] button.map-primary').click();await page.evaluate(()=>document.fonts.ready);
    await expect(page.getByRole('dialog',{name:'Illustrated map designer'})).toHaveScreenshot(`map-designer-${width}.png`,{animations:'disabled',mask:[page.locator('.map-save-state')],maxDiffPixelRatio:.005});
  });
  test(`V33 visual baseline: clean Royal Garden demo at ${width}px`,async({page},info)=>{
    test.skip(info.project.name!=='desktop-chromium','Explicit viewport baseline is shared.');
    await page.clock.setFixedTime(new Date('2026-10-29T12:00:00Z'));await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'reduce'});
    await phase9Fixtures(page,{code:'royal-garden-cinematic'});await page.goto('/templates/royal-garden-cinematic?lang=en');await page.locator('.rg-open').click();
    await expect(page.locator('[data-stage=CONTENT]')).toBeVisible();await page.locator('.rg-month-calendar').scrollIntoViewIfNeeded();await page.evaluate(()=>document.fonts.ready);
    await expect(page.locator('.rg-demo-nav,.rg-selected-day,.rg-calendar-export')).toHaveCount(0);
    await expect(page).toHaveScreenshot(`clean-demo-calendar-${width}.png`,{animations:'disabled',maxDiffPixelRatio:.005});
  });
}
