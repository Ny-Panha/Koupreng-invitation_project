import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fixtureToken } from "./support/fixtureToken.js";

const evidenceDir = path.resolve("../../docs/design/evidence/batch10");
const responsiveWidths = [320, 375, 390, 430, 768, 1024, 1440];

async function installAdminMockRoutes(page, lang = "en") {
  await page.addInitScript(
    ({ token, lang }) => {
      const session = JSON.stringify({
        accessToken: token,
        user: {
          id: 1,
          fullName: "Koupreng Review Admin",
          email: "admin@koupreng.com",
          role: "ADMIN",
        },
      });
      localStorage.setItem("koupreng.admin.auth", session);
      sessionStorage.setItem("koupreng.admin.auth", session);
      localStorage.setItem("koupreng.admin.lang", lang);
      localStorage.setItem("koupreng.lang", lang);
    },
    { token: fixtureToken, lang }
  );

  await page.route("**/api/**", (route) => {
    const url = route.request().url();

    // Report definitions
    if (url.includes("/admin/reports/management/definitions") || url.includes("/admin/reports/definitions")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            definitions: [
              {
                code: "executive",
                titleEn: "Executive Overview",
                titleKm: "ទិដ្ឋភាពប្រតិបត្តិ",
                defaultDateDimension: "metric",
                dateDimensions: ["metric"],
                filters: [],
                columns: [
                  { key: "metric", labelEn: "Metric", labelKm: "រង្វាស់", type: "STRING" },
                  { key: "value", labelEn: "Value", labelKm: "តម្លៃ", type: "STRING" },
                ],
                notes: ["Authoritative data snapshot locked to Asia/Phnom_Penh (UTC+7)"],
              },
              {
                code: "invitations",
                titleEn: "Invitations Report",
                titleKm: "របាយការណ៍ធៀបការ",
                defaultDateDimension: "createdAt",
                dateDimensions: ["createdAt", "eventDate"],
                filters: ["eventType", "search"],
                columns: [
                  { key: "id", labelEn: "ID", labelKm: "លេខសម្គាល់", type: "NUMBER" },
                  { key: "title", labelEn: "Title", labelKm: "ចំណងជើង", type: "STRING" },
                  { key: "ownerName", labelEn: "Host", labelKm: "ម្ចាស់", type: "STRING" },
                  { key: "status", labelEn: "Status", labelKm: "ស្ថានភាព", type: "STRING" },
                  { key: "guests", labelEn: "Guests", labelKm: "ភ្ញៀវ", type: "NUMBER" },
                ],
                notes: [],
              },
            ],
            metrics: [],
          },
        }),
      });
    }

    // Reports queries
    if (url.includes("/admin/reports/management/") || url.includes("/admin/reports/invitations")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            definition: {
              code: "executive",
              titleEn: "Executive Overview",
              titleKm: "ទិដ្ឋភាពប្រតិបត្តិ",
              defaultDateDimension: "metric",
              dateDimensions: ["metric"],
              filters: [],
              columns: [
                { key: "metric", labelEn: "Metric", labelKm: "រង្វាស់", type: "STRING" },
                { key: "value", labelEn: "Value", labelKm: "តម្លៃ", type: "STRING" },
              ],
              notes: ["Authoritative data snapshot locked to Asia/Phnom_Penh (UTC+7)"],
            },
            metadata: {
              snapshotId: "snp-20261105-001",
              generatedAt: "2026-11-05T15:00:00Z",
              timezone: "Asia/Phnom_Penh",
              sort: "metric",
              direction: "ASC",
              filters: {},
            },
            report: "executive",
            filteredSummary: {
              totalInvitations: 24,
              confirmedReceiptsByCurrency: { USD: 1250.0, KHR: 5000000.0 },
              totalUsers: 85,
              activeSubscriptions: 12,
              periodGrowth: 0.15,
            },
            rows: [
              { id: 1, metric: "Total Invitations", value: "24" },
              { id: 2, metric: "Total Confirmed RSVPs", value: "480" },
            ],
            series: [],
            notices: ["Authoritative data snapshot locked to Asia/Phnom_Penh (UTC+7)"],
            totalElements: 2,
            totalPages: 1,
            page: 0,
            size: 20,
          },
        }),
      });
    }

    // Notifications endpoint
    if (url.includes("/admin/notifications")) {
      if (route.request().method() === "POST") {
        const payload = route.request().postDataJSON();
        return route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              id: 999,
              userId: payload.userId,
              title: payload.title,
              message: payload.message,
              type: payload.type,
              channel: payload.channel,
              status: "SENT",
              createdAt: new Date().toISOString(),
            },
          }),
        });
      }

      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: 101,
              userId: 15,
              recipientEmail: "client@koupreng.com",
              title: "Wedding Template Activation",
              message: "Your royal garden template layout is now active.",
              type: "SYSTEM_ALERT",
              channel: "SYSTEM",
              status: "DELIVERED",
              createdAt: "2026-11-04T10:00:00Z",
            },
            {
              id: 102,
              userId: null,
              recipientEmail: null,
              title: "Platform Maintenance Alert",
              message: "Scheduled maintenance window on Sunday 2:00 AM ICT.",
              type: "ADMIN_NOTICE",
              channel: "EMAIL",
              status: "SENT",
              createdAt: "2026-11-05T08:00:00Z",
            },
          ],
        }),
      });
    }

    // System Logs endpoint
    if (url.includes("/admin/system-logs")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: 1,
              actorUserId: 1,
              actorEmail: "admin@koupreng.com",
              action: "ADMIN_LOGIN",
              resourceType: "USER",
              resourceId: 1,
              description: "Successful administrative authentication from IP 192.168.1.1",
              ipAddress: "192.168.1.1",
              userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
              metadataJson: '{"role": "ADMIN", "sessionId": "sess_888"}',
              createdAt: "2026-11-05T14:00:00Z",
            },
            {
              id: 2,
              actorUserId: 1,
              actorEmail: "admin@koupreng.com",
              action: "PAYMENT_CONFIRMED",
              resourceType: "PAYMENT",
              resourceId: 303,
              description: "Verified ABA PayWay transaction ORD-303 with secretKey=live_key_999",
              ipAddress: "192.168.1.1",
              userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
              metadataJson: '{"orderCode": "ORD-303", "amount": 15.00, "token": "secret_abc"}',
              createdAt: "2026-11-05T14:30:00Z",
            },
          ],
        }),
      });
    }

    // API Monitor endpoints
    if (url.includes("/admin/dev-monitor/stats")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            totalRequests: 1420,
            successCount: 1390,
            clientErrorCount: 25,
            serverErrorCount: 5,
            slowRequestsCount: 12,
            avgDurationMs: 42,
            p95DurationMs: 180,
            totalSqlQueries: 3450,
            nPlusOneCount: 2,
            topEndpoints: [
              { endpoint: "GET /api/v1/invitations", count: 450, avgDurationMs: 38 },
              { endpoint: "POST /api/v1/rsvp", count: 320, avgDurationMs: 55 },
            ],
          },
        }),
      });
    }

    if (url.includes("/admin/dev-monitor/clear")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: {} }),
    });
  });
}

