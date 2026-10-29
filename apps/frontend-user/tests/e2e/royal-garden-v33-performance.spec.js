import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import process from 'node:process';
import { phase9Fixtures } from './support/phase9Fixtures';

test('V33 compares the audited main build and current build with the same bounded map',async({browser},info)=>{
  test.skip(process.env.RUN_ROYAL_PERF!=='true'||info.project.name!=='desktop-chromium','Explicit local comparison requires the archived main preview at port 4273.');
  test.setTimeout(180000);
  const nodes=Array.from({length:80},(_,i)=>({id:`performance-${i}`,type:i%4===0?'road':i%4===1?'destination':i%4===2?'school':'pagoda',x:.1+(i%10)*.08,y:.1+Math.floor(i/10)*.1,width:.06,height:.04,rotation:0,label:{km:`គំរូ ${i+1}`,en:`Example ${i+1}`}}));
  const content={cinematicIntro:{enabled:false},informationScene:{enabled:true,fixedBackground:true},illustratedMap:{version:1,enabled:true,aspectRatio:'landscape',theme:'ivory',description:{km:'គំនូរគំរូ',en:'Bounded 80-node diagram'},nodes},saveTheDate:{enabled:true,showCalendar:true,showCountdown:true,showAddToCalendar:true},programDays:[],schedule:[],photos:[]};
  const runs=[];
  for(const[label,base]of[['audited-main','http://127.0.0.1:4273'],['v3.3','http://127.0.0.1:4173']]){
    const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
    for(let iteration=0;iteration<6;iteration++){
      const page=await context.newPage();
      const state=await phase9Fixtures(page,{code:'royal-garden-cinematic',content});
      state.events.set(101,{...state.events.get(101),eventDate:'2027-12-31',eventTime:'17:00',googleMapUrl:'',enabledSections:JSON.stringify({countdown:true,venue:true,schedule:true})});
      await page.addInitScript(()=>{
        window.__royalPerf={cls:0,lcp:0};
        new PerformanceObserver(list=>{for(const entry of list.getEntries())if(!entry.hadRecentInput)window.__royalPerf.cls+=entry.value;}).observe({type:'layout-shift',buffered:true});
        new PerformanceObserver(list=>{for(const entry of list.getEntries())window.__royalPerf.lcp=entry.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
      });
      const cdp=await context.newCDPSession(page);await cdp.send('Performance.enable');
      await page.goto(base+'/i/review-celestial?lang=en');await expect(page.locator('.kp-illustrated-map svg')).toBeAttached();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(300);
      const measurement=await page.evaluate(()=>({domContentLoaded:performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd,...window.__royalPerf,jsBytes:performance.getEntriesByType('resource').filter(r=>/\.js(?:\?|$)/.test(r.name)).reduce((n,r)=>n+r.encodedBodySize,0),svgElements:document.querySelector('.kp-illustrated-map svg').querySelectorAll('*').length,editorLoaded:performance.getEntriesByType('resource').some(r=>/IllustratedMapDesignerModal/.test(r.name))}));
      const metrics=Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));
      if(iteration>0)runs.push({build:label,iteration,...measurement,taskMs:metrics.TaskDuration*1000,scriptMs:metrics.ScriptDuration*1000,heapBytes:metrics.JSHeapUsedSize});
      expect(measurement.editorLoaded).toBe(false);
      await page.close();
    }
    await context.close();
  }
  const median=values=>[...values].sort((a,b)=>a-b)[Math.floor(values.length/2)];
  const summary=Object.fromEntries(['audited-main','v3.3'].map(build=>[build,Object.fromEntries(['domContentLoaded','lcp','cls','jsBytes','svgElements','taskMs','scriptMs','heapBytes'].map(key=>[key,Number(median(runs.filter(r=>r.build===build).map(r=>r[key])).toFixed(3))]))]));
  await fs.mkdir('../../output/playwright/royal-garden-v3-3',{recursive:true});await fs.writeFile('../../output/playwright/royal-garden-v3-3/performance.json',JSON.stringify({baseline:'cf586813385471dc311d64ea840684441c52cf25',method:'Chromium, 1440x900, localhost preview builds, same V1 80-node hosted fixture, reduced motion, one warmup excluded, median of five runs; API fixtures mocked',summary,runs},null,2));
  expect(summary['v3.3'].cls).toBeLessThan(.1);
});
