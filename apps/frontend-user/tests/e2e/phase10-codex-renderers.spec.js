import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import process from 'node:process';
import { openPhase06Fixture } from './support/phase06Fixtures.js';

const stage = process.env.PHASE10_STAGE || 'after';
const output = resolve('../../output/playwright/phase10-codex-2026-11-18', stage);
mkdirSync(output, { recursive: true });
const hash = value => createHash('sha256').update(value).digest('hex');
const sourceFiles = readdirSync('src/features/templates', { recursive: true }).filter(name => /\.(jsx?|css|json)$/.test(name)).sort();
const currentBuildFile = resolve('../../output/playwright/phase10-codex-2026-11-18/current-build-source.json');
const build = existsSync(currentBuildFile) ? JSON.parse(readFileSync(currentBuildFile,'utf8')) : null;
const fingerprint = build?.source_fingerprint || hash(sourceFiles.map(name => `${name}:${hash(readFileSync(join('src/features/templates', name)))}`).join('\n'));
const families = [
  ['khmer-floral-gold', '.kfg-invitation', '.kfg-content', '.kfg-skip-welcome,.kfg-skip-opening'],
  ['royal-garden-cinematic', '.tpl-royal-garden', '.tpl-royal-garden main', '.rg-entrance-skip,.rg-intro-skip,.rg-royal-skip,.rg-open,.rg-royal-open'],
  ['silk-heritage', '.tpl-silk-heritage', '.sh-hero-copy', '.sh-skip'],
  ['template-boilerplate', '.tpl-boilerplate', '.tpl-boilerplate main', '[data-testid="tpl-skip-opening-btn"]'],
  ['khmer-celestial', '.kc-page,.kc-root,.kc-template,.kc-invitation', '.kc-main', '.kc-opening__skip'],
  ['the-digital-yes-wedding', '.tdy-card-container,.tdy-envelope-scene', '.tdy-card-container', 'button[aria-label*="Skip"]'],
  ['emerald-canva-luxe-wedding', '.el-container', '.el-section,.el-card-container', '.el-skip-btn'],
  ['withjoy-modern-portal', '.wj-portal', '.wj-hero', null],
  ['bliss-editorial-wedding', '.bliss-editorial,.bliss-page,.bliss-container', '.bliss-hero-editorial', null],
  ['cover-khmer-golden-wedding', '.ck-page', '.ck-invitation', '.ck-cover__skip'],
];

