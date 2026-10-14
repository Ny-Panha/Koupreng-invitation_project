import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const outDir = "../../output/design-review/landing-v3";
await mkdir(outDir, { recursive: true });

async function run() {
  const browser = await chromium.launch({ headless: true });
  try {
    // 1440x900 Desktop
    const ctxDesktop = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    });
    const pageDesktop = await ctxDesktop.newPage();
    console.log("Navigating to https://bandithcardstore.com/ on Desktop...");
    await pageDesktop.goto("https://bandithcardstore.com/", { waitUntil: "domcontentloaded", timeout: 45000 });
    await pageDesktop.waitForTimeout(4000);
    
    await pageDesktop.screenshot({ path: `${outDir}/bandith-1440-hero.png`, fullPage: false });
    await pageDesktop.screenshot({ path: `${outDir}/bandith-1440-full.png`, fullPage: true });
    console.log("Captured 1440 screenshots.");

    // Inspect styles on Desktop
    const data = await pageDesktop.evaluate(() => {
      const header = document.querySelector("header") || document.querySelector("nav");
      const h1 = document.querySelector("h1");
      const h2s = Array.from(document.querySelectorAll("h2")).map(h => ({
        text: h.innerText.trim(),
        fontSize: window.getComputedStyle(h).fontSize,
        fontFamily: window.getComputedStyle(h).fontFamily,
        color: window.getComputedStyle(h).color
      }));
      const buttons = Array.from(document.querySelectorAll("button, a.btn, a[href*='template'], a[href*='login'], a[href*='register']")).slice(0, 15).map(b => {
        const style = window.getComputedStyle(b);
        const rect = b.getBoundingClientRect();
        return {
          tag: b.tagName,
          text: b.innerText.trim().slice(0, 50),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          bg: style.backgroundColor,
          color: style.color,
          fontSize: style.fontSize,
          borderRadius: style.borderRadius,
          border: style.border
        };
      });
      const bodyStyle = window.getComputedStyle(document.body);
      return {
        title: document.title,
        bodyBg: bodyStyle.backgroundColor,
        bodyColor: bodyStyle.color,
        bodyFont: bodyStyle.fontFamily,
        headerHeight: header ? Math.round(header.getBoundingClientRect().height) : null,
        headerBg: header ? window.getComputedStyle(header).backgroundColor : null,
        h1: h1 ? {
          text: h1.innerText.trim(),
          fontSize: window.getComputedStyle(h1).fontSize,
          lineHeight: window.getComputedStyle(h1).lineHeight,
          fontFamily: window.getComputedStyle(h1).fontFamily,
          color: window.getComputedStyle(h1).color
        } : null,
        h2s,
        buttons
      };
    });

    // 390x844 Mobile
    const ctxMobile = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1"
    });
    const pageMobile = await ctxMobile.newPage();
    console.log("Navigating to https://bandithcardstore.com/ on Mobile...");
    await pageMobile.goto("https://bandithcardstore.com/", { waitUntil: "domcontentloaded", timeout: 45000 });
    await pageMobile.waitForTimeout(4000);
    
    await pageMobile.screenshot({ path: `${outDir}/bandith-390-hero.png`, fullPage: false });
    await pageMobile.screenshot({ path: `${outDir}/bandith-390-full.png`, fullPage: true });
    console.log("Captured 390 screenshots.");

    // Inspect mobile header/h1
    const mobileData = await pageMobile.evaluate(() => {
      const header = document.querySelector("header") || document.querySelector("nav");
      const h1 = document.querySelector("h1");
      return {
        headerHeight: header ? Math.round(header.getBoundingClientRect().height) : null,
        h1: h1 ? {
          text: h1.innerText.trim(),
          fontSize: window.getComputedStyle(h1).fontSize,
          lineHeight: window.getComputedStyle(h1).lineHeight
        } : null
      };
    });

    const combined = { desktop: data, mobile: mobileData };
    await writeFile(`${outDir}/bandith-measurements.json`, JSON.stringify(combined, null, 2));
    console.log("Saved measurements to bandith-measurements.json");

    // Also try /templates
    try {
      console.log("Navigating to https://bandithcardstore.com/templates...");
      await pageDesktop.goto("https://bandithcardstore.com/templates", { waitUntil: "domcontentloaded", timeout: 35000 });
      await pageDesktop.waitForTimeout(3000);
      await pageDesktop.screenshot({ path: `${outDir}/bandith-templates-1440.png`, fullPage: false });
      await pageMobile.goto("https://bandithcardstore.com/templates", { waitUntil: "domcontentloaded", timeout: 35000 });
      await pageMobile.waitForTimeout(3000);
      await pageMobile.screenshot({ path: `${outDir}/bandith-templates-390.png`, fullPage: false });
      console.log("Captured /templates screenshots.");
    } catch (e) {
      console.warn("Could not capture /templates:", e.message);
    }

  } catch (err) {
    console.error("Bandith capture error:", err);
  } finally {
    await browser.close();
  }
}

run();
