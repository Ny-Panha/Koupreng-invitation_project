import { chromium } from "../../apps/frontend-user/node_modules/@playwright/test/index.mjs";
import { fixtures as studioFixtures } from "../../apps/frontend-user/tests/e2e/support/studioFixtures.js";
import { installOverhaulFixtures } from "../../apps/frontend-user/tests/e2e/support/overhaulFixtures.js";
import { uxEvents } from "../../apps/frontend-user/tests/e2e/support/uxFixtures.js";
import fs from "node:fs/promises";
import process from "node:process";

const phase = process.env.REVIEW_PHASE || "after";
const root = `output/playwright/template-studio-review/${phase}`;
const base = process.env.REVIEW_BASE || "http://127.0.0.1:5173";
const widths = (process.env.REVIEW_WIDTHS || "390,1440").split(",").map(Number);
const languages = (process.env.REVIEW_LANGS || "en,km").split(",");
const routes = [
  ["my-events", "/app/events", "single"],
  ["my-events-multiple", "/app/events"],
  ["event-sidebar", "/app/events/101"],
  ["event-sidebar-collapsed", "/app/events/101", "collapsed"],
  ["event-overview", "/app/events/101"],
  ["invitation-editor", "/app/events/101/invitation", "studio"],
  ["invitation-preview", "/app/events/101/invitation", "preview"],
  ["invitation-fullscreen", "/app/events/101/invitation", "fullscreen"],
  ["guests", "/app/events/101/guests"],
  ["tickets", "/app/events/101/tickets/design", "studio"],
  ["qr", "/app/events/101/qr"],
  ["delivery", "/app/events/101/delivery"],
  ["packages", "/app/packages"],
];
const selected = process.env.REVIEW_ROUTES?.split(",");
if (process.env.REVIEW_PREMIUM) routes.splice(0,routes.length,["my-events-premium-access","/app/events","premium"]);
if (process.env.REVIEW_AUDIT) routes.splice(0,routes.length,
  ...["rsvp","gifts","budget","seating","check-in","reports","settings","media","wishes","assistant"].map(module=>[module,`/app/events/101/${module}`]),
  ["templates","/templates"],["template-browsing","/templates/browse"],
  ["login","/login"],["register","/register"],["forgot-password","/forgot-password"],
  ["public-invitation","/i/audit-event","public"],
);
await fs.mkdir(root, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const lang of languages) for (const width of widths) for (const [name, route, mode] of routes) {
    if (selected && !selected.includes(name)) continue;
    const page = await browser.newPage({ viewport: { width, height: width < 768 ? 844 : 1000 }, reducedMotion: "reduce" });
    const errors = [];
    const consoleErrors = [];
    const failedRequests = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console",message=>{if(message.type()==="error") consoleErrors.push(message.text().replace(/https?:\/\/[^\s)]+/g,value=>{try{return new URL(value).origin+new URL(value).pathname;}catch{return "[request]";}}));});
    page.on("requestfailed",request=>failedRequests.push({path:new URL(request.url()).pathname,error:request.failure()?.errorText}));
    if (["studio", "preview", "fullscreen", "public"].includes(mode)) await studioFixtures(page, lang);
    else await installOverhaulFixtures(page, lang, { single: ["single","premium"].includes(mode) });
    if(mode==="premium") await page.route("**/api/v1/invitations/my",route=>route.fulfill({contentType:"application/json",body:JSON.stringify({data:[{...uxEvents[0],templateId:27,templateCode:"emerald-canva-luxe-wedding",templateName:"Emerald Luxe",syncError:"Premium template access is required"}]})}));
    if (["/login","/register","/forgot-password"].includes(route)) await page.addInitScript(()=>{sessionStorage.removeItem("koupreng.auth");localStorage.removeItem("koupreng.auth");});
    try {
      await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      if (name.startsWith("invitation-")) {
        await page.locator(".invitation-studio").waitFor();
        if (width < 1024 && mode !== "studio") await page.locator(".studio-mobile-tabs button").nth(1).click();
        const frame = page.frameLocator('iframe[title="Live User Template Preview"]');
        await frame.locator(".kc-root, .tpl-experience, [data-template-renderer]").first().waitFor({ state: "attached" });
        if (mode === "preview") await page.locator('.pe-sim-gate-btn').nth(1).click();
        if (mode === "fullscreen") {
          const fullscreen = page.getByRole("button", { name: /Fullscreen|áž–áŸáž‰áž¢áŸáž€áŸ’ážšáž„áŸ‹/, exact: true });
          if (await fullscreen.count()) await fullscreen.first().click();
        }
      }
      if (mode === "collapsed" && width >= 1024) await page.locator(".event-sidebar-toggle").click();
      if (name === "event-sidebar" && width < 1024) await page.locator(".event-mobile-nav-toggle").click();
      await page.waitForTimeout(300);
      const screenshot = `${root}/${name}-${lang}-${width}.png`;
      await page.screenshot({ path: screenshot, fullPage: mode !== "fullscreen" });
      const metrics = await page.evaluate(() => {
        const rect = selector => { const n = document.querySelector(selector); if (!n) return null; const r = n.getBoundingClientRect(); return { x:r.x,y:r.y,width:r.width,height:r.height }; };
        return { viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,studio:rect(".invitation-studio"),controls:rect(".pe-editor-column"),preview:rect(".pe-preview-column"),navigation:rect(".studio-sections") };
      });
      results.push({ name,route,mode,lang,width,screenshot,metrics,errors,consoleErrors,failedRequests,provenance:"browser API contract fixtures" });
      console.log(`${phase} ${name} ${lang} ${width}: ${metrics.documentWidth}px, errors=${errors.length}`);
    } catch (error) { results.push({ name,route,lang,width,error:error.message,errors }); console.error(`${name} ${width}: ${error.message}`); }
    await page.close();
  }
} finally { await browser.close(); }
let previous=[];
try {previous=JSON.parse(await fs.readFile(`${root}/viewport-results.json`,"utf8")).results;} catch(error) {if(error.code!=="ENOENT") throw error;}
const key=r=>`${r.name}:${r.lang}:${r.width}`;
const replaced=new Set(results.map(key));
await fs.writeFile(`${root}/viewport-results.json`, JSON.stringify({ browser:browser.version(),phase,results:[...previous.filter(r=>!replaced.has(key(r))),...results] },null,2));
if (results.some(r => r.error || r.errors.length)) process.exitCode = 1;


