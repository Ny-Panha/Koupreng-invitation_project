import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { startFixtureServers } from './fixture-http-server.mjs';
const root=path.resolve(import.meta.dirname,'../../../..');
const require=createRequire(path.join(root,'apps/frontend-user/package.json'));
const {chromium,expect}=require('@playwright/test');
const {openPhase06Fixture:open,centerHit}=await import(pathToFileURL(path.join(root,'apps/frontend-user/tests/e2e/support/phase06Fixtures.js')));
const output=path.join(root,'output/playwright/uxui-phase06-2026-11-17/renderer-review');
await fs.mkdir(output,{recursive:true});
const server=await startFixtureServers(root,'after');
const rows=[],zoom=[];
const only=process.argv.find(v=>v.startsWith('--only='))?.slice(7).split(',');
const headlessOnly=process.argv.includes('--headless-only');
const sha=execFileSync('git',['rev-parse','HEAD'],{cwd:root}).toString().trim();
const families=[
 ['khmer-floral-gold','.kfg-open'],['royal-garden-cinematic','.rg-royal-open'],
 ['silk-heritage','.sh-cover .sh-button'],['template-boilerplate','.tpl-boilerplate a.tpl-btn-primary[href]'],
 ['khmer-celestial','.kc-opening__cta-wrapper button'],['the-digital-yes-wedding','.tdy-envelope-scene + div button'],
 ['emerald-canva-luxe-wedding','.el-open-btn'],['withjoy-modern-portal','.wj-nav-brand'],
 ['bliss-editorial-wedding','.bliss-rsvp-trigger'],['khmer-golden-canva-inspired-wedding','.ck-cover__open'],
];
try {
 for(const headed of headlessOnly?[false]:[false,true]) {
  const browser=await chromium.launch({headless:!headed});
  try {
   const jobs=headed ? [['silk-heritage',families[2][1],1440],['emerald-canva-luxe-wedding','.el-open-btn',320],['emerald-canva-luxe-wedding','.el-open-btn',390]].flatMap(([key,selector,width])=>['loaded','missing'].flatMap(media=>['reduce','no-preference'].map(motion=>({key,selector,width,media,motion}))))
    : families.flatMap(([key,selector])=>[390,1440].flatMap(width=>['reduce','no-preference'].map(motion=>({key,selector,width,motion,media:'loaded'}))));
   for(const job of jobs) {
    if(only&&!only.includes(job.key))continue;
    const {key,selector,width,motion,media}=job;
    const context=await browser.newContext({viewport:{width,height:width<768?844:900},deviceScaleFactor:1,reducedMotion:motion,hasTouch:width<768});
    const page=await context.newPage();server.bind(page);
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    const row={...job,headed,sha,browser:browser.version(),observedAt:new Date().toISOString(),selector,status:'NOT TESTED',errors,stages:[]};
    const prefix=`${key}-${width}-${motion}-${media}-${headed?'headed':'headless'}`;
    const capture=async stage=>{
      const screenshot=path.join(output,`${prefix}-${stage}.png`);
      await page.screenshot({path:screenshot});
      row.stages.push({stage,at:await page.evaluate(()=>performance.now()),screenshot:path.relative(root,screenshot).replaceAll('\\','/'),
        computed:await page.locator(selector).first().evaluateAll(nodes=>nodes.map(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return {text:el.textContent.trim(),accessibleLabel:el.getAttribute('aria-label'),color:s.color,background:s.backgroundColor,opacity:s.opacity,visibility:s.visibility,pointerEvents:s.pointerEvents,hitStack:document.elementsFromPoint(r.x+r.width/2,r.y+r.height/2).slice(0,6).map(n=>({tag:n.tagName,class:n.className,aria:n.getAttribute('aria-hidden'),inert:!!n.closest('[inert]')})),x:r.x,y:r.y,width:r.width,height:r.height};}))});
    };
    try {
      if(media==='missing') {const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.setBlockedURLs',{urls:['*.png*','*.jpg*','*.jpeg*','*.webp*','*.mp4*']});}
      const state=await open(page,'template-demo',{path:`/templates/${key}`});
      const action=page.locator(selector).first();
      await expect(action).toBeVisible();await page.evaluate(()=>document.fonts.ready);
      if(key==='khmer-celestial'&&motion==='no-preference') {
        // A real pointer enters before clicking; this stops the existing idle
        // float through the renderer's own finite hover state. No forced click.
        const box=await action.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
      }
      await expect.poll(()=>centerHit(action)).toBe(true);
      await expect(action).toHaveAccessibleName(/.+/);
      await capture('ready');
      if(key==='template-boilerplate'){expect(new URL(await action.getAttribute('href')).hostname).toBe('maps.google.com');await action.focus();row.activation='Keyboard focus and safe map destination; this renderer starts open by design, no provider request';}
      else if(headed&&width<768){await action.tap();row.activation='normal touch';}
      else if(headed||(key==='khmer-celestial'&&motion==='no-preference')){await action.click();row.activation='normal pointer';}
      else {await action.focus();await action.press('Enter');row.activation='keyboard Enter';}
      await page.waitForTimeout(150);await capture('intermediate');
      if(key==='template-boilerplate')await expect(action).toBeFocused();
      else if(key==='withjoy-modern-portal') await expect(page).toHaveURL(/#home$/);
      else if(key==='bliss-editorial-wedding') await expect(page.locator('.bliss-drawer.open')).toBeVisible();
      else await expect(action).not.toBeVisible({timeout:8000});
      await capture('settled');
      row.renderer=await page.locator('[data-template-renderer]').first().getAttribute('data-template-renderer');
      row.paint=await page.evaluate(()=>({paints:performance.getEntriesByType('paint').map(e=>({name:e.name,startTime:e.startTime})),fonts:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family),images:[...document.images].map(i=>({url:i.currentSrc,complete:i.complete,naturalWidth:i.naturalWidth})),headings:[...document.querySelectorAll('h1,h2')].filter(e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden').map(e=>e.textContent.trim()).slice(0,8)}));
      expect(state.writes).toEqual([]);expect(errors).toEqual([]);
      await expect(page.locator('.host-header-wrapper,.kp-header,.admin-header')).toHaveCount(0);
      row.status='FIXTURE VERIFIED';
      if(headed&&key==='silk-heritage'&&motion==='reduce'&&media==='loaded') {
        const initial=await page.evaluate(()=>({dpr:devicePixelRatio,width:innerWidth}));
        for(const [level,presses] of [[200,5],[400,3]]) {
          for(let i=0;i<presses;i++)await page.keyboard.press('Control+Equal');
          const actual=await page.evaluate(()=>({dpr:devicePixelRatio,width:innerWidth}));
          zoom.push({requestedPercent:level,initial,actual,status:Math.abs(actual.dpr/initial.dpr-level/100)<.05?'OBSERVED NATIVE ZOOM':'NOT TESTED — browser shortcuts did not change measured zoom'});
        }
        await page.keyboard.press('Control+Digit0');
      }
    } catch(error) {row.status='REVIEW REQUIRED';row.reason=error.message;await capture('review').catch(()=>{});
      if(key==='khmer-celestial')try{await page.locator(selector).first().click({timeout:3000});row.pointerDiagnostic='Normal unforced pointer click succeeded';}catch(pointer){row.pointerDiagnostic=pointer.message;}
    }
    finally {rows.push(row);await context.close();}
    console.log(`${prefix}: ${row.status}${row.reason ? ' — '+row.reason.split('\n')[0] : ''}`);
    await fs.writeFile(path.join(output,'progress.json'),JSON.stringify({sha,rows,zoom},null,2)+'\n');
   }
  } finally {await browser.close();}
 }
} finally {await server.close();
 if(only){const prior=JSON.parse(await fs.readFile(path.join(import.meta.dirname,'renderer-visibility-review.json'),'utf8'));const key=r=>[r.key,r.width,r.motion,r.media,r.headed].join(':');const seen=new Set(rows.map(key));rows.push(...prior.rows.filter(r=>!seen.has(key(r))));if(!zoom.length)zoom.push(...prior.zoom);}
 await fs.writeFile(path.join(import.meta.dirname,'renderer-visibility-review.json'),JSON.stringify({sha,rows,zoom,limitations:['Fictional initial catalog content only; media=loaded means local fixture assets, not live authored media','Headed Chromium is a desktop browser, not a physical phone','No renderer source changed; actual authored language/media/RSVP and screen-reader certification remain separate']},null,2)+'\n');}
console.log(JSON.stringify({rows:rows.length,verified:rows.filter(r=>r.status==='FIXTURE VERIFIED').length,review:rows.filter(r=>r.status!=='FIXTURE VERIFIED').length}));
if(rows.some(r=>r.status!=='FIXTURE VERIFIED'))process.exitCode=1;
