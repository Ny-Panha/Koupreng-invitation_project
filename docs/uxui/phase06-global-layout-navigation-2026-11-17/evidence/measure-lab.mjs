// Isolated before/after Chromium fixture lab. Run after both capture stages.
// This is local comparative data, never field Core Web Vitals or INP.
import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import { startFixtureServers } from './fixture-http-server.mjs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '../../../..');
const base = path.join(root, 'output/playwright/uxui-phase06-2026-11-17');
const smoke = process.argv.includes('--smoke');
const diagnostic = process.argv.includes('--diagnostics');
const afterOnly = process.argv.includes('--after-only');
const diagnostics = diagnostic ? JSON.parse(await fs.readFile(path.join(import.meta.dirname,'performance-comparison.json'),'utf8')) : null;
const selectedDimensions=diagnostics?[...diagnostics.currentReviewTriggers,...diagnostics.historicalReview].map(r=>[r.surface,r.width,r.motion].join(':')):null;
const require = createRequire(path.join(root, 'apps/frontend-user/package.json'));
const { chromium } = require('@playwright/test');
const { routeContracts, installRouteContractFixtures } = await import(pathToFileURL(path.join(root, 'apps/frontend-user/tests/e2e/support/batch12RouteContracts.js')));
const surfaces = [
  ['home'], ['catalog'], ['auth-login'], ['create-event'], ['dashboard'], ['invitation'],
  ['admin-dashboard', 'frontend-admin'], ['admin-template-edit', 'frontend-admin'],
  ['ordinary-invitation', 'frontend-user', '/templates/event-essential'],
  ['cinematic-invitation', 'frontend-user', '/templates/emerald-canva-luxe-wedding'],
  ['checkout'], ['payment-status'], ['rsvp'],
];
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitFor(port) {
  for (let i = 0; i < 80; i++) {
    try { if ((await fetch(`http://127.0.0.1:${port}/`)).ok) return; } catch { /* starting */ }
    await sleep(250);
  }
  throw new Error(`Preview ${port} did not start`);
}
async function list(dir) {
  const result = [];
  for (const item of await fs.readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, item.name);
    result.push(...item.isDirectory() ? await list(file) : [file]);
  }
  return result;
}
const bundles = [];
for (const stage of diagnostic?[]:['before', 'after']) for (const app of ['user', 'admin']) {
  const dir = path.join(base, stage, `${app}-build`);
  for (const file of await list(path.join(dir, 'assets'))) {
    if (!/\.(?:js|css)$/.test(file)) continue;
    const bytes = await fs.readFile(file);
    bundles.push({ stage, app, file: path.relative(dir, file).replaceAll('\\', '/'), bytes: bytes.length,
      gzip: zlib.gzipSync(bytes).length, brotli: zlib.brotliCompressSync(bytes).length });
  }
}
const browser = await chromium.launch();
const progressPath = path.join(base, diagnostic?'lab-diagnostic-progress.json':smoke ? 'lab-smoke-progress.json' : 'lab-progress.json');
let prior = await fs.readFile(progressPath, 'utf8').then(JSON.parse).catch(() => null);
if(afterOnly){
  const original=JSON.parse(await fs.readFile(path.join(base,'lab-results.json'),'utf8'));
  const baseline=original.samples.filter(row=>row.stage==='before');
  if(baseline.length!==312)throw new Error('After-only run requires the complete validated unchanged baseline');
  prior={samples:baseline,errors:[],baselineReuse:{source:'lab-results.pre-zero-scroll.json',sourceSha:'4d30a8f3bd0b0c1ab63b9111389bfbeb6ece19b4',observations:baseline.length,qualification:'Previously measured unchanged baseline retained with its original command window; every final after observation is resampled'}};
}
const baselineReuse=prior?.baselineReuse||null;
if(process.argv.includes('--restart')&&prior){
  const archive=path.join(base,diagnostic?'lab-diagnostic-previous-attempt.json':'lab-first-interrupted-attempt.json');
  const exists=await fs.stat(archive).then(()=>true).catch(()=>false);
  await fs.copyFile(progressPath,exists?archive.replace('.json',`-${Date.now()}.json`):archive);prior=null;
}
const recoveredErrors=process.argv.includes('--retry-errors')?(prior?.errors||[]):[];
if(process.argv.includes('--retry-errors')&&prior){
  await fs.copyFile(progressPath,path.join(base,diagnostic?'lab-diagnostic-retry-input.json':'lab-retry-input.json'));
  prior.errors=[];
  // Retry a complete cold/warm pair, retaining any partial attempt in archive.
  prior.samples=prior.samples.filter(row=>['cold','warm'].every(cache=>prior.samples.some(other=>['stage','name','width','motion','trial'].every(key=>other[key]===row[key])&&other.cache===cache)));
}
const samples = prior?.samples || [], errors = prior?.errors || [];
async function saveProgress() {
  await fs.writeFile(progressPath, JSON.stringify({ browser: browser.version(), samples, errors, baselineReuse }, null, 2) + '\n');
}
try {
  const schedule=diagnostic?Array.from({length:5},(_,i)=>(i%2?['after','before']:['before','after']).map(stage=>({stage,selectedTrial:i+1}))).flat():(afterOnly?['after']:['before','after']).map(stage=>({stage,selectedTrial:null}));
  for (const {stage,selectedTrial} of schedule) {
    const fixtureServer = await startFixtureServers(root, stage);
    try {
      await Promise.all([waitFor(4173), waitFor(4174)]);
      for (const [name, application = 'frontend-user', override] of surfaces) {
        if(smoke && name!=='home') continue;
        const group = override ? 'template-demo' : name;
        const contract = routeContracts.find(row => row.group === group && row.application === application);
        if (!contract) { errors.push({ stage, name, reason: 'missing fixture contract' }); continue; }
        for (const width of smoke ? [390] : [390, 1440]) for (const motion of smoke ? ['reduce'] : ['reduce', 'no-preference']) for (let trial = 1; trial <= (diagnostic?5:smoke?1:3); trial++) {
          if(diagnostic&&(trial!==selectedTrial||!selectedDimensions.includes([name,width,motion].join(':'))))continue;
          if (['cold', 'warm'].every(cache => samples.some(item => item.stage === stage && item.name === name &&
            item.width === width && item.motion === motion && item.trial === trial && item.cache === cache))) continue;
          const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 },
            deviceScaleFactor: 1, reducedMotion: motion });
          const page = await context.newPage();
          try {
            fixtureServer.bind(page);
            const cdp = await context.newCDPSession(page);
            await cdp.send('Emulation.setCPUThrottlingRate', { rate: 2 });
            await cdp.send('Network.enable');
            await cdp.send('Network.setCacheDisabled', { cacheDisabled: false });
            let cacheHits = 0;
            cdp.on('Network.requestServedFromCache', () => cacheHits++);
            await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 20,
              downloadThroughput: 10 * 1024 * 1024 / 8, uploadThroughput: 5 * 1024 * 1024 / 8 });
            // Playwright's clock clears navigation/paint/resource entries in
            // Chromium. Freeze wall-clock dates without replacing performance.
            await page.addInitScript(timestamp => {
              const NativeDate = Date;
              class FixedDate extends NativeDate {
                constructor(...args) { super(...(args.length ? args : [timestamp])); }
                static now() { return timestamp; }
              }
              window.Date = FixedDate;
            }, Date.parse('2026-11-11T12:00:00Z'));
            await installRouteContractFixtures(page, contract, { lang: 'km' });
            if (name === 'admin-template-edit') {
              const template = { id: 30, code: 'event-essential', name: 'Motion lab fixture', status: 'ACTIVE', category: 'MINIMALIST', premium: false,
                description: JSON.stringify({ invitationTitle: 'Preview celebration', extension: { retained: true } }) };
              for (const pattern of ['**/api/v1/templates/slug/event-essential', '**/api/v1/templates/event-essential', '**/api/v1/templates/30', '**/api/v1/admin/templates/30']) {
                await page.route(pattern, route => route.request().method() === 'GET' ? route.fulfill({ json: { data: template } }) : route.fallback());
              }
            }
            await page.addInitScript(() => {
              window.__motionLab = { lcp: null, lcpElement: null, cls: 0, longTasks: [] };
              try { new PerformanceObserver(list => { for (const entry of list.getEntries()) {
                window.__motionLab.lcp = entry.startTime;
                const element = entry.element;
                window.__motionLab.lcpElement = element ? `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${typeof element.className === 'string' ? '.'+element.className.trim().replaceAll(' ','.') : ''}` : null;
                window.__motionLab.lcpState = element ? {text:element.textContent?.slice(0,120),opacity:getComputedStyle(element).opacity,visibility:getComputedStyle(element).visibility,font:getComputedStyle(element).fontFamily,image:element.currentSrc||null} : null;
              } }).observe({ type: 'largest-contentful-paint', buffered: true }); } catch { /* unsupported */ }
              try { new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__motionLab.cls += entry.value; }).observe({ type: 'layout-shift', buffered: true }); } catch { /* unsupported */ }
              try { new PerformanceObserver(list => { for (const entry of list.getEntries()) window.__motionLab.longTasks.push(entry.duration); }).observe({ type: 'longtask', buffered: true }); } catch { /* unsupported */ }
            });
            const port = application === 'frontend-admin' ? 4174 : 4173;
            const url = `http://127.0.0.1:${port}${override || contract.concreteUrl}`;
            for (const cache of ['cold', 'warm']) {
              cacheHits = 0;
              await page.goto(url, { waitUntil: 'load', timeout: 20000 });
              await page.locator(name==='invitation'?'.pe-editor-column input:not([type=checkbox]):not([type=file])':'main h1:visible, main h2:visible, .template-studio h1:visible, [data-template-renderer]:visible').first().waitFor({timeout:12000});
              await page.evaluate(() => document.fonts.ready);
              await page.waitForTimeout(400);
              // Headless Chromium can defer a paint until a frame is consumed.
              await page.screenshot();
              const result = await page.evaluate(() => {
                const nav = performance.getEntriesByType('navigation')[0];
                const resources = performance.getEntriesByType('resource');
                const paint = performance.getEntriesByType('paint');
                return { load: nav?.loadEventEnd ?? null, fcp: paint.find(item => item.name === 'first-contentful-paint')?.startTime ?? null,
                  lcp: window.__motionLab?.lcp, lcpElement: window.__motionLab?.lcpElement, lcpState: window.__motionLab?.lcpState, cls: window.__motionLab?.cls,
                  longTaskCount: window.__motionLab?.longTasks.length ?? null,
                  longTaskTotal: window.__motionLab?.longTasks.reduce((a, b) => a + b, 0) ?? null,
                  initialRequestBytes: (nav?.transferSize||0)+resources.reduce((sum,item)=>sum+item.transferSize,0),
                  resources: resources.map(item => ({ url: new URL(item.name).pathname, type:item.initiatorType,transferSize: item.transferSize,encodedBodySize:item.encodedBodySize,duration: item.duration })) };
              });
              samples.push({ stage, name, application, width, motion, trial, cache, cacheHits, ...result });
            }
          } catch (error) { errors.push({ stage, name, width, motion, trial, reason: error.message }); }
          finally { await context.close(); }
        }
        console.log(`${stage} ${name}: ${samples.filter(item => item.stage === stage && item.name === name).length} observations`);
        await saveProgress();
      }
    } finally {
      await fixtureServer.close();
      await sleep(500);
    }
  }
} finally { await browser.close(); }
const result = { browser: browser.version(), fixture: 'Batch 12 fictional read-only DTOs; no external requests',
  conditions: { viewports: ['390x844', '1440x900'], dpr: 1, cpu: 'Chromium CDP 2x throttle',
    network: 'CDP 20ms latency, 10Mbps down, 5Mbps up; loopback static + fictional API server', cache: 'new context cold, second navigation warm; page.route replaced by server mocks so HTTP cache remains enabled; cache hits explicitly recorded',
    motions: ['reduce', 'no-preference'], repeats: diagnostic?5:3, schedule:diagnostic?'Five rounds with before/after stage order alternating by round; selected diagnostic and six historical dimensions':baselineReuse?'Unchanged baseline retained with original observation window; all final after conditions remeasured':'Baseline stage then final stage', clock: 'Date wall clock fixed 2026-11-11T12:00:00Z; performance clock native' }, bundles, samples, errors, recoveredErrors, baselineReuse, retryArchive:recoveredErrors.length?(diagnostic?'lab-diagnostic-retry-input.json':'lab-retry-input.json'):null };
await fs.writeFile(path.join(base, diagnostic?'lab-diagnostic-results.json':smoke ? 'lab-smoke-results.json' : 'lab-results.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ samples: samples.length, errors: errors.length, browser: browser.version() }));
