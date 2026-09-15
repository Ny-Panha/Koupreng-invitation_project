import { expect, test } from "@playwright/test";

const TEST_TOKEN = [
  "eyJhbGciOiJub25lIn0",
  "eyJleHAiOjQxMDIyNjg4MDB9",
  "",
].join(".");

async function establishUserSession(page) {
  await page.addInitScript(({ token }) => {
    const authEnvelope = JSON.stringify({
      accessToken: token,
      tokenType: "Bearer",
      expiresAt: "2100-01-01T00:00:00Z",
      user: { id: 7, fullName: "Audit Host", email: "host@example.test", role: "USER" },
    });
    window.sessionStorage.setItem("koupreng.auth", authEnvelope);
    window.localStorage.setItem("koupreng.auth", authEnvelope);
  }, { token: TEST_TOKEN });
}

function json(route, data, status = 200) {
  return route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify({ data }),
  });
}

test("public landing and template catalog render real content", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#root")).not.toBeEmpty();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.goto("/templates");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator('a[href*="/templates/"]').first()).toBeVisible();
});

test("user protected route redirects to the login form with next", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);
  await expect(page.locator('input[type="password"]')).toBeVisible();
  await expect(page.locator('button[type="submit"]')).toBeVisible();
});

test("public invitation route fails gracefully without a backend", async ({ page }) => {
  await page.route("**/api/**", (route) => route.fulfill({
    status: 404,
    contentType: "application/json",
    body: JSON.stringify({ message: "Not found" }),
  }));
  await page.goto("/w/nonexistent-smoke-invitation");
  await expect(page.locator("#root")).not.toBeEmpty();
  await expect(page.getByRole("heading", { name: /Invitation unavailable/i })).toBeVisible();
});

test("admin login renders and protected routes redirect", async ({ page }) => {
  await page.goto("http://127.0.0.1:4174/users");
  await expect(page).toHaveURL(/127\.0\.0\.1:4174\/login\?next=%2Fusers$/);
  await expect(page.getByRole("heading", { name: "គូព្រេង", exact: true })).toBeVisible();
  await expect(page.getByText("Admin Portal v1.0", { exact: true })).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
});

test("authenticated guest route renders server authority and RSVP state", async ({ page }, testInfo) => {
  await establishUserSession(page);
  await page.addInitScript(() => {
    window.localStorage.setItem("koupreng.host.activeEventId", "42");
    window.localStorage.setItem("koupreng:guests:42", JSON.stringify([
      { id: "local-only", name: "Stale Local Guest" },
    ]));
  });
  await page.route("**/api/**", (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/api/v1/invitations/my") {
      return json(route, [{ id: 42, title: "Dara and Sophea", status: "PUBLISHED", slug: "dara-sophea" }]);
    }
    if (url.pathname === "/api/v1/invitations/42/guests") {
      return json(route, [{
        id: 501,
        guestName: "Sokha Server Guest",
        phone: "012 345 678",
        guestGroup: "Family",
        sideType: "Groom",
        seatCount: 2,
        sendStatus: "SENT",
        inviteToken: "guest-token",
      }]);
    }
    if (url.pathname === "/api/v1/invitations/42/rsvps") {
      return json(route, [{ id: 901, guestId: 501, responseStatus: "ATTENDING", attendeeCount: 2 }]);
    }
    if (url.pathname === "/api/v1/i18n/messages") {
      return json(route, { messages: {
        kicker: "Guest Operations",
        title: "គ្រប់គ្រងភ្ញៀវកិត្តិយស",
        subtitle: "តាមដានការផ្ញើធៀប ចំនួនកៅអី និងការឆ្លើយតប RSVP ក្នុងបញ្ជីតែមួយ។",
        statTotalGuests: "ភ្ញៀវសរុប",
        statTotalSeats: "កៅអីសរុប",
        statSent: "បានផ្ញើ",
        statResponded: "បានឆ្លើយតប",
        searchPlaceholder: "ស្វែងរកឈ្មោះ ក្រុម ឬលេខទូរស័ព្ទ",
        allGroups: "គ្រប់ក្រុម",
        allCategories: "គ្រប់ប្រភេទ",
        manageGroups: "គ្រប់គ្រងក្រុម",
        manageCategories: "គ្រប់គ្រងប្រភេទ",
        importBtn: "នាំចូលបញ្ជី",
        addGuestBtn: "បន្ថែមភ្ញៀវ",
        thGuest: "ភ្ញៀវ",
        thPhone: "ទូរស័ព្ទ",
        thGroup: "ក្រុម",
        thCategory: "ប្រភេទ",
        thSeats: "កៅអី",
        thStatus: "ស្ថានភាព",
        thActions: "សកម្មភាព",
        showQr: "បង្ហាញ QR",
        copyLink: "ចម្លងតំណ",
        edit: "កែប្រែ",
        delete: "លុប",
      } });
    }
    return json(route, { message: "Not found" }, 404);
  });

  await page.goto("/dashboard/invitations/42/guests");
  const visibleGuestSurface = page.locator(
    ".pe-desktop-table-wrap:visible, .pe-mobile-cards-wrap:visible",
  );
  await expect(visibleGuestSurface.getByText("Sokha Server Guest")).toBeVisible();
  await expect(visibleGuestSurface.getByText("RSVP: ATTENDING")).toBeVisible();
  await expect(page.getByText("Stale Local Guest")).toHaveCount(0);
  await expect(page.locator(".kp-site-preloader")).toHaveCount(0, { timeout: 5_000 });
  await page.screenshot({ path: testInfo.outputPath("authenticated-guests.png"), fullPage: true });
});

test("AI helper discloses local template fallback", async ({ page }, testInfo) => {
  await establishUserSession(page);
  await page.route("**/api/**", (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/api/v1/invitations/42") {
      return json(route, {
        id: 42,
        title: "Dara and Sophea Wedding",
        eventType: "WEDDING",
        eventDate: "2026-12-15",
        venueName: "Phnom Penh",
        groomName: "Dara",
        brideName: "Sophea",
        status: "DRAFT",
        visibility: "PUBLIC",
      });
    }
    if (url.pathname.startsWith("/api/v1/ai/")) {
      return json(route, {
        enabled: false,
        provider: "",
        generatedText: "",
        suggestions: [],
        warnings: ["AI provider adapter is not implemented yet."],
      });
    }
    return json(route, { message: "Not found" }, 404);
  });

  await page.goto("/dashboard/invitations/42/assistant");
  await page.getByRole("button", { name: /Generate Content/ }).click();
  await expect(page.getByRole("heading", { name: /Local template draft/ })).toBeVisible();
  await expect(page.getByText(/No external AI provider was used/)).toBeVisible();
  await expect(page.getByText("AI provider adapter is not implemented yet.")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("ai-local-template.png"), fullPage: true });
});
