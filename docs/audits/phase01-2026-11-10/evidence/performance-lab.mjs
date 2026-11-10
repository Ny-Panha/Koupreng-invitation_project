import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=fileURLToPath(new URL('../../../../',import.meta.url)),require=createRequire(path.join(root,'apps/frontend-user/package.json'));
const {chromium}=require('playwright');
const {routeContracts,installRouteContractFixtures}=await import(pathToFileURL(path.join(root,'apps/frontend-user/tests/e2e/support/batch12RouteContracts.js')));
const rows=[],browser=await chromium.launch({headless:true});
for(const group of ['home','create-event','public-invitation']) {
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,deviceScaleFactor:2,reducedMotion:'reduce'}),page=await context.newPage();
 const contract=routeContracts.find(x=>x.group===group);await installRouteContractFixtures(page,contract);
 await page.route('**/*',r=>['127.0.0.1','localhost'].includes(new URL(r.request().url()).hostname)?r.fallback():r.abort());
 await page.addInitScript(()=>{
  window.__lab={lcp:null,cls:0,longTasks:[]};
  new PerformanceObserver(list=>{for(const e of list.getEntries())window.__lab.lcp={startTime:e.startTime,size:e.size,element:e.element?.tagName};}).observe({type:'largest-contentful-paint',buffered:true});
  new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__lab.cls+=e.value;}).observe({type:'layout-shift',buffered:true});
  new PerformanceObserver(list=>{for(const e of list.getEntries())window.__lab.longTasks.push({start:e.startTime,duration:e.duration});}).observe({type:'longtask',buffered:true});
 });
 const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');
 await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:93750});
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 await page.goto('http://127.0.0.1:4173'+contract.concreteUrl,{waitUntil:'load',timeout:60000});
 await page.waitForTimeout(3000);
 rows.push({group,conditions:'single cold context; desktop Chromium 4x CPU, 150ms latency, 1.6Mbps down; 390x844 DPR2; reduced motion; fictional APIs; external blocked; concurrent audit workload; not field CWV',metrics:await page.evaluate(()=>({...window.__lab,paint:performance.getEntriesByType('paint').map(({name,startTime})=>({name,startTime})),resources:performance.getEntriesByType('resource').map(({name,transferSize,encodedBodySize,duration,initiatorType})=>({path:new URL(name).pathname,transferSize,encodedBodySize,duration,initiatorType}))}))});
 fs.writeFileSync(new URL('performance-lab.json',import.meta.url),JSON.stringify(rows,null,2));await context.close();
}
await browser.close();console.log(rows.map(r=>({group:r.group,lcp:r.metrics.lcp,cls:r.metrics.cls,requests:r.metrics.resources.length,longTasks:r.metrics.longTasks.length})));
