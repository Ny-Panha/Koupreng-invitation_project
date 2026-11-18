import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {startFixtureServers} from './fixture-http-server.mjs';
const root=path.resolve(import.meta.dirname,'../../../..');
const require=createRequire(path.join(root,'apps/frontend-user/package.json'));
const {chromium,expect}=require('@playwright/test');
const {openPhase06Fixture:open,centerHit}=await import(pathToFileURL(path.join(root,'apps/frontend-user/tests/e2e/support/phase06Fixtures.js')));
const {uxEvents}=await import(pathToFileURL(path.join(root,'apps/frontend-user/tests/e2e/support/uxFixtures.js')));
const rows=[];
const output=path.join(root,'output/playwright/uxui-phase06-2026-11-17/special-modes');await fs.mkdir(output,{recursive:true});
const server=await startFixtureServers(root,'after');
const browser=await chromium.launch();
const sha=execFileSync('git',['rev-parse','HEAD'],{cwd:root}).toString().trim();
try {
 for(const [group,app='frontend-user',header] of [['home',undefined,'.kp-header'],['auth-login',undefined,'.auth-top-bar'],['events',undefined,'.host-header-wrapper'],['dashboard',undefined,'.host-header-wrapper'],['admin-dashboard','frontend-admin','.admin-header'],['admin-template-edit','frontend-admin','.template-studio-toolbar']]) {
  for(const kind of ['safe-portrait','safe-landscape','forced-colors','text-spacing','font-fallback']) {
   const viewport=kind==='safe-landscape'?{width:844,height:390}:{width:390,height:844};
   const context=await browser.newContext({viewport,reducedMotion:'reduce',forcedColors:kind==='forced-colors'?'active':'none'});
   const page=await context.newPage();server.bind(page);
   const row={group,app,kind,viewport,sha,status:'NOT TESTED',errors:[]};page.on('pageerror',e=>row.errors.push(e.message));
   try {
    const cdp=await context.newCDPSession(page);
    if(kind.startsWith('safe-')) {
      row.insets=kind==='safe-landscape'?{top:0,left:44,right:44,bottom:21}:{top:44,left:0,right:0,bottom:34};
      await cdp.send('Emulation.setSafeAreaInsetsOverride',{insets:row.insets});
    }
    if(kind==='font-fallback'){await cdp.send('Network.enable');await cdp.send('Network.setBlockedURLs',{urls:['*.woff2*','*.woff*']});}
    const state=await open(page,group,{app,lang:'km',mode:'dark'});
    if(kind==='text-spacing'&&['events','dashboard'].includes(group)) {
      row.longLabel='ពិធីមង្គលការរបស់ ដារ៉ា និង សុភា · Dara & Sophea — ក្រុមគ្រួសារជាទីស្រឡាញ់';
      const event={...uxEvents[0],title:row.longLabel,venueName:'សាលាពិធីមង្គលការនៅរាជធានីភ្នំពេញ · Phnom Penh celebration venue'};
      await page.route('**/api/v1/invitations/101',route=>route.fulfill({json:{data:event}}));
      await page.route('**/api/v1/invitations/my',route=>route.fulfill({json:{data:[event,uxEvents[1]]}}));
      await page.reload();
      await expect(page.getByText(row.longLabel,{exact:true}).first()).toBeVisible();
    }
    await page.locator(header).waitFor();
    await page.locator('h1:visible, main h2:visible').first().waitFor();
    if(kind==='text-spacing')await page.addStyleTag({content:'.kp-marketing-shell *,.auth-shell *,.dash-wrapper *,.admin-shell *,.template-studio *{line-height:1.8!important;letter-spacing:.12em!important;word-spacing:.16em!important} p{margin-bottom:2em!important}'});
    row.fontLoads=await page.evaluate(async()=>{
      const results=[];
      for(const name of ['DM Sans','Kantumruy Pro','Moul'])try{const faces=await document.fonts.load(`16px "${name}"`,'គូព្រេង Aa');results.push({name,faces:faces.map(f=>({family:f.family,status:f.status,weight:f.weight}))});}catch(e){results.push({name,error:e.message});}
      return results;
    });
    row.header=await page.locator(header).evaluate(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return {x:r.x,y:r.y,width:r.width,height:r.height,paddingTop:parseFloat(s.paddingTop),paddingLeft:parseFloat(s.paddingLeft),paddingRight:parseFloat(s.paddingRight)};});
    if(kind.startsWith('safe-')&&group!=='auth-login') {
      expect(row.header.paddingTop).toBeGreaterThanOrEqual(row.insets.top);
      expect(row.header.paddingLeft).toBeGreaterThanOrEqual(row.insets.left);
      expect(row.header.paddingRight).toBeGreaterThanOrEqual(row.insets.right);
    } else if(kind.startsWith('safe-')) {
      // Auth insets belong to its centered page, not the inner toolbar.
      expect(row.header.x).toBeGreaterThanOrEqual(row.insets.left);
      expect(row.header.x+row.header.width).toBeLessThanOrEqual(viewport.width-row.insets.right+1);
      expect(row.header.y).toBeGreaterThanOrEqual(row.insets.top);
    }
    row.document=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth,forcedColors:matchMedia('(forced-colors:active)').matches}));
    expect(row.document.width).toBeLessThanOrEqual(viewport.width+1);
    const action=page.locator(group==='admin-template-edit'?'.studio-panel-switch button':group==='auth-login'?'.auth-form button[type=submit]':group==='admin-dashboard'?'.admin-mobile-toggle':group==='home'?'.kp-menu-trigger':'.host-hamburger-btn').first();
    if(await action.isVisible()){await expect.poll(()=>centerHit(action)).toBe(true);await action.focus();await expect(action).toBeFocused();row.actionName=await action.getAttribute('aria-label')||await action.textContent();}
    row.status='FIXTURE VERIFIED';expect(state.writes).toEqual([]);expect(row.errors).toEqual([]);
    const file=path.join(output,`${group}-${kind}.png`);await page.screenshot({path:file});row.screenshot=path.relative(root,file).replaceAll('\\','/');
   }catch(error){row.status='REVIEW REQUIRED';row.reason=error.message;}
   finally {rows.push(row);await context.close();}
  }
  console.log(`${group}: ${rows.length} special-mode observations`);
 }
 for(const kind of ['wizard-recovery','unknown-renderer-boundary']) {
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const page=await context.newPage();server.bind(page);
  const row={group:kind==='wizard-recovery'?'create-event':'template-demo',kind,sha,status:'NOT TESTED'};
  try {
    if(kind==='wizard-recovery') {
      const state=await open(page,'create-event',{lang:'km'});
      const step=page.locator('[aria-current="step"]');row.beforeStep=await step.textContent();
      await page.getByRole('button',{name:'បន្ត',exact:true}).click();
      await expect(step).not.toHaveText(row.beforeStep);row.afterStep=await step.textContent();
      const title=page.locator('#event-title');await title.fill('ពិធីរបស់ ដារ៉ា និង សុភា · Phase 06');
      await expect.poll(()=>page.evaluate(()=>JSON.parse(sessionStorage.getItem('koupreng.onboarding.7'))?.form?.title)).toBe('ពិធីរបស់ ដារ៉ា និង សុភា · Phase 06');
      page.on('dialog',dialog=>dialog.accept());await page.reload();
      if(!await title.isVisible())await page.getByRole('button',{name:'បន្ត',exact:true}).click();
      await expect(title).toHaveValue('ពិធីរបស់ ដារ៉ា និង សុភា · Phase 06');expect(state.writes).toEqual([]);
      row.copyDecision='Current control tested; native terminology approval absent; old Phase 02 assertion unchanged';
    } else {
      const state=await open(page,'template-demo',{path:'/templates/phase06-unregistered'});
      await expect(page.getByRole('heading',{name:/Template unavailable/})).toBeVisible();
      await expect(page.locator('[data-template-renderer]')).toHaveCount(0);
      await expect(page.locator('a[href="/templates"]').first()).toBeVisible();expect(state.writes).toEqual([]);
      row.contract='Unknown stable code is unavailable on public routes; callable internal fallback remains unit tested, not a public image gate';
    }
    row.status='FIXTURE VERIFIED';const file=path.join(output,`${kind}.png`);await page.screenshot({path:file});row.screenshot=path.relative(root,file).replaceAll('\\','/');
  }catch(error){row.status='REVIEW REQUIRED';row.reason=error.message;}
  finally{rows.push(row);await context.close();}
 }
}finally{await browser.close();await server.close();await fs.writeFile(path.join(import.meta.dirname,'special-mode-results.json'),JSON.stringify({sha,rows,limits:['CDP safe-area and forced-colors emulation are not a real device/OS/AT certificate','Font loading/fallback and geometry are not native Khmer glyph or phrasing review','No physical keyboard or browser chrome was simulated by shrinking viewport']},null,2)+'\n');}
console.log(JSON.stringify({rows:rows.length,verified:rows.filter(r=>r.status==='FIXTURE VERIFIED').length,review:rows.filter(r=>r.status!=='FIXTURE VERIFIED').length}));
if(rows.some(r=>r.status!=='FIXTURE VERIFIED'))process.exitCode=1;
