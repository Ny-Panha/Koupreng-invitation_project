import { expect, test } from "@playwright/test";
import { installOverhaulFixtures } from "./support/overhaulFixtures.js";
import { uxEvents } from "./support/uxFixtures.js";

test("a verified premium save denial has readable recovery without exposing the raw error", async ({page})=>{
  await installOverhaulFixtures(page,"en",{single:true});
  await page.route("**/api/v1/invitations/my",route=>route.fulfill({contentType:"application/json",body:JSON.stringify({data:[{...uxEvents[0],syncError:"Premium template access is required",syncFailure:{status:403,code:"PACKAGE_FEATURE_REQUIRED",details:{feature:"PREMIUM_TEMPLATES"}}}]})}));
  await page.goto("/app/events");
  await expect(page.locator(".event-card-sync-error")).toContainText("Premium access required");
  await expect(page.locator(".event-card-sync-error")).not.toContainText("Premium template access is required");
  await page.getByRole("button",{name:"Review access",exact:true}).click();
  await expect(page).toHaveURL(/\/app\/events\/101\/invitation/);
});
