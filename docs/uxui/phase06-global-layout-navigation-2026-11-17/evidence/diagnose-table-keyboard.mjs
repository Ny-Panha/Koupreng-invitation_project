import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const root=path.resolve(import.meta.dirname,'../../../..');
const require=createRequire(path.join(root,'apps/frontend-user/package.json'));
const {chromium,expect}=require('@playwright/test');
const {openPhase06Fixture:open}=await import(pathToFileURL(path.join(root,'apps/frontend-user/tests/e2e/support/phase06Fixtures.js')));
const children=[];const rows=[];
for(const [app,port] of [['user',4173],['admin',4174]]){
 const cwd=path.join(root,`apps/frontend-${app}`);
 children.push(spawn(process.execPath,[path.join(cwd,'node_modules/vite/bin/vite.js'),'preview','--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd,windowsHide:true,stdio:'ignore'}));
}
try{
 for(const port of [4173,4174])for(let i=0;i<50;i++){try{if((await fetch(`http://127.0.0.1:${port}`)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 await Promise.all([0,1].map(async worker=>{
  const browser=await chromium.launch();
  try{for(let trial=1;trial<=6;trial++){
   const context=await browser.newContext({viewport:{width:320,height:720}});const page=await context.newPage();
   const row={worker,trial};
   await page.addInitScript(()=>{
    window.__keyboardDiag=[];
    const describe=el=>el?{tag:el.tagName,id:el.id,role:el.getAttribute?.('role'),tabIndex:el.tabIndex,main:el.closest?.('main')?.id}:null;
    const capture=(kind,extra={})=>{if(window.__keyboardDiag.length<100)window.__keyboardDiag.push({kind,at:performance.now(),active:describe(document.activeElement),hasFocus:document.hasFocus(),...extra});};
    addEventListener('focusin',event=>capture('focusin',{target:describe(event.target)}),true);
    addEventListener('keydown',event=>{const row={kind:'keydown',key:event.key,at:performance.now(),active:describe(document.activeElement),hasFocus:document.hasFocus(),trusted:event.isTrusted};window.__keyboardDiag.push(row);queueMicrotask(()=>row.prevented=event.defaultPrevented);},true);
    const original=scrollTo.bind(window);window.scrollTo=(...args)=>{capture('window.scrollTo',{args});return original(...args);};
   });
   try{
    await open(page,'organization-detail');const region=page.getByRole('region',{name:'Organization members table'});await expect(region).toBeVisible();await region.focus();await expect(region).toBeFocused();
    row.before=await region.evaluate(el=>{const s=getComputedStyle(el);return {scroll:el.scrollLeft,scrollWidth:el.scrollWidth,width:el.clientWidth,overflow:s.overflowX,direction:s.direction,behavior:s.scrollBehavior,focused:el===document.activeElement,hasFocus:document.hasFocus(),main:el.closest('main')?.id};});
    await region.press('ArrowRight');
    try{await expect.poll(()=>region.evaluate(el=>el.scrollLeft),{timeout:1500}).toBeGreaterThan(0);row.first='PASS';}catch{row.first='FAIL';}
    row.after=await region.evaluate(el=>({scroll:el.scrollLeft,focused:el===document.activeElement,hasFocus:document.hasFocus()}));
    if(row.first==='FAIL'){await page.bringToFront();await region.focus();await region.press('ArrowRight');await page.waitForTimeout(300);row.foregroundRetry=await region.evaluate(el=>({scroll:el.scrollLeft,focused:el===document.activeElement,hasFocus:document.hasFocus()}));}
    row.events=await page.evaluate(()=>window.__keyboardDiag);
   }catch(error){row.error=error.message;}
   finally{rows.push(row);await context.close();}
  }}finally{await browser.close();}
 }));
}finally{for(const child of children)child.kill();await fs.writeFile(path.join(import.meta.dirname,'table-keyboard-diagnosis.json'),JSON.stringify({rows,method:'Two separate Chromium workers, six cold contexts each; original native key behavior observed, then one foreground retry only after a failure; diagnostic scrollTo wrapper forwards unchanged arguments'},null,2)+'\n');}
console.log(JSON.stringify(rows.map(({worker,trial,first,before,after,foregroundRetry,error})=>({worker,trial,first,before,after,foregroundRetry,error}))));
