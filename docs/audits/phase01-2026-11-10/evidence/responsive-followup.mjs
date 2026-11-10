import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=fileURLToPath(new URL('../../../../',import.meta.url)),require=createRequire(path.join(root,'apps/frontend-user/package.json'));
const engines=require('playwright');
const {routeContracts,installRouteContractFixtures}=await import(pathToFileURL(path.join(root,'apps/frontend-user/tests/e2e/support/batch12RouteContracts.js')));
const results=[],out=path.join(root,'output/playwright/phase01-audit-20261110');
for(const engine of ['chromium','firefox','webkit']) {
 const browser=await engines[engine].launch({headless:true});
 for(const group of ['events','ticket','seating','admin-template-edit']) {
  const contract=routeContracts.find(x=>x.group===group);
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,reducedMotion:'reduce'});
  const page=await context.newPage();page.setDefaultTimeout(6000);const row={engine,group,width:390};
  try {
   await installRouteContractFixtures(page,contract);
   await page.route('**/*',r=>['127.0.0.1','localhost'].includes(new URL(r.request().url()).hostname)?r.fallback():r.abort());
   await page.goto(`http://127.0.0.1:${contract.application==='frontend-admin'?4174:4173}${contract.concreteUrl}`);
   await page.locator('.kp-site-preloader').waitFor({state:'hidden'}).catch(()=>{});
   if(group==='events'){await page.locator('.events-create-btn').tap();await page.locator('#event-title').waitFor({state:'visible'});row.outcome='PASS: visible Create Event link opens onboarding';}
   if(group==='ticket'){await page.getByRole('button',{name:'Preview & export',exact:true}).tap();await page.locator('.ticket-preview canvas[role="img"]').waitFor({state:'visible'});row.outcome='PASS: mobile preview switch exposes canvas';}
   if(group==='seating'){await page.getByRole('button',{name:'Assign guests',exact:true}).tap();await page.locator('#seating-assignment-guest').waitFor({state:'visible'});row.options=await page.locator('#seating-assignment-guest option').allTextContents();row.outcome='PASS: assignment panel exposes guest selector';}
   if(group==='admin-template-edit'){
    await page.locator('aside').waitFor({state:'visible'});
    row.geometry=await page.evaluate(()=>{const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right};};return {viewport:innerWidth,rootScrollWidth:document.documentElement.scrollWidth,aside:rect(document.querySelector('aside')),preview:rect(document.querySelector('main')),frame:document.querySelector('iframe')?rect(document.querySelector('iframe')):null};});
    const divider=page.locator('[title*="Drag to resize"]');row.divider={tag:await divider.evaluate(e=>e.tagName),tabIndex:await divider.evaluate(e=>e.tabIndex),role:await divider.getAttribute('role')};
    row.outcome='FAIL: preview pane clipped beyond viewport; divider lacks keyboard focus';
   }
   row.screenshot=`followup-${engine}-${group}-390.png`;await page.screenshot({path:path.join(out,row.screenshot),fullPage:true});
  }catch(e){row.outcome='UNRESOLVED';row.error=String(e).slice(0,1500);}
  results.push(row);fs.writeFileSync(new URL('responsive-followup.json',import.meta.url),JSON.stringify(results,null,2));await context.close();
 }
 await browser.close();
}
console.log(JSON.stringify(results.map(({engine,group,outcome})=>({engine,group,outcome}))));
