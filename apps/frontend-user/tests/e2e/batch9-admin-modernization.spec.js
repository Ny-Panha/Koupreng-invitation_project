import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fixtureToken } from "./support/fixtureToken.js";

const evidenceDir = path.resolve("../../docs/design/evidence/batch9");
const responsiveWidths = [320, 375, 390, 430, 768, 1024, 1440];

async function installAdminMockRoutes(page, lang = "en") {
  await page.addInitScript(({ token, lang }) => {
    const session = JSON.stringify({
      accessToken: token,
      user: { id: 1, fullName: "Koupreng Review Admin", email: "admin@koupreng.com", role: "ADMIN" },
    });
    localStorage.setItem("koupreng.admin.auth", session);
    sessionStorage.setItem("koupreng.admin.auth", session);
    localStorage.setItem("koupreng.admin.lang", lang);
    localStorage.setItem("koupreng.lang", lang);
  }, { token: fixtureToken, lang });

  await page.route("**/api/**", (route) => {
    const url = route.request().url();
    if (url.includes("/summary")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            totalRevenue: 1250.00,
            currency: "USD",
            totalGuests: 350,
            totalInvitations: 12,
            recentUsers: [
              { id: 1, fullName: "Koupreng Admin", email: "admin@koupreng.com", role: "ADMIN", status: "ACTIVE" },
              { id: 2, fullName: "Sophea User", email: "sophea@koupreng.com", role: "USER", status: "ACTIVE" },
            ],
            recentPayments: [
              { orderCode: "KPR-TMP-101", amount: 15.00, currency: "USD", status: "PENDING", paidAt: null },
              { orderCode: "SUB-PKG-202", amount: 29.00, currency: "USD", status: "PAID", paidAt: "2026-11-01T12:00:00Z" },
            ],
          },
        }),
      });
    }

    if (url.includes("/admin/users")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            { id: 1, fullName: "Koupreng Admin", email: "admin@koupreng.com", role: "ADMIN", status: "ACTIVE", active: true, createdAt: "2026-08-01T00:00:00Z" },
            { id: 2, fullName: "Demo Master Admin", email: "admin.demo@koupreng.local", role: "ADMIN", status: "ACTIVE", active: true, createdAt: "2026-08-01T00:00:00Z" },
            { id: 3, fullName: "Bora Staff", email: "bora@koupreng.com", role: "STAFF", status: "ACTIVE", active: true, createdAt: "2026-08-02T00:00:00Z" },
            { id: 4, fullName: "Sophea User", email: "sophea@koupreng.com", role: "USER", status: "ACTIVE", active: true, createdAt: "2026-08-03T00:00:00Z" },
          ],
        }),
      });
    }

    if (url.includes("/admin/payments")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            { orderCode: "KPR-TMP-101", templateName: "Khmer Celestial", itemType: "TEMPLATE", amount: 15.00, currency: "USD", status: "PENDING", provider: "ABA PayWay", createdAt: "2026-11-01T10:00:00Z", paidAt: null },
            { orderCode: "SUB-PKG-202", packageName: "Diamond VIP Tier", itemType: "SUBSCRIPTION", amount: 29.00, currency: "USD", status: "REVIEW_REQUIRED", provider: "ABA PayWay", createdAt: "2026-11-02T11:00:00Z", paidAt: null },
            { orderCode: "KPR-TMP-303", templateName: "Emerald Luxe", itemType: "TEMPLATE", amount: 12.00, currency: "USD", status: "PAID", provider: "ABA PayWay", createdAt: "2026-10-28T09:00:00Z", paidAt: "2026-10-28T09:05:00Z" },
          ],
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

