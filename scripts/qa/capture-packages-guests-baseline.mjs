import { chromium } from "../../apps/frontend-user/node_modules/playwright/index.mjs";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

async function main() {
  const phase = process.argv[2] || "before";
  const outputDir = resolve(`output/playwright/dashboard-packages-guests-premium/${phase}`);
  await mkdir(outputDir, { recursive: true });

  console.log(`Starting capture for phase: ${phase} -> ${outputDir}`);

  // Fetch real auth token directly from backend
  const authRes = await fetch("http://127.0.0.1:8080/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: "demo@koupreng.local", password: "DemoPass123!" }),
  });

  if (!authRes.ok) {
    throw new Error(`Failed to login: ${authRes.status} ${await authRes.text()}`);
  }
  const authData = await authRes.json();
  console.log("Logged in successfully as:", authData.user?.email);

  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: "desktop-1440", width: 1440, height: 900, isMobile: false },
    { name: "mobile-390", width: 390, height: 844, isMobile: true },
  ];

  const locales = ["km", "en"];

  for (const vp of viewports) {
    for (const locale of locales) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.isMobile,
      });

      // Inject auth & language before any document loads
      await context.addInitScript(({ authData, locale }) => {
        localStorage.setItem("koupreng.auth", JSON.stringify(authData));
        sessionStorage.setItem("koupreng.auth", JSON.stringify(authData));
        localStorage.setItem("koupreng.user.lang", locale);
        localStorage.setItem("koupreng_language", locale);
        localStorage.setItem("language-storage", JSON.stringify({ state: { lang: locale }, version: 0 }));
      }, { authData, locale });

      const page = await context.newPage();

      // Capture Packages
      await page.goto("http://127.0.0.1:5173/dashboard/packages", { waitUntil: "domcontentloaded" });
      await page.waitForSelector(".pkg-card, article", { timeout: 10000 });
      await page.waitForTimeout(600);
      const pkgPath = `${outputDir}/packages-${vp.name}-${locale}.png`;
      await page.screenshot({ path: pkgPath, fullPage: true });
      console.log(`Saved: ${pkgPath}`);

      // Capture Guests
      await page.goto("http://127.0.0.1:5173/dashboard/guests", { waitUntil: "domcontentloaded" });
      await page.waitForSelector(".pe-toolbar", { timeout: 10000 });
      await page.waitForTimeout(600);
      const guestsPath = `${outputDir}/guests-${vp.name}-${locale}.png`;
      await page.screenshot({ path: guestsPath, fullPage: true });
      console.log(`Saved: ${guestsPath}`);

      await context.close();
    }
  }

  await browser.close();
  console.log("Capture completed successfully.");
}

main().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