function record(name, data) { writeFileSync(join(output, `${name}.json`), JSON.stringify({ stage, fingerprint, ...data }, null, 2)); }
async function takeScreenshot(page, options) {
  const geometry=await page.evaluate(()=>({ height:document.documentElement.scrollHeight, dpr:devicePixelRatio, viewport:{width:innerWidth,height:innerHeight} }));
  // WebKit caps backing-surface dimensions before CSS-scale downsampling.
  const fullPage=Boolean(options.fullPage && geometry.height*geometry.dpr<28000);
  await page.screenshot({ ...options, fullPage });
  writeFileSync(options.path+'.json',JSON.stringify({stage,fingerprint,capture_type:fullPage?'fullpage':'viewport',fullpage_requested:Boolean(options.fullPage),backing_surface_cap_applied:Boolean(options.fullPage&&!fullPage),geometry},null,2));
}
async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => { await Promise.all([...document.images].filter(img => img.loading !== 'lazy').map(img => img.complete ? null : new Promise(resolve => { img.addEventListener('load', resolve, { once: true }); img.addEventListener('error', resolve, { once: true }); }))); });
}
async function settleFiniteAnimations(page) {
  await page.evaluate(async () => {
    const finite = document.getAnimations().filter(animation => Number.isFinite(animation.effect?.getComputedTiming().endTime));
    await Promise.all(finite.map(animation => animation.finished.catch(() => undefined)));
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}
async function open(page, family, options = {}) {
  const state = await openPhase06Fixture(page, 'template-demo', { path: `/templates/${family}${options.embed ? '?embed=demo' : ''}`, anonymous: true, lang: options.lang || 'en' });
  const row = families.find(row => row[0] === family);
  if (row) await expect(page.locator(row[1]).first()).toBeVisible();
  return state;
}
async function reveal(page, row) {
  const [family, , , selector] = row;
  if (!selector) return { cover: 'N/A — coverless family', method: null };
  let action = page.locator(selector).filter({ visible: true }).first();
  if (family === 'royal-garden-cinematic') action = page.getByRole('button', { name: /Skip|រំលង/ }).first();
  if (await action.count() === 0) action = page.getByRole('button', { name: /Open invitation|បើក|មើលព័ត៌មានភ្លាម/ }).first();
  if (await action.count() === 0) return { cover: 'already open (route default)', method: null };
  await expect(action).toBeVisible();
  const geometry = await action.boundingBox();
  await page.evaluate(selector => {
    window.__phase10Timing = null;
    document.addEventListener('click', () => {
      const started = performance.now();
      const sample = () => {
        const main = document.querySelector(selector);
        if (main && main.getBoundingClientRect().height && !main.closest('[inert],[hidden]') && getComputedStyle(main).opacity !== '0') window.__phase10Timing = performance.now() - started;
        else requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    }, { once:true, capture:true });
  }, row[2]);
  const start = performance.now();
  await action.click();
  await expect(page.locator(row[2]).first()).toBeVisible();
  return { cover: 'opened', method: await action.count() ? 'cover action' : 'cover action unmounted', elapsed_ms: performance.now() - start, browser_click_to_frame_ms: await page.evaluate(() => window.__phase10Timing), geometry };
}

for (const row of families) {
  test(`matrix ${row[0]} opens and paints`, async ({ page }, info) => {
    const widths = stage === 'before' ? [320, 1440] : info.project.name === 'desktop-chromium' ? [320, 360, 390, 768, 1024, 1440, 1920, [844,390], [820,430], [768,390]] : [320,1440];
    // Budget the ten independent navigations in this aggregate test; individual
    // readiness/interaction assertions retain their unchanged five-second limit.
    test.setTimeout(widths.length * 15000);
    const rows = [];
    for (const size of widths) {
      const [width,height] = Array.isArray(size) ? size : [size, size < 768 ? 844 : 900];
      await page.setViewportSize({ width, height });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const state = await open(page, row[0]);
      await expect(page.locator(`[data-template-id="${row[0]}"]`)).toBeAttached();
      await settle(page);
      if ([320,1440].includes(width)) await takeScreenshot(page, { scale: 'css', path: join(output, `${info.project.name}-${row[0]}-${width}-cover.png`), fullPage: true });
      const opening = await reveal(page, row);
      await settle(page);
      const main = page.locator(row[2]).first();
      await expect(main).toBeVisible();
      const paint = await main.evaluate(node => ({ text: node.textContent.trim().slice(0,300), rect: node.getBoundingClientRect().toJSON(), opacity: getComputedStyle(node).opacity, visibility: getComputedStyle(node).visibility, active: node.contains(document.activeElement) || node === document.activeElement }));
      const geometry = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, height: innerHeight, images: [...document.images].map(img => ({ src: new URL(img.currentSrc || img.src).pathname, complete: img.complete, naturalWidth: img.naturalWidth, loading: img.loading })), fonts: document.fonts.status }));
      const capture = `${info.project.name}-${row[0]}-${width}x${height}-open.png`;
      await takeScreenshot(page, { scale: 'css', path: join(output, capture), fullPage: true });
      rows.push({ family: row[0], project: info.project.name, viewport: { width,height }, requested_app_locale: 'en', rendered_lang: await page.locator('[data-template-id] [lang]').evaluateAll(nodes => [...new Set(nodes.map(node => node.lang))]), motion: 'reduce', route: `/templates/${row[0]}`, opening, paint, geometry, capture, errors: state.errors });
      record(`${info.project.name}-${row[0]}`, { rows });
      expect.soft(paint.text.length).toBeGreaterThan(10);
      expect.soft(geometry.scrollWidth, `${row[0]} at ${width}x${height}`).toBeLessThanOrEqual(width);
      expect.soft(state.errors).toEqual([]);
    }
  });
}

for (const row of families) test(`normal art ${row[0]} cover and readable invitation`, async ({ page }, info) => {
  if (info.project.name !== 'desktop-chromium') test.skip(true, 'Normal-motion art sample on Chromium; reduced-motion family matrix and selected normal interactions span all projects');
  await page.setViewportSize({ width:390, height:844 });
  await page.emulateMedia({ reducedMotion:'no-preference' });
  await open(page,row[0]);
  await expect(page.locator(`[data-template-id="${row[0]}"]`)).toBeAttached();
  await settle(page);
  await settleFiniteAnimations(page);
  await takeScreenshot(page, { scale: 'css', path:join(output,`${row[0]}-normal-cover.png`) });
  const opening = await reveal(page,row);
  await expect(page.locator(row[2]).first()).toBeVisible();
  await settle(page);
  await settleFiniteAnimations(page);
  await takeScreenshot(page, { scale: 'css', path:join(output,`${row[0]}-normal-open.png`),fullPage:true });
  record(`${row[0]}-normal-art`,{ family:row[0], viewport:{width:390,height:844}, motion:'no-preference', opening, test:info.title });
});

