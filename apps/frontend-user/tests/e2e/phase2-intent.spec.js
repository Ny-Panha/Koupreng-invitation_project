import { expect, test } from "@playwright/test";
import { installPhase2Fixtures } from "./support/phase2Fixtures.js";

for (const [key, name, id] of [["khmer-celestial", "Khmer Celestial", 4], ["silk-heritage", "Silk Heritage", 5]]) {
  test(`visitor choice ${key} survives login, creation, Studio and refresh`, async ({ page }) => {
    const { created } = await installPhase2Fixtures(page, { anonymous: true });
    await page.goto("/templates");
    await expect(page.locator(`.kp-design-card[data-template="${key}"]`)).toBeVisible();
    expect(await page.evaluate(() => sessionStorage.getItem("koupreng.template_intent"))).toBeNull();
    await page.locator(`.kp-design-card[data-template="${key}"]`).getByRole("link", { name: "Use design", exact: true }).click();
    await expect(page).toHaveURL(/\/login\?next=/);
    expect(new URL(page.url()).searchParams.get("next")).toBe(`/app/events/new?template=${key}`);
    await page.locator('input[autocomplete="username"]').fill("audit@example.test");
    await page.getByLabel("Password", { exact: true }).fill("Fixture-only1!");
    await page.getByRole("button", { name: "Sign In", exact: true }).click();
    await expect(page).toHaveURL(/\/app\/events\/new/);
    await page.evaluate(() => sessionStorage.setItem("phase2.fixture.authenticated", "yes"));
    await expect(page.getByRole("button", { name: `Select ${name}`, exact: true })).toHaveAttribute("aria-pressed", "true");
    await page.getByLabel(/Event title/).fill(`Phase 2 ${name}`);
    await page.locator('[name="groomName"]').fill("Dara");
    await page.locator('[name="brideName"]').fill("Sokha");
    await page.locator('[name="eventDate"]').fill("2026-12-25");
    await page.locator('[name="eventTime"]').fill("17:30");
    await page.locator('[name="venueName"]').fill("Sample venue");
    await page.getByRole("button", { name: "Create event", exact: true }).click();
    await expect(page).toHaveURL(/\/app\/events\/301$/);
    expect(created).toHaveLength(1);
    expect(created[0]).toMatchObject({ templateId: id, templateCode: key });
    await page.goto("/app/events/301/invitation");
    if (page.viewportSize().width < 1024) await page.getByRole('button', { name: 'Preview invitation', exact: true }).click();
    const marker = page.frameLocator('iframe[title="Live User Template Preview"]').locator(`[data-template-renderer="${key}"]`);
    await expect(marker).toBeAttached({ timeout: 20000 });
    await expect(page.locator(".pe-template-tag")).toHaveText(name);
    await page.reload();
    if (page.viewportSize().width < 1024) await page.getByRole('button', { name: 'Preview invitation', exact: true }).click();
    await expect(marker).toBeAttached({ timeout: 20000 });
    await expect(page.locator(".pe-template-tag")).toHaveText(name);
  });
}

test("login and registration preserve the same validated destination", async ({ page }) => {
  await installPhase2Fixtures(page, { anonymous: true });
  const next = "/app/events/new?template=khmer-celestial";
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  const register = page.locator('.auth-footer-text a[href^="/register"]');
  expect(new URL(await register.getAttribute("href"), page.url()).searchParams.get("next")).toBe(next);
  await register.click();
  const login = page.locator('.auth-footer-text a[href^="/login"]');
  expect(new URL(await login.getAttribute("href"), page.url()).searchParams.get("next")).toBe(next);
  await login.click();
  expect(new URL(page.url()).searchParams.get("next")).toBe(next);
});
