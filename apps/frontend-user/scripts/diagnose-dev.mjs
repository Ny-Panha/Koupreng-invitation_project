import { chromium } from "@playwright/test";

async function inspect() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on("console", msg => console.log("PAGE CONSOLE:", msg.type(), msg.text()));
  page.on("pageerror", err => console.log("PAGE ERROR:", err.message));

  await page.goto("http://localhost:5173/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "../../output/design-review/landing-v3/test-current.png", fullPage: true });
  const h1 = await page.evaluate(() => document.querySelector("h1")?.innerText);
  console.log("H1 in diagnose:", h1);
  await browser.close();
}

inspect();
