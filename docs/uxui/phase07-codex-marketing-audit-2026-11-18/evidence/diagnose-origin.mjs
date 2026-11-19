// Isolated default-origin build. Does not replace either app's working dist.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync, spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
const root=path.resolve(import.meta.dirname,'../../../..');
const app=path.join(root,'apps/frontend-admin');
const out=path.join(root,'output/phase07-codex-2026-11-18/default-origin-admin');
const env={...process.env};delete env.VITE_USER_APP_URL;
const log=execFileSync(process.execPath,[path.join(app,'node_modules/vite/bin/vite.js'),'build','--outDir',out,'--emptyOutDir'],{cwd:app,env}).toString();
await fs.writeFile(path.join(root,'output/phase07-codex-2026-11-18/default-origin-build.log'),log);
const server=spawn(process.execPath,[path.join(app,'node_modules/vite/bin/vite.js'),'preview','--host','127.0.0.1','--port','4184','--strictPort','--outDir',out],{cwd:app,windowsHide:true,stdio:'ignore'});
const require=createRequire(path.join(root,'apps/frontend-user/package.json'));
const {chromium}=require('@playwright/test');
const {routeContracts,installRouteContractFixtures}=await import(pathToFileURL(path.join(root,'apps/frontend-user/tests/e2e/support/batch12RouteContracts.js')));
let browser;
try{
 for(let i=0;i<80;i++){try{if((await fetch('http://127.0.0.1:4184')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch();const page=await browser.newPage({viewport:{width:844,height:390}});
 const failures=[];page.on('requestfailed',r=>failures.push({url:r.url(),error:r.failure()}));
 const contract=routeContracts.find(r=>r.application==='frontend-admin'&&r.group==='admin-template-edit');
 await installRouteContractFixtures(page,contract);
 await page.route('**/*',r=>['localhost','127.0.0.1'].includes(new URL(r.request().url()).hostname)?r.fallback():r.abort());
 await page.goto('http://127.0.0.1:4184'+contract.concreteUrl);
 await page.locator('.studio-section-tabs button').first().waitFor();
 await page.locator('.studio-panel-switch button').last().click();
 const frame=page.locator('iframe[title="Live User Template Preview"]');await frame.waitFor();
 const originalSrc=await frame.getAttribute('src');const publicSrc=new URL(originalSrc);if(publicSrc.searchParams.has('previewSession'))publicSrc.searchParams.set('previewSession','FICTIONAL-SESSION-REDACTED');const src=publicSrc.href;
 await page.waitForTimeout(600);
 const result={sourceSha:execFileSync('git',['rev-parse','HEAD'],{cwd:root}).toString().trim(),defaultBuildOrigin:'VITE_USER_APP_URL omitted; existing environment files and runtime fallback unchanged',frameSrc:src,expectedUserOrigin:'http://127.0.0.1:4173',mismatch:new URL(src).origin!=='http://127.0.0.1:4173',requestFailures:failures,correctedEvidence:'baseline-phase06: 44/44 with explicit consistent build origin; accepted-phase06-six final separately',inference:'Demonstrates a concrete build-origin failure mode. Gemini original extra failures cannot be individually attributed without their traces.'};
 await fs.writeFile(path.join(import.meta.dirname,'origin-diagnosis.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify(result));
}finally{await browser?.close();server.kill();}
