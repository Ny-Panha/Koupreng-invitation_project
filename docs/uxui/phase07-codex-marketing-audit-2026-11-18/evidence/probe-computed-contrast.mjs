import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const root=path.resolve(import.meta.dirname,'../../../..'),app=path.join(root,'apps/frontend-user');
const require=createRequire(path.join(app,'package.json')),{chromium,expect}=require('@playwright/test');
const {openPhase06Fixture:open}=await import(pathToFileURL(path.join(app,'tests/e2e/support/phase06Fixtures.js')));
const server=spawn(process.execPath,[path.join(app,'node_modules/vite/bin/vite.js'),'preview','--host','127.0.0.1','--port','4185','--strictPort'],{cwd:app,windowsHide:true,stdio:'ignore'});
let browser;const rows=[];
const rgb=value=>{const values=value.match(/[\d.]+/g)?.map(Number);return values?.length>=3?values:null;};
const luminance=c=>c.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((v,c,i)=>v+c*[.2126,.7152,.0722][i],0);
try{
 for(let i=0;i<80;i++){try{if((await fetch('http://127.0.0.1:4185')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch();
 for(const width of [390,1440])for(const mode of ['light','dark'])for(const lang of ['en','km']){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),page=await context.newPage();
  const goto=page.goto.bind(page);page.goto=(url,options)=>goto(url.replace('http://127.0.0.1:4173','http://127.0.0.1:4185'),options);
  for(const [group,route,selector] of [['home','/','.kp-hero h1,.kp-hero .kp-button,.kp-metric-value,.kp-metric-label,.kp-guest-demo td span,.kp-faq summary,.kp-footer nav a'],['contact','/contact','.kp-page-label,.kp-contact-field label,.kp-field-error,.kp-contact-submit'],['venues','/venues/1','.venue-modal-title,.venue-photo-caption,.venue-tag,.venue-modal-contact-btn,.venue-modal-secondary-btn']]){
   await open(page,group,{path:route,mode,lang});await page.evaluate(()=>document.fonts.ready);
   if(group==='contact')await page.locator('button[type=submit]').click();
   if(group==='venues')await expect(page.getByRole('dialog')).toBeVisible();
   const data=await page.evaluate(selector=>({palette:Object.fromEntries(['canvas','surface','ink','muted','action','on-action','gold','focus','danger','success'].map(key=>[key,getComputedStyle(document.documentElement).getPropertyValue('--ui-theme-'+key).trim()])),pairs:[...document.querySelectorAll(selector)].filter(el=>el.getClientRects().length).map(el=>{
    const style=getComputedStyle(el);let ancestor=el,background='transparent',backgroundImage='none';
    while(ancestor){const current=getComputedStyle(ancestor);if(current.backgroundImage!=='none'){backgroundImage=current.backgroundImage;break;}if(current.backgroundColor!=='rgba(0, 0, 0, 0)'&&current.backgroundColor!=='transparent'){background=current.backgroundColor;break;}ancestor=ancestor.parentElement;}
    return{selector:el.className||el.tagName,text:el.textContent.trim().slice(0,120),foreground:style.color,background,backgroundImage,font:style.fontFamily,fontSize:parseFloat(style.fontSize),fontWeight:parseFloat(style.fontWeight)};
   })}),selector);
   for(const pair of data.pairs){const fg=rgb(pair.foreground),bg=rgb(pair.background);if(fg&&bg&&(bg[3]??1)===1&&pair.backgroundImage==='none'){
    const [a,b]=[luminance(fg),luminance(bg)].sort((a,b)=>b-a);pair.ratio=Number(((a+.05)/(b+.05)).toFixed(2));pair.minimum=pair.fontSize>=24||(pair.fontSize>=18.66&&pair.fontWeight>=700)?3:4.5;pair.result=pair.ratio>=pair.minimum?'PASS':'FAIL';
   }else pair.result='COMPUTED VALUES RECORDED; gradient/image/alpha requires visual or axe resolution';}
   rows.push({route,lang,mode,width,browser:browser.version(),sourceSha:execFileSync('git',['rev-parse','HEAD'],{cwd:root}).toString().trim(),...data});
  }
  await context.close();
 }
 await fs.writeFile(path.join(import.meta.dirname,'computed-theme-contrast.json'),JSON.stringify(rows,null,2));
 const failures=rows.flatMap(r=>r.pairs.filter(p=>p.result==='FAIL').map(p=>({route:r.route,mode:r.mode,lang:r.lang,...p})));
 console.log(JSON.stringify({rows:rows.length,pairs:rows.reduce((n,r)=>n+r.pairs.length,0),failures}));if(failures.length)process.exitCode=1;
}finally{await browser?.close();server.kill();}
