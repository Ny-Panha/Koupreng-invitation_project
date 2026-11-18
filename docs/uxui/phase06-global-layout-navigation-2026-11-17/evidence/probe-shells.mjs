import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const root = path.resolve(import.meta.dirname, '../../../..');
const require = createRequire(path.join(root, 'apps/frontend-user/package.json'));
const { chromium } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const { openPhase06Fixture: open } = await import(pathToFileURL(path.join(root, 'apps/frontend-user/tests/e2e/support/phase06Fixtures.js')));
const stage = process.argv[2];
if (!['before','after'].includes(stage)) throw new Error('Pass before or after');
const output = path.join(root, 'output/playwright/uxui-phase06-2026-11-17', stage, 'shell-probes');
await fs.mkdir(output, { recursive: true });
const children = [];
for (const [app, port] of [['user',4173],['admin',4174]]) {
  const cwd = path.join(root, `apps/frontend-${app}`);
  children.push(spawn(process.execPath, [path.join(cwd,'node_modules/vite/bin/vite.js'),'preview','--host','127.0.0.1','--port',String(port),'--strictPort','--outDir',path.join(root,`output/playwright/uxui-phase06-2026-11-17/${stage}/${app}-build`)], { cwd, windowsHide: true, stdio: 'ignore' }));
}
const rows=[], captures=[], actionCaptures=[], axe=[], errors=[];
const widths=[320,359,360,361,375,390,414,430,479,480,481,599,600,601,767,768,769,820,1023,1024,1025,1280,1440,1920];
const sha=execFileSync('git',['rev-parse','HEAD'],{cwd:root}).toString().trim();
let browser;
try {
  for (const port of [4173,4174]) {
    let ready=false;
    for (let i=0;i<100;i++) { try { if ((await fetch(`http://127.0.0.1:${port}`)).ok) { ready=true; break; } } catch { /* server starting */ } await new Promise(r=>setTimeout(r,100)); }
    if (!ready) throw new Error(`No server on ${port}`);
  }
  browser=await chromium.launch();
  for (const [group,app='frontend-user',selector] of [['home',undefined,'.kp-marketing-shell'],['auth-login',undefined,'.auth-shell'],['events',undefined,'.dash-wrapper'],['dashboard',undefined,'.dash-wrapper'],['admin-dashboard','frontend-admin','.admin-shell'],['admin-template-edit','frontend-admin','.template-studio']]) {
    for (const lang of ['en','km']) for (const mode of ['light','dark']) {
      const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,reducedMotion:'reduce'});
      const page=await context.newPage(); page.on('pageerror',e=>errors.push({group,lang,mode,message:e.message}));
      await open(page,group,{app,lang,mode});
      await page.locator(selector).waitFor();
      await page.locator(`${selector} h1:visible, ${selector} h2:visible`).first().waitFor();
      await page.evaluate(()=>document.fonts.ready);
      for (const width of widths) {
        await page.setViewportSize({width,height:844});
        await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
        const geometry=await page.evaluate(() => {
          const controls=[...document.querySelectorAll('a[href],button,input,select,textarea,[tabindex="0"]')].filter(el=>el.getClientRects().length && !el.closest('[inert],dialog:not([open])') && getComputedStyle(el).visibility!=='hidden');
          const bounds=el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return {tag:el.tagName,name:el.getAttribute('aria-label')||el.textContent.trim().slice(0,65),x:r.x,y:r.y,width:r.width,height:r.height,color:s.color,background:s.backgroundColor,font:s.fontFamily,lineHeight:s.lineHeight};};
          return {documentWidth:document.documentElement.scrollWidth,viewport:innerWidth,
            horizontalClips:controls.map(bounds).filter(r=>r.width>0&&(r.x < -1||r.x+r.width>innerWidth+1)),
            focused:document.activeElement?.outerHTML.slice(0,250),
            fonts:[...document.fonts].filter(f=>['DM Sans','Kantumruy Pro','Moul'].some(n=>f.family.includes(n))).map(f=>({family:f.family,status:f.status,weight:f.weight})),
            scrollRegions:[...document.querySelectorAll('main,.template-studio,.studio-controls-scroll,.event-workspace-main,.event-workspace-content')].map(el=>({selector:el.id||el.className,clientHeight:el.clientHeight,scrollHeight:el.scrollHeight})),
          };
        });
        const triggers={home:'.kp-menu-trigger',events:'.host-hamburger-btn',dashboard:'.host-hamburger-btn','admin-dashboard':'.admin-mobile-toggle'};
        let drawer=null;
        const trigger=triggers[group]&&page.locator(triggers[group]);
        if(trigger&&await trigger.isVisible()) {
          await trigger.click();
          if([320,390].includes(width)){
            const file=`${group}-${lang}-${mode}-${width}-menu-open.png`;
            await page.screenshot({path:path.join(output,file)});
            actionCaptures.push({stage,group,app,lang,mode,state:'menu-open',viewport:{width,height:844},sha,browser:browser.version(),capturedAt:new Date().toISOString(),screenshot:path.relative(root,path.join(output,file)).replaceAll('\\','/')});
          }
          await page.keyboard.press('Tab');
          drawer=await page.evaluate(()=>({focusedInDialog:!!document.activeElement?.closest('dialog[open]'),bodyOverflow:document.body.style.overflow}));
          await page.keyboard.press('Escape');
          drawer.focusReturned=await trigger.evaluate(el=>el===document.activeElement);
        }
        rows.push({stage,group,app,lang,mode,width,height:844,geometry,drawer});
        if([320,390,768,1440].includes(width)) {
          const file=`${group}-${lang}-${mode}-${width}.png`;await page.screenshot({path:path.join(output,file)});
          captures.push({stage,group,app,lang,mode,viewport:{width,height:844},dpr:1,motion:'reduce',url:page.url(),sha,browser:browser.version(),capturedAt:new Date().toISOString(),screenshot:path.relative(root,path.join(output,file)).replaceAll('\\','/')});
        }
        if(width===390&&((lang==='en'&&mode==='light')||(lang==='km'&&mode==='dark'))) {
          const result=await new AxeBuilder({page}).include(selector).analyze();
          axe.push({group,lang,mode,width,violations:result.violations});
        }
      }
      await context.close();
    }
    console.log(`${stage} ${group}: ${rows.length} width/state observations`);
  }
} catch (error) { errors.push({fatal:error.message}); console.error(error.message); process.exitCode=1; } finally {
  await browser?.close();for(const child of children)child.kill();
  await fs.writeFile(path.join(import.meta.dirname,`${stage}-shell-probes.json`),JSON.stringify({stage,sha,rows,captures,actionCaptures,axe,errors},null,2)+'\n');
}
console.log(JSON.stringify({stage,rows:rows.length,captures:captures.length,axe:axe.length,axeViolations:axe.reduce((n,r)=>n+r.violations.length,0),errors:errors.length,horizontalClipRows:rows.filter(r=>r.geometry.horizontalClips.length).length}));
