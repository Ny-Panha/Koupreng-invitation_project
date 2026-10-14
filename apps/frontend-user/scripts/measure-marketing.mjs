// Local Chromium lab proxy, controlled catalog responses; never field CWV.
// Run from apps/frontend-user with the production preview on port 4173.
import { chromium } from "@playwright/test";
import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import process from "node:process";

const output = "../../output/playwright/cinematic";
const axePath = `${output}/qa-tools/node_modules/axe-core/axe.min.js`;
const catalog = [
  { id: 2, code: "silk-heritage", name: "Silk Heritage", category: "TRADITIONAL", premium: false, price: 0, currency: "USD", thumbnailUrl: "/templates/silk-heritage/preview.svg" },
  { id: 80, code: "khmer-celestial", name: "Khmer Celestial", category: "TRADITIONAL", premium: true, price: null, currency: "USD", thumbnailUrl: "/facebook/all/06-card/cover-card.jpg" },
  { id: 81, code: "emerald-canva-luxe-wedding", name: "Emerald Luxe", category: "MODERN", premium: true, price: 20, currency: "USD", thumbnailUrl: "/templates/canva-luxury/emerald-luxury.jpg" },
];
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const accessibilityOnly = process.argv.includes("--a11y-only");
const performanceRows = accessibilityOnly ? JSON.parse(await readFile(`${output}/measurements.json`, "utf8")).performanceRows : [];
const accessibility = [];
try {
  for (const width of accessibilityOnly ? [] : [390, 1440]) {
    for (let run = 1; run <= 3; run++) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      await context.addInitScript(() => {
        localStorage.setItem("koupreng.lang", "en");
        window.lab = { lcp: 0, cls: 0, events: [], longTasks: [] };
        new PerformanceObserver((list) => { for (const entry of list.getEntries()) window.lab.lcp = entry.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((list) => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.lab.cls += entry.value; }).observe({ type: "layout-shift", buffered: true });
        new PerformanceObserver((list) => { for (const entry of list.getEntries()) if (entry.interactionId) window.lab.events.push({ name: entry.name, duration: entry.duration }); }).observe({ type: "event", buffered: true, durationThreshold: 16 });
        new PerformanceObserver((list) => { for (const entry of list.getEntries()) window.lab.longTasks.push(entry.duration); }).observe({ type: "longtask", buffered: true });
      });
      const page = await context.newPage();
      await page.route("**/api/**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: route.request().url().includes("/i18n/") ? { messages: {} } : catalog }) }));
      const cdp = await context.newCDPSession(page);
      await cdp.send("Network.enable");
      await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 200000, uploadThroughput: 75000 });
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      const requests = [];
      page.on("request", (request) => requests.push(request.url()));
      await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle", timeout: 60000 });
      await page.evaluate(() => document.fonts.ready);
      await page.getByRole("button", { name: "Open invitation preview" }).click();
      await page.waitForTimeout(500);
      const metrics = await page.evaluate(() => ({ ...window.lab, resources: performance.getEntriesByType("resource").filter((entry) => entry.name.startsWith(location.origin)).map((entry) => ({ name: new URL(entry.name).pathname, bytes: entry.encodedBodySize })) }));
      performanceRows.push({ width, run, ...metrics, heavyTemplateRequested: requests.some((url) => /TemplateExperience|SilkHeritageLayout|InvitationEditPage/.test(url)), decorativeBackgroundRequested: requests.some((url) => /background-.*\.png/.test(url)) });
      await context.close();
    }
  }
  const axeSource = await readFile(axePath, "utf8").catch(() => null);
  for (const lang of ["km", "en"]) {
    for (const width of [390, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
      await context.addInitScript((value) => localStorage.setItem("koupreng.lang", value), lang);
      const page = await context.newPage();
      await page.route("**/api/**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: route.request().url().includes("/i18n/") ? { messages: {} } : catalog }) }));
      await page.goto("http://127.0.0.1:4173/");
      await page.locator(".kp-design-card").first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      for (const image of await page.locator('.kp-landing img[loading="lazy"]').all()) await image.scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollTo(0, 0));
      if (axeSource) {
        await page.addScriptTag({ content: axeSource });
        const result = await page.evaluate(() => window.axe.run(".kp-marketing-shell", { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } }));
        const manualContrast = await page.evaluate(() => {
          const luminance = (color) => color.match(/[\d.]+/g).slice(0, 3).map(Number).map((value) => { const n = value / 255; return n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4; }).reduce((total, value, index) => total + value * [.2126, .7152, .0722][index], 0);
          const ratio = (a, b) => { const x = luminance(a); const y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
          return [".kp-final > .kp-eyebrow", "#kp-final-title", ".kp-final > p:nth-child(4)", ".kp-final .kp-text-link", ".kp-details-paper > span", ".kp-promise-strip"].map((selector) => {
            const element = document.querySelector(selector);
            const color = getComputedStyle(element).color;
            const surface = getComputedStyle(element.closest(".kp-final, .kp-details-paper, .kp-marketing-shell"));
            const backgrounds = surface.backgroundImage === "none" ? [surface.backgroundColor] : surface.backgroundImage.match(/rgba?\([^)]+\)/g);
            const minimum = Math.min(...backgrounds.map((background) => ratio(color, background)));
            return { selector, color, backgrounds, ratio: minimum, passesStandardText: minimum >= 4.5 };
          });
        });
        accessibility.push({ lang, width, engine: result.testEngine, passes: result.passes.length, manualContrast, incomplete: result.incomplete.map((item) => ({ id: item.id, targets: item.nodes.map((node) => node.target) })), violations: result.violations.map((item) => ({ id: item.id, impact: item.impact, description: item.description, nodes: item.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })) })) });
      } else accessibility.push({ lang, width, blocked: `Install audit-only axe-core at ${axePath}` });
      await page.screenshot({ path: `${output}/final-${lang}-${width}.png`, fullPage: true });
      await context.close();
    }
  }
} finally { await browser.close(); }
const assets = [];
for (const name of await readdir("dist/assets")) {
  if (/^(index-|HomePage-|TemplateGrid-|templates-)/.test(name)) {
    const file = await readFile(`dist/assets/${name}`);
    assets.push({ name, bytes: file.length, gzip: gzipSync(file).length });
  }
}
const result = { environment: "Windows local Vite production preview; Chromium cold contexts; 4x CPU, 1.6 Mbps, 150ms latency; intercepted catalog API; Event Timing sample is not field INP", performanceRows, accessibility, assets };
await writeFile(`${output}/measurements.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify({ performance: performanceRows.map(({ width, run, lcp, cls, events, heavyTemplateRequested, decorativeBackgroundRequested }) => ({ width, run, lcp, cls, events, heavyTemplateRequested, decorativeBackgroundRequested })), accessibility, assets }, null, 2));
if (accessibility.some((row) => row.violations?.length || row.manualContrast?.some((item) => !item.passesStandardText))) process.exitCode = 1;
