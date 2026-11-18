import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {startFixtureServers} from './fixture-http-server.mjs';
const root=path.resolve(import.meta.dirname,'../../../..');
const require=createRequire(path.join(root,'apps/frontend-user/package.json'));
const {webkit,devices}=require('@playwright/test');
const {openPhase06Fixture}=await import(pathToFileURL(path.join(root,'apps/frontend-user/tests/e2e/support/phase06Fixtures.js')));
const fixture=await startFixtureServers(root,'after');
const browser=await webkit.launch();const rows=[];
try {
 for(let trial=1;trial<=5;trial++){
  const context=await browser.newContext({...devices['iPhone 13'],reducedMotion:'no-preference'});
  const page=await context.newPage();await page.setViewportSize({width:1440,height:900});
  await openPhase06Fixture(page,'template-demo',{path:'/templates/silk-heritage'});
  const action=page.locator('.sh-cover .sh-button').first();await action.waitFor();
  const observations=[];
  for(let i=0;i<8;i++){
   await action.scrollIntoViewIfNeeded();
   observations.push(await action.evaluate(el=>{
    const b=el.getBoundingClientRect();const x=b.x+b.width/2,y=b.y+b.height/2;const hit=document.elementFromPoint(x,y);
    return {at:performance.now(),scrollY,innerWidth,innerHeight,visual:{width:visualViewport.width,height:visualViewport.height,top:visualViewport.offsetTop,scale:visualViewport.scale},bounds:{x:b.x,y:b.y,width:b.width,height:b.height},hit:hit?.outerHTML.slice(0,300),success:!!hit&&(el===hit||el.contains(hit)),fonts:document.fonts.status,overflow:[getComputedStyle(document.documentElement).overflow,getComputedStyle(document.body).overflow]};
   }));
   await page.waitForTimeout(150);
  }
  let activation='NOT ATTEMPTED';try{await action.click({timeout:5000});activation='NORMAL CLICK SUCCEEDED';}catch(e){activation=e.message;}
  rows.push({trial,observations,activation});await context.close();
 }
}finally{await browser.close();await fixture.close();}
await fs.writeFile(path.join(import.meta.dirname,'renderer-hit-diagnosis.json'),JSON.stringify({sourceSha:execFileSync('git',['rev-parse','HEAD'],{cwd:root}).toString().trim(),browser:browser.version(),rows,qualification:'Observational diagnostic; normal click only, no injected scroll or force click'},null,2)+'\n');
console.log(JSON.stringify(rows.map(r=>({trial:r.trial,hits:r.observations.map(o=>o.success),activation:r.activation}))));
