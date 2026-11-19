import { test } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = path.resolve(__dirname, "../../../../docs/uxui/phase11-1-gemini-event-creation-2026-11-19/evidence/screenshots");

const TEST_TOKEN = [
  "eyJhbGciOiJub25lIn0",
  "eyJleHAiOjQxMDIyNjg4MDB9",
  "",
].join(".");

const mockTemplate = {
  id: 30,
  code: "event-essential",
  slug: "event-essential",
  name: "Event Essential",
  category: "MINIMALIST",
  status: "ACTIVE",
  premium: false,
  price: 0,
  currency: "USD",
  thumbnailUrl: "/templates/event-essential.svg",
  supportedEventTypes: ["WEDDING", "ENGAGEMENT", "BIRTHDAY", "ANNIVERSARY", "CORPORATE", "OTHER"],
  supportedLanguages: ["KH", "EN", "BOTH"],
};

const mockCelestial = {
  id: 50,
  code: "khmer-celestial",
  slug: "khmer-celestial",
  name: "Khmer Celestial",
  category: "TRADITIONAL",
  status: "ACTIVE",
  premium: false,
  price: 0,
  currency: "USD",
  thumbnailUrl: "/templates/khmer-celestial.svg",
  supportedEventTypes: ["WEDDING"],
  supportedLanguages: ["KH", "BOTH"],
};

async function establishUserSession(page, { userId = 7, lang = "en", theme = "light", draft = null } = {}) {
  await page.addInitScript(({ token, userId, lang, theme, draft }) => {
    const authEnvelope = JSON.stringify({
      accessToken: token,
      tokenType: "Bearer",
      expiresAt: "2100-01-01T00:00:00Z",
      user: { id: userId, fullName: "Audit Host", email: "host@example.test", role: "HOST" },
    });
    window.sessionStorage.setItem("koupreng.auth", authEnvelope);
    window.localStorage.setItem("koupreng.auth", authEnvelope);
    window.localStorage.setItem("koupreng.lang", lang);
    window.localStorage.setItem("theme", theme);
    window.localStorage.setItem("koupreng.colorMode", theme);
    if (draft) {
      window.sessionStorage.setItem(`koupreng.onboarding.${userId}`, JSON.stringify(draft));
    }
  }, { token: TEST_TOKEN, userId, lang, theme, draft });
}

function setupMockApis(page) {
  return page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();

    if (path.includes("/templates/recommendations")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            { template: mockTemplate, styleMatch: true },
            { template: mockCelestial, styleMatch: false },
          ],
        }),
      });
    }

    if (path === "/api/v1/templates" && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [mockTemplate, mockCelestial] }),
      });
    }

    if (path.includes("/subscriptions/current")) {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: null }) });
    }

    if (path.includes("/template-access")) {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { hasAccess: true } }) });
    }

    if (path === "/api/v1/invitations" && method === "POST") {
      const body = route.request().postDataJSON();
      return route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          data: { id: 888, title: body?.title || "Created Event", eventType: body?.eventType || "WEDDING", visibility: "PRIVATE" },
        }),
      });
    }

    if (path.includes("/cover") && method === "POST") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { id: 1, fileUrl: "https://example.com/cover.jpg" } }) });
    }

    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: {} }) });
  });
}

test.describe("Phase 11.1 Screenshot Matrix Captures", () => {
  test("capture desktop 1440x900 4 steps in English", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await establishUserSession(page);
    await setupMockApis(page);

    await page.goto("/app/events/new");
    await page.waitForLoadState("networkidle");

    // Step 1: Type
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01-wizard-step1-type-desktop-en.png"), fullPage: false });

    // Step 2: Essentials
    await page.getByRole("button", { name: "Next: Event essentials" }).click();
    await page.locator("#event-title").fill("Kosal & Bopha Wedding");
    await page.locator("#event-groomName").fill("Kosal");
    await page.locator("#event-brideName").fill("Bopha");
    await page.locator("#event-eventDate").fill("2026-12-18");
    await page.locator("#event-eventTime").fill("17:00");
    await page.locator("#event-venueName").fill("Grand Ballroom");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02-wizard-step2-essentials-desktop-en.png"), fullPage: false });

    // Step 3: Design
    await page.getByRole("button", { name: "Next: Choose design" }).click();
    await page.getByRole("button", { name: "Select Event Essential" }).click();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03-wizard-step3-design-desktop-en.png"), fullPage: false });

    // Step 4: Review
    await page.getByRole("button", { name: "Next: Review & create" }).click();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04-wizard-step4-review-desktop-en.png"), fullPage: false });
  });

  test("capture mobile 393x851 viewports", async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });
    await establishUserSession(page);
    await setupMockApis(page);

    await page.goto("/app/events/new");
    await page.waitForLoadState("networkidle");

    // Mobile Step 1
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05-wizard-mobile-step1-type-393.png"), fullPage: false });

    // Mobile Step 2
    await page.getByRole("button", { name: "Next: Event essentials" }).click();
    await page.locator("#event-title").fill("Mobile Celebration");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "06-wizard-mobile-step2-essentials-393.png"), fullPage: false });

    // Mobile Step 4
    await page.getByRole("button", { name: /Review & Create/ }).click();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "07-wizard-mobile-step4-review-393.png"), fullPage: false });
  });

  test("capture narrow mobile 320x568 and landscape 844x390", async ({ page }) => {
    await establishUserSession(page);
    await setupMockApis(page);

    // Narrow 320
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/app/events/new");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "08-wizard-narrow-step1-320.png"), fullPage: false });

    // Landscape 844x390
    await page.setViewportSize({ width: 844, height: 390 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "09-wizard-landscape-844x390.png"), fullPage: false });
  });

  test("capture authentic Khmer localization desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await establishUserSession(page, { lang: "km" });
    await setupMockApis(page);

    await page.goto("/app/events/new");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "10-wizard-khmer-step1-desktop.png"), fullPage: false });

    await page.getByRole("button", { name: /ទៅកាន់ព័ត៌មានកម្មវិធី/ }).click();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "11-wizard-khmer-step2-desktop.png"), fullPage: false });
  });

  test("capture dark mode desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await establishUserSession(page, { theme: "dark" });
    await setupMockApis(page);

    await page.goto("/app/events/new");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "12-wizard-dark-mode-desktop.png"), fullPage: false });
  });

  test("capture upload failure retry banner and draft photo notice", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await setupMockApis(page);

    // Draft photo notice
    await establishUserSession(page, {
      draft: {
        type: "WEDDING",
        form: { title: "Restored Draft Wedding", venueName: "Sofitel" },
        requestId: "photo-notice-req",
      },
    });

    await page.goto("/app/events/new");
    await page.getByRole("button", { name: "Next: Event essentials" }).click();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "14-wizard-draft-photo-notice.png"), fullPage: false });

    // Validation error focus
    await page.locator("#event-title").fill("");
    await page.getByRole("button", { name: /Review & Create/ }).click();
    await page.locator(".event-create-actions button.primary").click();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "15-wizard-validation-error-focus.png"), fullPage: false });
  });

  test("capture upload failure retry banner state", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await establishUserSession(page, {
      draft: {
        type: "WEDDING",
        form: { title: "Retry Flow Event", groomName: "Dara", brideName: "Chenda", eventDate: "2026-12-25", eventTime: "18:00", venueName: "Hotel" },
        requestId: "retry-banner-req",
        pendingEventId: 777,
      },
    });
    await setupMockApis(page);

    await page.goto("/app/events/new");
    await page.getByRole("button", { name: /Review & Create/ }).click();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "13-wizard-upload-failure-retry-banner.png"), fullPage: false });
  });
});