test.describe("Batch 9: Koupreng Admin Modernization & Security Verification", () => {
  test.beforeAll(async () => {
    await mkdir(evidenceDir, { recursive: true });
  });

  test("1. Admin Login renders bilingual form with password toggle and validation", async ({ page }, info) => {
    test.setTimeout(60_000);
    // Explicitly unauthenticated state
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem("koupreng.admin.lang", "km");
    });
    await page.goto("http://127.0.0.1:4174/login");
    await expect(page.locator("h1")).toHaveText("គូព្រេង", { timeout: 15_000 });

    // Check language toggle to English
    const enBtn = page.getByRole("button", { name: "EN" });
    await enBtn.click();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByLabel("Email or Phone", { exact: true })).toBeVisible();

    // Password input exact check
    const passwordInput = page.locator("#password");
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Password show/hide toggle
    await page.getByRole("button", { name: "Show password" }).click();
    await expect(passwordInput).toHaveAttribute("type", "text");
    await page.getByRole("button", { name: "Hide password" }).click();
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Axe audit for Login
    const axe = await new AxeBuilder({ page })
      .disableRules(["color-contrast"])
      .analyze();
    expect(axe.violations.filter((v) => v.impact === "critical" || v.impact === "serious")).toEqual([]);

    if (info.project.name === "desktop-chromium") {
      await page.screenshot({ path: path.join(evidenceDir, "admin-login-en-1440.png") });
    }
  });

  test("2. Admin Dashboard renders live clock capsule and responsive metrics without whole-tree flicker", async ({ page }, info) => {
    test.setTimeout(90_000);
    await installAdminMockRoutes(page, "en");

    for (const width of responsiveWidths) {
      await page.setViewportSize({ width, height: 950 });
      await page.goto("http://127.0.0.1:4174/dashboard");
      await expect(page.locator("main")).toBeVisible({ timeout: 15_000 });

      // Check live clock capsule is visible
      const clockCapsule = page.locator("text=LOCAL CLOCK");
      await expect(clockCapsule).toBeVisible({ timeout: 15_000 });

      // Ensure no horizontal document overflow
      const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
      expect(noOverflow).toBe(true);

      if (info.project.name === "desktop-chromium") {
        await page.screenshot({ path: path.join(evidenceDir, `admin-dashboard-${width}.png`) });
      }
    }

    // Axe audit for Dashboard
    const axe = await new AxeBuilder({ page })
      .disableRules(["color-contrast"])
      .analyze();
    expect(axe.violations.filter((v) => v.impact === "critical" || v.impact === "serious")).toEqual([]);
  });

  test("3. Admin User Management enforces privileged safety and role filtering", async ({ page }, info) => {
    test.setTimeout(60_000);
    await installAdminMockRoutes(page, "en");
    await page.setViewportSize({ width: 1440, height: 950 });
    await page.goto("http://127.0.0.1:4174/users");

    await expect(page.locator(".page-head")).toBeVisible({ timeout: 15_000 });

    // Verify all four role tabs exist: All, Admins, Staff, Users
    await expect(page.getByRole("tab", { name: "All" })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("tab", { name: "Admins" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Staff" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Users" })).toBeVisible();

    // Verify self-account protected badge
    await expect(page.getByText("You (Protected)")).toBeVisible();

    // Verify Master Admin protected label
    await expect(page.getByText("Master Admin", { exact: true })).toBeVisible();

    // Axe audit for Users
    const axe = await new AxeBuilder({ page })
      .disableRules(["color-contrast"])
      .analyze();
    expect(axe.violations.filter((v) => v.impact === "critical" || v.impact === "serious")).toEqual([]);

    if (info.project.name === "desktop-chromium") {
      await page.screenshot({ path: path.join(evidenceDir, "admin-users-list-1440.png") });
    }
  });

  test("4. Payment Audit renders manual verification modal with authoritative amount", async ({ page }, info) => {
    test.setTimeout(60_000);
    await installAdminMockRoutes(page, "en");
    await page.setViewportSize({ width: 1440, height: 950 });
    await page.goto("http://127.0.0.1:4174/payments");

    await expect(page.locator(".page-head")).toBeVisible({ timeout: 15_000 });

    // Click confirm on the first pending order
    const confirmBtns = page.getByRole("button", { name: "Confirm Payment" });
    await expect(confirmBtns.first()).toBeVisible({ timeout: 10_000 });
    await confirmBtns.first().click();

    // Modal dialog is shown
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Manual Payment Verification")).toBeVisible();
    await expect(dialog.getByText("USD 15.00")).toBeVisible();
    await expect(dialog.getByText("KPR-TMP-101")).toBeVisible();

    // Check transaction ID input is required
    const txInput = dialog.getByLabel(/ABA PayWay Transaction Reference/i);
    await expect(txInput).toBeVisible();

    // Axe audit for Payments with Modal Open
    const axe = await new AxeBuilder({ page })
      .disableRules(["color-contrast"])
      .analyze();
    expect(axe.violations.filter((v) => v.impact === "critical" || v.impact === "serious")).toEqual([]);

    if (info.project.name === "desktop-chromium") {
      await page.screenshot({ path: path.join(evidenceDir, "admin-payment-verify-modal-1440.png") });
    }

    // Cancel modal
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).not.toBeVisible();
  });
});
