import { chromium } from "../../apps/frontend-user/node_modules/playwright/index.mjs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import process from "node:process";

const phase = process.argv[2] || "baseline";
const outputDir = `output/playwright/marketing-v7/${phase}`;
const baseUrl = process.env.MARKETING_PREVIEW_URL || "http://127.0.0.1:5173";

let axeSource = "";
try {
  axeSource = await readFile("output/playwright/cinematic/qa-tools/node_modules/axe-core/axe.min.js", "utf8");
} catch {
  // axe-core optional
}

const widths = [
  { name: "320", width: 320, height: 640, mobile: true },
  { name: "390", width: 390, height: 844, mobile: true },
  { name: "768", width: 768, height: 1024, mobile: true },
  { name: "1024", width: 1024, height: 768, mobile: false },
  { name: "1440", width: 1440, height: 900, mobile: false },
  { name: "1920", width: 1920, height: 1080, mobile: false },
];

const keyRoutes = [
  { path: "/", id: "home" },
  { path: "/templates", id: "templates" },
  { path: "/pricing", id: "pricing" },
  { path: "/contact", id: "contact" },
  { path: "/login", id: "login" },
  { path: "/register", id: "register" },
  { path: "/forgot-password", id: "forgot-password" },
  { path: "/reset-password", id: "reset-password" },
  { path: "/templates/silk-heritage", id: "demo-free" },
  { path: "/templates/emerald-canva-luxe-wedding", id: "demo-premium" },
  { path: "/templates/khmer-celestial", id: "demo-contact" },
];

const languages = ["km", "en"];

const catalogFixture = [
  { id: 2, code: "silk-heritage", name: "សូត្រមង្គល", nameEn: "Silk Heritage", category: "TRADITIONAL", premium: false, price: 0, currency: "USD", thumbnailUrl: "/templates/silk-heritage/preview.svg" },
  { id: 80, code: "khmer-celestial", name: "ខ្មែរចន្ទតារា", nameEn: "Khmer Celestial", category: "TRADITIONAL", premium: true, price: null, currency: "USD", thumbnailUrl: "/facebook/all/06-card/cover-card.jpg" },
  { id: 81, code: "emerald-canva-luxe-wedding", name: "Emerald Luxe", category: "MODERN", premium: true, price: 20, currency: "USD", thumbnailUrl: "/templates/canva-luxury/emerald-luxury.jpg" },
];

const packagesFixture = [
  { id: 1, code: "FIXTURE_BASIC", packageName: "Essential", description: "A small celebration, with the details together.", price: "0", currency: "USD", durationDays: 30, maxInvitations: 1, maxGuestsPerInvitation: 100, active: true, premiumTemplatesEnabled: false, seatingEnabled: false, qrCheckInEnabled: false },
  { id: 2, code: "FIXTURE_PLUS", packageName: "Celebration", description: "More invitations and additional guest tools.", price: "29", currency: "USD", durationDays: 90, maxInvitations: 3, maxGuestsPerInvitation: 300, active: true, premiumTemplatesEnabled: true, seatingEnabled: true, qrCheckInEnabled: true },
  { id: 3, code: "FIXTURE_KHR", packageName: "Family", description: "A separate KHR-priced example.", price: "160000", currency: "KHR", durationDays: 120, maxInvitations: 5, maxGuestsPerInvitation: 500, active: true, premiumTemplatesEnabled: true, seatingEnabled: true, qrCheckInEnabled: false },
];

const fixtureUser = { id: 7, fullName: "Fixture Host", email: "host@example.test", role: "USER" };

