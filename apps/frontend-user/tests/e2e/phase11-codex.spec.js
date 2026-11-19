import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import process from "node:process";
import { Buffer } from 'node:buffer';

const TEST_TOKEN = [
  "eyJhbGciOiJub25lIn0",
  "eyJleHAiOjQxMDIyNjg4MDB9",
  "",
].join(".");

const mockTemplate = {
  id: 30,
  code: "event-essential",
  slug: "event-essential",
  name: "Event Essential",
  category: "MINIMALIST",
  status: "ACTIVE",
  premium: false,
  price: 0,
  currency: "USD",
  thumbnailUrl: "/templates/event-essential.svg",
  supportedEventTypes: ["WEDDING", "ENGAGEMENT", "BIRTHDAY", "ANNIVERSARY", "CORPORATE", "OTHER"],
  supportedLanguages: ["KH", "EN", "BOTH"],
};

const mockCelestial = {
  id: 50,
  code: "khmer-celestial",
  slug: "khmer-celestial",
  name: "Khmer Celestial",
  category: "TRADITIONAL",
  status: "ACTIVE",
  premium: false,
  price: 0,
  currency: "USD",
  thumbnailUrl: "/templates/khmer-celestial.svg",
  supportedEventTypes: ["WEDDING"],
  supportedLanguages: ["KH", "BOTH"],
};

async function establishUserSession(page, { userId = 7, lang = "en", theme = "light" } = {}) {
  await page.addInitScript(({ token, userId, lang, theme }) => {
    const authEnvelope = JSON.stringify({
      accessToken: token,
      tokenType: "Bearer",
      expiresAt: "2100-01-01T00:00:00Z",
      user: { id: userId, fullName: "Audit Host", email: "host@example.test", role: "HOST" },
    });
    window.sessionStorage.setItem("koupreng.auth", authEnvelope);
    window.localStorage.setItem("koupreng.auth", authEnvelope);
    window.localStorage.setItem("koupreng.lang", lang);
    window.localStorage.setItem("theme", theme);
    window.localStorage.setItem("koupreng.colorMode", theme);
  }, { token: TEST_TOKEN, userId, lang, theme });
}

function setupMockApis(page) {
  return page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();

    if (path.includes("/templates/recommendations")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            { template: mockTemplate, styleMatch: true },
            { template: mockCelestial, styleMatch: false },
          ],
        }),
      });
    }

    if (path === "/api/v1/templates" && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [mockTemplate, mockCelestial],
        }),
      });
    }

    if (path.includes("/subscriptions/current")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: null }),
      });
    }

    if (path.includes("/template-access")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { hasAccess: true } }),
      });
    }

    if (path === "/api/v1/invitations" && method === "POST") {
      const body = route.request().postDataJSON();
      return route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            id: 888,
            title: body?.title || "Created Event",
            eventType: body?.eventType || "WEDDING",
            visibility: "PRIVATE",
            clientRequestId: body?.clientRequestId,
          },
        }),
      });
    }

    if (path.includes("/cover") && method === "POST") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: { id: 1, fileUrl: "https://example.com/uploaded-cover.jpg" },
        }),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: {} }),
    });
  });
}