for (const family of ['template-boilerplate','withjoy-modern-portal']) {
  test(`gallery ${family} keyboard isolation and return`, async ({ page }, info) => {
    await open(page, family);
    const trigger = page.locator(family === 'template-boilerplate' ? '[data-tx-section="gallery"] button' : '.wj-gallery-item').first();
    await trigger.focus(); await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect.poll(() => dialog.evaluate(node => node.contains(document.activeElement))).toBe(true);
    const original = await dialog.getByRole('img').getAttribute('src');
    await page.keyboard.press('ArrowRight');
    await expect(dialog.getByRole('img')).not.toHaveAttribute('src', original);
    for (let i=0;i<8;i++) { await page.keyboard.press(i%2 ? 'Shift+Tab' : 'Tab'); expect(await dialog.evaluate(node => node.contains(document.activeElement))).toBe(true); }
    expect(await page.locator('#root').evaluate(node => node.hasAttribute('inert'))).toBe(true);
    await takeScreenshot(page, { scale: 'css', path: join(output, `${info.project.name}-${family}-gallery.png`) });
    await page.keyboard.press('Escape'); await expect(dialog).toHaveCount(0); await expect(trigger).toBeFocused();
    record(`${info.project.name}-${family}-gallery`, { passed: true, test: info.title });
  });
}

test('Canva embed preserves explicitly closed preview and opens via keyboard', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, 'cover-khmer-golden-wedding', { embed: true });
  const skip = page.locator('.ck-cover__skip');
  await expect(skip).toBeVisible(); await skip.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('.ck-invitation')).toBeVisible();
  await expect.poll(() => page.locator('.ck-invitation').evaluate(node => node === document.activeElement)).toBe(true);
  record(`${info.project.name}-canva-embed`, { passed: true });
});

test('contrast enabled axe samples invitation and gallery', async ({ page }, info) => {
  if (info.project.name !== 'desktop-chromium') test.skip(true, 'Axe deterministic sample on Chromium; keyboard matrix runs all engines');
  const scans = [];
  for (const family of ['template-boilerplate','withjoy-modern-portal','emerald-canva-luxe-wedding']) {
    await page.emulateMedia({ reducedMotion: 'reduce' }); await open(page, family);
    await reveal(page, families.find(row => row[0] === family)); await settle(page);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    scans.push({ family, violations: result.violations, passes: result.passes.map(row => row.id), incomplete: result.incomplete.map(row => ({ id:row.id, impact:row.impact })), form_controls: await page.locator('input,select,textarea').count() });
    expect(result.passes.length).toBeGreaterThan(5);
  }
  record('axe', { scans });
  expect(scans.flatMap(scan => scan.violations)).toEqual([]);
});

test('preview channel rejects wrong origin nonce and source before accepting parent update', async ({ page }, info) => {
  await open(page, 'template-boilerplate');
  const sessionId = 'phase10-fictional-preview-1234567890';
  await page.evaluate(sessionId => {
    const frame = document.createElement('iframe');
    frame.id = 'phase10-preview';
    frame.src = `/templates/template-boilerplate/demo?embed=demo&previewSession=${sessionId}&previewOrigin=${encodeURIComponent(location.origin)}`;
    frame.style.cssText = 'width:390px;height:844px';
    document.body.appendChild(frame);
  }, sessionId);
  const frame = page.frameLocator('#phase10-preview');
  await expect(frame.locator('.tpl-boilerplate')).toBeVisible();
  const child = page.frames().find(candidate => candidate.url().includes('previewSession='));
  const payload = { type: 'LIVE_PREVIEW_SYNC', sessionId, data: { groomName: 'Trusted parent fixture', brideName: 'Second fixture' } };
  for (const mode of ['origin','nonce','source','malformed']) {
    await child.evaluate(({ payload, mode }) => window.dispatchEvent(new MessageEvent('message', {
      origin: mode === 'origin' ? 'https://attacker.example' : location.origin,
      source: mode === 'source' ? window : parent,
      data: mode === 'malformed' ? { ...payload, data: [] } : mode === 'nonce' ? { ...payload, sessionId: 'wrong-fictional-session-123456' } : payload,
    })), { payload, mode });
    await expect(frame.locator('.tpl-boilerplate')).not.toContainText('Trusted parent fixture');
  }
  await page.evaluate(payload => document.querySelector('#phase10-preview').contentWindow.postMessage(payload, location.origin), payload);
  await expect(frame.locator('.tpl-boilerplate')).toContainText('Trusted parent fixture');
  record(`${info.project.name}-preview-negative`, { passed: true, cases: ['wrong origin','wrong nonce','wrong source','array payload','trusted parent accepted'] });
});