async function run() {
  await mkdir(outputDir, { recursive: true });
  console.log(`[capture-v7] Starting ${phase} capture targeting ${baseUrl}...`);

  const browser = await chromium.launch({ headless: true });
  const auditRecords = [];
  const axeAuditRecords = [];

  for (const lang of languages) {
    for (const vp of widths) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.mobile,
        hasTouch: vp.mobile,
        deviceScaleFactor: 2,
      });

      await context.addInitScript(({ l }) => {
        localStorage.setItem("koupreng.lang", l);
      }, { l: lang });

      await context.route("**/api/**", (route) => {
        const url = new URL(route.request().url());
        if (url.pathname.endsWith("/templates")) {
          return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: catalogFixture }) });
        }
        if (url.pathname.endsWith("/packages")) {
          return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: packagesFixture }) });
        }
        if (url.pathname.endsWith("/auth/me")) {
          return route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ message: "No session" }) });
        }
        if (url.pathname.endsWith("/i18n/messages")) {
          return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ messages: {} }) });
        }
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) });
      });

      const page = await context.newPage();

      for (const item of keyRoutes) {
        // Capture 1440 and 390 for all routes; capture 320, 768, 1024, 1920 for home and login
        if (!["1440", "390"].includes(vp.name) && !["home", "login"].includes(item.id)) {
          continue;
        }

        const snapshotName = `${item.id}-${lang}-${vp.name}`;
        try {
          await page.goto(`${baseUrl}${item.path}`, { waitUntil: "domcontentloaded", timeout: 15000 });
          await page.waitForTimeout(600);
          await page.evaluate(() => document.fonts.ready);

          // Full page screenshot
          await page.screenshot({
            path: `${outputDir}/${snapshotName}-full.png`,
            fullPage: true,
          });

          // First viewport screenshot
          await page.screenshot({
            path: `${outputDir}/${snapshotName}-viewport.png`,
            fullPage: false,
          });

          const pageMetrics = await page.evaluate(() => {
            const h1 = document.querySelector("h1")?.textContent?.trim() || "";
            const buttons = Array.from(document.querySelectorAll("button, a.kp-button, a.kp-nav-cta")).map(b => b.textContent?.trim()).filter(Boolean);
            const scrollWidth = document.documentElement.scrollWidth;
            const clientWidth = document.documentElement.clientWidth;
            const overflow = scrollWidth > clientWidth;
            return { h1, buttons: buttons.slice(0, 8), overflow, scrollWidth, clientWidth };
          });

          auditRecords.push({
            route: item.path,
            id: item.id,
            lang,
            width: vp.width,
            overflow: pageMetrics.overflow,
            h1: pageMetrics.h1,
            buttonsCount: pageMetrics.buttons.length,
            snapshot: `${snapshotName}-viewport.png`,
          });

          // Run axe-core accessibility audit on 1440 desktop
          if (vp.name === "1440" && axeSource) {
            try {
              await page.evaluate(axeSource);
              const axeResults = await page.evaluate(async () => {
                return await window.axe.run(document, {
                  runOnly: {
                    type: "tag",
                    values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
                  },
                });
              });
              const violations = (axeResults.violations || []).map((v) => ({
                id: v.id,
                impact: v.impact,
                description: v.description,
                nodesCount: v.nodes.length,
              }));
              axeAuditRecords.push({
                route: item.path,
                id: item.id,
                lang,
                violationsCount: violations.length,
                violations,
              });
            } catch (axeErr) {
              console.warn(`[capture-v7] Axe error on ${item.path}:`, axeErr.message);
            }
          }
        } catch (err) {
          console.error(`[capture-v7] Error on ${item.path} (${lang} @ ${vp.width}px):`, err.message);
          auditRecords.push({
            route: item.path,
            id: item.id,
            lang,
            width: vp.width,
            error: err.message,
          });
        }
      }

      await context.close();
    }
  }

  await browser.close();

  const summary = {
    phase,
    capturedAt: new Date().toISOString(),
    totalSnapshots: auditRecords.length,
    overflowCount: auditRecords.filter((r) => r.overflow).length,
    records: auditRecords,
  };

  await writeFile(`${outputDir}/render-audit.json`, JSON.stringify(summary, null, 2), "utf8");
  if (axeAuditRecords.length > 0) {
    await writeFile(`${outputDir}/accessibility-audit.json`, JSON.stringify(axeAuditRecords, null, 2), "utf8");
    console.log(`[capture-v7] Saved accessibility audit to ${outputDir}/accessibility-audit.json`);
  }
  console.log(`[capture-v7] Done. Saved ${auditRecords.length} records to ${outputDir}/render-audit.json`);
}

run().catch((err) => {
  console.error("[capture-v7] Fatal error:", err);
  process.exit(1);
});
