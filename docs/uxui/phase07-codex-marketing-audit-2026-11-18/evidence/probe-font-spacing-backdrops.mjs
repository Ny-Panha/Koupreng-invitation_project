// Independent read-only fixture probes; own preview port, no shared server mutation.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const root=path.resolve(import.meta.dirname,'../../../..');
const require=createRequire(path.join(root,'apps/frontend-user/package.json'));
const {chromium,webkit,firefox,expect}=require('@playwright/test');
const {openPhase06Fixture:open}=await import(pathToFileURL(path.join(root,'apps/frontend-user/tests/e2e/support/phase06Fixtures.js')));
const app=path.join(root,'apps/frontend-user'),out=path.join(root,'output/phase07-codex-2026-11-18/mode-edges');
await fs.mkdir(out,{recursive:true});
const server=spawn(process.execPath,[path.join(app,'node_modules/vite/bin/vite.js'),'preview','--host','127.0.0.1','--port','4183','--strictPort'],{cwd:app,windowsHide:true,stdio:'ignore'});
const rows=[];let browser;
try{
 for(let i=0;i<80;i++){try{if((await fetch('http://127.0.0.1:4183')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 for(const [engine,launcher] of Object.entries({chromium,webkit,firefox})){
  browser=await launcher.launch();
  for(const width of [390,1440])for(const mode of ['light','dark'])for(const lang of ['en','km']){
   const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:2,reducedMotion:'reduce'}),page=await context.newPage();
   const row={engine,version:browser.version(),width,height:900,mode,lang,sourceSha:execFileSync('git',['rev-parse','HEAD'],{cwd:root}).toString().trim(),fixture:'phase06Fixtures; loopback4183; failed fonts + text-spacing override; no writes'};
   try{
    const goto=page.goto.bind(page);page.goto=(url,options)=>goto(url.replace('http://127.0.0.1:4173','http://127.0.0.1:4183'),options);
    await page.route('**/*.woff2',r=>r.abort());
    await open(page,'home',{mode,lang,anonymous:true});
    await expect(page.locator('.kp-hero h1')).toBeVisible();
    await page.addStyleTag({content:'#marketing-content :is(h1,h2,h3,p,a,button,label,input,summary){line-height:1.8!important;letter-spacing:.12em!important;word-spacing:.16em!important} #marketing-content p{margin-bottom:2em!important}'});
    row.homeOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    expect(row.homeOverflow).toBeLessThanOrEqual(1);
    await expect(page.locator('.kp-hero a.kp-button')).toBeVisible();
    if(width===390){
     await page.locator('.kp-menu-trigger').click();await expect(page.locator('#public-mobile-navigation')).toBeVisible();
     await page.mouse.click(1,1);await expect(page.locator('#public-mobile-navigation')).not.toBeVisible();row.menuBackdrop=true;
    }
    const image=path.join(out,`${engine}-${width}-${mode}-${lang}-font-spacing.png`);await page.screenshot({path:image});row.imagePath=path.relative(root,image).replaceAll('\\','/');
    await page.goto('http://127.0.0.1:4183/venues');
    await page.locator('.view-detail-btn').first().click();await expect(page.getByRole('dialog')).toBeVisible();
    await page.reload();await expect(page.getByRole('dialog')).toBeVisible();row.detailRefresh=true;
    await page.mouse.click(1,1);await expect(page.getByRole('dialog')).not.toBeVisible();await expect(page).toHaveURL(/\/venues$/);row.venueBackdrop=true;
    row.valid=true;
   }catch(e){row.valid=false;row.failure=e.message;}
   rows.push(row);await context.close();
   await fs.writeFile(path.join(import.meta.dirname,'mode-edge-results.json'),JSON.stringify(rows,null,2));
  }
  await browser.close();browser=null;
 }
 console.log(JSON.stringify({rows:rows.length,valid:rows.filter(r=>r.valid).length,failures:rows.filter(r=>!r.valid)}));
 if(rows.some(r=>!r.valid))process.exitCode=1;
}finally{await browser?.close();server.kill();}
