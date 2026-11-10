// Phase 01 evidence harness. No application edits or real API mutations.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root = fileURLToPath(new URL('../../../../', import.meta.url));
const require = createRequire(path.join(root,'apps/frontend-user/package.json'));
const {chromium,firefox,webkit} = require('playwright');
const {default:AxeBuilder} = await import(pathToFileURL(path.join(root,'apps/frontend-user/node_modules/@axe-core/playwright/dist/index.mjs')));
const {routeContracts,installRouteContractFixtures,assertRouteContract} = await import(pathToFileURL(path.join(root,'apps/frontend-user/tests/e2e/support/batch12RouteContracts.js')));
const out = path.join(root,'output/playwright/phase01-audit-20261110');
fs.mkdirSync(out,{recursive:true});
const results=[];
const mode=process.argv[2]||'routes';
const save=()=>fs.writeFileSync(new URL(`browser-${mode}-results.json`,import.meta.url),JSON.stringify(results,null,2));
async function inspect(page) {
 return page.evaluate(()=>{
  const visible=e=>e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height>0&&getComputedStyle(e).visibility!=='hidden';
  const summarize=e=>({tag:e.tagName,cls:String(e.className).slice(0,120),text:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,65),w:Math.round(e.getBoundingClientRect().width),h:Math.round(e.getBoundingClientRect().height)});
  return {title:document.title,viewport:[innerWidth,innerHeight],scrollWidth:document.documentElement.scrollWidth,
   overflow:[...document.querySelectorAll('body *')].filter(e=>visible(e)&&e.getBoundingClientRect().right>innerWidth+2&&getComputedStyle(e).position!=='fixed').slice(0,12).map(summarize),
   smallTargets:[...document.querySelectorAll('button,a,input,select')].filter(e=>visible(e)&&!e.disabled&&e.getBoundingClientRect().width<44&&e.getBoundingClientRect().height<44).slice(0,12).map(summarize),
   smallInputs:[...document.querySelectorAll('input,select,textarea')].filter(e=>visible(e)&&parseFloat(getComputedStyle(e).fontSize)<16).slice(0,12).map(e=>({...summarize(e),font:getComputedStyle(e).fontSize})),
   h1:[...document.querySelectorAll('h1')].map(e=>e.textContent.trim().slice(0,100)),
   landmarks:document.querySelectorAll('main,[role=main]').length};
 });
}
async function run(browser,contract,width,engine,{axe=false,lang='en',height=844}={}) {
 const context=await browser.newContext({viewport:{width,height},hasTouch:width<600,deviceScaleFactor:width<600?2:1,reducedMotion:'reduce'});
 const page=await context.newPage(); page.setDefaultTimeout(6000);
 const row={engine,width,height,lang,application:contract.application,pattern:contract.pattern,url:contract.concreteUrl,group:contract.group,mode:'fictional DTO read-only render; not live end-to-end'};
 const started=Date.now();
 try {
  const state=await installRouteContractFixtures(page,contract,{lang});
  await page.route('**/*',route=>['127.0.0.1','localhost'].includes(new URL(route.request().url()).hostname)?route.fallback():route.request().resourceType()==='stylesheet'?route.fulfill({body:'',contentType:'text/css'}):route.abort());
  await page.goto(`http://127.0.0.1:${contract.application==='frontend-admin'?4174:4173}${contract.concreteUrl}`,{waitUntil:'domcontentloaded'});
  await assertRouteContract(page,contract,state);
  row.render='PASS'; row.layout=await inspect(page); row.api={unexpected:state.unexpected,writes:state.writes,errors:state.errors};
  if(axe) {const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze(); row.axe=result.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,helpUrl:v.helpUrl,nodes:v.nodes.slice(0,8).map(n=>({target:n.target,summary:n.failureSummary}))}));}
  if(axe||row.layout.scrollWidth>width+2) {row.screenshot=`${engine}-${width}-${lang}-${contract.application}-${contract.group}.png`;await page.screenshot({path:path.join(out,row.screenshot),fullPage:true});}
 } catch(error) {row.render='FAIL';row.error=String(error).slice(0,2400);try{row.layout=await inspect(page);}catch{} }
 finally{row.elapsedMs=Date.now()-started;results.push(row);save();await context.close();}
}
const selectedGroups=new Set(['home','catalog','auth-login','auth-register','create-event','events','invitation','guests','public-invitation','checkout','admin-dashboard','admin-users','admin-template-edit']);
const selected=routeContracts.filter((r,i,all)=>selectedGroups.has(r.group)&&all.findIndex(x=>x.application===r.application&&x.group===r.group)===i);
for(const [engine,type] of Object.entries(mode==='engines'?{firefox,webkit}:{chromium})) {
 let browser;try{browser=await type.launch({headless:true});}catch(error){results.push({engine,launch:'BLOCKED',error:String(error)});save();continue;}
 if(mode==='routes') {
  for(const width of [390,1440]) for(const contract of routeContracts) await run(browser,contract,width,engine,{axe:selected.includes(contract)&&width===390});
 } else if(mode==='widths') {
  for(const width of [320,360,375,414,430,600,768,820,1024,1280]) for(const contract of selected) await run(browser,contract,width,engine);
  for(const contract of selected) await run(browser,contract,390,engine,{lang:'km',axe:true});
  for(const contract of selected.filter(c=>['auth-login','create-event','invitation'].includes(c.group))) await run(browser,contract,844,engine,{height:390});
 } else {
  for(const width of [390,1440]) for(const contract of selected) await run(browser,contract,width,engine,{axe:width===390});
 }
 await browser.close();
}
save();
console.log(JSON.stringify({mode,total:results.length,pass:results.filter(x=>x.render==='PASS').length,fail:results.filter(x=>x.render==='FAIL').length,blocked:results.filter(x=>x.launch==='BLOCKED').length,overflow:results.filter(x=>x.layout?.scrollWidth>x.width+2).length}));
