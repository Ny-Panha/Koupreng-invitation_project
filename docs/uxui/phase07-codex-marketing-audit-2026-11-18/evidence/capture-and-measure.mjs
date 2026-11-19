// Read-only loopback fixtures. Never sends contact email or calls a live API.
// Build apps first; run `node <this-file> before|after captures|lab` in isolation.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { execFileSync, spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '../../../..');
const stage = process.argv[2], task = process.argv[3] || 'captures';
const only = process.argv[4]?.replace('--only=', '').split(',');
const resultName = `${task}${only?.includes('signed-in') ? '-extra-states' : only?.includes('footer-end') ? '-footer-end' : only?.includes('footer') ? '-walked' : only ? '-supplemental' : ''}.json`;
if (!['before','after'].includes(stage) || !['captures','lab'].includes(task)) throw Error('Expected before|after captures|lab');
const out = path.join(root, 'output/phase07-codex-2026-11-18', stage);
await fs.mkdir(out, { recursive: true });
const require = createRequire(path.join(root, 'apps/frontend-user/package.json'));
const { chromium } = require('@playwright/test');
const { openPhase06Fixture: open } = await import(pathToFileURL(path.join(root, 'apps/frontend-user/tests/e2e/support/phase06Fixtures.js')));
const app = path.join(root, 'apps/frontend-user');
const build = stage === 'before' ? path.join(root, 'output/phase07-codex-2026-11-18/before-build') : path.join(app, 'dist');
const sha = execFileSync('git', ['rev-parse','HEAD'], { cwd: root }).toString().trim();
const sourceDigest = crypto.createHash('sha256');
const files = execFileSync('git', ['ls-files','-z','apps/frontend-user/src','apps/frontend-user/index.html'], { cwd: root }).toString().split('\0').filter(Boolean).sort();
for (const file of files) { sourceDigest.update(file); sourceDigest.update(await fs.readFile(path.join(root,file))); }
// Includes Gemini's initially untracked stylesheet; tests are separately inventoried.
sourceDigest.update(await fs.readFile(path.join(app, 'src/features/marketing/VenuesFeature.css')));
if (stage === 'after') {
  const extra = execFileSync('git', ['ls-files','--others','--exclude-standard','-z','apps/frontend-user/src'], {cwd:root}).toString().split('\0').filter(file=>file && /\.(?:jsx?|css)$/.test(file) && !/\.(?:test|spec)\./.test(file) && !file.endsWith('/VenuesFeature.css')).sort();
  for (const file of extra) { sourceDigest.update(file); sourceDigest.update(await fs.readFile(path.join(root,file))); }
}
const observedDigest = sourceDigest.digest('hex');
const sourceTreeSha256 = stage === 'before' ? JSON.parse(await fs.readFile(path.join(root,'output/phase07-codex-2026-11-18/before-source-tree.json'),'utf8')).sourceTreeSha256 : observedDigest;
try { await fetch('http://127.0.0.1:4173'); throw Error('Port 4173 occupied; stop only your own server before running'); }
catch (e) { if (!e.cause) throw e; }
const server = spawn(process.execPath, [path.join(app,'node_modules/vite/bin/vite.js'),'preview','--host','127.0.0.1','--port','4173','--strictPort','--outDir',build], { cwd:app, windowsHide:true, stdio:'ignore' });
const delay = ms => new Promise(resolve => setTimeout(resolve,ms));
let browser;
const rows = [];
try {
  for (let i=0;i<80;i++) { try { if ((await fetch('http://127.0.0.1:4173')).ok) break; } catch {} await delay(100); }
  browser = await chromium.launch();
  const jobs = [];
  if (task === 'captures') {
    for (const width of [320,390,768,1440,1920]) for (const lang of ['en','km']) for (const mode of ['light','dark']) for (const motion of ['reduce','no-preference']) jobs.push({ group:'home',path:'/',width,lang,mode,motion,state:'initial' });
    for (const [group,route,states] of [['home','/',['drawer','skip']],['contact','/contact',['initial','invalid','filled','pending','failure','recovered']],['venues','/venues',['initial','empty','click','failed-photo']],['venues','/venues/1',['direct']],['venues','/venues/999',['missing']],['contact','/about',['alias']],['contact','/help',['alias']],['home','/phase07-missing',['404']]]) {
      for (const state of states) for (const width of [390,1440]) if (!(width===1440 && state==='drawer')) jobs.push({ group,path:route,state,width,lang:'en',mode:width===390?'dark':'light',motion:'reduce' });
    }
    for (const [key,width] of [['silk-heritage',1440],['emerald-canva-luxe-wedding',390]]) jobs.push({ group:'template-demo',path:`/templates/${key}`,state:'renderer',width,lang:'en',mode:'light',motion:'reduce' });
    for (const width of [390,1440]) jobs.push({group:'home',path:'/',state:'collection',width,lang:'en',mode:width===390?'dark':'light',motion:'reduce'});
    for (const width of [320,390,768,1440,1920]) for (const lang of ['en','km']) for (const mode of ['light','dark']) jobs.push({group:'home',path:'/',state:'footer',width,lang,mode,motion:'reduce'});
    jobs.push({group:'home',path:'/',state:'walked',width:390,lang:'km',mode:'dark',motion:'reduce'}, {group:'home',path:'/',state:'walked',width:1440,lang:'en',mode:'light',motion:'reduce'});
    jobs.push({group:'home',path:'/',state:'footer-end',width:320,lang:'km',mode:'dark',motion:'reduce'}, {group:'home',path:'/',state:'footer-end',width:1440,lang:'en',mode:'light',motion:'reduce'});
    for (const width of [390,1440]) jobs.push({group:'home',path:'/',state:'signed-in',width,lang:'en',mode:'light',motion:'reduce'});
    for (const width of [768,844]) jobs.push({group:'venues',path:'/venues/1',state:'short-landscape',width,height:390,lang:'en',mode:'dark',motion:'reduce'});
    for (const width of [390,1440]) jobs.push({group:'venues',path:'/venues',state:'slow-photo',width,lang:'en',mode:'light',motion:'reduce'});
  } else {
    for (const [group,route] of [['home','/'],['contact','/contact'],['venues','/venues']]) for (const width of [390,1440]) for (const mode of ['light','dark']) for (const motion of ['reduce','no-preference']) for (const cache of ['routed-cold','routed-revisit']) for(let repeat=0;repeat<5;repeat++) jobs.push({ group,path:route,width,lang:'en',mode,motion,cache,repeat,state:'initial' });
  }
  for (const job of jobs) {
    if (only && !only.includes(job.state)) continue;
    const height = job.height ?? (job.width<600?844:900);
    const context = await browser.newContext({ viewport:{width:job.width,height}, deviceScaleFactor:task==='captures'?2:1, reducedMotion:job.motion });
    const page = await context.newPage();
    const errors=[], requests=[];
    page.on('pageerror',e=>errors.push({type:'pageerror',message:e.message}));
    page.on('console',m=>{if(m.type()==='error') errors.push({type:'console',message:m.text()});});
    page.on('response',async r=>{ try { const body=await r.body(); requests.push({url:r.url(),type:r.request().resourceType(),status:r.status(),decodedBytes:body.length}); } catch {} });
    await page.addInitScript(() => {
      window.__paint = { lcp:0,cls:0,longTasks:[],lcpElement:null };
      new PerformanceObserver(l=>{ for(const e of l.getEntries()) { window.__paint.lcp=e.startTime;window.__paint.lcpElement=e.element?.outerHTML?.slice(0,400); } }).observe({type:'largest-contentful-paint',buffered:true});
      new PerformanceObserver(l=>{ for(const e of l.getEntries()) if(!e.hadRecentInput) window.__paint.cls+=e.value; }).observe({type:'layout-shift',buffered:true});
      try { new PerformanceObserver(l=>{window.__paint.longTasks.push(...l.getEntries().map(e=>e.duration));}).observe({type:'longtask',buffered:true}); } catch {}
    });
    let row = { ...job,viewport:{width:job.width,height},browser:'chromium',version:browser.version(),sourceSha:sha,sourceTreeSha256,fixture:'phase06Fixtures.js; external media blocked; contact POST intercepted',errors };
    try {
      await open(page,job.group,{path:job.path,lang:job.lang,mode:job.mode,anonymous:job.group!=='template-demo' && job.state!=='signed-in'});
      if(job.state==='slow-photo') {
        await page.route('https://images.unsplash.com/**',async route=>{
          await delay(2000);await route.abort().catch(()=>{});
        });
        await page.reload({waitUntil:'domcontentloaded'});
        row.mediaFixture='External photos held pending for 2000ms then aborted; no substituted venue image';
      }
      if(job.state==='collection') {
        await page.route('**/api/v1/templates',r=>r.fulfill({json:{data:[['silk-heritage','Silk Heritage'],['khmer-celestial','Khmer Celestial'],['emerald-canva-luxe-wedding','Emerald Luxe']].map(([code,name],i)=>({id:31+i,code,slug:code,name,status:'ACTIVE',category:'TRADITIONAL',premium:true,price:null}))}}));
        await page.reload();await page.locator('.kp-design-card').first().waitFor();
      }
      if(job.cache==='routed-revisit') { requests.length=0; await page.reload(); }
      if(job.state==='renderer') await page.locator('.el-open-btn,.sh-cover button').first().waitFor();
      else await page.locator('h1').first().waitFor();
      if(job.state==='short-landscape') {
        await page.getByRole('dialog').waitFor();
        const inquiry=page.locator('.venue-modal-contact-btn');
        await inquiry.scrollIntoViewIfNeeded();
        row.inquiryCenterReachable=await inquiry.evaluate(el=>{
          const rect=el.getBoundingClientRect();
          const hit=document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2);
          return !!hit && (hit===el || el.contains(hit));
        });
        if(stage==='after' && !row.inquiryCenterReachable) throw Error('Landscape inquiry action remains obscured after scrolling');
      }
      await page.evaluate(()=>document.fonts.ready);
      if(job.state==='drawer') await page.getByRole('button',{name:'Open navigation menu'}).click();
      if(job.state==='skip') await page.getByRole('link',{name:'Skip to main content'}).focus();
      if(['invalid','filled','pending','failure','recovered'].includes(job.state)) {
        if(job.state==='invalid') await page.locator('button[type=submit]').click();
        else {
          await page.locator('#contact-name').fill('Fictional Host');await page.locator('#contact-email').fill('audit@example.test');await page.locator('#contact-message').fill('Fictional event question. No real delivery.');
          if(job.state!=='filled') {
            await page.route('**/api/v1/contact',r=>job.state==='pending'?new Promise(()=>{}):r.fulfill(job.state==='failure'?{status:503,json:{message:'Fixture unavailable'}}:{json:{data:{accepted:true,delivery:'SMTP_ACCEPTED'}}}));
            await page.locator('button[type=submit]').click();
            await page.locator(job.state==='pending'?'form[aria-busy=true]':job.state==='failure'?'[role=alert]':'[role=status]').waitFor();
          }
        }
      }
      if(job.state==='empty') await page.getByRole('textbox',{name:/Search by name/}).fill('no-such-place');
      if(job.state==='click') await page.getByRole('button',{name:/View details/}).first().click();
      if(job.state==='failed-photo') await page.locator('.venue-card').first().scrollIntoViewIfNeeded();
      if(job.state==='walked') {
        for (const img of await page.locator('img[loading=lazy]').all()) {
          if (await img.isVisible()) { await img.scrollIntoViewIfNeeded(); await img.evaluate(el=>el.decode().catch(()=>{})); }
        }
        await page.evaluate(()=>scrollTo(0,0));
      }
      if(job.state==='footer') {
        await page.locator('.kp-footer').scrollIntoViewIfNeeded();
        await page.locator('.kp-footer img').evaluateAll(images=>Promise.all(images.map(img=>img.decode().catch(()=>{}))));
      }
      if(job.state==='footer-end') {
        await page.locator('.kp-footer').scrollIntoViewIfNeeded();
        await page.locator('.kp-footer img').evaluateAll(images=>Promise.all(images.map(img=>img.decode().catch(()=>{}))));
        await page.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
      }
      // Keep native clocks. This is a fixed observation window, not a readiness assertion.
      await page.waitForTimeout(task==='lab'?700:250);
      row={...row,...await page.evaluate(()=>({paint:window.__paint,navigation:performance.getEntriesByType('navigation')[0]?.toJSON(),fonts:[...document.fonts].filter(f=>f.status==='loaded').map(f=>({family:f.family,weight:f.weight})),title:document.title,overflow:document.documentElement.scrollWidth-innerWidth,resources:performance.getEntriesByType('resource').map(r=>({name:r.name,transferSize:r.transferSize,encodedBodySize:r.encodedBodySize,decodedBodySize:r.decodedBodySize})),fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime,description:document.querySelector('meta[name=description]')?.content,renderer:document.querySelector('.tpl-silk-heritage,.ec-root')?getComputedStyle(document.querySelector('.tpl-silk-heritage,.ec-root')).color:null})),requests};
      if(task==='captures') {
        const name=`${job.group}-${job.path.replaceAll('/','_')}-${job.state}-${job.width}-${job.lang}-${job.mode}-${job.motion}.png`;
        await page.screenshot({path:path.join(out,name),fullPage:true});row.imagePath=path.relative(root,path.join(out,name)).replaceAll('\\','/');
        const viewportName=name.replace('.png','-viewport.png');await page.screenshot({path:path.join(out,viewportName)});row.viewportImagePath=path.relative(root,path.join(out,viewportName)).replaceAll('\\','/');
      }
      row.valid=true;
    } catch(e) {row.valid=false;row.failure=e.message;}
    rows.push(row);await context.close();
    await fs.writeFile(path.join(out,resultName),JSON.stringify(rows,null,2));
  }
  console.log(JSON.stringify({stage,task,rows:rows.length,invalid:rows.filter(r=>!r.valid).length,output:out}));
} finally {await browser?.close();server.kill();}
