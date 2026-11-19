import { expect, test } from "@playwright/test";
import { Buffer } from 'node:buffer';

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

async function establishUserSession(page, { userId = 7, lang = "en", theme = "light" } = {}) {
  await page.addInitScript(({ token, userId, lang, theme }) => {
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
  }, { token: TEST_TOKEN, userId, lang, theme });
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
        body: JSON.stringify({
          data: [mockTemplate, mockCelestial],
        }),
      });
    }

    if (path.includes("/subscriptions/current")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: null }),
      });
    }

    if (path.includes("/template-access")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { hasAccess: true } }),
      });
    }

    if (path === "/api/v1/invitations" && method === "POST") {
      const body = route.request().postDataJSON();
      return route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            id: 888,
            title: body?.title || "Created Event",
            eventType: body?.eventType || "WEDDING",
            visibility: "PRIVATE",
            clientRequestId: body?.clientRequestId,
          },
        }),
      });
    }

    if (path.includes("/cover") && method === "POST") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: { id: 1, fileUrl: "https://example.com/uploaded-cover.jpg" },
        }),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: {} }),
    });
  });
}

test.describe("Phase 11.1 Event Creation & Onboarding Wizard E2E", () => {
  test("canonical /app/events/new renders accessible 4-step stepper and wayfinding", async ({ page }) => {
    await establishUserSession(page);
    await setupMockApis(page);

    await page.goto("/app/events/new");
    await expect(page).toHaveURL(/\/app\/events\/new/);

    // Heading
    await expect(page.getByRole("heading", { name: "Bring your event together" })).toBeVisible();

    // Stepper
    const progressbar = page.getByRole("progressbar");
    await expect(progressbar).toBeVisible();
    await expect(progressbar).toHaveAttribute("aria-valuenow", "25");

    // Stepper navigation buttons
    await expect(page.getByRole("button", { name: /Event Type/ })).toHaveAttribute("aria-current", "step");
    await expect(page.getByRole("button", { name: /Event Essentials/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Choose Design/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Review & Create/ })).toBeVisible();

    // 6 Event types
    const eventTypes = ["Wedding", "Engagement", "Birthday", "Anniversary", "Corporate", "Other"];
    for (const name of eventTypes) {
      await expect(page.getByRole("button", { name, exact: true })).toBeVisible();
    }
  });

  test("end-to-end wedding creation with photo upload and private acknowledgment", async ({ page }) => {
    await establishUserSession(page);
    await setupMockApis(page);

    await page.goto("/app/events/new");

    // Step 1: Select Wedding (default)
    await page.getByRole("button", { name: "Next: Event essentials" }).click();

    // Step 2: Fill essentials
    await page.locator("#event-title").fill("Kosal & Bopha Wedding");
    await page.locator("#event-groomName").fill("Kosal");
    await page.locator("#event-brideName").fill("Bopha");
    await page.locator("#event-eventDate").fill("2026-12-18");
    await page.locator("#event-eventTime").fill("17:00");
    await page.locator("#event-venueName").fill("Grand Ballroom");
    await page.locator("#event-venueAddress").fill("123 Preah Norodom Blvd");

    // Attach cover photo
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.locator(".event-photo-dropzone").click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: "cover.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("dummy-photo-content"),
    });

    await expect(page.locator(".event-photo-preview-card")).toBeVisible();

    // Step 3: Choose Design
    await page.getByRole("button", { name: "Next: Choose design" }).click();
    await page.getByRole("button", { name: /^(?:Select|Selected) Event Essential$/ }).click();

    // Step 4: Review & Create
    await page.getByRole("button", { name: "Next: Review & create" }).click();

    // Review card verification
    await expect(page.getByRole("heading", { name: "Kosal & Bopha Wedding" })).toBeVisible();
    await expect(page.getByText("Kosal & Bopha", { exact: true })).toBeVisible();
    await expect(page.getByText("Grand Ballroom")).toBeVisible();

    // Create event
    await page.locator(".event-create-actions button.primary").click();

    // Navigates to guided invitation workspace
    await expect(page).toHaveURL(/\/app\/events\/888\/invitation\?mode=guided/);
  });

  test("draft save requires only title and skips photo requirement", async ({ page }) => {
    await establishUserSession(page);
    await setupMockApis(page);

    await page.goto("/app/events/new");

    // Go to details and fill only title
    await page.getByRole("button", { name: "Next: Event essentials" }).click();
    await page.locator("#event-title").fill("Quick Draft Event");

    // Navigate to Step 4 via stepper or next buttons
    await page.getByRole("button", { name: /Review & Create/ }).click();

    // Save draft
    await page.getByRole("button", { name: /Save draft/i }).first().click();

    // Navigates to event overview
    await expect(page).toHaveURL(/\/app\/events\/888/);
  });

  test("template intent query parameter pre-selects design and sets compatible type", async ({ page }) => {
    await establishUserSession(page);
    await setupMockApis(page);

    await page.goto("/app/events/new?template=khmer-celestial");

    // Navigate to Step 3 in stepper to view design
    await page.getByRole("button", { name: /Choose Design/ }).click();

    // Template should be selected
    const selectedBtn = page.getByRole("button", { name: /^(?:Select|Selected) Khmer Celestial$/ });
    await expect(selectedBtn).toBeVisible();
    await expect(selectedBtn).toHaveAttribute("aria-pressed", "true");
  });

  test("handles partial create with cover upload retry gracefully without duplicating event", async ({ page }) => {
    await establishUserSession(page);

    let createCallCount = 0;
    let uploadCallCount = 0;

    await page.route("**/api/v1/**", async (route) => {
      const url = new URL(route.request().url());
      const path = url.pathname;
      const method = route.request().method();

      if (path.includes("/templates/recommendations")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: [{ template: mockTemplate, styleMatch: true }] }),
        });
      }

      if (path === "/api/v1/invitations" && method === "POST") {
        createCallCount++;
        return route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            data: { id: 777, title: "Retry Flow Event", visibility: "PRIVATE" },
          }),
        });
      }

      if (path.includes("/cover") && method === "POST") {
        uploadCallCount++;
        if (uploadCallCount === 1) {
          return route.fulfill({
            status: 500,
            contentType: "application/json",
            body: JSON.stringify({ message: "S3 Storage Temporarily Unavailable" }),
          });
        }
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: { id: 2, fileUrl: "https://example.com/cover-ok.jpg" } }),
        });
      }

      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: {} }),
      });
    });

    await page.goto("/app/events/new");
    await page.getByRole("button", { name: "Next: Event essentials" }).click();

    await page.locator("#event-title").fill("Retry Flow Event");
    await page.locator("#event-groomName").fill("Dara");
    await page.locator("#event-brideName").fill("Chenda");
    await page.locator("#event-eventDate").fill("2026-12-25");
    await page.locator("#event-eventTime").fill("18:00");
    await page.locator("#event-venueName").fill("Hotel Cambodiana");

    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.locator(".event-photo-dropzone").click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: "wedding-photo.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("photo-bytes"),
    });

    await page.getByRole("button", { name: "Next: Choose design" }).click();
    await page.getByRole("button", { name: /^(?:Select|Selected) Event Essential$/ }).click();
    await page.getByRole("button", { name: "Next: Review & create" }).click();

    // First submit attempt fails at photo upload
    await page.locator(".event-create-actions button.primary").click();

    // Expect retry banner
    await expect(page.getByText("Event created successfully, but photo upload failed.")).toBeVisible();
    expect(createCallCount).toBe(1);
    expect(uploadCallCount).toBe(1);

    // Click retry photo upload
    await page.getByRole("button", { name: "Retry photo upload" }).click();

    // Navigates to guided invitation workspace
    await expect(page).toHaveURL(/\/app\/events\/777\/invitation\?mode=guided/);

    // Event creation must NOT have been called twice!
    expect(createCallCount).toBe(1);
    expect(uploadCallCount).toBe(2);
  });

  test("renders authentic Khmer typography and localized UI", async ({ page }) => {
    await establishUserSession(page, { lang: "km" });
    await setupMockApis(page);

    await page.goto("/app/events/new");

    // Khmer heading
    await expect(page.getByRole("heading", { name: "បង្កើតកម្មវិធីរបស់អ្នក" })).toBeVisible();

    // Khmer step labels
    await expect(page.getByText("ជ្រើសរើសប្រភេទកម្មវិធី", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "អាពាហ៍ពិពាហ៍", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "ខួបកំណើត", exact: true })).toBeVisible();
  });
});
