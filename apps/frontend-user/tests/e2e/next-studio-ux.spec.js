import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import process from 'node:process';
import { phase9Fixtures } from './support/phase9Fixtures';
import { chooseStudioSection } from './support/studioNavigationActions';
import AxeBuilder from '@axe-core/playwright';

const before = process.env.STUDIO_UX_BASELINE === 'true';
const evidence = `../../output/playwright/next-studio-ux/${before ? 'before' : 'after'}`;
test('six Studio tabs retain rendered mobile and desktop evidence', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop-chromium', 'Capture the viewport matrix once');
  test.setTimeout(120000);
  await phase9Fixtures(page);
  await fs.mkdir(evidence, { recursive: true });
  await page.goto('/app/events/101/invitation');
  await expect(page.locator('.invitation-studio')).toBeVisible();
  const tabs = await page.locator('[data-studio-tab]').evaluateAll(nodes => nodes.map(node => node.dataset.studioTab));
  expect(tabs).toHaveLength(6);
  for (const width of [390,1440]) {
    await page.setViewportSize({ width, height: 900 });
    if (width === 1440) await expect(page.frameLocator('iframe').locator('.kc-root')).toBeAttached();
    for (const tab of tabs) {
      const select = page.getByRole('combobox', { name: 'Edit section', exact: true });
      if (await select.isVisible()) await select.selectOption(tab);
      else await page.locator(`[data-studio-tab="${tab}"]`).click();
      await page.evaluate(() => document.fonts.ready);
      await page.locator('.pe-editor-scroll-body').evaluate(node => { node.scrollTop = 0; });
      await page.screenshot({ path: `${evidence}/studio-${tab}-${width}.jpg`, type: 'jpeg', quality: 80, animations: 'disabled' });
    }
  }
});

// Browser fixtures verify UI contracts; separate real MySQL/JWT suites prove enforcement.
const features = ['QR_INVITATIONS'];
const plans = [
  { id:2,code:'PRO',packageName:'Configured Pro',purchasable:true,price:199,currency:'USD',durationDays:30,billingInterval:'MONTHLY',eligibleFeatures:['QR_INVITATIONS','SEATING'],maxGuests:2000,maxInvitations:20 },
  { id:3,code:'PREMIUM',packageName:'Configured Premium',purchasable:true,price:499,currency:'USD',durationDays:30,billingInterval:'MONTHLY',eligibleFeatures:['QR_INVITATIONS','SEATING','PRE_WEDDING_VIDEO'],maxGuests:99999,maxInvitations:999 },
];
async function policy(page) {
  await page.route('**/api/v1/me/entitlements', route => route.fulfill({ json:{ data:{ packagePlan:{ id:1,packageName:'Configured Free' },features,quotas:{ invitations:{ limit:1,used:1 },guests:{ limit:20,used:4 } } } } }));
  await page.route('**/api/v1/public/packages', route => route.fulfill({ json:{ data:plans } }));
}
async function shot(page,name) { await fs.mkdir(evidence,{ recursive:true }); await page.screenshot({ path:`${evidence}/${name}.jpg`,type:'jpeg',quality:80,animations:'disabled' }); }

