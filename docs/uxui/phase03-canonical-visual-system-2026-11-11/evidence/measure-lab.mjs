// Three repeat cold/warm fixture observations per selected route and stage.
// Loopback Vite previews, Chromium, 390x844, reduced motion, default CPU/network.
import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const root=path.resolve(import.meta.dirname,'../../../..');
const base=path.join(root,'output/playwright/uxui-phase03-2026-11-11');
const require=createRequire(path.join(root,'apps/frontend-user/package.json'));
const { chromium }=require('@playwright/test');
const { routeContracts, installRouteContractFixtures }=await import(pathToFileURL(path.join(root,'apps/frontend-user/tests/e2e/support/batch12RouteContracts.js')));
const samples=[], bundles=[];
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function waitFor(port){for(let i=0;i<100;i++){try{if((await fetch(`http://127.0.0.1:${port}/`)).ok)return;}catch{}await sleep(200);}throw new Error(`Preview ${port} failed`);}
async function files(dir){const found=[];for(const entry of await fs.readdir(dir,{withFileTypes:true})){const name=path.join(dir,entry.name);if(entry.isDirectory())found.push(...await files(name));else found.push(name);}return found;}
for(const stage of ['before','after'])for(const app of ['user','admin']){
  const dir=path.join(base,stage,`${app}-build`);
  for(const file of await files(path.join(dir,'assets'))){
    if(!/\.(css|js)$/.test(file))continue;
    const bytes=await fs.readFile(file);
    bundles.push({stage,app,file:path.relative(dir,file).replaceAll('\\','/'),bytes:bytes.length,gzip:zlib.gzipSync(bytes).length,brotli:zlib.brotliCompressSync(bytes).length});
  }
}
const browser=await chromium.launch();
try{
  for(const stage of ['before','after']){
    const children=[];
    try{
      for(const [app,port] of [['user',4173],['admin',4174]]){
        const appRoot=path.join(root,`apps/frontend-${app}`);
        children.push(spawn(process.execPath,[path.join(appRoot,'node_modules/vite/bin/vite.js'),'preview','--host','127.0.0.1','--port',String(port),'--strictPort','--outDir',path.join(base,stage,`${app}-build`)],{cwd:appRoot,windowsHide:true,stdio:'ignore'}));
      }
      await Promise.all([waitFor(4173),waitFor(4174)]);
      for(const group of ['home','create-event','admin-dashboard','admin-template-edit','khmer-floral-gold']){
        const admin=group.startsWith('admin-'), key=group==='khmer-floral-gold'?'khmer-floral-gold':null;
        const contract=routeContracts.find(row=>row.group===(key?'template-demo':group)&&row.application===(admin?'frontend-admin':'frontend-user'));
        for(let trial=1;trial<=3;trial++){
          const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
          const page=await context.newPage();
          await installRouteContractFixtures(page,contract,{lang:'km'});
          if(group==='admin-template-edit'){
            const template={id:30,code:'event-essential',name:'Phase 03 fixture',status:'ACTIVE',category:'MINIMALIST',premium:false,description:'{}'};
            for(const pattern of ['**/api/v1/templates/slug/event-essential','**/api/v1/templates/event-essential','**/api/v1/templates/30','**/api/v1/admin/templates/30'])await page.route(pattern,route=>route.request().method()==='GET'?route.fulfill({json:{data:template}}):route.fallback());
          }
          await page.addInitScript(()=>{
            window.__phase03Perf={lcp:0,cls:0};
            try{new PerformanceObserver(list=>{for(const e of list.getEntries())window.__phase03Perf.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});}catch{}
            try{new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__phase03Perf.cls+=e.value;}).observe({type:'layout-shift',buffered:true});}catch{}
          });
          await page.route('**/*',route=>['127.0.0.1','localhost'].includes(new URL(route.request().url()).hostname)?route.fallback():route.abort());
          const url=`http://127.0.0.1:${admin?4174:4173}${key?`/templates/${key}`:contract.concreteUrl}`;
          for(const condition of ['cold','warm']){
            await page.goto(url,{waitUntil:'load'});
            await page.locator(group==='admin-template-edit'?'.template-studio':key?'[data-template-renderer]':'main').first().waitFor({state:'visible',timeout:12000}).catch(()=>{});
            await page.evaluate(()=>document.fonts.ready);
            const metric=await page.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];return {domContentLoaded:n?.domContentLoadedEventEnd,load:n?.loadEventEnd,fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime??null,lcp:window.__phase03Perf?.lcp||null,cls:window.__phase03Perf?.cls??null,resources:performance.getEntriesByType('resource').length};});
            samples.push({stage,group,trial,condition,...metric});
          }
          await context.close();
        }
        console.log(`${stage} ${group}: 3 cold + 3 warm`);
      }
    }finally{for(const child of children)child.kill();await sleep(500);}
  }
}finally{await browser.close();}
await fs.writeFile(path.join(import.meta.dirname,'lab-results.json'),JSON.stringify({browser:browser.version(),viewport:'390x844',motion:'reduce',network:'default loopback',cpu:'unthrottled',bundles,samples},null,2));
console.log(JSON.stringify({bundles:bundles.length,samples:samples.length}));
