import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import { phase9Fixtures, chooseStudioSection } from './support/phase9Fixtures';
import { royalGardenDemoContent } from '../../src/features/templates/shared/royalGardenDemo';

const evidence='../../output/playwright/map-studio-upgrade-ux';
const feature='ILLUSTRATED_VENUE_MAP';
const plans=[
  {id:2,code:'PRO',packageName:'Pro',price:20,currency:'USD',durationDays:365,billingInterval:'YEARLY',purchasable:true,eligibleFeatures:[feature,'SEATING','QR_INVITATIONS'],maxInvitations:20,maxGuests:2000,maxGuestsPerInvitation:500,maxTeamMembers:3,qrInvitationsEnabled:true,seatingEnabled:true},
  {id:3,code:'PREMIUM',packageName:'Premium',price:50,currency:'USD',durationDays:365,billingInterval:'YEARLY',purchasable:true,eligibleFeatures:[feature,'SEATING','QR_INVITATIONS','PRE_WEDDING_VIDEO'],maxInvitations:50,maxGuests:5000,maxGuestsPerInvitation:1000,maxTeamMembers:5,qrInvitationsEnabled:true,seatingEnabled:true,premiumTemplatesEnabled:true},
];
async function setup(page,{allowed=true,lang='en',dark=false}={}){
  await phase9Fixtures(page,{code:'royal-garden-cinematic',content:{...royalGardenDemoContent(),isTemplateDemo:false,cinematicIntro:{enabled:false}}});
  await page.addInitScript(({lang,dark})=>{localStorage.setItem('koupreng.lang',lang);localStorage.setItem('koupreng.colorMode',dark?'dark':'light');},{lang,dark});
  await page.route('**/api/v1/invitations/101/access',route=>route.fulfill({json:{data:{owner:true,permissions:['MANAGE_INVITATION'],ownerFeatures:allowed?[feature]:[]}}}));
  await page.route('**/api/v1/me/entitlements',route=>route.fulfill({json:{data:{packagePlan:{id:1,code:'FREE',packageName:'Free'},features:allowed?[feature]:[],quotas:{invitations:{used:1,limit:1},guests:{used:10,limit:100}}}}}));
  await page.route('**/api/v1/public/packages',route=>route.fulfill({json:{data:plans}}));
  await page.route('**/api/v1/packages',route=>route.fulfill({json:{data:plans}}));
  await page.route('**/api/v1/me/subscriptions',route=>route.fulfill({json:{data:[]}}));
}
async function open(page){
  await page.goto('/app/events/101/invitation');
  await page.locator('.pe-lang-pill-btn').nth(1).click();
  await chooseStudioSection(page,'scheduleVenue',/Venue|ទីតាំង/);
  await page.locator('[data-map-entry] button.map-primary').click();
}
async function capture(page,name){await fs.mkdir(evidence,{recursive:true});await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:`${evidence}/${name}.jpg`,type:'jpeg',quality:87,animations:'disabled'});}
async function fits(page,selector){expect(await page.locator(selector).evaluate(node=>node.scrollWidth<=node.clientWidth+1)).toBe(true);}

test('refined Map Studio fits mobile/tablet/desktop with readable properties and canvas',async({page},info)=>{
  test.skip(info.project.name!=='desktop-chromium','Explicit viewport sweep covers the layouts.');test.setTimeout(120000);
  await setup(page);
  for(const[width,height]of[[320,568],[390,844],[768,1024],[1440,900]]){
    await page.setViewportSize({width,height});await open(page);
    await expect(page.getByRole('dialog',{name:'Illustrated map designer',exact:true}).getByRole('heading',{name:'Map Studio',exact:true})).toBeVisible();
    await fits(page,'.map-designer-modal');await capture(page,`map-${width}`);
    const audit=await new AxeBuilder({page}).include('.map-designer-modal').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(audit.violations).toEqual([]);
    if(width<=900)await page.locator('.map-mobile-tabs').getByRole('button',{name:'Elements',exact:true}).click();
    await page.getByRole('searchbox',{name:'Search elements'}).fill('វត្ត');
    await expect(page.locator('.map-element-grid > button')).toHaveCount(1);await expect(page.getByRole('button',{name:'Pagoda',exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Clear search'}).click();await expect(page.getByRole('searchbox',{name:'Search elements'})).toBeFocused();await expect(page.getByRole('button',{name:'Straight road',exact:true})).toBeVisible();await capture(page,`library-${width}`);
    const libraryAudit=await new AxeBuilder({page}).include('.map-library').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(libraryAudit.violations).toEqual([]);
    if(width<=900)await page.locator('.map-mobile-tabs').getByRole('button',{name:'Properties',exact:true}).click();
    await page.locator('.map-layer-list button').nth(2).click();
    await expect(page.getByLabel('English label',{exact:true})).toBeVisible();
    await page.locator('.map-appearance summary').click();await expect(page.getByRole('combobox',{name:'Font',exact:true})).toBeVisible();await capture(page,`properties-${width}`);
    await page.getByRole('button',{name:'Close designer',exact:true}).click();
  }
});

for(const[lang,dark]of[['en',false],['km',true]]){
  test(`upgrade recommendations retain verified plans and checkout context in ${lang}`,async({page},info)=>{
    test.skip(info.project.name!=='desktop-chromium','Explicit 375/1440 viewport checks cover both layouts.');test.setTimeout(120000);
    await setup(page,{allowed:false,lang,dark});
    for(const width of[375,1440]){
      await page.setViewportSize({width,height:900});await open(page);
      await expect(page.locator('.access-plan')).toHaveCount(2);await expect(page.locator('.access-current')).toContainText('Free');
      await expect(page.locator('.access-plan[data-recommended]')).toContainText('Pro');
      await expect(page.locator('.access-plan').first().locator('.access-price')).toHaveText(/(?:\$|USD).*20\.00|20\.00.*(?:\$|USD)/);
      await fits(page,'.access-dialog');await capture(page,`upgrade-${lang}-${width}`);
      if(lang==='en')await expect(page.locator('.access-dialog')).toHaveScreenshot(`upgrade-${width}.png`,{animations:'disabled',maxDiffPixelRatio:.005});
      const audit=await new AxeBuilder({page}).include('.access-dialog').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(audit.violations).toEqual([]);
      await page.locator('.access-plan > a').first().click();
      await expect(page).toHaveURL(/feature=ILLUSTRATED_VENUE_MAP/);await expect(page).toHaveURL(/package=PRO/);
      await expect(page.locator('.pkg-card')).toHaveCount(2);await expect(page.locator('.pkg-context')).toContainText(lang==='en'?'Illustrated venue map':'ផែនទីគំនូរទីតាំង');
      await expect(page.locator('.pkg-card.is-targeted')).toContainText('Pro');await fits(page,'.pkg-page');await capture(page,`plans-${lang}-${width}`);
      const planAudit=await new AxeBuilder({page}).include('.pkg-page').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(planAudit.violations).toEqual([]);
      await page.locator('.pkg-card').first().getByRole('button').click();await expect(page.locator('.pkg-checkout')).toBeVisible();
      await expect(page.locator('.pkg-checkout input')).toHaveCount(2);await page.keyboard.press('Escape');
    }
  });
}
