import { expect, test } from "@playwright/test";

async function openDemo(page) {
  await page.route("**/api/**", (route) => route.fulfill({
    status: 404, contentType: "application/json", body: JSON.stringify({ message: "Offline demo" }),
  }));
  await page.goto("/templates/silk-heritage");
  return page.locator(".tpl-silk-heritage");
}

async function expectFullInvitation(folio) {
  await expect(folio.locator(".sh-families article")).toHaveCount(2);
  await expect(folio.locator(".sh-program li")).toHaveCount(9);
  await expect(folio.locator(".sh-program li").last()).toContainText("Wedding reception");
  await expect(folio.locator(".sh-apology")).toContainText("Please accept our apologies");
  await expect(folio.locator(".sh-closing")).toContainText("With love and gratitude");
  await expect(folio.locator(".sh-venue a")).toHaveAttribute("href", /Himawari/);
  await expect(folio.locator("audio")).toHaveCount(0);
}

test("the complete ceremonial folio opens smoothly and returns keyboard focus to its cover", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const folio = await openDemo(page);
  const open = folio.getByRole("button", { name: /Open invitation/ });
  await open.focus();
  await page.keyboard.press("Enter");
  await expect(folio.locator(".sh-cover.is-opening")).toBeVisible();
  await expect(folio.locator(".sh-cover")).toHaveCount(0);
  await expect(folio.locator("#sh-hero-title")).toBeFocused();
  await expect.poll(() => folio.locator(".sh-hero-copy").evaluate((node) => node.getAnimations().length)).toBeGreaterThan(0);
  await expect.poll(() => folio.locator(".sh-hero-copy").evaluate((node) => node.getAnimations().length)).toBe(0);
  await expectFullInvitation(folio);

  await folio.getByRole("button", { name: /View cover/ }).click();
  await expect(open).toBeFocused();
  await expect(folio.locator("main")).toBeHidden();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(folio.locator("#sh-hero-title")).toBeFocused();
  await expect(folio.locator(".sh-program li")).toHaveCount(9);
});

test("reduced motion reveals every ceremonial detail without decorative animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const folio = await openDemo(page);
  await expect(folio).toHaveAttribute("data-motion", "reduced");
  await folio.getByRole("button", { name: /Open invitation/ }).click();
  await expect(folio.locator(".sh-cover")).toHaveCount(0);
  await expect(folio.locator("#sh-hero-title")).toBeFocused();
  await expectFullInvitation(folio);
  await folio.locator(".sh-program li").last().scrollIntoViewIfNeeded();
  expect(await folio.evaluate((node) => node.getAnimations({ subtree: true }).length)).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
