import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import { phase9Fixtures } from './support/phase9Fixtures';

const evidence='../../output/playwright/package-purchase-ux';
const plan={id:2,code:'PRO',packageName:'Pro',price:20,currency:'USD',durationDays:365,billingInterval:'YEARLY',purchasable:true,eligibleFeatures:['ILLUSTRATED_VENUE_MAP','SEATING'],maxInvitations:20,maxGuests:2000,maxGuestsPerInvitation:500,maxTeamMembers:3,seatingEnabled:true};
// Browser-only API fixtures. These tests never create or pay for a live order.
async function setup(page,lang='en'){
  await phase9Fixtures(page);
  await page.addInitScript(lang=>{localStorage.setItem('koupreng.lang',lang);localStorage.setItem('koupreng.colorMode',lang==='km'?'dark':'light');},lang);
  const state={created:false,purchases:[],failStatus:false,order:{orderCode:'SUB-UX-EXAMPLE',packagePlan:plan,amount:20,currency:'USD',status:'PENDING_PAYMENT',paymentStatus:'PENDING',active:false,paymentUrl:'https://payment.example.test/aba',expiresAt:'2030-11-01T12:00:00Z'}};
  await page.route('**/api/v1/packages',route=>route.fulfill({json:{data:[plan]}}));
  await page.route('**/api/v1/public/packages',route=>route.fulfill({json:{data:[plan]}}));
  await page.route('**/api/v1/me/entitlements',route=>route.fulfill({json:{data:{packagePlan:state.order.active?plan:{id:1,code:'FREE',packageName:'Free'},features:state.order.active?plan.eligibleFeatures:[],quotas:{}}}}));
  await page.route('**/api/v1/me/subscriptions',route=>route.fulfill({json:{data:state.created?[state.order]:[]}}));
  await page.route('**/api/v1/me/subscriptions/purchase',route=>{state.purchases.push(route.request().postDataJSON());state.created=true;return route.fulfill({json:{data:state.order}});});
  await page.route('**/api/v1/me/subscriptions/orders/*',route=>state.failStatus?route.fulfill({status:503,json:{message:'Status temporarily unavailable'}}):route.fulfill({json:{data:state.order}}));
  page.on('popup',popup=>popup.close());
  return state;
}
async function capture(page,name){await fs.mkdir(evidence,{recursive:true});await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:`${evidence}/${name}.jpg`,type:'jpeg',quality:86,animations:'disabled'});}
async function audit(page){const result=await new AxeBuilder({page}).include('.pkg-checkout').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(result.violations).toEqual([]);expect(await page.locator('.pkg-checkout').evaluate(n=>n.scrollWidth<=n.clientWidth+1)).toBe(true);}
async function details(page){await page.getByLabel(/ABA Account Holder Name/).fill('Example payer');await page.getByLabel(/Last 3 digits/).fill('247');}

for(const lang of['en','km'])test(`package purchase: ${lang} details, pending resume, review and verified activation`,async({page},info)=>{
  test.setTimeout(120000);const state=await setup(page,lang);
  await page.goto('/app/packages?feature=ILLUSTRATED_VENUE_MAP&returnTo=%2Fapp%2Fevents%2F101%2Finvitation%23venue');
  await page.locator('.pkg-card button').click();
  const submit=page.getByRole('button',{name:/Continue to ABA PayWay/});
  await submit.click();await expect(page.getByLabel(/ABA Account Holder Name/)).toBeFocused();
  await page.getByLabel(/ABA Account Holder Name/).fill('Example payer');await page.getByLabel(/Last 3 digits/).fill('24');await submit.click();await expect(page.getByLabel(/Last 3 digits/)).toBeFocused();
  await details(page);
  const widths=info.project.name==='desktop-chromium'?[320,390,1440]:[390];
  for(const width of widths){await page.setViewportSize({width,height:width===320?568:900});await expect(submit).toBeInViewport();await audit(page);await capture(page,`details-${lang}-${width}-${info.project.name}`);if(lang==='en'&&info.project.name==='desktop-chromium'&&width!==320)await expect(page.locator('.pkg-checkout')).toHaveScreenshot(`checkout-details-${width}.png`,{animations:'disabled',maxDiffPixelRatio:.005});}
  await submit.click();await expect(page.locator('.pkg-checkout-status[data-stage=waiting]')).toBeVisible();
  expect(state.purchases).toEqual([{packageId:2,payerName:'Example payer',payerAccountLast3:'247'}]);
  await expect(page.locator('.pkg-checkout-steps li').last()).not.toHaveAttribute('data-complete','true');await audit(page);await capture(page,`pending-${lang}-${info.project.name}`);
  await page.locator('.pkg-checkout-actions button').click();await page.locator('.pkg-card button').click();await expect(page.locator('.pkg-order-reference')).toContainText('SUB-UX-EXAMPLE');expect(state.purchases).toHaveLength(1);
  state.failStatus=true;await page.locator('.pkg-refresh-status').click();await expect(page.locator('.pkg-checkout [role=alert]')).toBeVisible();
  state.failStatus=false;state.order={...state.order,status:'REVIEW_REQUIRED',paymentStatus:'PAID',active:false};
  await page.locator('.pkg-refresh-status').click();await expect(page.locator('.pkg-checkout-status[data-stage=review]')).toBeVisible();await expect(page.locator('.pkg-checkout [role=alert]')).toHaveCount(0);
  await expect(page.locator('.pkg-checkout-steps li').last()).not.toHaveAttribute('data-complete','true');await expect(page.locator('.pkg-checkout-actions a')).toHaveCount(0);await audit(page);await capture(page,`review-${lang}-${info.project.name}`);
  state.order={...state.order,status:'ACTIVE',paymentStatus:'PAID',active:true};await page.locator('.pkg-refresh-status').click();
  await expect(page.locator('.pkg-checkout-status[data-stage=success]')).toBeVisible();await expect(page.locator('.pkg-checkout-steps li').last()).toHaveAttribute('data-complete','true');await audit(page);await capture(page,`active-${lang}-${info.project.name}`);
  await expect(page.locator('.pkg-order-summary')).toContainText(lang==='en'?'Amount paid':'ចំនួនបានទូទាត់');
  await page.locator('.pkg-checkout-actions a').click();await expect(page).toHaveURL(/\/app\/events\/101\/invitation#venue$/);expect(state.purchases).toHaveLength(1);
});

for(const status of['EXPIRED','FAILED'])test(`package purchase: ${status} offers recovery without another payment`,async({page},info)=>{
  const state=await setup(page);await page.goto('/app/packages');await page.locator('.pkg-card button').click();await details(page);await page.getByRole('button',{name:'Continue to ABA PayWay'}).click();
  await expect(page.locator('.pkg-checkout-status[data-stage=waiting]')).toBeVisible();state.order={...state.order,status,paymentStatus:status};await page.locator('.pkg-refresh-status').click();
  await expect(page.locator(`.pkg-checkout-status[data-stage=${status.toLowerCase()}]`)).toBeVisible();await expect(page.locator('.pkg-checkout-actions a')).toHaveCount(0);await expect(page.getByRole('button',{name:'Back to plans'})).toBeVisible();await audit(page);await capture(page,`${status.toLowerCase()}-${info.project.name}`);expect(state.purchases).toHaveLength(1);
});