test('normal motion DigitalYes retains a working skip during opening and focuses content', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 844, height: 390 });
  await open(page, 'the-digital-yes-wedding');
  await settle(page);
  await settleFiniteAnimations(page);
  const start = page.getByRole('button', { name: 'បើកសំបុត្រអាពាហ៍ពិពាហ៍', exact: true });
  await start.focus(); await page.keyboard.press('Space');
  const skip = page.getByRole('button', { name: /Skip/ });
  await expect(skip).toBeVisible();
  if (process.env.PHASE10_DIAGNOSTIC === '1') {
    const frames = await skip.evaluate(async node => {
      const frames = [];
      for (let i = 0; i < 12; i++) {
        await new Promise(resolve => requestAnimationFrame(resolve));
        const rect = node.getBoundingClientRect();
        frames.push({ rect: rect.toJSON(), scrollY, visualTop: visualViewport?.offsetTop, hit: document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)?.outerHTML.slice(0, 300), ancestors: i ? undefined : [...function* () { for (let parent = node; parent; parent = parent.parentElement) yield parent; }()].map(parent => ({tag:parent.tagName, className:parent.className, transform:getComputedStyle(parent).transform, position:getComputedStyle(parent).position})) });
      }
      return frames;
    });
    record(`${info.project.name}-digital-diagnostic`, {frames});
  }
  // The opening has a finite 1.3s lifetime. On Windows WebKit, waiting for
  // Playwright's multi-frame stability check can outlive that lifetime even
  // with a fixed, unobscured target (recorded frame probe). Verify hit testing
  // and send a native pointer click without that extra animation wait.
  const target = await skip.boundingBox();
  expect(target).not.toBeNull();
  expect(await skip.evaluate(node => {
    const rect = node.getBoundingClientRect();
    window.__phase10SkipClicked = false;
    node.addEventListener('click', () => { window.__phase10SkipClicked = true; }, { once: true });
    return node === document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
  })).toBe(true);
  const before = performance.now(); await page.mouse.click(target.x + target.width / 2, target.y + target.height / 2);
  expect(await page.evaluate(() => window.__phase10SkipClicked)).toBe(true);
  await expect(page.locator('.tdy-card-container')).toBeFocused();
  await takeScreenshot(page, { scale: 'css', path: join(output, `${info.project.name}-digital-normal-open.png`) });
  record(`${info.project.name}-digital-normal`, { passed:true, click_to_assertion_ms: performance.now() - before, method:'runner wall time including automation; not render-only <50ms guarantee' });
});

test('Bliss drawer retains draft while closing, traps focus and restores trigger', async ({ page }, info) => {
  await open(page, 'bliss-editorial-wedding');
  const trigger = page.locator('.bliss-rsvp-trigger').first();
  await trigger.focus(); await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name:'RSVP', exact:true });
  await expect(dialog).toBeVisible();
  await expect.poll(() => dialog.evaluate(node => node.contains(document.activeElement))).toBe(true);
  expect(await page.locator('#root').evaluate(node => node.hasAttribute('inert'))).toBe(true);
  const name = dialog.locator('input[type="text"]').first(); await name.fill('Fictional draft');
  await page.keyboard.press('Escape'); await expect(dialog).toHaveCount(0); await expect(trigger).toBeFocused();
  await trigger.click(); await expect(dialog.locator('input[type="text"]').first()).toHaveValue('Fictional draft');
  await takeScreenshot(page, { scale: 'css', path: join(output, `${info.project.name}-bliss-rsvp.png`) });
  record(`${info.project.name}-bliss-drawer`, { passed:true });
});

test('Canva demo RSVP explains that no guest response is sent', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, 'cover-khmer-golden-wedding');
  await reveal(page, families.at(-1));
  const form = page.locator('.ck-demo-rsvp');
  await expect(form).toContainText('Demo only. Responses are not sent to the host.');
  const submit = form.locator('button[type="submit"]');
  if (await submit.count()) {
    await submit.click();
    await expect(form.getByRole('status')).toContainText('Nothing has been sent to the host.');
  } else {
    await expect(form.locator('a')).toHaveAttribute('href', /^\/login\?next=/);
    expect(decodeURIComponent(await form.locator('a').getAttribute('href'))).toContain('/app/events/new?template=cover-khmer-golden-wedding');
  }
  record(`${info.project.name}-canva-demo`, { passed: true, submission: 'Demo notice; real guest authority remains canonical child', test: info.title });
});