const stage = process.env.PHASE11_STAGE || 'after';
const evidenceRoot = path.resolve('../../output/playwright/phase11-codex-2026-11-19');
const image = { name: 'fixture.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6m1sAAAAASUVORK5CYII=', 'base64') };
async function step(page, number) {
  await page.locator('.event-wizard-step-btn').nth(number - 1).click();
}
async function details(page) {
  await step(page, 2);
  for (const [field, value] of Object.entries({ title: 'Fictional celebration', groomName: 'Dara', brideName: 'Soriya', eventDate: '2026-12-20', eventTime: '17:00', venueName: 'Fixture Hall' })) await page.locator(`#event-${field}`).fill(value);
  await page.locator('#event-photo-input').setInputFiles(image);
  await step(page, 3);
  await page.getByRole('button', { name: /^(?:Select|Selected) Event Essential$/ }).click();
  await step(page, 4);
}
async function capture(page, testInfo, state, locale='en', theme='light', extra={}) {
  const dir = path.join(evidenceRoot, `${stage}-captures`); fs.mkdirSync(dir, {recursive:true});
  const id = `${testInfo.project.name}-${locale}-${theme}-${state}`;
  const file = path.join(dir, `${id}.png`); await page.screenshot({path:file,fullPage:true});
  const overflow = await page.evaluate(() => ({ root: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    ancestors: [...document.querySelectorAll('main, section, form, fieldset, aside, .host-content, .event-mobile-bottom-bar')].filter(el => el.getClientRects().length && el.scrollWidth > el.clientWidth + 1).map(el => ({tag:el.tagName,id:el.id,className:el.className,overflowX:getComputedStyle(el).overflowX})) }));
  const frozenPath=path.join(evidenceRoot,'frozen-source.json');const frozen=fs.existsSync(frozenPath)?JSON.parse(fs.readFileSync(frozenPath,'utf8')):{};
  const metadata = {testId:testInfo.title,route:new URL(page.url()).pathname,accountFixture:'fictional owner 7',state,locale,theme,actualLocale:await page.locator('.event-create').getAttribute('lang'),viewport:page.viewportSize(),browserEngine:testInfo.project.use.browserName,motion:await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches?'reduce':'no-preference'),sourceStage:stage,sourceHead:'0cf4755b645d948f1f10762075f4abd1c8e50e76',sourceSHA:stage==='before'?'BASELINE MANIFEST':frozen.sourceSHA||'MISSING',buildSHA:stage==='before'?'NOT CAPTURED':frozen.buildSHA||'MISSING',timestamp:new Date().toISOString(),file,sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),manualVisualReview:'PENDING',overflow,...extra};
  fs.writeFileSync(path.join(dir,`${id}.json`), JSON.stringify(metadata,null,2));
  expect(overflow.root, JSON.stringify(overflow)).toBe(false);
}
test('N11-20/21/22 loaded bilingual themes and review Axe with contrast enabled', async ({page},testInfo)=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  const violations=[];
  for (const locale of ['en','km']) for (const theme of ['light','dark']) {
    await establishUserSession(page,{lang:locale,theme}); await setupMockApis(page); await page.goto('/app/events/new');
    await page.locator('.event-type-option').first().waitFor(); await step(page,2);
    await expect(page.locator('.event-create')).toHaveAttribute('lang',locale);
    await expect(page.locator('html')).toHaveAttribute('data-color-mode',theme);
    await page.locator('#event-title').fill('សិរីមង្គល សុភមង្គល — Fictional celebration');
    for (const [field,value] of Object.entries({groomName:'Dara',brideName:'Soriya',eventDate:'2026-12-20',eventTime:'17:00',venueName:'Fixture Hall'})) await page.locator(`#event-${field}`).fill(value);
    await page.locator('#event-photo-input').setInputFiles(image);
    await page.evaluate(()=>document.fonts.ready);
    const axe=await new AxeBuilder({page}).include('.event-create').analyze();
    await capture(page,testInfo,'details',locale,theme,{axe:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
    violations.push(...axe.violations.map(v=>({locale,theme,state:'details',id:v.id,targets:v.nodes.map(n=>n.target)})));
    await step(page,3);await page.locator('.event-template-actions button[aria-pressed]').first().click();
    await step(page,4);
    const review=await new AxeBuilder({page}).include('.event-create').analyze();
    await capture(page,testInfo,'review',locale,theme,{axe:review.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
    violations.push(...review.violations.map(v=>({locale,theme,state:'review',id:v.id,targets:v.nodes.map(n=>n.target)})));
    await page.unroute('**/api/v1/**');
  }
  expect(violations).toEqual([]);
});
test('N11-09/30 validation reveals details before focusing first error; reduced motion and forced colors',async({page},testInfo)=>{
  await establishUserSession(page);await setupMockApis(page);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/app/events/new');await step(page,4);
  await page.locator('.event-create-actions button[type=submit]').click();
  await capture(page,testInfo,'invalid-details');
  await expect(page.locator('#event-title')).toBeFocused();
  const box=await page.locator('#event-title').boundingBox();expect(box.y).toBeGreaterThanOrEqual(0);expect(box.y+box.height).toBeLessThan(page.viewportSize().height-60);
  const axe=await new AxeBuilder({page}).include('.event-create').analyze();expect(axe.violations).toEqual([]);
  await page.emulateMedia({forcedColors:'active'});await capture(page,testInfo,'forced-colors');
  await page.keyboard.type('Keyboard fixture');await expect(page.locator('#event-title')).toHaveValue('Keyboard fixture');
});
test('N11-06/07 real request interception: POST, upload failure, reload, owner check and reselect without second POST',async({page},testInfo)=>{
  await establishUserSession(page);await setupMockApis(page);let posts=0,uploads=0,ownerChecks=0;
  await page.route('**/api/v1/invitations',async route=>{posts++;const payload=route.request().postDataJSON();expect(payload.visibility).toBe('PRIVATE');expect(payload.clientRequestId).toMatch(/^[a-f\d-]{36}$/i);await route.fulfill({json:{data:{id:888,userId:7,visibility:'PRIVATE'}}});});
  await page.route('**/api/v1/invitations/888',async route=>{ownerChecks++;await route.fulfill({json:{data:{id:888,userId:7,visibility:'PRIVATE'}}});});
  await page.route('**/api/v1/invitations/888/media/cover',async route=>{uploads++;await route.fulfill({status:uploads===1?503:200,json:uploads===1?{message:'Fixture image storage unavailable'}:{data:{id:1}}});});
  await page.goto('/app/events/new');await details(page);await page.locator('.event-create-actions button[type=submit]').click();
  await expect(page.getByText(/Event created successfully, but photo upload failed/)).toBeVisible();await capture(page,testInfo,'upload-failure');
  await page.reload();await expect(page.getByRole('button',{name:'Retry photo upload'})).toBeVisible();await capture(page,testInfo,'recovered-file-missing');
  await page.getByRole('button',{name:'Retry photo upload'}).click();await expect(page.locator('#event-photo-picker')).toBeFocused();
  await page.locator('#event-photo-input').setInputFiles(image);await page.getByRole('button',{name:'Retry photo upload'}).click();
  await expect(page).toHaveURL(/\/app\/events\/888\/invitation\?mode=guided/);expect(posts).toBe(1);expect(uploads).toBe(2);expect(ownerChecks).toBeGreaterThan(0);
});
test('N11-08 response lost retry reuses original payload and client request ID',async({page})=>{
  await establishUserSession(page);await setupMockApis(page);const payloads=[];
  await page.route('**/api/v1/invitations',async route=>{payloads.push(route.request().postDataJSON());if(payloads.length===1)return route.abort('failed');return route.fulfill({json:{data:{id:888,userId:7,visibility:'PRIVATE'}}});});
  await page.goto('/app/events/new');await details(page);await page.locator('.event-create-actions button[type=submit]').click();
  await expect(page.getByText(/Retry uses your original submitted details/)).toBeVisible();await expect(page.locator('.event-create-actions button[type=submit]')).toBeEnabled();
  await page.locator('.event-create-actions button[type=submit]').click();await expect(page).toHaveURL(/\/app\/events\/888\/invitation/);expect(payloads).toHaveLength(2);expect(payloads[1]).toEqual(payloads[0]);
});
async function tabTo(page,selector) {
  for(let n=0;n<120;n++) {
    if(await page.evaluate(selector=>document.activeElement?.matches(selector),selector))return;
    await page.keyboard.press('Tab');
  }
  throw new Error(`Keyboard could not reach ${selector}`);
}
test('N11-23 keyboard-only stepper, native chooser, design and creation remain reachable',async({page})=>{
  await establishUserSession(page);await setupMockApis(page);await page.emulateMedia({reducedMotion:'reduce'});
  await page.addInitScript(()=>sessionStorage.setItem('koupreng.onboarding.7',JSON.stringify({type:'WEDDING',form:{title:'Keyboard fixture',groomName:'Dara',brideName:'Soriya',eventDate:'2026-12-20',eventTime:'17:00',venueName:'Fixture Hall'}})));
  await page.goto('/app/events/new');await page.locator('.event-type-option').first().waitFor();
  await tabTo(page,'.event-wizard-step-btn:nth-child(2)');await page.keyboard.press('Enter');
  await tabTo(page,'#event-title');await page.keyboard.press('ControlOrMeta+A');await page.keyboard.type('Keyboard celebration');
  await tabTo(page,'#event-photo-picker');const chooser=page.waitForEvent('filechooser');await page.keyboard.press('Space');await(await chooser).setFiles(image);
  await tabTo(page,'#step-2-details .event-step-nav-btn.next');await page.keyboard.press('Enter');
  await tabTo(page,'.event-template-actions button[aria-pressed]');await page.keyboard.press('Space');
  await tabTo(page,'#step-3-design .event-step-nav-btn.next');await page.keyboard.press('Enter');
  await tabTo(page,'.event-create-actions button[type=submit]');await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/app\/events\/888\/invitation\?mode=guided/);
});
test('N11-22 denied and unavailable templates are truthful loaded Axe states',async({page},testInfo)=>{
  await establishUserSession(page);await setupMockApis(page);await page.emulateMedia({reducedMotion:'reduce'});
  await page.route('**/api/v1/templates/recommendations*',route=>route.fulfill({status:503,json:{message:'Fixture templates unavailable'}}));
  await page.goto('/app/events/new');await step(page,3);await expect(page.getByRole('button',{name:'Retry templates'})).toBeVisible();
  const unavailable=await new AxeBuilder({page}).include('.event-create').analyze();await capture(page,testInfo,'templates-unavailable','en','light',{axe:unavailable.violations.map(v=>({id:v.id,impact:v.impact}))});expect(unavailable.violations).toEqual([]);
  await page.unroute('**/api/v1/templates/recommendations*');
  await page.route('**/api/v1/templates/recommendations*',route=>route.fulfill({json:{data:[{template:{...mockTemplate,id:99,name:'Fixture premium',premium:true,price:10},styleMatch:true},{template:mockTemplate,styleMatch:true}]}}));
  await page.route('**/api/v1/me/templates/*/access',route=>route.fulfill({json:{data:{hasAccess:false}}}));
  await page.getByRole('button',{name:'Retry templates'}).click();await expect(page.getByRole('link',{name:'Get access (new tab)'})).toBeVisible();
  const denied=await new AxeBuilder({page}).include('.event-create').analyze();await capture(page,testInfo,'premium-denied','en','light',{axe:denied.violations.map(v=>({id:v.id,impact:v.impact}))});expect(denied.violations).toEqual([]);
  await expect(page.getByRole('button',{name: /^(?:Select|Selected) Fixture premium$/})).toHaveCount(0);await expect(page.getByRole('button',{name: /^(?:Select|Selected) Event Essential$/})).toBeEnabled();
});

