import { test,expect } from '@playwright/test';
import { installPhase4Fixtures } from './support/phase4Fixtures.js';
import { uxPlans } from './support/uxFixtures.js';
import { fixtureToken } from './support/fixtureToken.js';
import process from 'node:process';
test.use({ reducedMotion:'reduce' });

// Retrospective before captures run the original 0183def5 build, not reconstructed markup.
// Both stages use the same fictional intercepted input; they are visual evidence only.
for(const stage of ['before','after']) for(const lang of ['en','km']) test(`${stage} ${lang} matched guest, generic and package inputs`,async ({ page },info) => {
  test.skip(stage === 'before' && !process.env.PHASE7_BEFORE_USER_ORIGIN, 'Retrospective evidence requires the separately supplied 0183def5 static build; current regression runs the after stage.');
  const state=await installPhase4Fixtures(page,{ count:3,lang }); state.eventOverrides={ venueAddress:'Fictional Phnom Penh address' };
  const free={ id:9,code:'FREE',packageName:'Free',price:0,currency:'USD',maxInvitations:1,maxGuests:40,maxGuestsPerInvitation:40,maxTeamMembers:1 };
  await page.route('**/api/v1/me/entitlements',route => route.fulfill({ json:{ data:{ source:'CONFIGURED_FREE_PACKAGE',packagePlan:free,features:[],usage:{ invitations:1,guests:3,teamMembers:0 } } } }));
  await page.route('**/api/v1/packages',route => route.fulfill({ json:{ data:[free,...uxPlans] } }));
  const origin=stage==='before' ? process.env.PHASE7_BEFORE_USER_ORIGIN : 'http://127.0.0.1:4173';
  for(const [screen,path] of [['guests','/app/events/101/guests'],['generic','/app/events/101/invitation?mode=guided'],['packages','/app/packages']]) {
    await page.goto(origin+path); await expect(page.getByRole('main').first()).toBeVisible();
    if(screen==='guests') await expect(page.getByText('Review Guest 1',{ exact:true }).first()).toBeVisible();
    if(screen==='packages') await expect(page.locator('.pkg-card')).toHaveCount(4);
    for(const width of [390,1440]) { await page.setViewportSize({ width,height:950 }); await page.evaluate(() => document.fonts.ready); await page.screenshot({ path:info.outputPath(`${stage}-${screen}-${lang}-${width}.png`),fullPage:true,animations:'disabled' }); }
  }
});
for(const stage of ['before','after']) for(const lang of ['en','km']) test(`${stage} admin ${lang} zero-activity dashboard`,async ({ page },info) => {
  test.skip(stage === 'before' && !process.env.PHASE7_BEFORE_ADMIN_ORIGIN, 'Retrospective evidence requires the separately supplied 0183def5 static build; current regression runs the after stage.');
  await page.clock.install({ time:new Date('2026-10-24T12:00:00Z') });
  await page.addInitScript(({ token,lang }) => { localStorage.setItem('koupreng.admin.auth',JSON.stringify({ accessToken:token,user:{ id:7,fullName:'Fictional audit admin',email:'admin@example.test',role:'ADMIN' } })); localStorage.setItem('koupreng.admin.lang',lang); },{ token:fixtureToken,lang });
  const summary={ totalUsers:0,activeUsers:0,totalTemplates:0,premiumTemplates:0,totalInvitations:0,publishedInvitations:0,totalGuests:0,totalPayments:0,failedPayments:0,totalRevenue:0,currency:'USD',revenueComparable:false,revenueByCurrency:{ USD:0,KHR:0 },recentUsers:[],recentPayments:[],recentInvitations:[] };
  await page.route('**/api/**',route => {
    const path=new URL(route.request().url()).pathname;
    if(!path.startsWith('/api/')) return route.fallback();
    let data={ summary:{},rows:[] };
    if(path.endsWith('/dashboard/summary')) data=summary;
    if(path.endsWith('/analytics/revenue')) data={ summary:{ paidRevenueByCurrency:{ USD:0,KHR:0 } },rows:[],generatedAt:'2026-10-24T12:00:00Z' };
    if(path.endsWith('/me')) data={ id:7,fullName:'Fictional audit admin',email:'admin@example.test',role:'ADMIN' };
    return route.fulfill({ json:{ data } });
  });
  await page.goto(`${stage==='before' ? process.env.PHASE7_BEFORE_ADMIN_ORIGIN : 'http://127.0.0.1:4174'}/dashboard`);
  await expect(page.getByRole('heading',{ level:2 }).first()).toBeVisible();
  await page.clock.runFor(2000);
  for(const width of [390,1440]) { await page.setViewportSize({ width,height:950 }); await page.evaluate(() => document.fonts.ready); await page.screenshot({ path:info.outputPath(`${stage}-admin-${lang}-${width}.png`),fullPage:true,animations:'disabled' }); }
});