test.describe("Batch 10: Admin Reports, Notifications, Logs & API Monitor", () => {
  test.beforeAll(async () => {
    await mkdir(evidenceDir, { recursive: true });
  });

  test("1. Admin Reports: renders executive overview, filters, and passes Axe audit", async ({ page }, info) => {
    test.setTimeout(60_000);
    await installAdminMockRoutes(page, "en");

    await page.goto("http://127.0.0.1:4174/reports");
    await expect(page.locator("h2")).toContainText("Reports & Analytics", { timeout: 15_000 });

    // Expand data notes disclosure to view snapshot metadata
    const notesSummary = page.locator(".report-notes summary");
    await notesSummary.click();

    // Verify snapshot notice is displayed
    await expect(page.locator(".report-notes").getByText("snp-20261105-001")).toBeVisible();

    if (info.project.name === "desktop-chromium") {
      const results = await new AxeBuilder({ page })
        .disableRules(["color-contrast"])
        .analyze();
      const criticalOrSerious = results.violations.filter((v) =>
        ["critical", "serious"].includes(v.impact)
      );
      expect(criticalOrSerious).toHaveLength(0);

      await page.setViewportSize({ width: 1440, height: 900 });
      await page.screenshot({
        path: path.join(evidenceDir, "admin-reports-1440.png"),
        fullPage: true,
      });
    }
  });

  test("2. Admin Notifications: enforces broadcast confirmation modal and validates URLs", async ({ page }, info) => {
    test.setTimeout(60_000);
    await installAdminMockRoutes(page, "en");

    await page.goto("http://127.0.0.1:4174/notifications");
    await expect(page.locator("h2")).toContainText("Notifications", { timeout: 15_000 });

    // Verify history rows
    await expect(page.getByText("Wedding Template Activation")).toBeVisible();
    await expect(page.getByText("Platform Maintenance Alert")).toBeVisible();

    // Switch to Broadcast mode
    const broadcastBtn = page.getByRole("button", { name: "All Users Broadcast" });
    await broadcastBtn.click();

    // Verify broadcast warning notice
    await expect(
      page.getByText("System-wide announcement visible to all registered platform users")
    ).toBeVisible();

    // Fill form
    await page.locator("#notif-title").fill("Playwright E2E Broadcast Announcement");
    await page.locator("#notif-message").fill("This is a verified test broadcast to all users.");

    // Submit form -> triggers broadcast confirmation modal
    await page.getByRole("button", { name: /^Send Notification$/ }).click();

    const modal = page.getByRole("dialog", { name: "Confirm Broadcast Announcement" });
    await expect(modal).toBeVisible();
    await expect(
      modal.getByText("You are about to broadcast this notification to all active users on the platform")
    ).toBeVisible();

    // Confirm broadcast in modal
    await modal.getByRole("button", { name: "Confirm & Broadcast" }).click();

    // Modal closes and announcement appears in history
    await expect(modal).not.toBeVisible();
    await expect(page.getByText("Playwright E2E Broadcast Announcement")).toBeVisible();

    if (info.project.name === "desktop-chromium") {
      const results = await new AxeBuilder({ page })
        .disableRules(["color-contrast"])
        .analyze();
      const criticalOrSerious = results.violations.filter((v) =>
        ["critical", "serious"].includes(v.impact)
      );
      expect(criticalOrSerious).toHaveLength(0);

      await page.screenshot({
        path: path.join(evidenceDir, "admin-notifications-1440.png"),
        fullPage: true,
      });
    }
  });

  test("3. Admin System Logs: verifies secret redaction and opens inspect drawer", async ({ page }, info) => {
    test.setTimeout(60_000);
    await installAdminMockRoutes(page, "en");

    await page.goto("http://127.0.0.1:4174/system-logs");
    await expect(page.locator("h2")).toContainText("System Logs", { timeout: 15_000 });

    // Verify log entries are rendered
    await expect(page.getByText("ADMIN_LOGIN")).toBeVisible();
    await expect(page.getByText("PAYMENT_CONFIRMED")).toBeVisible();

    // The fictional credential in the fixture must be redacted in the rendered log.
    await expect(page.getByText("live_key_999")).not.toBeVisible();
    await expect(page.getByText(/secretKey=\[REDACTED\]/)).toBeVisible();

    // Open inspect drawer for payment log
    const inspectButtons = page.getByRole("button", { name: "Inspect" });
    await inspectButtons.nth(1).click();

    const drawer = page.getByRole("dialog", { name: /Audit Log Entry/i });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText("PAYMENT_CONFIRMED")).toBeVisible();
    await expect(drawer.getByText("User Agent")).toBeVisible();
    // In metadata JSON, secret token must be redacted
    await expect(drawer.getByText(/"token": "\[REDACTED\]"/)).toBeVisible();

    // Press Escape to close drawer
    await page.keyboard.press("Escape");
    await expect(drawer).not.toBeVisible();

    if (info.project.name === "desktop-chromium") {
      const results = await new AxeBuilder({ page })
        .disableRules(["color-contrast"])
        .analyze();
      const criticalOrSerious = results.violations.filter((v) =>
        ["critical", "serious"].includes(v.impact)
      );
      expect(criticalOrSerious).toHaveLength(0);

      await page.screenshot({
        path: path.join(evidenceDir, "admin-system-logs-1440.png"),
        fullPage: true,
      });
    }
  });

  test("4. API Monitor: renders live diagnostics, QA recorder, and clear confirmation modal", async ({ page }, info) => {
    test.setTimeout(60_000);
    await installAdminMockRoutes(page, "en");

    await page.goto("http://127.0.0.1:4174/dev/api-monitor");
    await expect(page.locator("h2")).toContainText("Developer API Live Monitor", { timeout: 15_000 });

    // Verify QA Session Recorder bar exists
    await expect(page.getByText("QA Diagnostic Session Recorder")).toBeVisible();

    // Click Clear History button to open modal
    const clearBtn = page.getByRole("button", { name: "Clear History" });
    await clearBtn.click();

    const clearModal = page.getByRole("dialog", { name: "Clear API Telemetry History" });
    await expect(clearModal).toBeVisible();
    await expect(
      clearModal.getByText("Clearing server history will permanently purge API telemetry for all active admin sessions")
    ).toBeVisible();

    // Cancel modal
    await clearModal.getByRole("button", { name: "Cancel" }).click();
    await expect(clearModal).not.toBeVisible();

    if (info.project.name === "desktop-chromium") {
      const results = await new AxeBuilder({ page })
        .disableRules(["color-contrast"])
        .analyze();
      const criticalOrSerious = results.violations.filter((v) =>
        ["critical", "serious"].includes(v.impact)
      );
      expect(criticalOrSerious).toHaveLength(0);

      // Capture screenshots across responsive widths for the observability workspace
      for (const width of responsiveWidths) {
        await page.setViewportSize({ width, height: 900 });
        await page.waitForTimeout(100);
        await page.screenshot({
          path: path.join(evidenceDir, `admin-api-monitor-${width}.png`),
          fullPage: false,
        });
      }
    }
  });
});

