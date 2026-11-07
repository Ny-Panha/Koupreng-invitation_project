import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import { phase9Fixtures } from './support/phase9Fixtures';

const evidence='../../docs/design/royal-garden-v4/evidence/video-footer/polish';
test('modern guest panel, motion, two-day calendar and gallery remain usable across sizes',async({page})=>{
  test.setTimeout(120000); await fs.mkdir(evidence,{recursive:true});
  await phase9Fixtures(page,{code:'royal-garden-cinematic',content:{informationScene:{motionPreset:'cinematic',effects:{butterfly:true,petals:true,sparkles:true,goldDust:true}}}});
  for(const [width,height] of [[320,568],[390,844],[844,390],[768,1024],[1440,900]]) {
    await page.setViewportSize({width,height}); await page.emulateMedia({reducedMotion:'no-preference'});
    await page.goto('/templates/royal-garden-cinematic?lang=en');
    await expect(page.locator('.kp-site-preloader')).toBeHidden();
    await expect(page.locator('.rg-guest-frame[data-modern=true]')).toContainText('You and your family');
    await expect(page.locator('.rg-open-label')).toHaveText('Open Invitation');
    await expect(page.locator('.rg-open')).toHaveCSS('animation-name','rg-invitation-breathe');
    await expect(page.locator('.rg-butterfly-flight')).toHaveCount(width<768 ? 4 : 5);
    await page.locator('.rg-entrance-photo img,.rg-frame-source,.rg-guest-frame img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
    await page.screenshot({path:`${evidence}/guest-${width}x${height}.png`,fullPage:true,animations:'disabled'});
    const plaque=await page.locator('.rg-guest-frame').boundingBox(),cover=await page.locator('.rg-entrance-stage').boundingBox();
    expect(plaque.width/cover.width).toBeLessThan(.7);
    if(width===390) {
      await page.locator('.rg-language select').selectOption('km');
      await expect(page.locator('.rg-open-label')).toHaveText('បើកសំបុត្រ');
      await expect(page.locator('.rg-entrance-lettering > img')).toHaveAttribute('src','/templates/royal-garden/golden-calligraphy.webp');
      await page.screenshot({path:`${evidence}/guest-km-${width}x${height}.png`,animations:'disabled'});
      await page.locator('.rg-language select').selectOption('en');
    }
    await page.emulateMedia({reducedMotion:'reduce'}); await page.locator('.rg-open').click();
    await expect(page.locator('[data-stage=CONTENT]')).toBeVisible(); await expect(page.locator('.rg-butterfly-flight')).toHaveCount(0);
    const nav=page.getByRole('navigation',{name:'Invitation sections'});
    await expect(nav.getByRole('button')).toHaveText(['Date','Venue','Program','Photos','Wishes']);
    await expect(page.locator('.rg-names strong')).toHaveText(['Koeurng Vireak','Long Somaly']);
    for(const name of ['Khun Sievkheng','Kuy Daly','Lam Kimlong','Leng Yongsy']) await expect(page.locator('#rg-family')).toContainText(name);
    expect(await page.locator('#rg-family').innerText()).not.toMatch(/[\u1780-\u17ff]/);
    await nav.locator('[aria-controls=rg-countdown]').click();
    const calendar=page.locator('.rg-wedding-calendar');
    await expect(calendar.locator('.rg-celebration-days,.rg-selected-day')).toHaveCount(0);
    await expect(calendar.locator('[data-ceremony=true]')).toHaveCount(2);
    await page.screenshot({path:`${evidence}/calendar-${width}x${height}.png`,animations:'disabled'});
    const add=calendar.getByRole('button',{name:'Add to Calendar',exact:true});
    await add.scrollIntoViewIfNeeded();
    if(width===390) {const pending=page.waitForEvent('download');await add.click();const download=await pending;expect(download.suggestedFilename()).toBe('celebration.ics');await expect(add).toBeEnabled();}
    await page.screenshot({path:`${evidence}/calendar-action-${width}x${height}.png`,animations:'disabled'});
    await nav.locator('[aria-controls=rg-venue]').click();
    await expect(page.locator('#rg-venue figcaption')).toHaveCount(0);
    await expect(page.locator('#rg-venue').getByRole('link',{name:'Open Google Maps',exact:true})).toHaveAttribute('href','https://maps.app.goo.gl/GwpoP4BhtsvgtUph9');
    await page.screenshot({path:`${evidence}/map-${width}x${height}.png`,animations:'disabled'});
    await nav.locator('[aria-controls=rg-schedule]').click();
    await expect(page.locator('.rg-program .kp-program-day')).toHaveCount(2);
    await expect(page.locator('#rg-schedule .rg-celebration-days')).toHaveCount(0);
    expect(await page.locator('#rg-schedule').innerText()).not.toMatch(/[\u1780-\u17ff]/);
    await page.screenshot({path:`${evidence}/agenda-${width}x${height}.png`,animations:'disabled'});
    await nav.locator('[aria-controls=rg-gallery]').click();
    const plain=await page.locator('.rg-wedding-calendar,.rg-month-calendar,.rg-program .kp-program-day,.rg-photo-tile,.rg-wedding-calendar .kp-countdown-unit').evaluateAll(nodes=>nodes.every(node=>{const css=getComputedStyle(node);return css.backgroundImage==='none' && css.backgroundColor==='rgba(0, 0, 0, 0)' && css.boxShadow==='none';}));
    expect(plain).toBe(true);
    await page.locator('.rg-photo-tile img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
    await page.screenshot({path:`${evidence}/gallery-${width}x${height}.png`,animations:'disabled'});
    await page.getByRole('button',{name:'Enlarge photo 1 / 12',exact:true}).click();
    const dialog=page.getByRole('dialog',{name:'Photo gallery'});
    await dialog.getByRole('button',{name:'View photo 12',exact:true}).click();
    await expect(dialog.locator('.rg-expanded-actions')).toContainText('12 / 12');
    await dialog.locator('.rg-expanded-photo').evaluate(image=>image.decode());
    await page.screenshot({path:`${evidence}/lightbox-${width}x${height}.png`,animations:'disabled'});
    await dialog.getByRole('button',{name:'Close photo',exact:true}).click();
    if(width===390) {
      await page.locator('.rg-language select').selectOption('km');
      for(const name of ['ឃុន ស៊ីវខេង','គុយ ដាលី','ឡាំ គីមឡុង','ឡេង យ៉ុងស៊ី']) await expect(page.locator('#rg-family')).toContainText(name);
      await expect(page.locator('.rg-names strong')).toHaveText(['កឿង វីរៈ','ឡុង សុម៉ាលី']);
      expect(await page.locator('#rg-schedule').innerText()).not.toMatch(/Family blessings|Wedding reception/);
      await expect(page.locator('#rg-venue').getByRole('link',{name:'មើលទីតាំងក្នុង Map',exact:true})).toHaveAttribute('href','https://maps.app.goo.gl/GwpoP4BhtsvgtUph9');
      await page.locator('.rg-bottom-nav [aria-controls=rg-schedule]').click();
      await page.screenshot({path:`${evidence}/agenda-km-${width}x${height}.png`,animations:'disabled'});
    }
    expect(await page.evaluate(()=>scrollY)).toBe(0);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  }
});
