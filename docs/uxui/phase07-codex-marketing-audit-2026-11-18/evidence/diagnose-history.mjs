// Requires the current local preview on 4173; observes only a fictional fixture.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
const root=path.resolve(import.meta.dirname,'../../../..');
const require=createRequire(path.join(root,'apps/frontend-user/package.json'));
const {webkit}=require('@playwright/test');
const {openPhase06Fixture:open}=await import(pathToFileURL(path.join(root,'apps/frontend-user/tests/e2e/support/phase06Fixtures.js')));
const browser=await webkit.launch();const rows=[];
try{
 for(let i=0;i<3;i++){
  const page=await browser.newPage();await open(page,'venues');
  await page.evaluate(()=>{window.__history=[];window.addEventListener('popstate',e=>window.__history.push({url:location.href,state:e.state}));});
  await page.getByRole('button',{name:/View details/}).first().click();
  await page.waitForURL('**/venues/1');
  await page.goBack();await page.waitForTimeout(1200);
  rows.push(await page.evaluate(()=>({url:location.href,canonical:document.querySelector("link[rel=canonical]")?.href,title:document.title,events:window.__history,state:history.state,dialog:document.querySelector('dialog[open]')?.outerHTML.slice(0,250),main:document.querySelector('#marketing-content')?.innerText.slice(0,100),scripts:[...document.scripts].map(s=>s.src)})));
  await page.close();
 }
}finally{await browser.close();}
await fs.writeFile(path.join(import.meta.dirname,'history-diagnostic.json'),JSON.stringify(rows,null,2));console.log(JSON.stringify(rows));
