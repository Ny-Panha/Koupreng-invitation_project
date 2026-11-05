import { expect, test } from "@playwright/test";
import { installPhase4Fixtures } from "./support/phase4Fixtures.js";
import AxeBuilder from "@axe-core/playwright";

const aliases = [
  ["/dashboard", "/app/events"], ["/dashboard/events", "/app/events"], ["/dashboard/invitations", "/app/events"],
  ["/events", "/app/events"], ["/event/list", "/app/events"], ["/dashboard/share", "/app/events?module=delivery"],
  ["/dashboard/guests", "/app/events?module=guests"], ["/dashboard/rsvp", "/app/events?module=rsvp"],
  ["/dashboard/check-in", "/app/events?module=check-in"], ["/dashboard/delivery", "/app/events?module=delivery"],
  ["/dashboard/invitations/local-draft", "/app/events"], ["/dashboard/invitations/101", "/app/events/101"],
  ...["guests", "rsvp", "delivery", "check-in", "qr", "wishes", "reports", "budget", "seating", "media"].map(module => [`/dashboard/invitations/101/${module}`, `/app/events/101/${module}`]),
  ["/profile", "/app/profile"], ["/dashboard/profile", "/app/profile"], ["/dashboard/payments", "/app/payments"],
];

test("legacy destinations preserve event identity and resolve real page content", async ({ page }, info) => {
  test.setTimeout(180_000);
  await installPhase4Fixtures(page, { count: 2 });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const [source, target] of aliases) {
    await page.goto(source);
    await expect(page).toHaveURL(`http://127.0.0.1:4173${target}`);
    if (target.startsWith("/app/events/101")) await expect(page.locator("#event-module-content")).toBeVisible();
    else await expect(page.getByRole("heading").first()).toBeVisible();
  }
  expect(errors).toEqual([]);
  await info.attach("legacy-destinations", { body: JSON.stringify(aliases), contentType: "application/json" });
});

test("personalized delivery deep link keeps selected guest, drops credentials and survives reload/history", async ({ page }) => {
  await installPhase4Fixtures(page, { count: 2 });
  await page.goto("/dashboard/invitations/101/delivery?guestId=501&token=discard-fixture&password=discard-fixture#recipients");
  await expect(page).toHaveURL("http://127.0.0.1:4173/app/events/101/delivery?guestId=501#recipients");
  await expect(page.getByRole("heading", { name: "Recipients", exact: true })).toBeVisible();
  await expect(page.getByRole("checkbox", { name: /Review Guest 1/ })).toBeChecked();
  await page.reload();
  await expect(page.getByRole("checkbox", { name: /Review Guest 1/ })).toBeChecked();
  await page.goto("/app/events"); await page.goBack();
  await expect(page.getByRole("heading", { name: "Recipients", exact: true })).toBeVisible();
  await page.goForward(); await expect(page).toHaveURL(/\/app\/events$/);
});

test("copying a link leaves the server delivery state unchanged", async ({ page, context }) => {
  await installPhase4Fixtures(page, { count: 2 });
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const writes = [];
  page.on("request", request => { if (request.url().includes("mark-shared")) writes.push(request.url()); });
  await page.goto("/app/events/101/delivery");
  await page.getByRole("button", { name: "Copy link: Review Guest 1", exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("review-501");
  expect(writes).toEqual([]);
  await expect(page.getByRole("row", { name: /Review Guest 1/ })).toContainText("Not sent");
});

for (const lang of ["en", "kh"]) {
  test(`delivery reflows at seven widths with ${lang} copy and accessible controls`, async ({ page }, info) => {
    test.setTimeout(90_000);
    await installPhase4Fixtures(page, { count: 2, lang });
    await page.goto("/app/events/101/delivery");
    await expect(page.locator(".delivery-workspace h1")).toBeVisible();
    for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      if (width <= 1024) {
        const menu = page.locator(".host-hamburger-btn");
        await expect(menu).toBeVisible();
        const bounds = await menu.boundingBox();
        expect(bounds.width).toBeGreaterThanOrEqual(44);
        expect(bounds.height).toBeGreaterThanOrEqual(44);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
      }
      if (info.project.name === "desktop-chromium") await page.screenshot({ path: info.outputPath(`delivery-${lang}-${width}.png`), fullPage: true });
    }
    const results = await new AxeBuilder({ page }).include(".delivery-workspace").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations).toEqual([]);
    const input = page.locator(".delivery-workspace input[type='search']");
    await input.focus();
    await expect(input).toBeFocused();
  });
}
