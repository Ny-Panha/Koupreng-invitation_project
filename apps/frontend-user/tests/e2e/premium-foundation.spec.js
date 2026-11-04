import { expect, test } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { installUxFixtures } from "./support/uxFixtures.js";

const baseline = process.env.PREMIUM_UI_BASELINE === "1";
const evidence = path.resolve("../../docs/qa/premium-modernization", baseline ? "before" : "after");
const widths = [320, 375, 390, 430, 768, 1024, 1440];

test("shared confirmation stays reachable at seven widths in both languages", async ({ page }) => {
  test.setTimeout(120_000);
  await mkdir(evidence, { recursive: true });
  await installUxFixtures(page, "en", { preservePreferences: true });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  const measurements = [];
  for (const lang of ["en", "km"]) {
    await page.goto("/app/packages");
    await page.evaluate(lang => localStorage.setItem("koupreng.lang", lang), lang);
    for (const width of widths) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/app/events");
      await page.locator(".event-card-dots-btn").first().click();
      await page.locator(".event-card-dropdown-item--danger").click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const close = dialog.locator(".k-modal-close-btn");
      const bounds = await close.boundingBox();
      measurements.push({ lang, width, close: bounds, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1) });
      if (!baseline) {
        await expect(dialog).not.toContainText("confirmBtn");
        await expect(dialog.getByRole("button", { name: /Delete Event|លុបកម្មវិធី/ })).toBeVisible();
        expect(bounds.width).toBeGreaterThanOrEqual(44);
        expect(bounds.height).toBeGreaterThanOrEqual(44);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
        expect(measurements.at(-1).overflow).toBe(false);
        for (let i = 0; i < 7; i++) {
          await page.keyboard.press("Tab");
          expect(await dialog.evaluate(node => node.contains(document.activeElement))).toBe(true);
        }
      }
      if ([390, 1440].includes(width)) await page.screenshot({ path: path.join(evidence, `confirmation-${lang}-${width}.png`), scale: "css" });
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
    }
  }
  await writeFile(path.join(evidence, "confirmation-measurements.json"), JSON.stringify({ errors, measurements }, null, 2));
  expect(errors).toEqual([]);
});

test("public template music provides truthful playback and retry", async ({ page }) => {
  test.setTimeout(120_000);
  await mkdir(evidence, { recursive: true });
  await installUxFixtures(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = function () {
      if (window.__rejectMusic) return Promise.reject(new DOMException("Blocked", "NotAllowedError"));
      this.dispatchEvent(new Event("play"));
      return Promise.resolve();
    };
    HTMLMediaElement.prototype.pause = function () { this.dispatchEvent(new Event("pause")); };
  });
  for (const [code, selector] of [["withjoy-modern-portal", ".wj-portal"], ["bliss-editorial-wedding", ".bliss-container"]]) {
    for (const width of baseline ? [390, 1440] : widths) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`/templates/${code}/demo`);
      await expect(page.locator(selector)).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      if ([390, 1440].includes(width)) await page.screenshot({ path: path.join(evidence, `${code}-${width}.png`), scale: "css" });
      if (baseline) continue;
      const music = page.locator(".floating-audio-btn");
      await expect(music).toHaveAccessibleName(/ចាក់ភ្លេង|Play music/);
      await expect(music).toHaveAttribute("aria-pressed", "false");
      const bounds = await music.boundingBox();
      expect(bounds.width).toBeGreaterThanOrEqual(44);
      expect(bounds.height).toBeGreaterThanOrEqual(44);
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
      await page.evaluate(() => { window.__rejectMusic = true; });
      await music.click();
      await expect(page.locator(".floating-audio-status")).toBeVisible();
      await expect(music).toHaveAttribute("aria-pressed", "false");
      await page.evaluate(() => { window.__rejectMusic = false; });
      await music.click();
      await expect(music).toHaveAttribute("aria-pressed", "true");
      await music.click();
      await expect(music).toHaveAttribute("aria-pressed", "false");
      expect(await music.locator("svg").evaluate(node => getComputedStyle(node).animationName)).toBe("none");
    }
  }
  expect(errors).toEqual([]);
});
