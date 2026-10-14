import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const outDir = "../../output/design-review/landing-v3";
await mkdir(outDir, { recursive: true });

async function capture() {
  const browser = await chromium.launch();
  const results = {};

  try {
    for (const lang of ["km", "en"]) {
      for (const vp of [
        { width: 1440, height: 900, isMobile: false, name: "1440" },
        { width: 390, height: 844, isMobile: true, name: "390" }
      ]) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          isMobile: vp.isMobile,
          hasTouch: vp.isMobile
        });

        const page = await context.newPage();
        await page.goto("http://localhost:5173/", { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForTimeout(1000);

        // Set language via evaluate
        await page.evaluate((targetLang) => {
          localStorage.setItem("koupreng.lang", targetLang);
          localStorage.setItem("koupreng.locale", targetLang);
        }, lang);

        await page.reload({ waitUntil: "domcontentloaded" });
        await page.waitForTimeout(2500);

        // Hero screenshot
        await page.screenshot({ path: `${outDir}/current-${lang}-${vp.name}-hero.png`, fullPage: false });
        // Full page screenshot
        await page.screenshot({ path: `${outDir}/current-${lang}-${vp.name}-full.png`, fullPage: true });

        // Get computed details
        const info = await page.evaluate(() => {
          const header = document.querySelector("header");
          const h1 = document.querySelector("h1");
          const h2s = Array.from(document.querySelectorAll("h2")).map(h => ({
            text: h.innerText.trim(),
            fontSize: window.getComputedStyle(h).fontSize,
            lineHeight: window.getComputedStyle(h).lineHeight,
            fontFamily: window.getComputedStyle(h).fontFamily,
            color: window.getComputedStyle(h).color
          }));
          const buttons = Array.from(document.querySelectorAll("button, a.kp-button, a.kp-text-link, a.kp-cta, .kp-folio-demo, .kp-card-action")).map(b => ({
            tag: b.tagName,
            text: b.innerText.trim().slice(0, 50),
            rect: { width: Math.round(b.getBoundingClientRect().width), height: Math.round(b.getBoundingClientRect().height) },
            style: {
              bg: window.getComputedStyle(b).backgroundColor,
              color: window.getComputedStyle(b).color,
              font: window.getComputedStyle(b).fontFamily,
              fontSize: window.getComputedStyle(b).fontSize,
              radius: window.getComputedStyle(b).borderRadius,
              border: window.getComputedStyle(b).border
            }
          }));
          const bodyStyle = window.getComputedStyle(document.body);
          return {
            title: document.title,
            bodyBg: bodyStyle.backgroundColor,
            bodyColor: bodyStyle.color,
            h1: h1 ? {
              text: h1.innerText.trim(),
              fontSize: window.getComputedStyle(h1).fontSize,
              lineHeight: window.getComputedStyle(h1).lineHeight,
              fontFamily: window.getComputedStyle(h1).fontFamily,
              color: window.getComputedStyle(h1).color
            } : null,
            headerHeight: header ? Math.round(header.getBoundingClientRect().height) : null,
            h2s,
            buttons: buttons.slice(0, 15)
          };
        });

        results[`${lang}-${vp.name}`] = info;
        console.log(`Captured current ${lang}-${vp.name}: H1 = ${info.h1?.text?.slice(0, 30)}`);
        await context.close();
      }
    }

    await writeFile(`${outDir}/current-measurements.json`, JSON.stringify(results, null, 2));
    console.log("Current Koupreng captures and measurements complete!");
  } finally {
    await browser.close();
  }
}

capture().catch(err => {
  console.error("Capture failed:", err);
  process.exit(1);
});

