import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

const matrix = JSON.parse(readFileSync(new URL("../../../../docs/qa/batch11/route-matrix.json", import.meta.url), "utf8"));
const concrete = pattern => pattern.replace(/:[A-Za-z]+/g, "101");

test("unknown route fallback recovers in both applications", async ({ page }) => {
  await page.addInitScript(() => { localStorage.clear(); sessionStorage.clear(); localStorage.setItem("koupreng.lang", "en"); localStorage.setItem("koupreng.admin.lang", "en"); });
  await page.route("**/api/**", route => route.fulfill({ status: route.request().url().includes("/auth/me") ? 401 : 200, contentType: "application/json", body: JSON.stringify({ data: { messages: {} } }) }));
  await page.goto("/__batch11_missing_route__");
  await expect(page.getByRole("heading", { name: "404", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to home", exact: true })).toHaveAttribute("href", "/");
  await page.goto("http://127.0.0.1:4174/__batch11_missing_route__");
  await expect(page.getByText("404")).toBeVisible();
  await page.getByRole("link", { name: "Return to Dashboard" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:4174/login?next=%2Fdashboard");
  await expect(page.locator('input[autocomplete="username"]')).toBeVisible();
});

for (const application of ["frontend-user", "frontend-admin"]) {
  test(`${application}: anonymous guards cover every declared protected pattern`, async ({ page }, info) => {
    test.setTimeout(240_000);
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.addInitScript(() => { localStorage.clear(); sessionStorage.clear(); localStorage.setItem("koupreng.lang", "en"); localStorage.setItem("koupreng.admin.lang", "en"); });
    await page.route("**/api/**", route => route.fulfill({ status: route.request().url().includes("/auth/me") ? 401 : 200, contentType: "application/json", body: JSON.stringify({ data: { messages: {} } }) }));
    const rows = matrix.routes.filter(row => row.application === application && ["authenticated", "admin"].includes(row.accessRequirement));
    const observations = [];
    for (const row of rows) {
      await page.goto(`http://127.0.0.1:${application === "frontend-admin" ? 4174 : 4173}${concrete(row.routePattern)}`);
      await expect(page).toHaveURL(/\/login\?next=/);
      await expect(page.locator('input[autocomplete="username"]')).toBeVisible();
      const next = new URL(page.url()).searchParams.get("next");
      expect(next).toBe(concrete(row.routePattern));
      observations.push({ pattern: row.routePattern, outcome: "anonymous guard passed; authenticated page not exercised" });
    }
    expect(errors).toEqual([]);
    await info.attach(`${application}-guard-observations`, { body: JSON.stringify(observations, null, 2), contentType: "application/json" });
  });
}
