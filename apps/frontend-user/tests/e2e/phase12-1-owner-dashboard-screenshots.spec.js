import { test } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = path.resolve(__dirname, "../../../../docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/evidence/screenshots");

const TEST_TOKEN = [
  "eyJhbGciOiJub25lIn0",
  "eyJleHAiOjQxMDIyNjg4MDB9",
  "",
].join(".");

const mockServerEvents = [
  {
    id: 42,
    title: "Vannak & Kolab Royal Wedding",
    groomName: "Vannak",
    brideName: "Kolab",
    eventType: "WEDDING",
    eventDate: "2027-11-28",
    eventTime: "17:00",
    venueName: "Sokha Hotel Grand Ballroom",
    status: "PUBLISHED",
    slug: "vannak-kolab-2027",
    coverUrl: "/templates/royal-garden.svg",
    templateThumbnailUrl: "/templates/royal-garden.svg",
    createdAt: "2026-11-01T10:00:00Z",
    updatedAt: "2026-11-18T15:30:00Z",
  },
  {
    id: 105,
    title: "Channary 30th Birthday Gala",
    celebrantName: "Channary",
    eventType: "BIRTHDAY",
    eventDate: "2027-04-12",
    eventTime: "18:30",
    venueName: "Rosewood Phnom Penh",
    status: "DRAFT",
    slug: "channary-30th",
    coverUrl: "/templates/event-essential.svg",
    templateThumbnailUrl: "/templates/event-essential.svg",
    createdAt: "2026-11-10T12:00:00Z",
    updatedAt: "2026-11-15T09:00:00Z",
  },
  {
    id: 201,
    title: "Piseth Tech Leadership Summit",
    eventType: "CORPORATE",
    eventDate: "2027-08-20",
    eventTime: "09:00",
    venueName: "Koh Pich Convention Center",
    status: "PUBLISHED",
    shared: true,
    ownerName: "Piseth Tech Ltd",
    slug: "tech-leadership-2027",
    coverUrl: "/templates/bliss-editorial.svg",
    templateThumbnailUrl: "/templates/bliss-editorial.svg",
    createdAt: "2026-11-05T08:00:00Z",
    updatedAt: "2026-11-12T14:00:00Z",
  },
];

async function establishUserSession(page, { userId = 7, lang = "en", theme = "light", drafts = [] } = {}) {
  await page.addInitScript(({ token, userId, lang, theme, drafts }) => {
    const authEnvelope = JSON.stringify({
      accessToken: token,
      tokenType: "Bearer",
      expiresAt: "2100-01-01T00:00:00Z",
      user: { id: userId, fullName: "Audit Owner", email: "owner@example.test", role: "HOST" },
    });
    window.sessionStorage.setItem("koupreng.auth", authEnvelope);
    window.localStorage.setItem("koupreng.auth", authEnvelope);
    window.localStorage.setItem("koupreng.lang", lang);
    window.localStorage.setItem("theme", theme);
    window.localStorage.setItem("koupreng.colorMode", theme);

    if (drafts && drafts.length > 0) {
      window.localStorage.setItem("weddingDrafts", JSON.stringify(drafts));
    } else {
      window.localStorage.removeItem("weddingDrafts");
    }
  }, { token: TEST_TOKEN, userId, lang, theme, drafts });
}

function setupMockApis(page, { emptyEvents = false } = {}) {
  return page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();

    if (path.includes("/invitations/my") || path.includes("/invitations/mine") || (path === "/api/v1/invitations" && method === "GET")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(emptyEvents ? [] : mockServerEvents),
      });
    }

    if (path === "/api/v1/invitations/42" && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockServerEvents[0]),
      });
    }

    if (path === "/api/v1/invitations/201" && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockServerEvents[2]),
      });
    }

    if (path.includes("/invitations/42/access")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          owner: true,
          role: "OWNER",
          canManage: true,
          permissions: ["VIEW_EVENT", "EDIT_EVENT", "MANAGE_SETTINGS", "MANAGE_INVITATION", "MANAGE_GUESTS", "MANAGE_BUDGET"],
          ownerFeatures: ["QR_INVITATIONS", "CUSTOM_DOMAIN"],
        }),
      });
    }

    if (path.includes("/invitations/201/access")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          owner: false,
          role: "VIEWER",
          canManage: false,
          permissions: ["VIEW_EVENT"],
          ownerFeatures: [],
        }),
      });
    }

    if (path.includes("/reports/invitations/42/dashboard")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          totalGuests: 250,
          totalInvited: 250,
          attending: 185,
          declined: 15,
          pending: 50,
          rsvpRate: 74,
          checkedInCount: 120,
        }),
      });
    }

    if (path.includes("/budget/items")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { id: 1, category: "Venue & Catering", actualCost: 3500, estimatedCost: 4000, currency: "USD" },
          { id: 2, category: "Traditional Music", actualCost: 2000000, estimatedCost: 2500000, currency: "KHR" },
          { id: 3, category: "Floral & Decor", actualCost: 1500, estimatedCost: 1500, currency: "USD" },
        ]),
      });
    }

    if (path.includes("/planning/gifts")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { id: 1, guestName: "Lok Chumteav Bopha", amount: 200, currency: "USD" },
          { id: 2, guestName: "Oknha Rithy", amount: 800000, currency: "KHR" },
          { id: 3, guestName: "Meng & Srey", amount: 100, currency: "USD" },
        ]),
      });
    }

    if (path.includes("/guests/check-in/summary")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          totalCheckedIn: 120,
          checkedIn: 120,
        }),
      });
    }

    if (path.includes("/notifications/invitation")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { id: 1, title: "RSVP Accepted", message: "Visal confirmed attendance.", createdAt: "2026-11-18T14:20:00Z" },
          { id: 2, title: "Gift Received", message: "Lok Chumteav Bopha sent $200.", createdAt: "2026-11-18T15:00:00Z" },
        ]),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: {} }),
    });
  });
}

