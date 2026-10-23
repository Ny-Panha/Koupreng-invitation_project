import {expect,test} from '@playwright/test';
import {installOverhaulFixtures} from './support/overhaulFixtures.js';
import {phase2EvidencePath} from './support/phase2Evidence.js';
test('new inline guest keeps personal actions in its row without marking a share as sent',async({page},info)=>{
 await installOverhaulFixtures(page,'en');
 let guest=null;const writes=[];
 await page.route('**/api/v1/invitations/101/guests',async route=>{
  if(route.request().method()==='POST') {writes.push('create');guest={...route.request().postDataJSON(),id:503,inviteToken:'phase2-synthetic-link',sendStatus:'PENDING'};}
  await route.fulfill({contentType:'application/json',body:JSON.stringify({data:route.request().method()==='POST'?guest:guest?[guest]:[]})});
 });
 await page.route('**/api/v1/invitations/101/guests/503/**',route=>{
  if(route.request().method()!=='GET')writes.push(new URL(route.request().url()).pathname);
  return route.fulfill({contentType:'application/json',body:JSON.stringify({data:{}})});
 });
 await page.goto('/app/events/101/guests');
 const form=page.locator('.guest-inline-form-row');
 await form.getByRole('textbox',{name:'Guest Name',exact:true}).fill('Phase 2 sample guest');
 await form.locator('button[type="submit"]').click();
 const row=page.locator('.guest-record-row').filter({hasText:'Phase 2 sample guest'});await expect(row).toBeVisible();
 await expect(page.getByRole('region',{name:'Saved guest actions'})).toHaveCount(0);
 await page.getByLabel('More actions: Phase 2 sample guest',{exact:true}).click();
 await expect(row.getByRole('button',{name:'Ticket',exact:true})).toBeVisible();
 await expect(row.getByRole('button',{name:'Copy invitation message'})).toBeVisible();
 const share=page.getByRole('link',{name:'Share invitation for Phase 2 sample guest via Telegram'});await expect(share).toHaveAttribute('target','_blank');
 // Opening an external provider is deliberately not part of this fixture journey.
 expect(writes).toEqual(['create']);
 await expect(page.locator('.kp-site-preloader')).toBeHidden();
 await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
 await page.screenshot({path:phase2EvidencePath(info,`guests/guest-row-${info.project.name}.png`),fullPage:true});
 await row.scrollIntoViewIfNeeded();
 await page.screenshot({path:phase2EvidencePath(info,`guests/guest-row-viewport-${info.project.name}.png`)});
 await row.getByRole('link',{name:'Send or share for Phase 2 sample guest in Delivery'}).click();await expect(page).toHaveURL(/\/app\/events\/101\/delivery\?guestId=503$/);
 await expect(page.getByText('Publish the invitation before preparing guest links.').first()).toBeVisible();expect(writes).toEqual(['create']);
});
