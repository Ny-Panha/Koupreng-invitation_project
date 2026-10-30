import { expect, test } from "@playwright/test";
import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import process from 'node:process';
import { fixtures, qrPayload } from "./support/studioFixtures.js";
import { chooseStudioSection } from './support/studioNavigationActions';

const evidence = path.resolve(process.env.STUDIO_EVIDENCE_DIR || "../../docs/qa/ux-overhaul/studio-tickets");
for (const lang of ["en", "km"]) {
  test(`studio and designer fit eight viewports (${lang})`, async ({ page }, info) => {
    test.setTimeout(240_000);
    await mkdir(evidence, { recursive: true });
    await fixtures(page, lang);
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors = []; page.on("pageerror", error => errors.push(error.message));
    for (const width of [320, 375, 390, 430, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const [name, route] of [["editor", "invitation"], ["designer", "tickets/design"]]) {
        await page.goto(`/app/events/101/${route}`);
        await expect(page.locator(name === "editor" ? ".invitation-studio" : ".ticket-studio")).toBeVisible({ timeout: 15000 });
        if (name === "designer") {
          if (width < 900) await page.locator('.ticket-mobile-switch button').nth(1).click();
          await expect(page.getByRole("button", { name: /ទាញយក PNG|Download PNG/ })).toBeEnabled();
        }
        else {
          await expect(page.locator(".studio-sections")).toBeVisible();
          // Finish the embedded template import before the next hard navigation aborts its CSS request.
          const preview = page.locator('.invitation-studio iframe').first();
          if (await preview.count()) await expect(preview.contentFrame().locator('.kc-root')).toBeAttached({ timeout: 15000 });
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
        if (info.project.name === "desktop-chromium") await page.screenshot({ path: path.join(evidence, `${name}-${lang}-${width}.png`), fullPage: true });
      }
    }
    expect(errors).toEqual([]);
  });
}
test("exports exact 2x/3x personalized canvases with decodable QR for every layout", async ({ page }, info) => {
  test.setTimeout(120_000);
  await mkdir(path.join(evidence, "exports"), { recursive: true });
  await fixtures(page);
  await page.goto("/app/events/101/tickets/design");
  const mobile = page.viewportSize().width < 900;
  const panels = page.getByRole('group', { name: 'Ticket workspace', exact: true });
  if (mobile) await panels.getByRole('button', { name: 'Preview & export', exact: true }).click();
  await page.getByLabel(/Preview recipient/).selectOption("501");
  for (const layout of ["GOLD", "MINIMAL", "FLORAL", "IVORY"]) {
    if (mobile) await panels.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.getByLabel(/Layout/).selectOption(layout);
    const save = page.getByRole("button", { name: /Save design/ });
    if (await save.isEnabled()) await save.click();
    if (mobile) await panels.getByRole('button', { name: 'Preview & export', exact: true }).click();
    const download = page.getByRole("button", { name: /ទាញយក PNG|Download PNG/ });
    await expect(download).toBeEnabled();
    for (const scale of [2, 3]) {
      const waiting = page.waitForEvent("download");
      await page.getByRole("button", { name: scale === 2 ? /ទាញយក PNG|Download PNG/ : "PNG · 3×", exact: scale === 3 }).click();
      const file = await waiting;
      const output = path.join(evidence, "exports", `${layout.toLowerCase()}-${scale}x-${info.project.name}.png`);
      await file.saveAs(output);
      await page.addScriptTag({ path: "node_modules/jsqr/dist/jsQR.js" });
      const decoded = await page.evaluate(async data => {
        const image = new Image(); image.src = data; await image.decode();
        const canvas = document.createElement("canvas"); canvas.width = image.width; canvas.height = image.height;
        const ctx = canvas.getContext("2d"); ctx.drawImage(image, 0, 0);
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
        return { width: image.width, height: image.height, qr: window.jsQR(pixels.data, image.width, image.height)?.data };
      }, `data:image/png;base64,${(await readFile(output)).toString("base64")}`);
      expect(decoded).toEqual({ width: 600 * scale, height: 900 * scale, qr: qrPayload });
    }
  }
});
test("autosaves real editor payloads without navigation and restores edits with undo", async ({ page }) => {
  const { writes } = await fixtures(page);
  await page.goto("/app/events/101/invitation");
  const title = page.getByRole('textbox', { name: 'Main Title', exact: true });
  await title.fill("Saved studio title");
  await expect.poll(() => writes.filter(write => write.kind === "invitation").length).toBeGreaterThan(0);
  expect(writes.findLast(write => write.kind === "invitation").event.title).toBe("Saved studio title");
  await expect(page).toHaveURL(/\/app\/events\/101\/invitation$/);
  await expect(page.locator(".studio-save-status")).toContainText("Saved to server");
  await title.fill("Another edit");
  await page.getByLabel("More studio actions").click();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(title).toHaveValue("Saved studio title");
});
test("personal public ticket opens without submitting RSVP and modal restores focus", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await fixtures(page);
  const writes = [];
  page.on("request", request => { if (["POST", "PUT", "PATCH"].includes(request.method())) writes.push(new URL(request.url()).pathname); });
  await page.goto("/i/audit-event?token=qa-guest-ticket");
  await page.locator(".kc-opening button").first().click();
  const trigger = page.getByRole("button", { name: /My ticket/ });
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("button", { name: /ទាញយក PNG|Download PNG/ })).toBeEnabled();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(writes).toEqual([]);
});

