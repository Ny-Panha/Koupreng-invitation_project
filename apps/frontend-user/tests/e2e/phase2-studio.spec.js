import { expect, test } from '@playwright/test';
import { installIdentityFixtures } from './support/templateIdentityFixtures.js';
test('preview retains the form, newest edits, focus and position with one active frame', async ({page},testInfo)=>{
 const fixture=await installIdentityFixtures(page);
 if (page.viewportSize().width < 1024) await page.setViewportSize({width:390,height:500});
 await page.goto('/app/events/101/invitation');
 const groom=page.locator('input[id$="-groom"]'),bride=page.locator('input[id$="-bride"]');
 await expect(groom).toBeVisible();
 expect(await groom.evaluate(e=>e.labels.length)).toBe(1);
 await groom.fill('Newest groom');await bride.fill('Newest bride');
 const mobile=page.viewportSize().width<1024;
 await expect(page.locator('iframe')).toHaveCount(mobile?0:1);
 const scroll=await page.evaluate(()=>scrollY);
 if (mobile) expect(scroll).toBeGreaterThan(0);
 const opener=page.getByRole('button',{name:'Preview invitation',exact:true});
 if (mobile) {
   const box=await opener.boundingBox();
   expect(box.y).toBeGreaterThanOrEqual(0);expect(box.y+box.height).toBeLessThanOrEqual(500);
   // A physical tap does not invoke the automation locator's scrollIntoView.
   await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);
 } else await opener.click();
 const dialog=page.getByRole('dialog',{name:'Invitation preview'});
 await expect(dialog).toBeVisible();await expect(page.locator('iframe')).toHaveCount(1);
 const frame=page.frameLocator('iframe[title="Live User Template Preview"]');
 await expect(frame.locator('[data-template-renderer="khmer-celestial"]')).toBeAttached();
 await expect(frame.getByText('Newest groom',{exact:true}).first()).toBeAttached({timeout:20000});
 await expect(frame.getByText('Newest bride',{exact:true}).first()).toBeAttached();
 await page.screenshot({path:`D:/Koupreng-UXUI-Phase2/screenshots/milestone5/studio-sheet-${testInfo.project.name}.png`});
 await page.locator('iframe').focus();await page.keyboard.press('Escape');
 await expect(dialog).toHaveCount(0);await expect(bride).toBeFocused();
 expect(Math.abs(await page.evaluate(()=>scrollY)-scroll)).toBeLessThan(3);
 await expect(groom).toHaveValue('Newest groom');await expect(bride).toHaveValue('Newest bride');
 await expect(page.locator('iframe')).toHaveCount(mobile?0:1);
 await page.getByRole('button',{name:'Save',exact:true}).click();
 await expect.poll(()=>fixture.writes.filter(w=>w.payload.groomName==='Newest groom'&&w.payload.brideName==='Newest bride').length).toBeGreaterThan(0);
 await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase','saved');
});
