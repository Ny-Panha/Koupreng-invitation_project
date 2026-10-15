// Production-preview visual and lab evidence. All API calls are intercepted;
// no contact message, purchase or authenticated request reaches a real backend.
import { fixtureToken } from "../tests/e2e/support/fixtureToken.js";
import { chromium } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import process from "node:process";

const phase = process.argv[2] || "before";
const performanceOnly = process.argv.includes("--performance");
const output = `../../output/design-review/marketing-v4/${phase}`;
const origin = "http://127.0.0.1:4173";
const token = fixtureToken;
const user = { id: 7, fullName: "Fixture Host", email: "host@example.test", role: "USER" };
const catalog = [
  { id: 2, code: "silk-heritage", name: "សូត្រមង្គល", nameEn: "Silk Heritage", category: "TRADITIONAL", premium: false, price: 0, currency: "USD", thumbnailUrl: "/templates/silk-heritage/preview.svg" },
  { id: 80, code: "khmer-celestial", name: "ខ្មែរចន្ទតារា", nameEn: "Khmer Celestial", category: "TRADITIONAL", premium: true, price: null, currency: "USD", thumbnailUrl: "/facebook/all/06-card/cover-card.jpg" },
  { id: 81, code: "emerald-canva-luxe-wedding", name: "Emerald Luxe", category: "MODERN", premium: true, price: 20, currency: "USD", thumbnailUrl: "/templates/canva-luxury/emerald-luxury.jpg" },
];
const packages = [
  { id: 1, code: "FIXTURE_BASIC", packageName: "Essential", description: "A small celebration, with the details together.", price: "0", currency: "USD", durationDays: 30, maxInvitations: 1, maxGuestsPerInvitation: 100, active: true, premiumTemplatesEnabled: false, seatingEnabled: false, qrCheckInEnabled: false },
  { id: 2, code: "FIXTURE_PLUS", packageName: "Celebration", description: "More invitations and additional guest tools.", price: "29", currency: "USD", durationDays: 90, maxInvitations: 3, maxGuestsPerInvitation: 300, active: true, premiumTemplatesEnabled: true, seatingEnabled: true, qrCheckInEnabled: true },
  { id: 3, code: "FIXTURE_KHR", packageName: "Family", description: "A separate KHR-priced example.", price: "160000", currency: "KHR", durationDays: 120, maxInvitations: 5, maxGuestsPerInvitation: 500, active: true, premiumTemplatesEnabled: true, seatingEnabled: true, qrCheckInEnabled: false },
];
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const rows = [];
const configure = async (context, language, signedIn = false) => {
  await context.addInitScript(({ language, signedIn, token, user }) => {
    localStorage.setItem("koupreng.lang", language);
    if (signedIn) {
      const auth = JSON.stringify({ accessToken: token, tokenType: "Bearer", user });
      sessionStorage.setItem("koupreng.auth", auth); localStorage.setItem("koupreng.auth", auth);
    }
  }, { language, signedIn, token, user });
  await context.route("**/api/**", route => {
    const path = new URL(route.request().url()).pathname;
    const data = path.endsWith("/templates") ? catalog : path.endsWith("/i18n/messages") ? { messages: {} } : path.endsWith("/packages") ? packages : path.endsWith("/auth/me") ? user : [];
    // Blocking POSTs also prevents accidental messages during manual capture.
    return route.fulfill({ status: route.request().method() === "GET" ? 200 : 405, contentType: "application/json", body: JSON.stringify({ data }) });
  });
};
try {
  if (!performanceOnly) {
    let axe;
    try { axe = await readFile("../../output/playwright/cinematic/qa-tools/node_modules/axe-core/axe.min.js", "utf8"); } catch { /* Report missing audit engine below. */ }
    for (const language of ["km", "en"]) for (const width of [390, 1440, 320]) for (const path of ["/", "/pricing", "/contact"]) {
      const context = await browser.newContext({ viewport: { width, height: width < 500 ? 844 : 900 }, reducedMotion: "reduce" });
      await configure(context, language);
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(`${origin}${path}`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      for (const section of await page.locator("main section").all()) await section.scrollIntoViewIfNeeded();
      for (const img of await page.locator("main img").all()) { await img.scrollIntoViewIfNeeded(); await img.evaluate(node => node.decode().catch(() => {})); }
      await page.evaluate(() => scrollTo(0, 0));
      const name = `${path === "/" ? "home" : path.slice(1)}-${language}-${width}`;
      await page.screenshot({ path: `${output}/${name}-hero.png` });
      await page.screenshot({ path: `${output}/${name}-full.png`, fullPage: true });
      const layout = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        h1: document.querySelector("main h1")?.textContent,
        headerHeight: Math.round(document.querySelector(".kp-header")?.getBoundingClientRect().height || 0),
        fonts: [...new Set([...document.querySelectorAll("main h1, main h2, main p, main input")].map(node => getComputedStyle(node).fontFamily))],
        clippedText: [...document.querySelectorAll("main h1,main h2,main h3,main p,main button,main a,main label")].filter(node => node.getClientRects().length && node.scrollWidth > node.clientWidth + 2).map(node => ({ text: node.textContent.slice(0, 80), class: node.className })),
      }));
      let accessibility = { blocked: "Audit-only axe-core is unavailable" };
      if (axe && width !== 320) {
        await page.addScriptTag({ content: axe });
        const audit = await page.evaluate(() => window.axe.run(".kp-marketing-shell", { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } }));
        accessibility = { violations: audit.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })), incomplete: audit.incomplete.map(v => v.id) };
      }
      rows.push({ name, path, language, width, ...layout, errors, accessibility });
      console.log(JSON.stringify({ name, overflow: layout.overflow, clipped: layout.clippedText.length, violations: accessibility.violations?.length }));
      await context.close();
    }
    for (const language of ["km", "en"]) for (const width of [390, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
      await configure(context, language, true);
      const page = await context.newPage();
      await page.goto(`${origin}/pricing`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      for (const section of await page.locator("main section").all()) await section.scrollIntoViewIfNeeded();
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: `${output}/pricing-auth-${language}-${width}-full.png`, fullPage: true });
      await context.close();
    }
  } else {
    for (const width of [390, 1440]) for (let run = 1; run <= 3; run++) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      await configure(context, "en");
      await context.addInitScript(() => {
        window.lab = { lcp: 0, cls: 0, events: [], longTasks: [] };
        new PerformanceObserver(list => { for (const entry of list.getEntries()) { window.lab.lcp = entry.startTime; window.lab.lcpElement = entry.element?.className; } }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.lab.cls += entry.value; }).observe({ type: "layout-shift", buffered: true });
        new PerformanceObserver(list => { for (const entry of list.getEntries()) if (entry.interactionId) window.lab.events.push({ name: entry.name, duration: entry.duration }); }).observe({ type: "event", buffered: true, durationThreshold: 16 });
        new PerformanceObserver(list => { for (const entry of list.getEntries()) window.lab.longTasks.push(entry.duration); }).observe({ type: "longtask", buffered: true });
      });
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      await cdp.send("Network.enable");
      await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 200000, uploadThroughput: 75000 });
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      await page.goto(origin, { waitUntil: "networkidle", timeout: 60000 });
      await page.evaluate(() => document.fonts.ready);
      await page.getByRole("button", { name: "Open invitation preview" }).click();
      const metrics = await page.evaluate(() => ({ ...window.lab, resources: performance.getEntriesByType("resource").map(entry => ({ path: entry.name.replace(location.origin, ""), bytes: entry.encodedBodySize, duration: entry.duration })) }));
      rows.push({ width, run, ...metrics });
      console.log(JSON.stringify({ width, run, lcp: metrics.lcp, lcpElement: metrics.lcpElement, cls: metrics.cls, events: metrics.events }));
      await context.close();
    }
  }
} finally { await browser.close(); }
await writeFile(`${output}/${performanceOnly ? "performance" : "render-audit"}.json`, JSON.stringify({ source: "Local production preview, API fixtures; packages and guests are illustrative, no live backend or messages", conditions: performanceOnly ? "Chromium cold contexts; 4x CPU, 1.6 Mbps, 150ms latency; Event Timing is not field INP" : "Reduced motion, local static assets; full-page screenshots after lazy media load", rows }, null, 2));
