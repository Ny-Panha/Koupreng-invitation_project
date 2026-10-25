import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { installUxFixtures, uxPlans } from './support/uxFixtures.js';
import { installPhase4Fixtures } from './support/phase4Fixtures.js';
import { installIdentityFixtures } from './support/templateIdentityFixtures.js';

test.use({ reducedMotion: 'reduce' });
async function audit(page,info,state) {
  await page.evaluate(() => document.fonts.ready);
  const results=await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
  await info.attach(`axe-${state}.json`, { body:JSON.stringify(results,null,2),contentType:'application/json' });
  expect(results.violations.map(item => ({ rule:item.id, impact:item.impact, nodes:item.nodes.map(node => ({ target:node.target, summary:node.failureSummary })) }))).toEqual([]);
}
for(const lang of ['en','kh']) for(const screen of ['create','generic','studio','packages','guests','team','analytics']) {
  test(`axe ${screen} ${lang}`,async ({ page },info) => {
    if(screen==='guests') await installPhase4Fixtures(page,{ count:3,lang });
    else if(screen==='studio') { await installIdentityFixtures(page); await page.addInitScript(lang => localStorage.setItem('koupreng.lang',lang),lang); }
    else await installUxFixtures(page,lang);
    await page.route('**/api/v1/me/entitlements',route => route.fulfill({ json:{ data:{ source:'CONFIGURED_FREE_PACKAGE',packagePlan:{ id:9,code:'FREE',packageName:'Free',price:0,currency:'USD',maxInvitations:1,maxGuests:40,maxGuestsPerInvitation:40,maxTeamMembers:1 },usage:{ invitations:0,guests:0,teamMembers:0 },features:[] } } }));
    if(screen==='team') {
      await page.route('**/api/v1/invitations/101/access',route => route.fulfill({ json:{ data:{ owner:true,ownerFeatures:['TEAM_MEMBERS'],permissions:[],organizationId:null } } }));
      await page.route('**/api/v1/organizations',route => route.fulfill({ json:{ data:[{ id:11,name:'Fictional team',ownerUserId:7 }] } }));
    }
    if(screen==='packages') await page.route('**/api/v1/packages',route => route.fulfill({ json:{ data:uxPlans.map(plan => ({ ...plan,teamMembersEnabled:true,advancedAnalyticsEnabled:true })) } }));
    if(screen==='analytics') await page.route('**/api/v1/invitations/101/analytics?**',route => route.fulfill({ json:{ data:{ from:'2026-10-23',to:'2026-10-23',timezone:'Asia/Phnom_Penh',current:{ guestRecords:4,reservedSeats:10,respondedRecords:3,confirmedAttendees:2,checkedInRecords:1 },days:[{ date:'2026-10-23',guestRecordsCreated:4,latestRsvpRecords:3,attendingRecords:1,declinedRecords:1,maybeRecords:1,activeCheckInRecords:1 }] } } }));
    const routes={ create:'/app/events/new',generic:'/app/events/101/invitation?mode=guided',studio:'/app/events/101/invitation?mode=guided',packages:'/app/packages',guests:'/app/events/101/guests',team:'/app/events/101/team',analytics:'/app/events/101/analytics' };
    await page.goto(routes[screen]);
    await expect(page.getByRole('main').first()).toBeVisible();
    if(screen==='guests') await expect(page.locator('.guest-record-row')).toHaveCount(3);
    if(screen==='analytics') await expect(page.getByRole('table')).toBeVisible();
    if(screen==='studio') await expect(page.locator('.invitation-studio')).toBeVisible();
    if(screen==='team') await expect(page.locator('select').last()).toBeVisible();
    if(screen==='packages') await expect(page.locator('.pkg-comparison')).toBeVisible();
    await audit(page,info,'default');
    if(screen==='generic' && lang==='en') {
      await page.getByRole('button',{ name:'Review publication',exact:true }).click();
      const dialog=page.getByRole('dialog',{ name:'Review publication' }); await expect(dialog).toBeVisible();
      await audit(page,info,'publish-review');
      await page.keyboard.press('Escape'); await expect(dialog).toBeHidden();
    }
    if(screen==='guests' && lang==='en') {
      await page.getByRole('button',{ name:'Import',exact:true }).click();
      await expect(page.getByRole('dialog',{ name:'Import guests' })).toBeVisible();
      await audit(page,info,'import-dialog');
    }
  });
}