test('contextual Premium video offers, cancel, keyboard focus and responsive reflow retain the Studio draft', async ({ page },info) => {
  await phase9Fixtures(page,{ premium:false }); await policy(page);
  await page.goto('/app/events/101/invitation');
  await chooseStudioSection(page,'mediaOpening','Pre-wedding video');
  const card=page.locator('[data-feature-lock="PRE_WEDDING_VIDEO"]');
  await card.getByRole('button',{ name:'Explore eligible packages' }).click();
  const dialog=page.getByRole('dialog',{ name:'Explore eligible packages' });
  await expect(dialog.getByRole('heading',{ name:'Configured Premium' })).toBeVisible();
  await expect(dialog.getByRole('heading',{ name:'Configured Pro' })).toHaveCount(0);
  await expect(dialog).toContainText('$499.00');
  await expect(dialog).toContainText('Pending payments do not unlock features');
  const widths=info.project.name==='desktop-chromium' ? [320,375,390,430,768,1024,1366,1440,1920] : [390];
  for (const width of widths) {
    await page.setViewportSize({ width,height:900 });
    expect(await dialog.evaluate(node=>node.scrollWidth<=node.clientWidth+1)).toBe(true);
    await page.keyboard.press('Tab'); expect(await dialog.evaluate(node=>node.contains(document.activeElement))).toBe(true);
    await dialog.locator('.k-modal-body').evaluate(node=>{node.scrollTop=0;}); await shot(page,`upgrade-${info.project.name}-${width}`);
  }
  const audit=await new AxeBuilder({page}).include('.access-dialog').analyze(); expect(audit.violations).toEqual([]);
  await page.keyboard.press('Escape'); await expect(dialog).toBeHidden();
  await expect(card.getByRole('button')).toBeFocused();
  await expect(page.locator('.studio-editable-fields')).toBeEnabled();
});

test('role revocation keeps mounted edits, disables mutation and offers recovery without an upsell', async ({ page },info) => {
  await phase9Fixtures(page); await policy(page);
  let revoked=false;
  await page.route('**/api/v1/invitations/101/access', route=>route.fulfill({json:{data:{ owner:!revoked,permissions:revoked?['VIEW_EVENT']:['MANAGE_INVITATION'],ownerFeatures:features,quotas:{ guestsPerInvitation:{ limit:20,used:4,remaining:16 } } } }}));
  await page.goto('/app/events/101/invitation'); await chooseStudioSection(page,'eventInformation','Event details');
  const title=page.locator('input[name="title"]'); await title.fill('Authored text retained after access changes');
  revoked=true; await page.evaluate(()=>window.dispatchEvent(new Event('koupreng:access-refresh')));
  await expect(page.getByRole('button',{name:'Download recovery draft',exact:true})).toBeVisible();
  await expect(title).toHaveValue('Authored text retained after access changes'); await expect(title).toBeDisabled();
  await expect(page.getByRole('button',{name:'Save',exact:true})).toBeDisabled();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await shot(page,`revoked-draft-${info.project.name}`);
});

test('confirmation cancellation, honest failed save and one confirmed-save toast preserve authored data', async ({ page },info) => {
  await phase9Fixtures(page); await policy(page);
  let fail=true;
  await page.route('**/api/v1/invitations/101', async route=> {
    if(route.request().method()==='PUT' && fail) return route.fulfill({status:503,json:{message:'Fixture save unavailable',code:'API_UNAVAILABLE'}});
    return route.fallback();
  });
  await page.goto('/app/events/101/invitation'); await chooseStudioSection(page,'eventInformation','Event details');
  const title=page.locator('input[name="title"]'); await title.fill('Unsaved text with backend retry');
  await page.getByRole('button',{name:'Save',exact:true}).click();
  await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase','failed'); await expect(title).toHaveValue('Unsaved text with backend retry');
  await expect(page.locator('.k-toast-success')).toHaveCount(0); await shot(page,`save-failure-${info.project.name}`);
  fail=false; await page.getByRole('button',{name:'Save',exact:true}).click();
  await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase','saved');
  await expect(page.locator('.k-toast-success')).toHaveCount(1); await shot(page,`save-success-${info.project.name}`);
  await title.fill('Keep this local text'); await page.getByLabel('More studio actions',{exact:true}).click(); await page.getByRole('button',{name:'Reset changes',exact:true}).click();
  const confirmation=page.locator('.k-confirm-dialog'); await expect(confirmation.getByRole('button',{name:'Cancel',exact:true})).toBeFocused();
  await shot(page,`confirmation-${info.project.name}`); await page.keyboard.press('Escape'); await expect(title).toHaveValue('Keep this local text');
});
