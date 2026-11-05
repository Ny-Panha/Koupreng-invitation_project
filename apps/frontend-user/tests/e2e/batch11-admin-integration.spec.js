import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { installBatch11Admin } from "./support/batch11AdminFixtures.js";

test("administrative legacy aliases resolve without loops and fullscreen editors stay available", async ({ page }) => {
  test.setTimeout(90_000);
  await installBatch11Admin(page);
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const [source, destination] of [["/", "/dashboard"], ["/admin", "/dashboard"], ...["dashboard", "users", "templates", "payments", "packages", "notifications", "reports", "system-logs"].map(path => [`/admin/${path}`, `/${path}`])]) {
    await page.goto(`http://127.0.0.1:4174${source}`);
    await expect(page).toHaveURL(`http://127.0.0.1:4174${destination}`);
    await expect(page.locator("#admin-main")).toBeVisible();
  }
  await page.goto("http://127.0.0.1:4174/templates/new");
  await expect(page.getByRole("heading", { name: /Create New Template/ })).toBeVisible();
  await page.goto("http://127.0.0.1:4174/templates/30");
  await expect(page.getByRole("heading", { name: /Batch 11 fixture template/ })).toBeVisible();
  expect(errors).toEqual([]);
});

test("admin user detail, template catalog and packages render fixture data and controls", async ({ page }) => {
  await installBatch11Admin(page);
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("http://127.0.0.1:4174/users/1101");
  await expect(page.getByRole("heading", { name: "Batch 11 fictional account" })).toBeVisible();
  await expect(page.getByText("batch11@example.test", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Back", exact: true }).click();
  await expect(page).toHaveURL(/\/users$/);
  await page.goto("http://127.0.0.1:4174/templates");
  await expect(page.getByText("Batch 11 fixture template", { exact: true })).toBeVisible();
  await page.goto("http://127.0.0.1:4174/packages");
  await expect(page.getByRole("heading", { name: "Pricing & Packages" })).toBeVisible();
  await expect(page.getByText("Fixture Basic", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("notification composer reports pending creation truth across languages and viewport widths", async ({ page }, info) => {
  test.setTimeout(90_000);
  const { writes } = await installBatch11Admin(page);
  await page.goto("http://127.0.0.1:4174/notifications");
  await expect(page.getByLabel(/Action URL/)).toBeDisabled();
  await page.getByLabel(/Recipient User ID/).fill("1101");
  await page.getByLabel(/^Title/).fill("Batch 11 pending fixture");
  await page.getByLabel(/Message Content/).fill("No real notification dispatch.");
  await page.getByRole("button", { name: "Send Notification", exact: true }).click();
  await expect(page.getByText(/Notification saved. Server status: PENDING/)).toBeVisible();
  expect(writes).toHaveLength(1);
  expect(writes[0].body).not.toHaveProperty("actionUrl");
  for (const lang of ["en", "km"]) {
    await page.evaluate(lang => localStorage.setItem("koupreng.admin.lang", lang), lang);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(page.locator("#notif-action-url")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      if (info.project.name === "desktop-chromium") await page.screenshot({ path: info.outputPath(`notifications-${lang}-${width}.png`), fullPage: true });
    }
  }
  await page.evaluate(() => localStorage.setItem("koupreng.admin.lang", "en")); await page.reload();
  await expect(page.getByText(/No notifications found/)).toBeVisible();
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(document.getAnimations().filter(animation => animation.effect?.getComputedTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {})));
  });
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  await info.attach("notification-axe", { body: JSON.stringify(results.violations, null, 2), contentType: "application/json" });
  expect(results.violations.filter(v => ["critical", "serious"].includes(v.impact))).toEqual([]);
  await page.screenshot({ path: info.outputPath("notifications-contract-1440.png"), fullPage: true });
});
