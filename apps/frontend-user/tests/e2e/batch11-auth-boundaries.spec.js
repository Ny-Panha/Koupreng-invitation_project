import { expect, test } from "@playwright/test";
import { installBatch11Admin } from "./support/batch11AdminFixtures.js";

for (const role of ["USER", "STAFF", "SUPERADMIN", "INVALID_ROLE"]) {
  test(`${role} cannot open an administrative page or issue admin requests`, async ({ page }) => {
    await installBatch11Admin(page, { role });
    const requests = [];
    page.on("request", request => { if (request.url().includes("/v1/admin/")) requests.push(request.url()); });
    await page.goto("http://127.0.0.1:4174/templates/new");
    await expect(page.getByRole("heading", { name: "Access Denied" })).toBeVisible();
    expect(requests).toEqual([]);
  });
}
for (const options of [{ expired: true }, { customerSessionOnly: true }]) {
  test(`admin session rejects ${options.expired ? "expired token" : "customer app storage"}`, async ({ page }) => {
    await installBatch11Admin(page, options);
    await page.goto("http://127.0.0.1:4174/users/1101");
    await expect(page).toHaveURL(/\/login\?next=/);
    await expect(page.locator('input[autocomplete="username"]')).toBeVisible();
  });
}
