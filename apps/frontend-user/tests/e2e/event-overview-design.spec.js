import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import { phase9Fixtures } from './support/phase9Fixtures';
import { installGuestDashboardFixtures } from './support/guestDashboardFixtures';

const output='../../output/playwright/next-studio-ux/after';
test('event overview and guest list keep only useful controls and fit both languages',async({page},info)=>{
  test.skip(info.project.name!=='desktop-chromium','Capture the responsive matrix once');
  test.setTimeout(120000);
  await fs.mkdir(output,{recursive:true});
  for (const lang of ['en','kh']) {
    const {events}=await phase9Fixtures(page,{lang});
    events.set(101,{...events.get(101),status:'PUBLISHED'});
    const guests=Array.from({length:24},(_,i)=>({id:501+i,guestName:`Guest ${i+1}`,seatCount:1,sendStatus:i<18?'SENT':'PENDING'}));
    await installGuestDashboardFixtures(page,{guests});
    await page.route('**/api/v1/invitations/101/dashboard',route=>route.fulfill({json:{data:{totalGuests:24,attending:12,declined:2,pending:10,deliverySent:18}}}));
    await page.route('**/api/v1/invitations/101/access',route=>route.fulfill({json:{data:{owner:true,permissions:[],ownerFeatures:['QR_INVITATIONS','QR_CHECK_IN','SEATING'],quotas:{guestsPerInvitation:{limit:5000,used:24,remaining:4976}}}}}));
    for (const width of [320,390,768,1024,1440,1920]) {
      await page.setViewportSize({width,height:960});
      await page.goto('/app/events/101',{waitUntil:'domcontentloaded'});
      await expect(page.locator('.event-overview .overview-hero h2')).toBeVisible();
      await expect(page.locator('.overview-metrics')).toContainText('24');
      await expect(page.getByText('Your preparation, guests and next steps in one place.')).toHaveCount(0);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
      await page.evaluate(()=>document.fonts.ready);
      await page.screenshot({path:`${output}/event-overview-${lang}-${width}.jpg`,type:'jpeg',quality:80,animations:'disabled'});
      if(width===1440) expect((await new AxeBuilder({page}).include('.event-overview').analyze()).violations).toEqual([]);
    }
    await page.goto('/app/events/101/guests',{waitUntil:'domcontentloaded'});
    await expect(page.locator('.guest-record-row')).toHaveCount(24);
    await expect(page.locator('.guest-count-definitions,.guest-page-description,[data-quota]')).toHaveCount(0);
    await page.screenshot({path:`${output}/guests-clean-${lang}.jpg`,type:'jpeg',quality:80,animations:'disabled'});
  }
});
