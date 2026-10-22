import { expect, test } from "@playwright/test";
import { installOverhaulFixtures } from "./support/overhaulFixtures.js";
import { uxEvents } from "./support/uxFixtures.js";
import { fixtures as installStudioFixtures } from "./support/studioFixtures.js";

const nav = page => page.getByRole("navigation", { name: "Event navigation", exact: true });
const current = page => page.locator('.event-workspace-nav [aria-current="page"]');
const json = (route, data, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ data }) });
async function open(page, { width = 1440, height = 900, module = "guests", lang = "en" } = {}) {
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await installOverhaulFixtures(page, lang, { published: true });
  await page.goto(`/app/events/101${module ? `/${module}` : ""}`);
  await expect(page.locator(".event-workspace-content main").first()).toBeVisible();
}

test("expanded desktop has fixed context/footer, readable labels and one active destination", async ({ page }) => {
  await open(page);
  await expect(page.locator(".event-workspace-sidebar")).toHaveCSS("width", "276px");
  await expect(nav(page).locator("a")).toHaveCount(17);
  const paths = await nav(page).locator("a").evaluateAll(links => links.map(link => link.getAttribute("href")));
  expect(new Set(paths).size).toBe(17);
  await expect(current(page)).toHaveAccessibleName("Guests");
  await expect(current(page)).toHaveCount(1);
  const body = page.locator(".event-navigation-body");
  expect(await body.evaluate(e => e.scrollHeight > e.clientHeight)).toBe(true);
  await body.evaluate(e => { e.scrollTop = e.scrollHeight; });
  const header = await page.locator(".event-navigation-header").boundingBox();
  const footer = await page.locator(".event-navigation-footer").boundingBox();
  expect(header.y).toBeGreaterThanOrEqual(80);
  expect(footer.y + footer.height).toBeLessThanOrEqual(900);
  await expect(page.getByLabel("Switch event", { exact: true })).toBeInViewport();
  await expect(page.getByRole("button", { name: "Collapse navigation", exact: true })).toBeInViewport();
});

test("collapsed rail exposes every destination and keyboard tooltips; preference survives refresh", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "Collapse navigation", exact: true }).click();
  await expect(page.locator(".event-workspace-sidebar")).toHaveCSS("width", "72px");
  for (const link of await nav(page).getByRole("link").all()) {
    await link.focus();
    await expect(page.getByRole("tooltip")).toHaveText(await link.getAttribute("aria-label"));
    await expect(link).toBeInViewport();
  }
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("button", { name: "Expand navigation", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Expand navigation", exact: true }).click();
  await expect(page.getByLabel("Switch event", { exact: true })).toBeVisible();
});

test("active groups reveal deep links while other group choices survive route history", async ({ page }) => {
  await open(page, { module: "settings" });
  await expect(page.getByRole("button", { name: "More", exact: true })).toHaveAttribute("aria-expanded", "true");
  await expect(current(page)).toHaveAccessibleName("Settings");
  const invitation = nav(page).getByRole("button", { name: "Invitation", exact: true });
  await invitation.click();
  await expect(invitation).toHaveAttribute("aria-expanded", "false");
  await nav(page).getByRole("link", { name: "Guests", exact: true }).click();
  await expect(current(page)).toHaveAccessibleName("Guests");
  await page.goBack();
  await expect(current(page)).toHaveAccessibleName("Settings");
  await expect(invitation).toHaveAttribute("aria-expanded", "false");
  await page.goForward();
  await expect(current(page)).toHaveAccessibleName("Guests");
  await expect(invitation).toHaveAttribute("aria-expanded", "false");
});

test("laptop defaults to rail, tablet uses a drawer without squeezing content", async ({ page }) => {
  await open(page, { width: 1366, height: 768 });
  await expect(page.getByRole("button", { name: "Expand navigation", exact: true })).toBeVisible();
  await page.setViewportSize({ width: 768, height: 650 });
  await expect(page.locator(".event-workspace-sidebar")).toHaveCount(0);
  const content = await page.locator(".event-workspace-content").boundingBox();
  expect(content.width).toBeGreaterThan(720);
  await page.getByRole("button", { name: "Toggle modules menu" }).click();
  await expect(page.getByRole("dialog", { name: "Event navigation" })).toBeVisible();
});

test("mobile drawer traps focus, isolates background and restores focus on Escape", async ({ page }) => {
  await open(page, { width: 390, height: 844 });
  const menu = page.getByRole("button", { name: "Toggle modules menu" });
  await menu.click();
  const dialog = page.getByRole("dialog", { name: "Event navigation" });
  await expect(current(page)).toBeFocused();
  expect(await page.locator("#root").evaluate(e => e.inert)).toBe(true);
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  const back = dialog.getByRole("link", { name: "Back to My Events", exact: true });
  await back.focus(); await page.keyboard.press("Tab");
  await expect(dialog.getByRole("button", { name: "Close event navigation" })).toBeFocused();
  await page.keyboard.press("Shift+Tab"); await expect(back).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0); await expect(menu).toBeFocused();
  expect(await page.locator("#root").evaluate(e => e.inert)).toBe(false);
});

