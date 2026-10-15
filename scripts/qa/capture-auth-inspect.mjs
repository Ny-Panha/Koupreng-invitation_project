import { chromium } from "../../apps/frontend-user/node_modules/playwright/index.mjs";
import { mkdir } from "node:fs/promises";

async function main() {
  const outputDir = "output/playwright/auth-inspect";
  await mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  
  // Desktop
  const desktopPage = await browser.newPage({ viewport: { width: 1280, height: 850 } });
  
  // 1. Desktop Login (Khmer)
  await desktopPage.goto("http://127.0.0.1:5173/login", { waitUntil: "networkidle" });
  await desktopPage.waitForTimeout(500);
  await desktopPage.screenshot({ path: `${outputDir}/login-desktop-km.png`, fullPage: true });
  console.log("Captured login-desktop-km.png");

  // Switch to English
  const enBtn = desktopPage.locator(".auth-lang-btn", { hasText: "English" });
  if (await enBtn.count()) {
    await enBtn.click();
    await desktopPage.waitForTimeout(300);
    await desktopPage.screenshot({ path: `${outputDir}/login-desktop-en.png`, fullPage: true });
    console.log("Captured login-desktop-en.png");
  }

  // 2. Desktop Register
  await desktopPage.goto("http://127.0.0.1:5173/register", { waitUntil: "networkidle" });
  await desktopPage.waitForTimeout(500);
  await desktopPage.screenshot({ path: `${outputDir}/register-desktop-km.png`, fullPage: true });
  console.log("Captured register-desktop-km.png");

  // 3. Mobile Login
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await mobilePage.goto("http://127.0.0.1:5173/login", { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: `${outputDir}/login-mobile-km.png`, fullPage: true });
  console.log("Captured login-mobile-km.png");

  // 4. Mobile Register
  await mobilePage.goto("http://127.0.0.1:5173/register", { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: `${outputDir}/register-mobile-km.png`, fullPage: true });
  console.log("Captured register-mobile-km.png");

  await browser.close();
  console.log("All screenshots captured in", outputDir);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

