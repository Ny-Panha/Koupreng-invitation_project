import { expect, test } from "@playwright/test";
import { installOverhaulFixtures } from "./support/overhaulFixtures.js";
import { fixtures as installStudioFixtures } from "./support/studioFixtures.js";
import { installPhase4Fixtures } from "./support/phase4Fixtures.js";

test("single event is featured, searchable and has one management action", async ({ page }, info) => {
  await installOverhaulFixtures(page, "en", { single: true });
  await page.goto("/app/events");
  const card = page.locator(".event-card--featured");
  await expect(card).toBeVisible();
  await expect(card.getByRole("button", { name: 'Manage event', exact: true })).toHaveCount(1);
  if (page.viewportSize().width >= 1024) expect((await card.boundingBox()).width).toBeGreaterThan(900);
  await page.screenshot({ path: info.outputPath("featured-event.png"), fullPage: true });
  await page.getByRole("searchbox").fill("no matching event");
  await expect(page.locator(".event-card")).toHaveCount(0);
  await expect(page.getByText("No events match your search or filter.")).toBeVisible();
});

test("event navigation supports collapse, keyboard recovery and explicit switching", async ({ page }) => {
  await installOverhaulFixtures(page);
  await page.goto("/app/events/101/guests");
  await expect(page.getByText("Sokha", { exact: true })).toBeVisible();
  const toggle = page.getByRole("button", { name: "Toggle modules menu" });
  if (await toggle.isVisible()) {
    await toggle.click();
    await expect(page.locator('.event-workspace-nav a[aria-current="page"]')).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(toggle).toBeFocused();
    await expect(page.locator(".event-workspace-nav")).toBeHidden();
    await toggle.click();
  } else {
    const expand = page.getByRole("button", { name: "Expand navigation", exact: true });
    if (await expand.isVisible()) await expand.click();
    await page.getByRole("button", { name: "Collapse navigation" }).click();
    await expect(page.locator(".event-workspace")).toHaveClass(/is-collapsed/);
    await page.getByRole("button", { name: "Expand navigation" }).click();
  }
  await expect(page.locator(".event-workspace-nav a")).toHaveCount(19);
  await page.getByLabel("Switch event").selectOption("102");
  await expect(page).toHaveURL(/\/app\/events\/102\/guests$/);
  if (await toggle.isVisible()) await expect(page.locator(".event-workspace-title")).toHaveText("Sokha’s birthday");
  else await expect(page.getByLabel("Switch event").locator("option:checked")).toHaveText("Sokha’s birthday");
});

test("new event prioritizes preparation and displays the server's zero activity", async ({ page }) => {
  await installOverhaulFixtures(page, "en", { empty: true });
  await page.goto("/app/events/101");
  await expect(page.locator(".overview-checklist li")).toHaveCount(5);
  await expect(page.locator(".overview-checklist .is-done")).toHaveCount(2);
  await expect(page.locator(".overview-metrics strong")).toHaveText(['0', '0', '0', '0']);
  await expect(page.locator(".overview-actions .primary")).toHaveText("Review and publish");
  await expect(page.locator(".overview-actions .primary")).toHaveAttribute("href", "/app/events/101/invitation");
});

test("guest empty state keeps a usable inline add form and persists the new row", async ({ page }) => {
  const state = await installPhase4Fixtures(page, { count: 0 });
  await page.goto("/app/events/101/guests");
  const form = page.locator('.guest-inline-form-row');
  const add = form.getByRole("button", { name: 'Add', exact: true });
  await expect(add).toBeDisabled();
  await page.locator('#guestForm-name').fill('New fictional guest');
  await add.click();
  await expect(page.locator('.guest-record-row')).toContainText('New fictional guest');
  await expect(page.locator('#guestForm-name')).toHaveValue('');
  expect(state.guests).toHaveLength(1);
  await page.reload();
  await expect(page.locator('.guest-record-row')).toContainText('New fictional guest');
});

