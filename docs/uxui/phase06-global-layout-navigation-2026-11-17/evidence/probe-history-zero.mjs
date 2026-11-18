// Back must restore zero as well as nonzero scroll positions.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {startFixtureServers} from './fixture-http-server.mjs';
const root=path.resolve(import.meta.dirname,'../../../..');
const require=createRequire(path.join(root,'apps/frontend-user/package.json'));
const {chromium,webkit,firefox,expect}=require('@playwright/test');
const {openPhase06Fixture:open}=await import(pathToFileURL(path.join(root,'apps/frontend-user/tests/e2e/support/phase06Fixtures.js')));
const server=await startFixtureServers(root,'after'),rows=[];
try{
 for(const [engine,kind] of Object.entries({chromium,webkit,firefox})){
  const browser=await kind.launch();
  try{for(const motion of ['reduce','no-preference']){
   const context=await browser.newContext({viewport:{width:1440,height:700},reducedMotion:motion});
    const page=await context.newPage();server.bind(page);const row={engine,motion,sha:execFileSync('git',['rev-parse','HEAD'],{cwd:root}).toString().trim(),observedAt:new Date().toISOString(),browser:browser.version(),viewport:{width:1440,height:700},status:'NOT TESTED'};
   try{
    await open(page,'home');await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
    await page.locator('.kp-header').getByRole('link',{name:'Templates',exact:true}).click();
    await expect(page).toHaveURL(/\/templates$/);await page.locator('.tp-title').waitFor();
    await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.evaluate(()=>scrollTo(0,300));
    await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(100);
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(resolve)));
    row.catalogScroll=await page.evaluate(()=>scrollY);expect(row.catalogScroll).toBe(300);
    await page.goBack();await expect(page).toHaveURL('http://127.0.0.1:4173/');
    await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);row.restored=await page.evaluate(()=>scrollY);row.status='CROSS-ENGINE VERIFIED';
   }catch(error){row.status='FAIL';row.reason=error.message;row.restored=await page.evaluate(()=>scrollY).catch(()=>null);}
   finally{rows.push(row);await context.close();}
  }}finally{await browser.close();}
 }
}finally{await server.close();}
await fs.writeFile(path.join(import.meta.dirname,'history-zero-results.json'),JSON.stringify({rows,scope:'First home visit at zero → catalog scroll → Back; three installed engines, two motion preferences'},null,2)+'\n');
console.log(JSON.stringify(rows));if(rows.some(r=>r.status==='FAIL'))process.exitCode=1;
