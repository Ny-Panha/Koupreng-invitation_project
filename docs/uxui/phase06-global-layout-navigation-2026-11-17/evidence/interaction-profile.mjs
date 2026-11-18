// Local interaction timing: automation wall time and RAF gaps are not field INP/FPS.
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {startFixtureServers} from './fixture-http-server.mjs';
const root=path.resolve(import.meta.dirname,'../../../..');
const require=createRequire(path.join(root,'apps/frontend-user/package.json'));
const {chromium,expect}=require('@playwright/test');
const {openPhase06Fixture:open}=await import(pathToFileURL(path.join(root,'apps/frontend-user/tests/e2e/support/phase06Fixtures.js')));
const server=await startFixtureServers(root,'after');
const browser=await chromium.launch();
const rows=[];
try {
 for(const motion of ['reduce','no-preference'])for(const group of ['home','events','admin-template-edit']) {
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:motion});
  const page=await context.newPage();server.bind(page);
  const app=group==='admin-template-edit'?'frontend-admin':'frontend-user';
  const state=await open(page,group,{app,lang:'km'});
  const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:2});
  for(let trial=1;trial<=5;trial++) {
   const row={group,motion,trial,status:'NOT TESTED'};
   try {
    await page.evaluate(()=>{
      window.__profile={start:performance.now(),gaps:[],longTasks:[]};
      let previous=performance.now();
      window.__profile.tick=()=>{const now=performance.now();window.__profile.gaps.push(now-previous);previous=now;window.__profile.raf=requestAnimationFrame(window.__profile.tick);};
      window.__profile.raf=requestAnimationFrame(window.__profile.tick);
      window.__profile.observer=new PerformanceObserver(list=>window.__profile.longTasks.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration}))));
      window.__profile.observer.observe({type:'longtask'});
    });
    if(group==='admin-template-edit') {
      await page.locator('.studio-panel-switch button').last().click();
      await expect(page.locator('iframe[title="Live User Template Preview"]')).toBeVisible();
      await page.locator('.studio-panel-switch button').first().click();
      await expect(page.locator('#template-studio-controls')).toBeVisible();
    }else {
      const trigger=page.locator(group==='home'?'.kp-menu-trigger':'.host-hamburger-btn');
      await trigger.click();await expect(page.locator('dialog[open]')).toBeVisible();
      await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
    }
    await page.waitForTimeout(450);
    Object.assign(row,await page.evaluate(()=>{const p=window.__profile;cancelAnimationFrame(p.raf);p.observer.disconnect();return {elapsed:performance.now()-p.start,rafGaps:p.gaps,longTasks:p.longTasks};}));
    expect(state.writes).toEqual([]);row.status='FIXTURE VERIFIED';
   }catch(error){row.status='REVIEW REQUIRED';row.reason=error.message;}
   rows.push(row);
  }
  await context.close();console.log(`${group} ${motion}: ${rows.length} actions`);
 }
}finally{await browser.close();await server.close();}
const result={sha:execFileSync('git',['rev-parse','HEAD'],{cwd:root}).toString().trim(),observedAt:new Date().toISOString(),browser:browser.version(),method:'390x844 Chromium, fictional HTTP server, CDP 2x CPU, five trials of each shell action, two motion preferences',limits:['Automation includes actionability waits and a deliberate 450ms observation window; elapsed time is not input delay','RAF gaps are scheduling observations, not a GPU/physical-device FPS guarantee','No field INP or production user data'],rows};
await fs.writeFile(path.join(import.meta.dirname,'interaction-profile.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({rows:rows.length,verified:rows.filter(r=>r.status==='FIXTURE VERIFIED').length}));
if(rows.some(r=>r.status!=='FIXTURE VERIFIED'))process.exitCode=1;
