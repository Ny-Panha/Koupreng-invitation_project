import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import crypto from 'node:crypto';
const root = path.resolve(import.meta.dirname, '../../../..');
const stage = process.argv[2] || 'after';
const out = path.join(root, 'output/phase08-codex-2026-11-18', process.argv[3] || stage);
fs.mkdirSync(out, { recursive: true });
const { chromium } = await import(pathToFileURL(path.join(root, 'apps/frontend-user/node_modules/playwright/index.mjs')));
const { default: AxeBuilder } = await import(pathToFileURL(path.join(root, 'apps/frontend-user/node_modules/@axe-core/playwright/dist/index.mjs')));
const { openPhase06Fixture } = await import(pathToFileURL(path.join(root, 'apps/frontend-user/tests/e2e/support/phase06Fixtures.js')));
const browser = await chromium.launch();
const rows = [], responsive = [], scans = [], performanceRows = [], contrastRows = [];
const routes = [['auth-login','/login'],['auth-register','/register'],['auth-forgot','/forgot-password'],['auth-reset','/reset-password'],['profile','/app/profile'],['password','/app/change-password']];
const buildHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'apps/frontend-user/dist/index.html'))).digest('hex');
for (const [group, url] of routes) for (const lang of ['en','km']) for (const mode of ['light','dark']) {
  const context = await browser.newContext({ viewport: { width: lang === 'en' ? 1440 : 390, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await openPhase06Fixture(page, group, { path:url, lang, mode, anonymous: group.startsWith('auth-') });
  await page.locator('h1').first().waitFor(); await page.evaluate(() => document.fonts.ready);
  if (group === 'profile') await page.locator('.profile-pw-toggle').click();
  const filename = `${group}-${lang}-${mode}.png`;
  await page.screenshot({ path:path.join(out,filename), fullPage:true, animations:'disabled' });
  const styles = await page.locator('h1').first().evaluate(el => ({ color:getComputedStyle(el).color, font:getComputedStyle(el).fontFamily, background:getComputedStyle(el.closest('.auth-card,.profile-card,.dash-panel') || el.parentElement).backgroundColor }));
  rows.push({ group, route:url, lang, mode, motion:'reduce', viewport:page.viewportSize(), file:path.relative(root,path.join(out,filename)).replaceAll('\\','/'), buildHash, styles, errors, sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(out,filename))).digest('hex') });
  if (stage === 'after') {
    const samples = await page.evaluate(() => {
      const rgb = value => { const n=value.match(/[\d.]+/g)?.map(Number)||[0,0,0]; return [n[0],n[1],n[2],n[3]??1]; };
      const blend=(a,b)=>a.slice(0,3).map((n,i)=>n*a[3]+b[i]*(1-a[3]));
      const background=el=> { const layers=[]; for(let p=el;p;p=p.parentElement)layers.push(rgb(getComputedStyle(p).backgroundColor)); return layers.reverse().reduce((base,layer)=>blend(layer,base),[255,255,255]); };
      const lum=c=>c.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
      const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
      return [...document.querySelectorAll('.auth-card :is(h1,label,.auth-hint,.auth-error,.auth-error-msg,.account-password-guidance),.profile-page :is(h1,label,.profile-msg,.account-password-guidance),.account-password-page :is(h1,label,.dash-alert,.account-password-guidance)')].filter(el=>el.getClientRects().length).map(el=>{const s=getComputedStyle(el),bg=background(el),fg=blend(rgb(s.color),bg);return{selector:el.tagName+'.'+el.className,color:s.color,background:bg,ratio:ratio(fg,bg),minimum:parseFloat(s.fontSize)>=24||parseFloat(s.fontSize)>=18.66&&parseInt(s.fontWeight)>=700?3:4.5};});
    });
    contrastRows.push(...samples.map(sample=>({group,lang,mode,...sample})));
    const result = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    scans.push({group,lang,mode,violations:result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
    for (const [width,height] of [[320,740],[360,740],[390,844],[430,844],[600,800],[768,900],[820,900],[1024,900],[1440,900],[1920,1080],[844,390],[820,430],[768,390]]) {
      await page.setViewportSize({width,height});
      const geometry = await page.evaluate(() => ({ width:innerWidth, scrollWidth:document.documentElement.scrollWidth, clipped:[...document.querySelectorAll('main input, .auth-card input, .profile-page input, .dash-panel input')].filter(el=>el.getClientRects().length && getComputedStyle(el).opacity!=='0').filter(el=>{const r=el.getBoundingClientRect();return r.x < -1 || r.right > innerWidth+1;}).map(el=>el.id) }));
      responsive.push({group,lang,mode,width,height,...geometry});
    }
    if (group === 'auth-login' && lang === 'km' && mode === 'dark') {
      await page.setViewportSize({width:844,height:390}); await page.screenshot({path:path.join(out,'login-km-dark-landscape.png'),fullPage:true});
      rows.push({group,route:url,lang,mode,motion:'reduce',state:'short landscape',viewport:page.viewportSize(),buildHash,file:path.relative(root,path.join(out,'login-km-dark-landscape.png')).replaceAll('\\','/'),sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(out,'login-km-dark-landscape.png'))).digest('hex')});
      await page.emulateMedia({forcedColors:'active'}); await page.screenshot({path:path.join(out,'login-forced-colors.png'),fullPage:true});
      rows.push({group,route:url,lang,mode,motion:'reduce',state:'forced colors',viewport:page.viewportSize(),buildHash,file:path.relative(root,path.join(out,'login-forced-colors.png')).replaceAll('\\','/'),sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(out,'login-forced-colors.png'))).digest('hex')});
      scans.push({group,lang,mode,forcedColors:true,violations:(await new AxeBuilder({page}).analyze()).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))});
    }
    await page.emulateMedia({forcedColors:'none'});
    await page.setViewportSize({width:390,height:844});
    // Render real API-error shapes; only the explicitly named fictional mutation is allowed.
    const endpoint = {'auth-login':'auth/login','auth-register':'auth/register','auth-forgot':'auth/forgot-password','auth-reset':'auth/reset-password',profile:'users/me',password:'auth/change-password'}[group];
    await page.route(`**/${endpoint}`, route=>route.fulfill({status:group==='profile'?503:400,json:{message:'Fictional request could not be completed'}}));
    if(group==='profile') { await page.reload(); await page.locator('.profile-msg.error').waitFor(); }
    else {
      if(group==='auth-login')await page.locator('input[autocomplete=username]').fill('fictional@example.invalid');
      if(group==='auth-register'){await page.locator('input[autocomplete=name]').fill('Fictional Host');await page.locator('input[type=tel]').fill('012345678');}
      if(group==='auth-forgot')await page.locator('input[type=email]').fill('fictional@example.invalid');
      if(group==='auth-reset')await page.locator('form input[autocomplete=off]').fill('fictional-reset');
      for(const el of await page.locator('input[autocomplete="current-password"],input[autocomplete="new-password"]').all())await el.fill('FictionalPass1');
      await page.locator('form button[type=submit]').click();
      await page.locator(group==='password'?'.dash-alert.is-error':'.auth-card > p.auth-error').waitFor();
      for(const el of await page.locator('form input').all())if(await el.isEditable())await el.fill('');
    }
    const errorFile=filename.replace('.png','-error.png');
    await page.screenshot({path:path.join(out,errorFile),fullPage:true,animations:'disabled'});
    rows.push({group,route:url,lang,mode,motion:'reduce',state:'API failure; synthetic inputs cleared before screenshot',viewport:page.viewportSize(),file:path.relative(root,path.join(out,errorFile)).replaceAll('\\','/'),buildHash,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(out,errorFile))).digest('hex')});
    const errorsAxe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    scans.push({group,lang,mode,state:'API failure',violations:errorsAxe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
  }
  await context.close();
}
for (const [group,url] of [routes[0], routes[3], routes[4]]) for (const temperature of ['cold','warm']) for (let sample=0;sample<3;sample++) {
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const page=await context.newPage();
  await page.addInitScript(() => {
    window.lab={lcp:0,cls:0,lcpElement:''};
    new PerformanceObserver(list=>{for(const e of list.getEntries()){window.lab.lcp=e.startTime;window.lab.lcpElement=e.element?.tagName+':'+(e.element?.className || '');}}).observe({type:'largest-contentful-paint',buffered:true});
    new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.lab.cls+=e.value;}).observe({type:'layout-shift',buffered:true});
  });
  await openPhase06Fixture(page,group,{path:url,anonymous:group.startsWith('auth-')});
  if(temperature==='warm')await page.reload();
  await page.locator('h1').first().waitFor(); await page.evaluate(()=>document.fonts.ready);
  // Two frames allow paint observers to report without an arbitrary timing sleep.
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  performanceRows.push({group,temperature,sample,buildHash,...await page.evaluate(()=>({ ...window.lab,fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime,dom:performance.getEntriesByType('navigation')[0]?.domContentLoadedEventEnd,resources:performance.getEntriesByType('resource').map(r=>({name:new URL(r.name).pathname,bytes:r.transferSize,duration:r.duration})),note:'Loopback fixture, unthrottled; route interception disables browser HTTP cache; warm means repeat navigation only. No field INP/p75 claim.'}))});
  await context.close();
}
await browser.close();
const write=(name,value)=>fs.writeFileSync(path.join(import.meta.dirname,name),JSON.stringify(value,null,2)+'\n');
write(`${stage}-visual.json`,rows); write(`${stage}-performance.json`,performanceRows);
if(stage==='after'){write('responsive-a11y-results.json',{geometry:responsive,axe:scans,nativeZoom:'NOT TESTED',physicalAT:'BLOCKED — EXTERNAL'});write('contrast-results.json',{samples:contrastRows,failures:contrastRows.filter(r=>r.ratio<r.minimum),scope:'Computed text samples only; borders, focus and placeholders are not certified by this calculation.'});}
console.log(JSON.stringify({stage,captures:rows.length,samples:performanceRows.length,geometry:responsive.length,overflows:responsive.filter(r=>r.scrollWidth>r.width+1||r.clipped.length).length,axeScans:scans.length,axeViolations:scans.reduce((n,r)=>n+r.violations.length,0)}));