test("mobile close control, scrim and destination click dismiss navigation", async ({ page }) => {
  await open(page, { width: 375, height: 667 });
  const menu = page.getByRole("button", { name: "Toggle modules menu" });
  await menu.click(); await page.getByRole("button", { name: "Close event navigation" }).click();
  await expect(menu).toBeFocused();
  await menu.click(); await page.locator(".event-navigation-backdrop").click({ position: { x: 360, y: 300 } });
  await expect(page.getByRole("dialog")).toHaveCount(0); await expect(menu).toBeFocused();
  await menu.click(); await nav(page).getByRole("link", { name: "RSVP", exact: true }).click();
  await expect(page).toHaveURL(/\/101\/rsvp$/); await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("event switch preserves the module and reloads verified identity without stale guests", async ({ page }) => {
  await open(page);
  const engagement = { ...uxEvents[1], title: "Engagement B", eventType: "ENGAGEMENT" };
  await page.route("**/api/v1/invitations/my", route => json(route, [uxEvents[0], engagement]));
  await page.route("**/api/v1/invitations/102", route => json(route, engagement));
  await page.route("**/api/v1/invitations/102/guests", route => json(route, [{ id: 502, guestName: "Guest B", seatCount: 1 }]));
  await page.reload();
  await page.getByLabel("Switch event", { exact: true }).selectOption("102");
  await expect(page).toHaveURL(/\/102\/guests$/);
  await expect(current(page)).toHaveAttribute("href", "/app/events/102/guests");
  await expect(page.getByLabel("Switch event", { exact: true }).locator("option:checked")).toHaveText("Engagement B");
  await expect(page.getByText("Guest B", { exact: true })).toBeVisible();
  await expect(page.getByText("Sokha", { exact: true })).toHaveCount(0);
});

test("short Khmer drawer keeps identity and footer visible with a scrollable body", async ({ page }) => {
  await open(page, { width: 320, height: 568, lang: "km" });
  const title = "សិរីមង្គលអាពាហ៍ពិពាហ៍របស់សុខ និងស្រីពេជ្រ ជាមួយក្រុមគ្រួសារជាទីស្រឡាញ់";
  await page.route("**/api/v1/invitations/101", route => json(route, { ...uxEvents[0], title }));
  await page.reload(); await page.locator(".event-mobile-nav-toggle").click();
  const dialog = page.getByRole("dialog");
  expect((await dialog.boundingBox()).width).toBe(288);
  const body = page.locator(".event-navigation-body");
  await body.evaluate(e => { e.scrollTop = e.scrollHeight; });
  const footer = await page.locator(".event-navigation-footer").boundingBox();
  expect(footer.y + footer.height).toBeLessThanOrEqual(568);
  await expect(page.locator(".event-switcher-select")).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
});

test("reduced motion disables shell transitions and modal entry", async ({ page }) => {
  await open(page, { width: 390 }); await page.locator(".event-mobile-nav-toggle").click();
  for (const selector of [".event-navigation-dialog", ".event-navigation-backdrop"]) {
    await expect(page.locator(selector)).toHaveCSS("animation-name", "none");
  }
});

test("denied owner route never mounts navigation or requests private module data", async ({ page }) => {
  const requests = [];
  await installOverhaulFixtures(page);
  await page.route("**/api/v1/invitations/999**", route => { requests.push(new URL(route.request().url()).pathname); return json(route, null, 403); });
  await page.goto("/app/events/999/guests");
  await expect(page.getByRole("alert")).toContainText("Access denied");
  await expect(page.locator(".event-workspace-nav")).toHaveCount(0);
  expect(requests).toEqual(["/api/v1/invitations/999"]);
});

test("Studio navigation restores toolbar focus and preserves access to editing actions", async ({ page }) => {
  await installStudioFixtures(page); await page.goto("/app/events/101/invitation");
  await expect(page.locator(".invitation-studio")).toBeVisible();
  await page.getByRole("button", { name: "Open event navigation", exact: true }).click();
  await expect(current(page)).toHaveAccessibleName("Invitation Studio");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open event navigation", exact: true })).toBeFocused();
  // The existing editor suite verifies dirty-form save and leave confirmation in detail.
  await expect(page.getByRole("button", { name: "Save", exact: true })).toBeVisible();
});

test("responsive overview fits short viewports and effective 125/200 percent zoom widths", async ({ page }) => {
  test.setTimeout(90_000);
  await installOverhaulFixtures(page, "en", { published: true });
  for (const [width, height] of [[320,568],[375,667],[390,844],[430,844],[768,650],[1024,768],[1366,768],[1440,900],[1920,1080],[1152,720],[720,450]]) {
    await page.setViewportSize({ width, height }); await page.goto("/app/events/101");
    await expect(page.locator(".overview-hero")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    if (width >= 1024) {
      const footer = await page.locator(".event-navigation-footer").boundingBox();
      expect(footer.y + footer.height).toBeLessThanOrEqual(height);
    }
  }
});
