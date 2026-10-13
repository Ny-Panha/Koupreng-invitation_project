import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const widths = [320, 360, 375, 390, 430, 768, 1024, 1440];
const portrait = "/templates/silk-heritage/portrait.webp";
const together = "/templates/silk-heritage/together.webp";
const catalog = [{ id: 75, code: "silk-heritage", name: "Silk Heritage", status: "ACTIVE", category: "TRADITIONAL", thumbnailUrl: "/templates/silk-heritage/preview.svg", premium: false, price: 0, currency: "USD", description: JSON.stringify({ presetId: "SILK_HERITAGE", coverImage: portrait, primaryColor: "#672C39", secondaryColor: "#B39460", backgroundColor: "#F6F0E5" }) }];
const invitation = (languageMode = "KH") => ({ id: 44, slug: "silk-test", status: "PUBLISHED", templateCode: "silk-heritage", languageMode, guest: { guestName: "លោក សំណាង និងក្រុមគ្រួសារ" }, coverUrl: portrait, enabledSections: JSON.stringify({ rsvp: true, schedule: true, gallery: true, map: true, countdown: false, story: true, dressCode: false, gift: false, faq: false, music: false }), contentJson: JSON.stringify({ couple: { groom: "សុវណ្ណ សុវណ្ណមង្គលសិរីសួស្តី", bride: "សុភា សុភាមង្គលសិរីសួស្តី", groomEn: "Sovann", brideEn: "Sophea", groomParents: ["លោកឪពុក", "អ្នកម្ដាយ"] }, event: { date: "2026-11-28", receptionTime: "17:00", venueName: "សាលមង្គល / Celebration hall", venueAddress: "ភ្នំពេញ / Phnom Penh", mapLink: "https://www.google.com/maps/search/?api=1&query=Phnom+Penh" }, coverImage: portrait, messageText: "សូមគោរពអញ្ជើញ លោក លោកស្រី និងក្រុមគ្រួសារ ចូលរួមក្នុងពិធីមង្គលការរបស់យើងខ្ញុំ។", schedule: [{ id: "welcome", time: "17:00", title: "ទទួលភ្ញៀវកិត្តិយស", titleEn: "Guest welcome" }, { id: "reception", time: "18:00", title: "ពិធីជប់លៀងមង្គលការ", titleEn: "Wedding reception" }], storyChapters: [{ id: "one", title: "រឿងរ៉ាវរបស់យើង", text: "យើងរីករាយនឹងវត្តមានរបស់លោកអ្នក។" }], thankYouText: "អរគុណចំពោះវត្តមានរបស់លោកអ្នក។" }), designJson: JSON.stringify({ presetId: "SILK_HERITAGE", gallery: [{ src: portrait, alt: "Couple holding hands", caption: "A moment together" }, { src: together, alt: "Newlyweds in a garden", caption: "Our wedding day" }] }) });
const json = (route, data, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(status >= 400 ? { message: data } : { data }) });
async function mockPublic(page, { language = "KH", rsvpError = false } = {}) {
  let posts = 0;
  await page.route("**/api/**", (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/api/v1/templates") return json(route, catalog);
    if (url.pathname.includes("/templates/slug/")) return json(route, catalog[0]);
    if (url.pathname.endsWith("/silk-test")) return json(route, invitation(language));
    if (url.pathname.endsWith("/guest-view")) return json(route, { guestName: "លោក សំណាង និងក្រុមគ្រួសារ", rsvpStatus: "PENDING", seatCount: 1 });
    if (url.pathname.includes("/rsvp") && route.request().method() === "POST") {
      posts++;
      if (rsvpError && posts === 1) return json(route, "Please try your RSVP again", 503);
      return json(route, { id: 92, guestName: "Guest", responseStatus: "ATTENDING", attendeeCount: 1 });
    }
    if (url.pathname.endsWith("/wishes")) return json(route, []);
    if (url.pathname.endsWith("/media")) return json(route, {});
    return json(route, [], 200);
  });
}

