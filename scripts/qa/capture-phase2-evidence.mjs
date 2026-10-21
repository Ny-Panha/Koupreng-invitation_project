import { chromium } from "../../apps/frontend-user/node_modules/@playwright/test/index.mjs";
import { fixtures as studioFixtures } from "../../apps/frontend-user/tests/e2e/support/studioFixtures.js";
import { installOverhaulFixtures } from "../../apps/frontend-user/tests/e2e/support/overhaulFixtures.js";
import { identityCatalog, installIdentityFixtures } from "../../apps/frontend-user/tests/e2e/support/templateIdentityFixtures.js";
import fs from "node:fs/promises";
import path from "node:path";

const base = process.env.REVIEW_BASE || "http://127.0.0.1:5173";
const outDir = "D:/Koupreng-UXUI-Phase2/screenshots/after";
const respDir = "D:/Koupreng-UXUI-Phase2/screenshots/responsive";

await fs.mkdir(outDir, { recursive: true });
await fs.mkdir(respDir, { recursive: true });
await fs.mkdir(path.join(outDir, "landing"), { recursive: true });
await fs.mkdir(path.join(outDir, "marketing"), { recursive: true });
await fs.mkdir(path.join(outDir, "templates"), { recursive: true });
await fs.mkdir(path.join(outDir, "events"), { recursive: true });
await fs.mkdir(path.join(outDir, "guests"), { recursive: true });
await fs.mkdir(path.join(outDir, "payments"), { recursive: true });
await fs.mkdir(path.join(outDir, "studio"), { recursive: true });

const browser = await chromium.launch();

async function setupPage(lang = "km", width = 1440, height = 900) {
  const page = await browser.newPage({
    viewport: { width, height },
    reducedMotion: "reduce"
  });
  await page.addInitScript((l) => {
    localStorage.setItem("koupreng.lang", l);
  }, lang);
  return page;
}

try {
  console.log("=== Capturing Phase 2 Evidence ===");

  // 1. Landing Page (Hero & Full)
  for (const lang of ["en", "km"]) {
    for (const width of [1440, 390]) {
      const page = await setupPage(lang, width, width < 768 ? 844 : 900);
      await page.goto(`${base}/`, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);

      // Hero screenshot
      const heroPath = path.join(outDir, "landing", `landing-hero-${lang}-${width}.png`);
      await page.screenshot({ path: heroPath });
      console.log(`Saved: ${heroPath}`);

      // Full landing page
      const fullPath = path.join(outDir, "landing", `landing-full-${lang}-${width}.png`);
      await page.screenshot({ path: fullPath, fullPage: true });
      console.log(`Saved: ${fullPath}`);

      await page.close();
    }
  }

  // 2. Marketing / Pricing (3-card preview)
  for (const lang of ["en", "km"]) {
    for (const width of [1440, 390]) {
      const page = await setupPage(lang, width, width < 768 ? 844 : 900);
      await page.goto(`${base}/pricing`, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);

      const pricingPath = path.join(outDir, "marketing", `pricing-desktop-${lang}-${width}.png`);
      await page.screenshot({ path: pricingPath, fullPage: true });
      console.log(`Saved: ${pricingPath}`);
      await page.close();
    }
  }

  // 3. Template Catalog & Browse (showing Card 3 Khmer localization fix)
  for (const lang of ["en", "km"]) {
    for (const width of [1440, 390]) {
      const page = await setupPage(lang, width, width < 768 ? 844 : 900);
      await installIdentityFixtures(page, { catalog: identityCatalog });
      await page.goto(`${base}/templates/browse`, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);

      const tplPath = path.join(outDir, "templates", `templates-browse-${lang}-${width}.png`);
      await page.screenshot({ path: tplPath, fullPage: true });
      console.log(`Saved: ${tplPath}`);

      await page.goto(`${base}/templates`, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);
      const catalogPath = path.join(outDir, "templates", `templates-catalog-${lang}-${width}.png`);
      await page.screenshot({ path: catalogPath, fullPage: true });
      console.log(`Saved: ${catalogPath}`);

      await page.close();
    }
  }

  // 4. Event Create Page (showing preselected template intent)
  for (const lang of ["en", "km"]) {
    for (const width of [1440, 390]) {
      const page = await setupPage(lang, width, width < 768 ? 844 : 900);
      await installIdentityFixtures(page, { catalog: identityCatalog });
      await page.goto(`${base}/app/events/new?template=khmer-celestial`, { waitUntil: "networkidle" });
      await page.waitForTimeout(600);

      const eventCreatePath = path.join(outDir, "events", `event-create-${lang}-${width}.png`);
      await page.screenshot({ path: eventCreatePath, fullPage: true });
      console.log(`Saved: ${eventCreatePath}`);
      await page.close();
    }
  }

  // 5. Guest Table with 1-Click Telegram Share
  for (const lang of ["en", "km"]) {
    for (const width of [1440, 390]) {
      const page = await setupPage(lang, width, width < 768 ? 844 : 900);
      await installOverhaulFixtures(page, lang, { published: true });
      await page.goto(`${base}/app/events/101/guests`, { waitUntil: "networkidle" });
      await page.waitForTimeout(600);

      const guestPath = path.join(outDir, "guests", `guests-${lang}-${width}.png`);
      await page.screenshot({ path: guestPath, fullPage: true });
      console.log(`Saved: ${guestPath}`);
      await page.close();
    }
  }

  // 6. Packages / Payments with 4-Step KHQR Guidance
  for (const lang of ["en", "km"]) {
    for (const width of [1440, 390]) {
      const page = await setupPage(lang, width, width < 768 ? 844 : 900);
      await installOverhaulFixtures(page, lang);
      await page.goto(`${base}/app/packages`, { waitUntil: "networkidle" });
      await page.waitForTimeout(600);

      const pkgPath = path.join(outDir, "payments", `packages-${lang}-${width}.png`);
      await page.screenshot({ path: pkgPath, fullPage: true });
      console.log(`Saved: ${pkgPath}`);
      await page.close();
    }
  }

  // 7. Invitation Studio
  for (const lang of ["en", "km"]) {
    for (const width of [1440, 390]) {
      const page = await setupPage(lang, width, width < 768 ? 844 : 900);
      await studioFixtures(page, lang);
      await page.goto(`${base}/app/events/101/invitation`, { waitUntil: "networkidle" });
      await page.waitForTimeout(800);

      const studioPath = path.join(outDir, "studio", `invitation-studio-${lang}-${width}.png`);
      await page.screenshot({ path: studioPath });
      console.log(`Saved: ${studioPath}`);
      await page.close();
    }
  }

  // 8. Responsive Viewports for Landing Page
  const responsiveWidths = [320, 375, 390, 430, 768, 1024, 1366, 1440, 1920];
  for (const w of responsiveWidths) {
    const page = await setupPage("km", w, w < 768 ? 844 : 900);
    await page.goto(`${base}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);

    const rPath = path.join(respDir, `landing-km-${w}.png`);
    await page.screenshot({ path: rPath });
    console.log(`Saved responsive: ${rPath}`);
    await page.close();
  }

  console.log("=== All Evidence Captured Successfully ===");
} catch (err) {
  console.error("Capture failed:", err);
  process.exitCode = 1;
} finally {
  await browser.close();
}

