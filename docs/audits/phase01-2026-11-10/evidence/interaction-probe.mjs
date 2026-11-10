import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=fileURLToPath(new URL('../../../../',import.meta.url));
const require=createRequire(path.join(root,'apps/frontend-user/package.json'));
const {chromium}=require('playwright');
const {routeContracts,installRouteContractFixtures}=await import(pathToFileURL(path.join(root,'apps/frontend-user/tests/e2e/support/batch12RouteContracts.js')));
const browser=await chromium.launch({headless:true});
const rows=[];const out=path.join(root,'output/playwright/phase01-audit-20261110');
for(const width of [390,1440]) for(const group of ['events','ticket','seating','guests','auth-login','admin-template-edit']) {
 const contract=routeContracts.find(x=>x.group===group);
 const context=await browser.newContext({viewport:{width,height:844},hasTouch:width<600,reducedMotion:'reduce'});
 const page=await context.newPage();page.setDefaultTimeout(5000);
 const state=await installRouteContractFixtures(page,contract);
 await page.route('**/*',r=>['127.0.0.1','localhost'].includes(new URL(r.request().url()).hostname)?r.fallback():r.abort());
 await page.goto(`http://127.0.0.1:${contract.application==='frontend-admin'?4174:4173}${contract.concreteUrl}`);
 await page.locator('.kp-site-preloader').waitFor({state:'hidden'}).catch(()=>{});
 await page.waitForTimeout(1000);
 const row={group,width,url:contract.concreteUrl,body:(await page.locator('body').innerText()).slice(0,14000),controls:await page.locator('button,a,input,select').evaluateAll(es=>es.filter(e=>e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height>0).map(e=>({tag:e.tagName,text:(e.getAttribute('aria-label')||e.textContent||e.title||'').trim().slice(0,90),href:e.getAttribute('href'),class:e.className}))),api:state.unexpected,errors:state.errors};
 await page.screenshot({path:path.join(out,`probe-${group}-${width}.png`),fullPage:true});
 rows.push(row);fs.writeFileSync(new URL('interaction-probe.json',import.meta.url),JSON.stringify(rows,null,2));await context.close();
}
await browser.close();console.log('Captured',rows.length,'route probes');
