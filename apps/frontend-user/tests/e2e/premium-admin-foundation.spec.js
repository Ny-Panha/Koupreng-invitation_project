import { expect, test } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fixtureToken } from "./support/fixtureToken.js";

const evidence = path.resolve("../../docs/qa/premium-modernization/after");
const widths = [320, 375, 390, 430, 768, 1024, 1440];

async function installAdminFixtures(page, lang = "en") {
  await page.addInitScript(({ token, lang }) => {
    // Browser-only unsigned session; every API response is intercepted below.
    localStorage.setItem("koupreng.admin.auth", JSON.stringify({ accessToken: token, user: { id: 1, fullName: "Review Admin", email: "review@example.test", role: "ADMIN" } }));
    localStorage.setItem("koupreng.admin.lang", lang);
  }, { token: fixtureToken, lang });
  await page.route("**/api/**", route => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ data: route.request().url().includes("i18n") ? { messages: {} } : route.request().url().includes("alerts") ? [] : {} }),
  }));
}

async function containedFocus(page, dialog, count = 15) {
  for (let index = 0; index < count; index++) {
    await page.keyboard.press("Tab");
    expect(await dialog.evaluate(node => node.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Shift+Tab");
  expect(await dialog.evaluate(node => node.contains(document.activeElement))).toBe(true);
}

for (const lang of ["en", "km"]) {
  test(`admin chrome fits seven widths with usable navigation: ${lang}`, async ({ page }, info) => {
    test.setTimeout(120_000);
    const errors = [];
    const results = [];
    page.on("pageerror", error => errors.push(error.message));
    await installAdminFixtures(page, lang);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await mkdir(evidence, { recursive: true });
    for (const width of widths) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("http://127.0.0.1:4174/dashboard");
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("main h2").first()).toBeVisible();
      await expect.poll(() => page.locator("main .animate-cascade").evaluateAll(nodes => nodes.every(node => getComputedStyle(node).animationDelay === "0s"))).toBe(true);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      const controls = page.locator(".admin-header button, .admin-header a, .admin-header select, .admin-dock a, .admin-dock button");
      const unnamed = await controls.evaluateAll(nodes => nodes.filter(node => node.getBoundingClientRect().width > 0 && !(node.getAttribute("aria-label") || node.textContent.trim())).map(node => node.outerHTML));
      expect(unnamed).toEqual([]);
      const undersized = await controls.evaluateAll(nodes => nodes.filter(node => {
        const rect = node.getBoundingClientRect();
        return rect.width > 0 && (rect.width < 44 || rect.height < 44);
      }).map(node => node.outerHTML));
      expect(undersized).toEqual([]);
      if (width < 1024) {
        const trigger = page.getByRole("button", { name: lang === "en" ? "Open navigation" : "បើកម៉ឺនុយ" });
        await trigger.click();
        const dialog = page.getByRole("dialog");
        await expect(dialog).toBeVisible();
        await containedFocus(page, dialog);
        if (width === 390 && info.project.name === "desktop-chromium") await page.screenshot({ path: path.join(evidence, `admin-drawer-${lang}-${width}.png`) });
        await page.keyboard.press("Escape");
        await expect(page.getByRole("dialog")).toHaveCount(0);
        await expect(trigger).toBeFocused();
        expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
      }
      if (info.project.name === "desktop-chromium" && ((lang === "en" && [390, 1440].includes(width)) || (lang === "km" && width === 390))) await page.screenshot({ path: path.join(evidence, `admin-dashboard-${lang}-${width}.png`) });
      results.push({ lang, width, noOverflow: true, namedControls: true, min44px: true, nativeDrawerKeyboard: width < 1024 });
    }
    expect(errors).toEqual([]);
    await writeFile(path.join(evidence, `admin-shell-${lang}-${info.project.name}.json`), JSON.stringify({ browser: info.project.name, fixtures: "Intercepted empty summary/analytics; browser-only ADMIN session", results }, null, 2));
  });
}

test("admin page search filters, contains focus, navigates and supports dark mode", async ({ page }, info) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await installAdminFixtures(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("http://127.0.0.1:4174/dashboard");
  await expect(page.locator("main h2").first()).toBeVisible();
  await page.getByRole("button", { name: "Find a page in your workspace" }).click();
  const dialog = page.getByRole("dialog", { name: "Find an admin page" });
  const search = dialog.getByRole("searchbox", { name: "Page name" });
  await expect(search).toBeFocused();
  await search.fill("zzzzzz");
  await expect(dialog.getByRole("status")).toHaveText("No pages found. Try a different page name.");
  await search.fill("payments");
  await expect(dialog.getByRole("link")).toHaveCount(1);
  await containedFocus(page, dialog, 8);
  await mkdir(evidence, { recursive: true });
  if (info.project.name === "desktop-chromium") await page.screenshot({ path: path.join(evidence, "admin-search-en-1440.png") });
  await dialog.getByRole("link", { name: "KHQR payments" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:4174/payments");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goto("http://127.0.0.1:4174/dashboard");
  await expect(page.locator("main h2").first()).toBeVisible();
  await page.getByRole("button", { name: "Use dark theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.evaluate(() => document.fonts.ready);
  if (info.project.name === "desktop-chromium") await page.screenshot({ path: path.join(evidence, "admin-dashboard-dark-en-1440.png") });
  expect(errors).toEqual([]);
});

test("admin drawer keeps actions reachable with a shortened mobile viewport", async ({ page }) => {
  await installAdminFixtures(page);
  await page.setViewportSize({ width: 390, height: 480 });
  await page.goto("http://127.0.0.1:4174/dashboard");
  await page.getByRole("button", { name: "Open navigation" }).click();
  const dialog = page.getByRole("dialog");
  const search = dialog.getByRole("searchbox", { name: "Find a page" });
  await search.fill("payments");
  await expect(dialog.getByRole("link", { name: "KHQR payments" })).toBeInViewport();
  await expect(dialog.getByRole("link", { name: "Create invitation template" })).toBeInViewport();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