for (const width of widths) {
  test(`published Khmer folio fits ${width}px and keeps primary targets usable`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await mockPublic(page);
    await page.goto("/w/silk-test?token=fixture-guest-token");
    const open = page.getByRole("button", { name: "បើកសំបុត្រអញ្ជើញ", exact: true });
    await expect(open).toBeVisible();
    await expect(page.getByText("លោក សំណាង និងក្រុមគ្រួសារ", { exact: true }).first()).toBeVisible();
    const bounds = await open.boundingBox();
    expect(bounds.height).toBeGreaterThanOrEqual(44);
    expect(bounds.width).toBeGreaterThanOrEqual(44);
    await expect(page.locator(".chat-toggle-btn")).toHaveCount(0);
    await open.focus(); await page.keyboard.press("Enter");
    await expect(page.locator("#sh-hero-title")).toBeFocused();
    await expect(page.locator("#sh-program-title")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.locator(".tpl-silk-heritage").evaluate((node) => [...node.querySelectorAll('h1,h2,h3,p,a,button,input,select,textarea')].filter((n) => n.getClientRects().length && n.getBoundingClientRect().width > 0).every((n) => n.scrollWidth <= n.clientWidth + 2))).toBe(true);
    await mkdir("../../docs/qa/silk-heritage/screenshots", { recursive: true });
    if (info.project.name === "desktop-chromium") await page.screenshot({ path: `../../docs/qa/silk-heritage/screenshots/published-${width}.png`, fullPage: true });
  });
}

test("photo album traps focus, navigates and returns focus to its trigger", async ({ page }) => {
  await mockPublic(page, { language: "EN" });
  await page.goto("/w/silk-test");
  await page.getByRole("button", { name: "Skip opening", exact: true }).click();
  const trigger = page.getByRole("button", { name: "View photo: Couple holding hands", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Photo album" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(dialog.getByRole("img", { name: "Newlyweds in a garden" })).toBeVisible();
  await page.keyboard.press("Tab");
  expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("authorized RSVP reports API failure then confirmed success without changing its token", async ({ page }) => {
  await mockPublic(page, { language: "EN", rsvpError: true });
  await page.goto("/w/silk-test?token=fixture-guest-token");
  await page.getByRole("button", { name: "Skip opening", exact: true }).click();
  const requestPromise = page.waitForRequest((request) => request.method() === "POST" && request.url().includes("/guests/fixture-guest-token/rsvp"));
  await page.getByRole("button", { name: "Submit RSVP", exact: true }).click();
  const request = await requestPromise;
  expect(request.postDataJSON().responseStatus).toBe("ATTENDING");
  await expect(page.getByRole("alert")).toHaveText("Please try your RSVP again");
  await expect(page.getByText("RSVP received", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Submit RSVP", exact: true }).click();
  await expect(page.getByText("RSVP received", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/token=fixture-guest-token/);
});

test("offline artwork remains readable in landscape", async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.route("**/api/**", (route) => json(route, [], 404));
  await page.route("**/*.webp", (route) => route.abort());
  await page.goto("/templates/silk-heritage");
  await page.getByRole("button", { name: /Skip opening/ }).click();
  await expect(page.locator(".sh-hero-photo .sh-photo-fallback")).toBeVisible();
  await expect(page.locator("#sh-program-title")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("live catalog honors empty state instead of selling offline templates", async ({ page }) => {
  await page.route("**/api/**", (route) => json(route, []));
  await page.goto("/templates");
  await expect(page.locator(".tp-grid .tp-card-name")).toHaveCount(0);
  await expect(page.locator(".tp-catalog-status")).toBeVisible();
});

test("unknown template slugs show recovery instead of an unrelated design", async ({ page }) => {
  await page.route("**/api/**", (route) => json(route, "Not found", 404));
  await page.goto("/templates/unknown-folio");
  await expect(page.getByRole("heading", { name: /Template unavailable/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Browse templates/ })).toHaveAttribute("href", "/templates");
});

test("the public demo keeps the selected design in its login destination", async ({ page }) => {
  await mockPublic(page);
  await page.goto("/templates/silk-heritage");
  const link = page.locator('.sh-toolbar a[href^="/login"]');
  await expect(link).toHaveAttribute("href", /template%3Dsilk-heritage/);
  await link.click();
  await expect(page).toHaveURL(/\/login\?next=/);
});

test("folio opening reveals the page and can be skipped while its leaves move", async ({ page }) => {
  await mockPublic(page, { language: "EN" });
  await page.goto("/w/silk-test");
  await page.getByRole("button", { name: "Open invitation", exact: true }).click();
  await expect(page.locator(".sh-cover.is-opening")).toBeVisible();
  await page.getByRole("button", { name: "Skip opening", exact: true }).click();
  await expect(page.locator(".sh-cover")).toHaveCount(0);
  await expect(page.locator("#sh-hero-title")).toBeFocused();
  await expect(page.locator("#sh-program-title")).toBeVisible();
});
