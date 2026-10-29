import { test,expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import { phase9Fixtures } from './support/phase9Fixtures';
import { installOperationsFixtures } from './support/operationsFixtures';
import { installGuestDashboardFixtures } from './support/guestDashboardFixtures';

const output='../../output/playwright/next-studio-ux/project-wide';
const features=['PREMIUM_TEMPLATES','QR_INVITATIONS','QR_CHECK_IN','SEATING','ADVANCED_ANALYTICS','CUSTOM_BRANDING','TEAM_MEMBERS','AI_ASSISTANT','GUEST_IMPORT','PRE_WEDDING_VIDEO','COUPLE_MONOGRAM','ILLUSTRATED_VENUE_MAP'];
async function fixtures(page,lang='en') {
  const state=await phase9Fixtures(page,{lang,preservePreferences:true});
  await installOperationsFixtures(page,lang,{installBase:false});
  const guests=[{id:501,guestName:'Fictional guest',seatCount:2,sendStatus:'SENT'}];
  await installGuestDashboardFixtures(page,{guests});
  await page.route('**/api/v1/invitations/101/access',route=>route.fulfill({json:{data:{owner:true,permissions:[],ownerFeatures:features,organizationId:null}}}));
  await page.route('**/api/v1/me/entitlements',route=>route.fulfill({json:{data:{packagePlan:{id:3,code:'PREMIUM',packageName:'Premium'},features,quotas:{guests:{limit:99999,used:1},invitations:{limit:999,used:1}}}}}));
  const qr=`data:image/png;base64,${(await fs.readFile(new URL('./support/fixtures/ticket-qr.png',import.meta.url))).toString('base64')}`;
  await page.route('**/api/v1/invitations/101/qr',route=>route.fulfill({json:{data:{kind:'GENERAL',title:'Celestial celebration',qrCodeDataUri:qr,invitationUrl:'https://fixture.invalid/i/review-celestial'}}}));
  await page.route('**/api/v1/invitations/101/analytics?*',route=>route.fulfill({json:{data:{from:'2026-10-01',to:'2026-10-28',timezone:'Asia/Phnom_Penh',current:{guestRecords:2,reservedSeats:3,respondedRecords:1,confirmedAttendees:2,checkedInRecords:1},days:[{date:'2026-10-28',guestRecordsCreated:2,latestRsvpRecords:1,attendingRecords:1,declinedRecords:0,maybeRecords:0,activeCheckInRecords:1}]}}}));
  return state;
}
const overflow=async page=>expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);

test('navbar theme and Khmer/English controls persist without changing the Studio draft or iframe',async({page})=>{
  await fixtures(page);await page.setViewportSize({width:1440,height:900});
  await page.goto('/app/events/101/invitation');
  const draft=page.locator('input[name="groomName"]');await draft.fill('Keep this authored name');
  const frame=page.locator('iframe').first();await frame.evaluate(node=>{node.dataset.themeIdentity='kept';});
  await page.locator('.app-theme-toggle:visible').click();await expect(page.locator('html')).toHaveAttribute('data-color-mode','dark');
  await page.locator('.app-language-toggle:visible').click();
  await expect(draft).toHaveValue('Keep this authored name');await expect(frame).toHaveAttribute('data-theme-identity','kept');await overflow(page);
  await page.setViewportSize({width:390,height:900});await overflow(page);await expect(draft).toHaveValue('Keep this authored name');
  await page.locator('.studio-action--save').click();await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase','saved');
  await page.reload();await expect(page.locator('html')).toHaveAttribute('data-color-mode','dark');await expect(page.locator('.app-language-toggle:visible')).toHaveAttribute('aria-checked','false');
});

test('landing light/dark surfaces, keyboard controls and mobile navigation remain usable',async({page},info)=>{
  test.skip(info.project.name!=='desktop-chromium','Capture once');test.setTimeout(90000);
  await page.emulateMedia({reducedMotion:'reduce'});
  await fixtures(page);await fs.mkdir(output,{recursive:true});
  for(const width of [320,390,768,1440]) {
    await page.setViewportSize({width,height:960});await page.goto('/');await expect(page.locator('#kp-hero-title')).toBeVisible();
    const toggle=page.locator('.app-theme-toggle:visible');await expect(toggle).toHaveCount(1);
    if(await page.locator('html').getAttribute('data-color-mode')!=='dark') await toggle.click();
    expect(await page.locator('.kp-landing').evaluate(node=>getComputedStyle(node).backgroundColor)).toBe('rgb(17, 26, 22)');
    await overflow(page);await page.screenshot({path:`${output}/landing-dark-${width}.jpg`,type:'jpeg',quality:80,animations:'disabled'});
    if(width===1440) {
      const audit=await new AxeBuilder({page}).include('.kp-marketing-shell').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      const violations=audit.violations.map(({id,nodes})=>({id,nodes:nodes.map(({html,failureSummary})=>({html,failureSummary}))}));
      await fs.writeFile(`${output}/landing-dark-accessibility.json`,JSON.stringify(violations,null,2));
      expect(violations).toEqual([]);
      await page.screenshot({path:`${output}/landing-dark-full.jpg`,type:'jpeg',quality:80,animations:'disabled',fullPage:true});
    }
    await toggle.click();await expect(page.locator('html')).toHaveAttribute('data-color-mode','light');await overflow(page);
  }
});

