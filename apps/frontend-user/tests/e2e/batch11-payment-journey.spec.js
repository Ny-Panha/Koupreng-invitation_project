import { expect, test } from "@playwright/test";
import { installUxFixtures } from "./support/uxFixtures.js";

test("payment return aliases use server state regardless of success query values", async ({ page }) => {
  await installUxFixtures(page);
  for (const path of ["/payments/success", "/payments/return"]) {
    await page.goto(`${path}?orderCode=AUDIT&status=PAID&success=true`);
    await expect(page.getByRole("heading", { name: "Payment is being verified. Please wait." })).toBeVisible();
    await expect(page.locator(".payment-status")).toHaveText("PENDING");
    await expect(page.getByRole("link", { name: /Use Template|Download receipt/i })).toHaveCount(0);
  }
});

test("a receipt denied by the backend remains inaccessible", async ({ page }) => {
  await installUxFixtures(page);
  await page.route("**/api/v1/me/payments/UNVERIFIED/receipt", route => route.fulfill({ status: 403, contentType: "application/json", body: JSON.stringify({ message: "Receipt requires verified payment", code: "PAYMENT_NOT_VERIFIED" }) }));
  await page.goto("/app/payments/UNVERIFIED");
  await expect(page.getByText("Receipt requires verified payment")).toBeVisible();
  await expect(page.getByRole("button", { name: /Print|Download/i })).toHaveCount(0);
});
