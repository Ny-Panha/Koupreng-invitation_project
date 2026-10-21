import { chromium } from "../../apps/frontend-user/node_modules/@playwright/test/index.mjs";
import { installOverhaulFixtures } from "../../apps/frontend-user/tests/e2e/support/overhaulFixtures.js";
import { fixtures as installStudioFixtures } from "../../apps/frontend-user/tests/e2e/support/studioFixtures.js";
import { installOperationsFixtures } from "../../apps/frontend-user/tests/e2e/support/operationsFixtures.js";
import fs from "node:fs/promises";
import process from "node:process";

// All responses are browser contract fixtures; these are not live-provider checks.
const base = process.env.UX_BASE_URL || "http://127.0.0.1:5173";
const targetDir = `docs/qa/ux-overhaul/${process.env.UX_PHASE || "after"}`;
await fs.mkdir(targetDir, { recursive: true });

const browser = await chromium.launch();

const viewports = [
  { name: "desktop", width: 1440, height: 900, lang: "km" },
  { name: "mobile", width: 390, height: 844, lang: "km" },
  { name: "desktop-en", width: 1440, height: 900, lang: "en" },
];
if (process.env.UX_WIDTHS) {
  viewports.splice(0, viewports.length, ...["km", "en"].flatMap(lang => process.env.UX_WIDTHS.split(",").map(Number).map(width => ({ name: lang, width, height: 1000, lang }))));
}

const routes = [
  { path: "/app/events", name: "my-events" },
  { path: "/app/events/101", name: "event-workspace" },
  { path: "/app/events/101/invitation", name: "invitation-studio", studio: true },
  { path: "/app/events/101/tickets/design", name: "ticket-designer", studio: true },
  { path: "/app/events/101/guests", name: "guests" },
  { path: "/app/events/101/delivery", name: "delivery" },
  { path: "/app/events/101/qr", name: "qr-page" },
  { path: "/app/events/101/wishes", name: "wishes" },
];
if (process.env.UX_ALL) {
  const extra = ["/", "/pricing", "/contact", "/login", "/register", "/forgot-password", "/reset-password", "/app/events/new", "/app/profile", "/app/change-password", "/app/packages", "/app/payments", "/app/payments/AUDIT", "/app/notifications", "/app/organizations", "/app/organizations/11", "/app/templates/paid", ...["rsvp", "gifts", "budget", "seating", "check-in", "reports", "settings", "media", "assistant", "preview"].map(module => `/app/events/101/${module}`), "/templates", "/templates/browse", "/templates/browse/event-essential", "/templates/event-essential", "/templates/event-essential/demo", "/templates/event-essential/preview", "/templates/30/checkout", "/w/audit-event", "/i/audit-event?token=audit-guest", "/payments/AUDIT/status", "/payments/success", "/payments/return", "/payments/cancel", "/venues", "/venues/11", "/about", "/help", "/does-not-exist", "/dashboard/invitations/101/guests", "/dashboard/expenses", "/create/wedding", "/event/ux-local-draft", "/preview/ux-local-draft", "/create/wedding/101", "/event/101/manage", "/dashboard/invitations/101/edit", "/dashboard/invitations/101/preview", "/dashboard/invitations/design", "/dashboard/invitations/edit"];
  routes.push(...extra.map(path => ({ path, name: path.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "") || "home" })));
}
const results = [];
if (process.env.UX_ROUTES) {
  const selected = new Set(process.env.UX_ROUTES.split(","));
  routes.splice(0, routes.length, ...routes.filter(route => selected.has(route.path)));
}

console.log("Starting visual overhaul QA captures...");

for (const vp of viewports) {
  for (const route of routes) {
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
    reducedMotion: "reduce",
  });

  const errors = [];
  const consoleErrors = [];
  const failedRequests = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("requestfailed", request => failedRequests.push({ path: new URL(request.url()).pathname, error: request.failure()?.errorText }));
  await (route.studio ? installStudioFixtures(page, vp.lang) : process.env.UX_OPERATIONS ? installOperationsFixtures(page, vp.lang) : installOverhaulFixtures(page, vp.lang));

    try {
      await page.goto(`${base}${route.path}`, { waitUntil: "networkidle", timeout: 25000 });
      await page.evaluate(() => document.fonts.ready);
      const filename = `${targetDir}/${route.name}-${vp.name}-${vp.width}.png`;
      await page.screenshot({ path: filename, fullPage: true });
      const metrics = await page.evaluate(() => {
        const visible = element => element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) && !element.closest("[inert]") && element.getBoundingClientRect().width > 0;
        const outside = element => { const r = element.getBoundingClientRect(); return r.right > innerWidth + 2 || r.left < -2; };
        const scrollRegion = ".k-responsive-table-container, .guest-table-wrap, .rsvp-table-wrapper, .tb-categories, .studio-preview-viewport";
        const outsideControls = [...document.querySelectorAll("input,select,textarea,button,h1,h2,strong,.exp-sum-card,.wg-sum-card")].filter(visible).filter(outside);
        const clipped = outsideControls.filter(element => !element.closest(scrollRegion));
        return { width: innerWidth, documentWidth: document.documentElement.scrollWidth, heading: [...document.querySelectorAll("h1,h2")].filter(visible).slice(0, 4).map(element => element.textContent), clipped: clipped.slice(0, 12).map(element => ({ tag: element.tagName, class: element.className, text: element.textContent.slice(0, 80) })), scrollRegionControls: outsideControls.length - clipped.length, bodyHeight: document.body.scrollHeight };
      });
      results.push({ path: route.path, lang: vp.lang, width: vp.width, screenshot: filename, metrics, errors, consoleErrors, failedRequests });
      console.log(`${vp.lang} ${vp.width} ${route.path}: document=${metrics.documentWidth}, clipped=${metrics.clipped.length}, errors=${errors.length}`);
    } catch (err) {
      results.push({ path: route.path, lang: vp.lang, width: vp.width, error: err.message, errors });
      console.error(`Failed to capture ${route.path} on ${vp.name}:`, err.message);
    }
  await page.close();
  }
}

await browser.close();
let retained = [];
if (process.env.UX_MERGE) {
  try { retained = JSON.parse(await fs.readFile(`${targetDir}/measurements.json`, "utf8")); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
}
const key = result => `${result.path}:${result.lang}:${result.width}`;
const replaced = new Set(results.map(key));
await fs.writeFile(`${targetDir}/measurements.json`, JSON.stringify([...retained.filter(result => !replaced.has(key(result))), ...results], null, 2));
if (results.some(result => result.error || result.errors.length)) process.exitCode = 1;
console.log("Finished all visual overhaul QA captures.");
