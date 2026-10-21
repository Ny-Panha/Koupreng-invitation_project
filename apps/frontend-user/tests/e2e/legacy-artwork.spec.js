import { expect, test } from "@playwright/test";
import { installUxFixtures } from "./support/uxFixtures.js";

test("golden template preserves its registered renderer and serves its original artwork", async ({ page }, info) => {
  await installUxFixtures(page);
  await page.goto("/templates/cover-khmer-golden-wedding/demo");
  // This route intentionally maps to CanvaKhmerWeddingTemplate in the current registry.
  await expect(page.locator(".ck-cover")).toBeVisible();
  const background = await page.request.get("/templates/cover-khmer-golden-wedding/cover-bg.svg");
  expect(background.status()).toBe(200);
  expect(background.headers()["content-type"]).toContain("image/svg+xml");
  const preview = await page.request.get("/templates/cover-khmer-golden-wedding/cover-preview.svg");
  expect(preview.status()).toBe(200);
  expect(preview.headers()["content-type"]).toContain("image/svg+xml");
  await page.screenshot({ path: info.outputPath("registered-golden-template.png"), fullPage: true, animations: "disabled" });
});