test("failed saves retain changes and guard route links and browser back", async ({ page }) => {
  await fixtures(page);
  await page.route("**/api/v1/invitations/101", async route => {
    if (route.request().method() === "PUT") return route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ message: "Save temporarily unavailable" }) });
    return route.fallback();
  });
  await page.goto("/app/events/101");
  const menu = page.getByRole("button", { name: "Toggle modules menu" });
  if (page.viewportSize().width < 1100) await menu.click();
  await page.locator('.event-workspace-nav a[href$="/invitation"]').click();
  const title = page.getByRole('textbox', { name: 'Main Title', exact: true });
  await title.fill("Keep this unsaved change");
  await expect(page.locator(".studio-save-status")).toContainText("Save failed");
  const dialogs = [];
  page.on("dialog", dialog => { dialogs.push(dialog.message()); return dialog.dismiss(); });
  await page.getByRole("button", { name: "Back to Event", exact: true }).click();
  await expect(page).toHaveURL(/\/invitation$/);
  await page.evaluate(() => window.history.back());
  await expect.poll(() => dialogs.length).toBe(2);
  await expect(page).toHaveURL(/\/invitation$/);
  await expect(title).toHaveValue("Keep this unsaved change");
});

test("appearance, schedule and media controls persist through the existing editor API", async ({ page }) => {
  const { writes } = await fixtures(page);
  await page.goto("/app/events/101/invitation");
  await chooseStudioSection(page, 'designCover', 'Colors & typography');
  await page.getByLabel(/Palette/).selectOption("2");
  await page.getByLabel(/Khmer heading/).selectOption("Kantumruy Pro");
  await expect.poll(() => writes.filter(write => write.kind === "invitation").length).toBeGreaterThan(0);
  const saved = writes.findLast(write => write.kind === "invitation").event;
  expect(JSON.parse(saved.contentJson).studioStyle.primary).toBe("#164637");
  expect(JSON.parse(saved.contentJson).fontKhmer).toBe("Kantumruy Pro");
  await chooseStudioSection(page, 'scheduleVenue', 'Schedule');
  await expect(page.getByRole("button", { name: 'Add program day', exact: true })).toBeVisible();
  await chooseStudioSection(page, 'mediaOpening', 'Gallery');
  await expect(page.getByRole("button", { name: "Move photo 1 down", exact: true })).toBeVisible();
});
