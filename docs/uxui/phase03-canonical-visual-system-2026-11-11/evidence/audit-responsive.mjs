// Read-only loopback fixture audit of breakpoint geometry and selected axe scans.
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '../../../..');
const output = path.join(root, 'output/playwright/uxui-phase03-2026-11-11/after');
const require = createRequire(path.join(root, 'apps/frontend-user/package.json'));
const { chromium } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const { routeContracts, installRouteContractFixtures } = await import(pathToFileURL(path.join(root, 'apps/frontend-user/tests/e2e/support/batch12RouteContracts.js')));
const children = [];
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitFor(port) {
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(`http://127.0.0.1:${port}/`)).ok) return; } catch { /* starting */ }
    await sleep(200);
  }
  throw new Error(`Preview ${port} failed`);
}
for (const [app, port] of [['user', 4173], ['admin', 4174]]) {
  const appRoot = path.join(root, `apps/frontend-${app}`);
  children.push(spawn(process.execPath, [path.join(appRoot, 'node_modules/vite/bin/vite.js'), 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort', '--outDir', path.join(output, `${app}-build`)], { cwd: appRoot, windowsHide: true, stdio: 'ignore' }));
}
let browser;
const rows = [], scans = [], shortLandscape = [];
const widths = [320,360,375,390,414,430,599,600,601,767,768,769,820,1023,1024,1025,1280,1440,1920];
const groups = ['home','auth-login','dashboard','admin-dashboard','admin-template-edit'];
const axeOnly = process.argv.includes('--axe-only');
const landscapeOnly = process.argv.includes('--landscape-only');
try {
  await Promise.all([waitFor(4173),waitFor(4174)]);
  browser = await chromium.launch();
  async function open(group, width, height, mode = 'light') {
    const admin = group.startsWith('admin-');
    const contract = routeContracts.find(row => row.group === group && row.application === (admin ? 'frontend-admin' : 'frontend-user'));
    if (!contract) throw new Error(`Missing ${group}`);
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce', hasTouch: width <= 430 });
    const page = await context.newPage();
    await installRouteContractFixtures(page, contract, { lang: 'km' });
    if (group === 'admin-template-edit') {
      const template = { id: 30, code: 'event-essential', name: 'Phase 03 fixture', status: 'ACTIVE', category: 'MINIMALIST', premium: false, description: '{}' };
      for (const pattern of ['**/api/v1/templates/slug/event-essential','**/api/v1/templates/event-essential','**/api/v1/templates/30','**/api/v1/admin/templates/30']) {
        await page.route(pattern, route => route.request().method() === 'GET' ? route.fulfill({ json: { data: template } }) : route.fallback());
      }
    }
    await page.addInitScript(({ admin, mode }) => localStorage.setItem(admin ? 'theme' : 'koupreng.colorMode', mode), { admin, mode });
    await page.route('**/*', route => ['127.0.0.1','localhost'].includes(new URL(route.request().url()).hostname) ? route.fallback() : route.abort());
    await page.goto(`http://127.0.0.1:${admin ? 4174 : 4173}${contract.concreteUrl}`, { waitUntil: 'domcontentloaded' });
    await page.locator(group === 'admin-template-edit' ? '.template-studio' : 'main').first().waitFor({ state: 'visible', timeout: 12000 }).catch(() => {});
    await page.evaluate(() => document.fonts.ready);
    return { page, context };
  }
  for (const group of axeOnly || landscapeOnly ? [] : groups) {
    for (const width of widths) {
      const { page, context } = await open(group, width, 900);
      const geometry = await page.evaluate(() => {
        const all = [...document.querySelectorAll('button, input, select, textarea, a[href]')].filter(el => {
          const rect = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          return rect.width && rect.height && style.visibility !== 'hidden' && style.display !== 'none';
        });
        const clipped = all.filter(el => { const r=el.getBoundingClientRect(); return r.left < -1 || r.right > innerWidth + 1; }).slice(0,8).map(el => `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]}`);
        return { documentWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth, controls: all.length, clippedControls: clipped,
          minControlHeight: all.length ? Math.min(...all.map(el => el.getBoundingClientRect().height)) : null };
      });
      rows.push({ group, width, height: 900, ...geometry });
      await context.close();
    }
    console.log(`${group}: ${widths.length} widths`);
  }
  for (const [width,height] of axeOnly ? [] : [[844,390],[820,430],[768,390]]) {
    const { page, context } = await open('admin-template-edit',width,height);
    const result = await page.evaluate(() => {
      const selectors = ['.template-studio-toolbar','.studio-panel-switch','.studio-controls-scroll','.studio-preview-panel','.studio-section-tabs'];
      return Object.fromEntries(selectors.map(selector => {
        const el=document.querySelector(selector); if(!el) return [selector,null];
        const r=el.getBoundingClientRect(); return [selector,{ x:r.x,y:r.y,width:r.width,height:r.height,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight }];
      }));
    });
    const studio = page.locator('.template-studio');
    result.outerBefore = await studio.evaluate(el => ({scrollHeight:el.scrollHeight,clientHeight:el.clientHeight,scrollTop:el.scrollTop}));
    await studio.evaluate(el => { el.scrollTop = el.scrollHeight; });
    result.outerAfter = await studio.evaluate(el => ({scrollTop:el.scrollTop,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight}));
    const switches = page.locator('.studio-panel-switch button');
    result.switches = await switches.count();
    if (result.switches >= 2) {
      await switches.nth(1).click();
      result.previewVisible = await page.locator('.studio-preview-panel').isVisible();
      await switches.nth(0).click();
      result.editVisible = await page.locator('.template-studio-controls').isVisible();
    }
    shortLandscape.push({width,height,result});
    await context.close();
  }
  for (const [group,mode] of landscapeOnly ? [] : [['home','light'],['auth-login','dark'],['dashboard','dark'],['admin-dashboard','light'],['admin-template-edit','dark']]) {
    const { page, context } = await open(group,390,844,mode);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
    scans.push({group,mode,violations:result.violations.map(v => ({id:v.id,impact:v.impact,nodes:v.nodes.map(n => ({target:n.target,html:n.html,summary:n.failureSummary})),description:v.help}))});
    await context.close();
    console.log(`axe ${group} ${mode}: ${result.violations.length} rules`);
  }
} finally {
  await browser?.close();
  for (const child of children) child.kill();
  const target = path.join(import.meta.dirname,'responsive-a11y-results.json');
  const previous = axeOnly || landscapeOnly ? JSON.parse(await fs.readFile(target,'utf8')) : null;
  const complete = {browser:browser?.version(),widths,rows:previous?.rows||rows,shortLandscape:axeOnly?previous.shortLandscape:shortLandscape,scans:landscapeOnly?previous.scans:scans};
  await fs.writeFile(target, JSON.stringify(complete,null,2));
  console.log(JSON.stringify({rows:complete.rows.length,horizontalOverflow:complete.rows.filter(r=>r.documentWidth>r.viewportWidth).length,clipped:complete.rows.filter(r=>r.clippedControls.length).length,scans:complete.scans.length}));
}