test('long Khmer and English content remains readable with failed fonts photos video and blocked audio', async ({ page }, info) => {
  if (info.project.name !== 'desktop-chromium') test.skip(true, 'Focused degradation sample; six-project ordinary readiness matrix remains separate');
  await page.route(/\.(woff2?|ttf|mp4|webm)(\?.*)?$/, route => route.abort());
  await page.addInitScript(() => { HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException('Fixture browser blocked playback', 'NotAllowedError')); });
  const rows=[];
  for (const [family, lang] of [['emerald-canva-luxe-wedding','KH'],['silk-heritage','EN']]) {
    await page.emulateMedia({ reducedMotion:'reduce', forcedColors:'active' });
    await page.setViewportSize({ width:320, height:844 });
    await open(page,family);
    await page.route(`**/api/v1/templates/slug/${family}`, route => route.fulfill({ json:{ data:{ id:9901, code:family, slug:family, name:'Fictional long content', status:'ACTIVE', premium:false, price:0, description:JSON.stringify({ languageMode:lang, groomName:'សុវណ្ណ វិសាលចន្ទ្ររតនៈ សុខសាន្ត', brideName:'សុភា ច័ន្ទរស្មីសិរីមង្គល រតនាអមតៈ', coverImage:'/missing-fixture-photo.webp', weddingDate:'', bgMusicUrl:'/missing-fixture-audio.mp3' }) } } }));
    await page.reload(); await expect(page.locator(`[data-template-id="${family}"]`)).toBeAttached();
    const opening = await reveal(page,families.find(row=>row[0]===family));
    await expect(page.locator(families.find(row=>row[0]===family)[2]).first()).toBeVisible();
    await takeScreenshot(page, { scale: 'css', path:join(output,`${family}-${lang}-degradation.png`),fullPage:true });
    rows.push({ family, lang, opening, scrollWidth:await page.evaluate(()=>document.documentElement.scrollWidth), fonts:'intentionally failed', motion:'reduce', forcedColors:'active', audio:'play promise rejected by deterministic stub; physical autoplay not certified' });
  }
  record('degradation',{ rows });
  expect(rows.every(row=>row.scrollWidth<=320)).toBe(true);
});

test('performance cold and warm local route observations', async ({ browser }, info) => {
  if (info.project.name !== 'desktop-chromium') test.skip(true, 'Comparable local lab only on desktop Chromium; field CWV remains external');
  test.setTimeout(120000);
  const samples=[];
  for (const family of ['silk-heritage','the-digital-yes-wedding','khmer-floral-gold']) {
    for (let repeat=0;repeat<3;repeat++) {
      const context=await browser.newContext({ viewport:{width:390,height:844}, reducedMotion:'reduce' });
      const page=await context.newPage();
      await page.addInitScript(() => {
        window.__phase10Lab={lcp:0,cls:0,longTasks:[]};
        for (const [type,receive] of [['largest-contentful-paint', entry=>{window.__phase10Lab.lcp=entry.startTime;}],['layout-shift',entry=>{if(!entry.hadRecentInput)window.__phase10Lab.cls+=entry.value;}],['longtask',entry=>window.__phase10Lab.longTasks.push(entry.duration)]]) {
          try {new PerformanceObserver(list=>list.getEntries().forEach(receive)).observe({type,buffered:true});}catch{/* Engine support is recorded, not simulated. */}
        }
      });
      for (const cache of ['cold-context','warm-same-context']) {
        const started=performance.now(); await open(page,family); const opening=await reveal(page,families.find(row=>row[0]===family)); await settle(page);
        const measured=await page.evaluate(()=>({ ...window.__phase10Lab, paints:performance.getEntriesByType('paint').map(e=>({name:e.name,time:e.startTime})), navigation:performance.getEntriesByType('navigation').map(e=>({duration:e.duration,domContentLoaded:e.domContentLoadedEventEnd})), resources:performance.getEntriesByType('resource').map(e=>({path:new URL(e.name).pathname,transferSize:e.transferSize,encodedBodySize:e.encodedBodySize,decodedBodySize:e.decodedBodySize,duration:e.duration})) }));
        samples.push({family,repeat,cache,route_readiness_ms:performance.now()-started,opening,measured});
        record('performance-lab',{ method:'Three new browser contexts per family; cold first navigation then warm same-context navigation. 390x844 reduced motion, local preview build, mocked API, external requests blocked. No CPU throttling, field INP or field p75 claim.',samples });
      }
      await context.close();
    }
  }
});