const sampleDrafts = [
  {
    id: "wed-local-offline-1",
    title: "Dara & Rathana Riverside Wedding",
    eventType: "WEDDING",
    status: "DRAFT",
    syncStatus: "LOCAL_ONLY",
    isLocal: true,
    eventDate: "2027-05-15",
    eventTime: "16:30",
    venueName: "Sofitel Phnom Penh Phokeethra",
    updatedAt: "2026-11-19T08:00:00Z",
  },
  {
    id: "wed-sync-failed-1",
    title: "Sreypov Golden Anniversary",
    eventType: "ANNIVERSARY",
    status: "DRAFT",
    syncStatus: "SYNC_FAILED",
    eventDate: "2027-06-20",
    eventTime: "18:00",
    venueName: "Hyatt Regency Phnom Penh",
    updatedAt: "2026-11-17T11:00:00Z",
  },
];

test.describe("Phase 12.1 Owner Dashboard & Event Management Visual Matrix", () => {
  test("01-05: Events list across 5 viewports in English", async ({ page }) => {
    // Desktop (1440x900)
    await page.setViewportSize({ width: 1440, height: 900 });
    await establishUserSession(page, { drafts: sampleDrafts, lang: "en" });
    await setupMockApis(page);

    await page.goto("/app/events");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01-events-list-desktop-1440-en.png"), fullPage: false });

    // Mobile (393x851)
    await page.setViewportSize({ width: 393, height: 851 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02-events-list-mobile-393-en.png"), fullPage: false });

    // Tablet (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03-events-list-tablet-768-en.png"), fullPage: false });

    // Narrow Mobile (320x568)
    await page.setViewportSize({ width: 320, height: 568 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04-events-list-narrow-320-en.png"), fullPage: false });

    // Landscape Mobile (844x390)
    await page.setViewportSize({ width: 844, height: 390 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05-events-list-landscape-844-en.png"), fullPage: false });
  });

  test("06: Events list Desktop in Khmer", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await establishUserSession(page, { drafts: sampleDrafts, lang: "km" });
    await setupMockApis(page);

    await page.goto("/app/events");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "06-events-list-khmer-desktop-1440.png"), fullPage: false });
  });

  test("07-09: Inline Calendar Month, Agenda & Mobile Khmer", async ({ page }) => {
    // 07: Month view Desktop 1440
    await page.setViewportSize({ width: 1440, height: 900 });
    await establishUserSession(page, { drafts: sampleDrafts, lang: "en" });
    await setupMockApis(page);

    await page.goto("/app/events?view=calendar");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "07-events-calendar-month-desktop-1440-en.png"), fullPage: false });

    // 08: Agenda view Desktop 1440
    await page.getByRole("button", { name: "Agenda" }).click();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "08-events-calendar-agenda-desktop-1440-en.png"), fullPage: false });

    // 09: Mobile Khmer Calendar
    await page.setViewportSize({ width: 393, height: 851 });
    await establishUserSession(page, { drafts: sampleDrafts, lang: "km" });
    await page.goto("/app/events?view=calendar");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "09-events-calendar-mobile-393-km.png"), fullPage: false });
  });

  test("10-11: Empty State & Search Filtering", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // 10: Empty State
    await establishUserSession(page, { drafts: [], lang: "en" });
    await setupMockApis(page, { emptyEvents: true });
    await page.goto("/app/events");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "10-events-empty-state-desktop-1440-en.png"), fullPage: false });

    // 11: Search query filtering
    await establishUserSession(page, { drafts: sampleDrafts, lang: "en" });
    await setupMockApis(page);
    await page.goto("/app/events?q=Vannak");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "11-events-search-filter-desktop-1440-en.png"), fullPage: false });
  });

  test("12-14: Owner Workspace Dashboard", async ({ page }) => {
    // 12: Desktop 1440 English
    await page.setViewportSize({ width: 1440, height: 900 });
    await establishUserSession(page, { lang: "en" });
    await setupMockApis(page);

    await page.goto("/app/events/42");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "12-workspace-dashboard-desktop-1440-en.png"), fullPage: false });

    // 13: Mobile 393 English
    await page.setViewportSize({ width: 393, height: 851 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "13-workspace-dashboard-mobile-393-en.png"), fullPage: false });

    // 14: Desktop 1440 Khmer
    await page.setViewportSize({ width: 1440, height: 900 });
    await establishUserSession(page, { lang: "km" });
    await page.goto("/app/events/42");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "14-workspace-dashboard-khmer-1440.png"), fullPage: false });
  });

  test("15-16: Workspace Permissions & Mobile Navigation Drawer", async ({ page }) => {
    // 15: Shared non-owner workspace
    await page.setViewportSize({ width: 1440, height: 900 });
    await establishUserSession(page, { lang: "en" });
    await setupMockApis(page);

    await page.goto("/app/events/201");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "15-workspace-permission-denied-desktop-en.png"), fullPage: false });

    // 16: Mobile drawer opened
    await page.setViewportSize({ width: 393, height: 851 });
    await page.goto("/app/events/42");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Toggle modules menu" }).click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "16-workspace-mobile-drawer-393-en.png"), fullPage: false });
  });
});
