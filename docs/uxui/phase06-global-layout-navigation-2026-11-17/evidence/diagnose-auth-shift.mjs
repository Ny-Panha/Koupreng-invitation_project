import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {startFixtureServers} from './fixture-http-server.mjs';
const root=path.resolve(import.meta.dirname,'../../../..');
const require=createRequire(path.join(root,'apps/frontend-user/package.json'));
const {chromium}=require('@playwright/test');
const {openPhase06Fixture:open}=await import(pathToFileURL(path.join(root,'apps/frontend-user/tests/e2e/support/phase06Fixtures.js')));
const browser=await chromium.launch(),rows=[];
const candidate='@media(max-width:480px){.auth-shell .auth-top-bar{flex-direction:column;align-items:stretch;gap:8px}.auth-shell .auth-preferences{align-self:flex-end}}';
try{
 for(const stage of ['before','after']) {
  const server=await startFixtureServers(root,stage);
  try{
   for(const variant of stage==='before'?['baseline']:['current','reserved-rows'])for(let trial=1;trial<=3;trial++) {
    const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
    const page=await context.newPage();server.bind(page);
    const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:2});
    await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:20,downloadThroughput:10*1024*1024/8,uploadThroughput:5*1024*1024/8});
    await page.addInitScript(css=>{
      window.__shifts=[];
      new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__shifts.push({value:e.value,start:e.startTime,sources:e.sources.map(s=>({node:s.node?.outerHTML?.slice(0,200),before:s.previousRect.toJSON(),after:s.currentRect.toJSON()}))});}).observe({type:'layout-shift',buffered:true});
      if(css){const observer=new MutationObserver(()=>{if(document.head){const style=document.createElement('style');style.textContent=css;document.head.append(style);observer.disconnect();}});observer.observe(document,{childList:true,subtree:true});}
    },variant==='reserved-rows'?candidate:null);
    try {
      await open(page,'auth-login',{lang:'km'});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(500);await page.screenshot();
      rows.push({stage,variant,trial,...await page.evaluate(()=>({cls:window.__shifts.reduce((n,s)=>n+s.value,0),shifts:window.__shifts,topbarHeight:document.querySelector('.auth-top-bar').getBoundingClientRect().height}))});
    }catch(error){rows.push({stage,variant,trial,error:error.message});}
    finally{await context.close();}
   }
  }finally{await server.close();}
 }
}finally{await browser.close();}
await fs.writeFile(path.join(import.meta.dirname,'auth-layout-shift-diagnosis.json'),JSON.stringify({candidate,rows,limits:['Candidate is injected before app render for diagnosis; must be rebuilt and measured if adopted','390x844 Chromium, fictional local DTOs, three cold observations per variant; no field CWV']},null,2)+'\n');
console.log(JSON.stringify(rows.map(({stage,variant,trial,cls,error,topbarHeight})=>({stage,variant,trial,cls,error,topbarHeight}))));