const routes=[['events','/app/events','.events-page,.pe-events-page,.event-card'],['overview','/app/events/101','.event-overview'],['guests','/app/events/101/guests','.guest-workspace'],['invitation','/app/events/101/invitation','.invitation-studio'],['rsvp','/app/events/101/rsvp','.rsvp-page'],['delivery','/app/events/101/delivery','.delivery-workspace h1'],['tickets','/app/events/101/tickets/design','.ticket-studio'],['preview','/app/events/101/preview','.inv-preview-header'],['media','/app/events/101/media','.media-library'],['seating','/app/events/101/seating','.seating-page'],['checkin','/app/events/101/check-in','.checkin-hero-banner'],['analytics','/app/events/101/analytics','.attendance-analytics .analytics-totals'],['gifts','/app/events/101/gifts','.wg-page'],['budget','/app/events/101/budget','.ep-page,.exp-page'],['reports','/app/events/101/reports','.financial-report-page'],['qr','/app/events/101/qr','.qr-page h1'],['wishes','/app/events/101/wishes','.wishes-page'],['settings','/app/events/101/settings','#event-title'],['team','/app/events/101/team','.workspace-heading h1']];
for (const [name,path,ready] of routes) test(`${name} renders responsive light and dark surfaces`,async({page},info)=>{
  test.skip(info.project.name!=='desktop-chromium','Capture once');test.setTimeout(240000);await fs.mkdir(output,{recursive:true});
  await fixtures(page);
    for(const [mode,width] of [['light',1440],['dark',390],['dark',768],['dark',1440]]) {
      await page.setViewportSize({width,height:960});
      await page.goto(path,{waitUntil:'domcontentloaded'});await expect(page.locator(ready).first()).toBeVisible();
      if(await page.locator('html').getAttribute('data-color-mode')!==mode) await page.locator('.app-theme-toggle:visible').first().click();
      await expect(page.locator('html')).toHaveAttribute('data-color-mode',mode);await overflow(page);
      if(name==='invitation' && width===1440) await expect(page.frameLocator('iframe').locator('.kc-root')).toBeAttached();
      if(name==='preview') await expect(page.locator('.kc-root')).toBeAttached();
      await page.screenshot({path:`${output}/${name}-${mode}-${width}.jpg`,type:'jpeg',quality:75,animations:'disabled'});
      if(mode==='dark' && width===1440) {
        const audit=await new AxeBuilder({page}).include(name==='events'?'.events-page':'.event-workspace-content').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
        const violations=audit.violations.map(({id,nodes})=>({id,nodes:nodes.map(({html,failureSummary})=>({html,failureSummary}))}));
        await fs.writeFile(`${output}/${name}-dark-accessibility.json`,JSON.stringify(violations,null,2));
        expect(violations).toEqual([]);
      }
    }
});

for(const [name,path,ready,width,lang] of [
  ['events','/app/events','.events-page',1440,'en'],
  ['overview','/app/events/101','.event-overview',390,'km'],
]) for(const mode of ['light','dark']) test(`visual baseline ${name} ${mode} ${lang}`,async({page},info)=>{
  test.skip(info.project.name!=='desktop-chromium','Golden images use one Windows Chromium renderer');
  // Match the committed golden's 402-day countdown without date-driven pixel drift.
  await page.clock.setFixedTime(new Date('2026-10-28T12:00:00Z'));
  await fixtures(page,lang);await page.setViewportSize({width,height:960});
  await page.goto(path);await expect(page.locator(ready)).toBeVisible();
  if(await page.locator('html').getAttribute('data-color-mode')!==mode) await page.locator('.app-theme-toggle:visible').click();
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(img=>img.decode().catch(()=>{})));});
  expect((await new AxeBuilder({page}).include(ready).include('.host-header-wrapper').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  await expect(page).toHaveScreenshot(`${name}-${mode}-${lang}-${width}.png`,{animations:'disabled',maxDiffPixels:100});
});
