import {expect,test} from '@playwright/test';
import {installOverhaulFixtures} from './support/overhaulFixtures.js';
test('new guest exposes personal actions and enters authoritative delivery without marking a share as sent',async({page},info)=>{
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
 await page.goto('/app/events/101/guests');await page.getByRole('button',{name:/Add Guest/i}).click();
 await page.locator('#guestFormName').fill('Phase 2 sample guest');
 await page.getByRole('dialog').locator('button[type="submit"]').click();
 const context=page.getByRole('region',{name:'Saved guest actions'});await expect(context).toBeVisible();
 await expect(context).toContainText('Phase 2 sample guest');await expect(context.getByRole('button',{name:'View personal ticket'})).toBeVisible();
 await expect(context.getByRole('button',{name:'Copy personal invitation link'})).toBeVisible();
 await expect(context.getByRole('link',{name:'Review RSVP'})).toHaveAttribute('href','/app/events/101/rsvp');
 await page.getByText('More actions',{exact:true}).click();
 const share=page.getByRole('link',{name:'Share invitation for Phase 2 sample guest via Telegram'});await expect(share).toHaveAttribute('target','_blank');
 // Opening an external provider is deliberately not part of this fixture journey.
 expect(writes).toEqual(['create']);
 await page.screenshot({path:`D:/Koupreng-UXUI-Phase2/screenshots/milestone6/guest-context-${info.project.name}.png`,fullPage:true});
 await context.getByRole('link',{name:'Send / share in Delivery'}).click();await expect(page).toHaveURL(/\/app\/events\/101\/delivery$/);
 await expect(page.getByText('Invitation must be published before delivery can be prepared.')).toBeVisible();expect(writes).toEqual(['create']);
});
