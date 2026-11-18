// Supplemental observation of font readiness and screenshot-consumed paint.
// No stylesheet, app source, DOM layout or native performance clock is changed.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {startFixtureServers} from './fixture-http-server.mjs';
const root=path.resolve(import.meta.dirname,'../../../..');
const require=createRequire(path.join(root,'apps/frontend-user/package.json'));
const {chromium}=require('@playwright/test');
const {routeContracts,installRouteContractFixtures}=await import(pathToFileURL(path.join(root,'apps/frontend-user/tests/e2e/support/batch12RouteContracts.js')));
const contract=routeContracts.find(r=>r.group==='rsvp'&&r.application==='frontend-user');
const browser=await chromium.launch();const rows=[];
try {
 for(const mode of ['primary-snapshot','consume-ready-frames'])for(let trial=1;trial<=3;trial++)for(const stage of trial%2?['before','after']:['after','before']){
  const server=await startFixtureServers(root,stage);
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,reducedMotion:'no-preference'});
  try{
   const page=await context.newPage();server.bind(page);await installRouteContractFixtures(page,contract,{lang:'km'});
   await page.addInitScript(()=>{
    const NativeDate=Date;class FixedDate extends NativeDate{constructor(...args){super(...(args.length?args:[Date.parse('2026-11-11T12:00:00Z')]));}static now(){return NativeDate.parse('2026-11-11T12:00:00Z');}}window.Date=FixedDate;
    window.__paintEntries=[];new PerformanceObserver(list=>{for(const e of list.getEntries())window.__paintEntries.push({at:e.startTime,size:e.size,element:e.element?.className||e.element?.tagName});}).observe({type:'largest-contentful-paint',buffered:true});
   });
   const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:2});await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:false});
   await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:20,downloadThroughput:10*1024*1024/8,uploadThroughput:5*1024*1024/8});
   let cacheHits=0;cdp.on('Network.requestServedFromCache',()=>cacheHits++);
   for(const cache of ['cold','warm']){
    cacheHits=0;await page.goto('http://127.0.0.1:4173'+contract.concreteUrl,{waitUntil:'load',timeout:20000});
    await page.locator('main h1:visible').first().waitFor();
    const ready=await page.evaluate(()=>performance.now());
    if(mode==='consume-ready-frames')await page.screenshot();
    await page.evaluate(()=>document.fonts.ready);
    const fontsReady=await page.evaluate(()=>performance.now());
    if(mode==='consume-ready-frames')await page.screenshot();
    await page.waitForTimeout(400);
    const beforeSnapshot=await page.evaluate(()=>({at:performance.now(),lcp:window.__paintEntries.at(-1)||null}));
    await page.screenshot();
    const result=await page.evaluate(()=>{
     const el=document.querySelector('.rsvp-count-context');const b=el?.getBoundingClientRect();
     return {at:performance.now(),load:performance.getEntriesByType('navigation')[0].loadEventEnd,paints:performance.getEntriesByType('paint').map(e=>({name:e.name,at:e.startTime})),lcpEntries:window.__paintEntries,fonts:performance.getEntriesByType('resource').filter(e=>/\.woff2?(?:\?|$)/.test(e.name)).map(e=>({url:new URL(e.name).pathname,start:e.startTime,end:e.responseEnd,duration:e.duration,transfer:e.transferSize})),candidate:el?{text:el.textContent,bounds:{x:b.x,y:b.y,width:b.width,height:b.height},ancestors:[el,...function*(node){while(node.parentElement){node=node.parentElement;yield node;}}(el)].map(n=>({tag:n.tagName,class:n.className,opacity:getComputedStyle(n).opacity,transform:getComputedStyle(n).transform})),animations:document.getAnimations().map(a=>({state:a.playState,time:a.currentTime,timing:a.effect?.getTiming()}))}:null};
    });
    rows.push({stage,mode,trial,cache,cacheHits,ready,fontsReady,beforeSnapshot,...result});
   }
  }finally{await context.close();await server.close();}
 }
}finally{await browser.close();}
const result={sourceSha:execFileSync('git',['rev-parse','HEAD'],{cwd:root}).toString().trim(),observedAt:new Date().toISOString(),browser:browser.version(),rows,method:'Same 390x844 normal-motion read-only fixture, native performance clock, real HTTP cache, CPU2x/network20ms10Mbps. Three alternating-stage trials per mode. Supplemental mode consumes a screenshot at content and font readiness; it changes capture scheduling, not production source.',limits:['Supplemental paint scheduling is not equivalent to the primary 624 matrix','A screenshot-dependent LCP timing difference does not certify field behavior or prove a code-level regression','No CSS, font, template, data or production source patched for this diagnosis']};
await fs.writeFile(path.join(import.meta.dirname,'rsvp-paint-diagnosis.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(rows.filter(r=>r.cache==='warm').map(r=>({stage:r.stage,mode:r.mode,trial:r.trial,ready:r.ready,fontsReady:r.fontsReady,snapshot:r.beforeSnapshot.at,lcp:r.lcpEntries.at(-1)}))));
