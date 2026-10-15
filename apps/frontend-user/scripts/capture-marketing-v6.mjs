// Run from apps/frontend-user with a production preview on port 4173.
// Production-preview visual and lab evidence. All API calls are intercepted;
// no contact message, purchase or authenticated request reaches a real backend.
import { chromium, firefox, webkit, expect } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import process from "node:process";

const phase = process.argv[2] || "before";
const reflowOnly = process.argv.includes("--zoom-reflow");
const dprOnly = process.argv.includes("--dpr");
const comfortOnly = process.argv.includes("--comfort") || dprOnly;
const diagnostic = process.argv.includes("--diagnostic");
const statesOnly = process.argv.includes("--states");
const performanceOnly = process.argv.includes("--performance") || diagnostic;
const routeOnly = process.argv.find(value => value.startsWith("--route="))?.slice(8);
const output = `../../output/playwright/marketing-v6/${phase}`;
const origin = process.env.MARKETING_PREVIEW_ORIGIN || "http://127.0.0.1:4173";
const token = "eyJhbGciOiJub25lIn0.eyJleHAiOjQxMDIyNjg4MDB9.";
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
    if (!localStorage.getItem("koupreng.lang")) localStorage.setItem("koupreng.lang", language);
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
  if (reflowOnly) {
    for (const language of ["km", "en"]) {
      // 1440x900 physical window at 200% browser zoom has 720x450 CSS pixels.
      // This models responsive reflow; it does not operate native browser zoom.
      const context = await browser.newContext({ viewport: { width: 720, height: 450 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
      await configure(context, language);
      const page = await context.newPage();
      for (const path of ["/", "/templates", "/pricing", "/contact"]) {
        await page.goto(`${origin}${path}`, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready);
        const name = `zoom-reflow200-${path === "/" ? "home" : path.slice(1)}-${language}`;
        const layout = await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth > innerWidth,
          clippedControls: [...document.querySelectorAll(".kp-header a,.kp-header button,main h1,main .kp-button")].filter(node => {
            if (!node.getClientRects().length || node.classList.contains("kp-skip-link")) return false;
            const box = node.getBoundingClientRect(); return box.left < -1 || box.right > innerWidth + 1;
          }).map(node => node.textContent),
        }));
        expect(layout.overflow).toBe(false); expect(layout.clippedControls).toEqual([]);
        await expect(page.locator(".kp-menu-trigger")).toBeVisible();
        await page.screenshot({ path: `${output}/${name}.png` });
        rows.push({ name, kind: "Effective CSS viewport model, not native browser zoom", ...layout });
      }
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(origin, { waitUntil: "networkidle" });
      await page.evaluate(() => { document.documentElement.style.zoom = "2"; });
      rows.push({ name: `css-zoom-header-diagnostic-${language}`, kind: "CSS zoom keeps desktop media queries; document overflow alone misses clipping", clippedControls: await page.locator(".kp-header a,.kp-header button").evaluateAll(nodes => nodes.filter(node => node.getClientRects().length && node.getBoundingClientRect().right > innerWidth + 1).map(node => node.textContent)) });
      await context.close();
    }
  } else if (comfortOnly) {
    for (const [name, engine] of Object.entries({ firefox, webkit })) {
      try { const instance = await engine.launch(); rows.push({ engine: name, available: true }); await instance.close(); }
      catch (error) { rows.push({ engine: name, status: "NOT TESTED", reason: error.message.split("\n")[0] }); }
    }
    rows.push({ engine: "chromium", version: browser.version() });
    for (const language of ["km", "en"]) for (const width of [390, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, deviceScaleFactor: 2, hasTouch: width === 390, isMobile: width === 390, reducedMotion: "reduce" });
      await configure(context, language);
      const page = await context.newPage();
      const images = [];
      page.on("request", request => { if (/silk-portrait|portrait.webp/.test(request.url())) images.push(request.url()); });
      await page.goto(origin, { waitUntil: "networkidle" });
      await page.locator(".kp-hero img").first().evaluate(node => node.decode());
      rows.push({ name: `dpr2-${language}-${width}`, image: await page.locator(".kp-hero img").first().evaluate(node => ({ source: node.currentSrc, naturalWidth: node.naturalWidth, paintedWidth: node.clientWidth, dpr: devicePixelRatio })), requests: [...images] });
      await page.screenshot({ path: `${output}/dpr2-${language}-${width}.png` });
      if (dprOnly) { await context.close(); continue; }
      for (const path of ["/", "/templates", "/pricing", "/contact"]) {
        await page.goto(`${origin}${path}`, { waitUntil: "networkidle" });
        const name = `${path === "/" ? "home" : path.slice(1)}-${language}-${width}`;
        const other = language === "km" ? "en" : "km";
        if (width === 390) {
          await page.locator(".kp-menu-trigger").tap();
          await page.locator(`dialog .kp-language button[lang="${other}"]`).tap();
          await page.keyboard.press("Escape");
        } else await page.locator(`.kp-desktop-actions .kp-language button[lang="${other}"]`).click();
        await expect(page.locator("html")).toHaveAttribute("lang", other);
        await page.reload({ waitUntil: "networkidle" });
        await expect(page.locator("html")).toHaveAttribute("lang", other);
        await page.evaluate(lang => localStorage.setItem("koupreng.lang", lang), language);
        await page.reload({ waitUntil: "networkidle" });
        if (width === 1440) {
          await page.evaluate(() => { document.documentElement.style.zoom = "2"; });
          await page.screenshot({ path: `${output}/zoom200-${name}.png`, fullPage: true });
          rows.push({ name: `zoom200-${name}`, kind: "CSS zoom stress; not native browser zoom", overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth) });
        } else {
          await page.evaluate(() => {
            const text = [...document.querySelectorAll("main h1,main h2,main h3,main p,main a,main button,main label,main input,main textarea,main select,main summary,main th,main td")];
            const sizes = text.map(node => parseFloat(getComputedStyle(node).fontSize));
            text.forEach((node, index) => { node.style.fontSize = `${sizes[index] * 2}px`; });
          });
          await page.screenshot({ path: `${output}/text200-${name}.png`, fullPage: true });
          const layout = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, clipped: [...document.querySelectorAll("main h1,main h2,main h3,main p,main a,main button,main label")].filter(node => node.getClientRects().length && node.scrollWidth > node.clientWidth + 2).map(node => ({ text: node.textContent.slice(0,80), class: node.className })) }));
          rows.push({ name: `text200-${name}`, kind: "Computed font-size stress; not native OS scaling", ...layout });
        }
      }
      await context.close();
    }
  } else if (statesOnly) {
    const axe = await readFile("../../output/playwright/cinematic/qa-tools/node_modules/axe-core/axe.min.js", "utf8");
    const capture = async (page, name, selector = ".kp-marketing-shell") => {
      await page.evaluate(() => document.fonts.ready);
      await page.locator(selector).scrollIntoViewIfNeeded();
      // Frame full-document states consistently; sticky chrome should appear
      // at the document top rather than inside the scrolled form capture.
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await page.screenshot({ path: `${output}/${name}.png`, fullPage: true });
      await page.addScriptTag({ content: axe });
      const audit = await page.evaluate(() => window.axe.run(".kp-marketing-shell", { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } }));
      const row = { name, accessibility: { violations: audit.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), incomplete: audit.incomplete.map(v => v.id) } };
      rows.push(row); console.log(JSON.stringify(row));
    };
    for (const language of ["km", "en"]) for (const width of [390, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, reducedMotion: "reduce" });
      await configure(context, language);
      await context.tracing.start({ screenshots: true, snapshots: true, sources: false });
      const page = await context.newPage();
      await page.goto(`${origin}/contact`, { waitUntil: "networkidle" });
      await page.locator('button[type="submit"]').click();
      await capture(page, `contact-invalid-${language}-${width}`, "#contact-form");
      await page.locator("#contact-name").fill("Fixture Visitor");
      await page.locator("#contact-email").fill("visitor@example.test");
      await page.locator("#contact-message").fill("Local fixture message; never delivered.");
      for (const [state, status, data] of [["error", 500, {}], ["rate", 429, {}], ["accepted", 200, { accepted: true, delivery: "SMTP_ACCEPTED" }]]) {
        await page.route("**/api/v1/contact", route => route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ data }) }));
        await page.locator('button[type="submit"]').click();
        await page.locator(state === "accepted" ? ".kp-contact-accepted" : ".kp-contact-error").waitFor();
        await capture(page, `contact-${state}-${language}-${width}`, "#contact-form");
      }
      await page.goto(origin, { waitUntil: "networkidle" });
      await page.locator(".kp-demo-filters button").nth(1).click();
      await capture(page, `guest-filter-${language}-${width}`, ".kp-guest-demo");
      let release;
      const pending = new Promise(resolve => { release = resolve; });
      let failed = true;
      await page.route("**/api/v1/templates", async route => {
        await pending;
        await route.fulfill({ status: failed ? 503 : 200, contentType: "application/json", body: JSON.stringify({ data: failed ? [] : catalog }) });
      });
      await page.goto(`${origin}/templates`, { waitUntil: "domcontentloaded" });
      await page.locator(".kp-design-skeleton").first().waitFor();
      await capture(page, `catalog-loading-${language}-${width}`);
      release();
      await page.locator(".tp-catalog-status button").waitFor();
      await capture(page, `catalog-offline-${language}-${width}`);
      failed = false;
      await page.locator(".tp-catalog-status button").click();
      await page.locator(".kp-design-card").nth(2).waitFor();
      await page.route("**/images/marketing/*", route => route.abort());
      await page.route("**/templates/silk-heritage/preview.svg", route => route.abort());
      await page.reload({ waitUntil: "networkidle" });
      await capture(page, `catalog-image-failure-${language}-${width}`);
      await context.tracing.stop({ path: `${output}/states-${language}-${width}.zip` });
      await context.close();
    }
  } else if (!performanceOnly) {
    let axe;
    try { axe = await readFile("../../output/playwright/cinematic/qa-tools/node_modules/axe-core/axe.min.js", "utf8"); } catch { /* Report missing audit engine below. */ }
    for (const language of ["km", "en"]) for (const width of [320, 360, 390, 430, 768, 1024, 1440, 1920]) for (const path of ["/", "/templates", "/pricing", "/contact"]) {
      if (routeOnly && routeOnly !== path) continue;
      const context = await browser.newContext({ viewport: { width, height: width < 500 ? 844 : 900 }, reducedMotion: "reduce" });
      await configure(context, language);
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(`${origin}${path}`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      for (const section of await page.locator("main section").all()) await section.scrollIntoViewIfNeeded();
      for (const img of await page.locator("main img").all()) { await img.scrollIntoViewIfNeeded(); await img.evaluate(node => node.decode().catch(() => {})); }
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      const name = `${path === "/" ? "home" : path.slice(1)}-${language}-${width}`;
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await page.screenshot({ path: `${output}/${name}-hero.png` });
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await page.screenshot({ path: `${output}/${name}-full.png`, fullPage: true });
      const layout = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        h1: document.querySelector("main h1")?.textContent,
        headerHeight: Math.round(document.querySelector(".kp-header")?.getBoundingClientRect().height || 0),
        fonts: [...new Set([...document.querySelectorAll("main h1, main h2, main p, main input")].map(node => getComputedStyle(node).fontFamily))],
        documentHeight: document.documentElement.scrollHeight,
        positions: Object.fromEntries([".kp-hero .kp-button", ".kp-folio-cover", ".kp-collection", ".kp-product"].map(selector => {
          const rect = document.querySelector(selector)?.getBoundingClientRect();
          return [selector, rect ? { top: rect.top, bottom: rect.bottom } : null];
        })),
        clippedText: [...document.querySelectorAll("main h1,main h2,main h3,main p,main button,main a,main label")].filter(node => node.getClientRects().length && node.scrollWidth > node.clientWidth + 2).map(node => ({ text: node.textContent.slice(0, 80), class: node.className })),
      }));
      let accessibility = { blocked: "Audit-only axe-core is unavailable" };
      if (axe && [390, 1440].includes(width)) {
        await page.addScriptTag({ content: axe });
        const audit = await page.evaluate(() => window.axe.run(".kp-marketing-shell", { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } }));
        accessibility = { violations: audit.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })), incomplete: audit.incomplete.map(v => v.id) };
      }
      rows.push({ name, path, language, width, ...layout, errors, accessibility });
      console.log(JSON.stringify({ name, overflow: layout.overflow, clipped: layout.clippedText.length, violations: accessibility.violations?.length }));
      await context.close();
    }
    for (const language of !routeOnly || routeOnly === "/pricing-auth" ? ["km", "en"] : []) for (const width of [390, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, reducedMotion: "reduce" });
      await configure(context, language, true);
      const page = await context.newPage();
      await page.goto(`${origin}/pricing`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      for (const section of await page.locator("main section").all()) await section.scrollIntoViewIfNeeded();
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await page.screenshot({ path: `${output}/pricing-auth-${language}-${width}-hero.png` });
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await page.screenshot({ path: `${output}/pricing-auth-${language}-${width}-full.png`, fullPage: true });
      if (axe) {
        await page.addScriptTag({ content: axe });
        const audit = await page.evaluate(() => window.axe.run(".kp-marketing-shell", { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } }));
        rows.push({ name: `pricing-auth-${language}-${width}`, width, accessibility: { violations: audit.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })) } });
      }
      await context.close();
    }
    // Inspect the invitation's state changes separately from initial-page captures.
    for (const language of routeOnly ? [] : ["km", "en"]) for (const width of [390, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, reducedMotion: "reduce" });
      await configure(context, language);
      const page = await context.newPage();
      await page.goto(origin, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.locator(".kp-hero .kp-actions button").click();
      await page.locator(".kp-hero-art").scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${output}/folio-open-${language}-${width}.png` });
      const paper = await page.locator(".kp-folio-paper").evaluate(node => ({ height: node.clientHeight, contentHeight: node.scrollHeight }));
      rows.push({ name: `folio-open-${language}-${width}`, paper });
      await page.locator("#invitation-story").scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${output}/guest-details-${language}-${width}.png` });
      await context.close();
    }
  } else {
    for (const language of ["km", "en"]) for (const width of [390, 1440]) for (let run = 1; run <= 3; run++) {
      if (diagnostic && (language !== "km" || width !== 1440 || run !== 1)) continue;
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      await configure(context, language);
      await context.addInitScript(() => {
        window.lab = { lcp: 0, cls: 0, events: [], longTasks: [] };
        new PerformanceObserver(list => { for (const entry of list.getEntries()) { window.lab.lcp = entry.startTime; window.lab.lcpUrl = entry.url; window.lab.lcpElement = entry.element?.outerHTML?.slice(0, 500); } }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.lab.cls += entry.value; }).observe({ type: "layout-shift", buffered: true });
        new PerformanceObserver(list => { for (const entry of list.getEntries()) if (entry.interactionId) window.lab.events.push({ name: entry.name, duration: entry.duration }); }).observe({ type: "event", buffered: true, durationThreshold: 16 });
        new PerformanceObserver(list => { for (const entry of list.getEntries()) window.lab.longTasks.push(entry.duration); }).observe({ type: "longtask", buffered: true });
      });
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      const waterfall = [];
      const requests = new Map();
      cdp.on("Network.requestWillBeSent", event => {
        const row = { id: event.requestId, url: event.request.url, type: event.type, start: event.timestamp, priority: event.request.initialPriority, initiator: event.initiator.type };
        requests.set(event.requestId, row); waterfall.push(row);
      });
      cdp.on("Network.resourceChangedPriority", event => { const row = requests.get(event.requestId); if (row) row.finalPriority = event.newPriority; });
      cdp.on("Network.responseReceived", event => { const row = requests.get(event.requestId); if (row) Object.assign(row, { response: event.timestamp, status: event.response.status, protocol: event.response.protocol, headers: event.response.headers, timing: event.response.timing, cache: event.response.fromDiskCache }); });
      cdp.on("Network.loadingFinished", event => { const row = requests.get(event.requestId); if (row) Object.assign(row, { finish: event.timestamp, transferBytes: event.encodedDataLength }); });
      await cdp.send("Performance.enable");
      await cdp.send("Network.enable");
      await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 200000, uploadThroughput: 75000 });
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      if (diagnostic) await cdp.send("Tracing.start", { categories: "devtools.timeline,v8,v8.execute,disabled-by-default-v8.compile", transferMode: "ReturnAsStream" });
      await page.goto(origin, { waitUntil: "networkidle", timeout: 60000 });
      await page.evaluate(() => document.fonts.ready);
      // Measure first view before interaction.
      await page.waitForTimeout(1000);
      const metrics = await page.evaluate(() => ({ ...window.lab, resources: performance.getEntriesByType("resource").map(entry => ({ path: entry.name.replace(location.origin, ""), bytes: entry.encodedBodySize, start: entry.startTime, duration: entry.duration, initiator: entry.initiatorType })) }));
      const attribution = await page.evaluate(() => {
        const navigation = performance.getEntriesByType("navigation")[0];
        const resource = performance.getEntriesByType("resource").find(entry => entry.name === window.lab.lcpUrl);
        const portrait = document.querySelector(".kp-hero img");
        return {
          ttfb: navigation.responseStart,
          imageLoadDelay: resource ? resource.startTime - navigation.responseStart : null,
          imageLoadDuration: resource?.duration,
          renderDelay: resource ? window.lab.lcp - resource.responseEnd : null,
          paints: performance.getEntriesByType("paint").map(entry => ({ name: entry.name, start: entry.startTime })),
          image: portrait && { src: portrait.currentSrc, width: portrait.clientWidth, height: portrait.clientHeight, dpr: devicePixelRatio, fetchPriority: portrait.fetchPriority },
          fontStatus: document.fonts.status,
          googleStylesheets: performance.getEntriesByType("resource").filter(entry => entry.name.includes("fonts.googleapis")).map(entry => entry.name),
          navigation: { domInteractive: navigation.domInteractive, domContentLoaded: navigation.domContentLoadedEventEnd, load: navigation.loadEventEnd },
        };
      });
      const mainThread = Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map(item => [item.name, item.value]));
      await writeFile(`${output}/${diagnostic ? "diagnostic-" : ""}waterfall-${language}-${width}-${run}.json`, JSON.stringify(waterfall, null, 2));
      rows.push({ language, width, run, ...metrics, attribution, mainThread });
      console.log(JSON.stringify({ language, width, run, lcp: metrics.lcp, lcpElement: metrics.lcpElement, cls: metrics.cls, events: metrics.events }));
      if (diagnostic) {
        const complete = new Promise(resolve => cdp.once("Tracing.tracingComplete", resolve));
        await cdp.send("Tracing.end");
        const { stream } = await complete;
        let contents = "";
        for (;;) { const chunk = await cdp.send("IO.read", { handle: stream }); contents += chunk.data; if (chunk.eof) break; }
        await cdp.send("IO.close", { handle: stream });
        await writeFile(`${output}/startup-trace.json`, contents);
      }
      await context.close();
    }
  }
} finally { await browser.close(); }
await writeFile(`${output}/${reflowOnly ? "zoom-reflow" : dprOnly ? "dpr" : comfortOnly ? "comfort" : diagnostic ? "diagnostic" : performanceOnly ? "performance" : statesOnly ? "states-audit" : routeOnly ? `${routeOnly.slice(1) || "home"}-audit` : "render-audit"}.json`, JSON.stringify({ source: "Local production preview, API fixtures; packages and guests are illustrative, no live backend or messages", conditions: performanceOnly ? "Chromium cold contexts; 4x CPU, 1.6 Mbps, 150ms latency; Event Timing is not field INP" : "Reduced motion, local static assets; full-page screenshots after lazy media load", rows }, null, 2));