test("unpublished delivery points to the actual publishing workflow", async ({ page }) => {
  await installOverhaulFixtures(page);
  await page.goto("/app/events/101/delivery");
  await expect(page.getByText("Publish the invitation before preparing guest links.")).toBeVisible();
  await expect(page.getByRole("button", { name: 'Prepare delivery', exact: true })).toBeDisabled();
  await page.getByText('Email & reminders', { exact: false }).click();
  await expect(page.getByRole("button", { name: 'Send to selected email recipients', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Copy message', exact: true })).toBeDisabled();
  await page.getByRole("link", { name: "Publish Invitation", exact: true }).click();
  await expect(page).toHaveURL(/\/app\/events\/101\/invitation$/);
});

test("QR download preserves the returned PNG and public URL", async ({ page }) => {
  await installOverhaulFixtures(page);
  await page.goto("/app/events/101/qr");
  await expect(page.locator(".qr-image")).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download QR/ }).click();
  expect((await download).suggestedFilename()).toBe("qr-invitation-101.png");
  await page.addScriptTag({ path: "node_modules/jsqr/dist/jsQR.js" });
  const payload = await page.locator(".qr-image").evaluate(image => {
    const canvas = document.createElement("canvas"); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d"); context.drawImage(image, 0, 0);
    return window.jsQR(context.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height)?.data;
  });
  expect(payload).toBe("https://koupreng.example/i/audit-event");
});

test("wishes require confirmation before removing a message", async ({ page }) => {
  await installOverhaulFixtures(page, "en", { wishes: [{ id: 9, guestName: "Sokha", message: "Warm wishes for your celebration" }] });
  const deletes = [];
  await page.route("**/api/v1/invitations/101/wishes/9", async route => {
    deletes.push(route.request().method());
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ data: {} }) });
  });
  await page.goto("/app/events/101/wishes");
  await page.getByRole("button", { name: "Delete wish", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(deletes).toEqual([]);
  await page.getByRole("button", { name: "Delete wish", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete wish", exact: true }).click();
  await expect(page.locator(".wish-card")).toHaveCount(0);
  expect(deletes).toEqual(["DELETE"]);
});

test("phone preview keeps its logical viewport when fitted or zoomed", async ({ page }, info) => {
  await installStudioFixtures(page, "en");
  await page.goto("/app/events/101/invitation");
  await expect(page.locator(".invitation-studio")).toBeVisible();
  if (page.viewportSize().width < 1024) {
    await page.getByRole('button',{name:'Preview invitation',exact:true}).click();
    await page.getByRole('button',{name:'Device and zoom controls',exact:true}).click();
  }
  const frame = page.locator(".pe-device-frame");
  const iframe = frame.locator("iframe");
  await expect(page.getByRole("button", { name: "Phone preview", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => iframe.evaluate(node => node.contentWindow.innerWidth)).toBe(440);
  await expect.poll(() => iframe.evaluate(node => node.contentWindow.innerHeight)).toBe(860);
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect(page.getByLabel("Preview zoom").locator("option:checked")).toHaveText(/\d+%/);
  await expect.poll(() => iframe.evaluate(node => node.contentWindow.innerWidth)).toBe(440);
  await page.screenshot({ path: info.outputPath("iphone-18-pro-max-preview.png"), fullPage: true });
  await page.getByLabel("Preview zoom").selectOption("100");
  await expect.poll(() => iframe.evaluate(node => node.contentWindow.innerWidth)).toBe(440);
  await page.getByRole("button", { name: "Desktop", exact: true }).click();
  await expect.poll(() => iframe.evaluate(node => node.contentWindow.innerWidth)).toBe(1200);
  await page.getByRole("button", { name: "Reset view", exact: true }).click();
  await expect(page.getByLabel("Preview zoom")).toHaveValue("fit");
  await expect(frame).toHaveAttribute("data-device", "mobile");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize().width);
});

test("workspace support stays below content until explicitly opened", async ({ page }) => {
  await installOverhaulFixtures(page);
  await page.goto("/app/events/101/guests");
  const support = page.locator(".chatbot-wrapper");
  await expect(support).toHaveCSS("position", "static");
  await page.getByRole("button", { name: "Help & Support", exact: true }).click();
  await expect(page.getByRole("region", { name: "Help & Support" })).toBeVisible();
  await page.getByRole("region", { name: "Help & Support" }).getByRole("button", { name: "Close support chat" }).click();
  await expect(support).toHaveCSS("position", "static");
});

test("overview displays the server check-in field without inventing a zero", async ({ page }) => {
  await installOverhaulFixtures(page);
  await page.route("**/api/v1/invitations/101/check-in/summary", route => route.fulfill({ contentType: "application/json", body: JSON.stringify({ data: { invitationId: 101, totalGuests: 1, checkedIn: 1, attendingCheckedIn: 1, remaining: 0 } }) }));
  await page.goto("/app/events/101");
  await expect(page.locator('.overview-metrics a[href$="/check-in"] strong')).toHaveText("1");
});
