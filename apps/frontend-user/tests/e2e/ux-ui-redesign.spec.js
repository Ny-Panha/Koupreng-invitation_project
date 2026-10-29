import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { installUxFixtures } from "./support/uxFixtures.js";

const evidence = path.resolve(process.env.UX_EVIDENCE_DIR || "../../docs/qa/ux-ui/responsive");
const widths = [320, 375, 390, 430, 768, 1024, 1440, 1920];
async function top(page) { await page.evaluate(() => { window.scrollTo(0, 0); document.querySelector(".dash-main-scroll")?.scrollTo(0, 0); }); }
async function fits(page, expectedWidth = page.viewportSize().width) {
  await expect.poll(() => page.evaluate(() => innerWidth)).toBeLessThanOrEqual(expectedWidth + 1);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  const clipped = await page.locator(".workspace-page input, .workspace-page select, .workspace-page button, .workspace-dialog input, .workspace-dialog button, .seating-form input, .seating-form select, .checkin-panel-card input").evaluateAll(nodes => nodes.filter(node => {
    const r = node.getBoundingClientRect();
    return r.width > 0 && !node.closest("[inert]") && (r.right > innerWidth + 1 || r.left < -1);
  }).map(node => node.outerHTML.slice(0, 160)));
  expect(clipped).toEqual([]);
}
for (const lang of ["en", "km"]) {
  test(`packages and single form remain usable across eight widths: ${lang}`, async ({ page }, info) => {
    test.setTimeout(240_000);
    await mkdir(evidence, { recursive: true });
    await installUxFixtures(page, lang);
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    for (const width of widths) {
      await page.setViewportSize({ width, height: 1000 });
      for (const [name, route] of [["packages", "/app/packages"], ["event-create", "/app/events/new"]]) {
        await page.goto(route);
        if (name === "packages") {
          await expect(page.locator(".pkg-card")).toHaveCount(3);
          expect(await page.locator(".pkg-features").first().evaluate(node => parseFloat(getComputedStyle(node).fontSize))).toBeGreaterThanOrEqual(16);
          // auto-fit retains collapsed 0px tracks in computed styles; count visible columns.
          if (width >= 1024) expect(await page.locator(".pkg-grid").evaluate(node => getComputedStyle(node).gridTemplateColumns.split(" ").filter(track => parseFloat(track) > 0).length)).toBe(width < 1200 ? 2 : 3);
          if (width < 768) await expect(page.locator(".pkg-history-mobile")).toBeVisible();
          else await expect(page.locator(".pkg-history-table")).toBeVisible();
        } else {
          await expect(page.getByRole("button", { name: /Select Event Essential|ជ្រើសរើស Event Essential/ })).toBeVisible();
          await expect(page.locator('[name="title"]')).toBeVisible();
          await expect(page.getByRole("button", { name: /Continue|បន្ត/, exact: true })).toHaveCount(0);
        }
        await fits(page); await top(page); await page.evaluate(() => document.fonts.ready);
        const heading = await page.locator("h1").first().boundingBox(), nav = await page.locator(".host-header-container").boundingBox();
        expect(heading.y).toBeGreaterThanOrEqual(nav.y + nav.height);
        if (info.project.name === "desktop-chromium") await page.screenshot({ path: path.join(evidence, `${name}-${lang}-${width}.png`), fullPage: true });
      }
      if ([320, 768, 1440].includes(width)) {
        for (const route of ["/app/profile", "/app/events/101", "/app/events/101/guests", "/app/events/101/gifts", "/app/events/101/rsvp", "/app/events/101/seating", "/app/events/101/check-in", "/payments/AUDIT/status"]) {
          await page.goto(route); await page.waitForLoadState("networkidle"); await fits(page);
        }
      }
    }
    expect(errors).toEqual([]);
  });
}

test("pending payments resume; validated checkout remains pending and traps keyboard focus", async ({ page }, info) => {
  const { calls } = await installUxFixtures(page);
  page.on("popup", popup => popup.close());
  await page.goto("/app/packages");
  await page.getByRole("button", { name: "View pending order" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("SUB-AUDIT-041");
  expect(calls.filter(call => call.path.endsWith("/purchase"))).toHaveLength(0);
  await page.keyboard.press("Escape"); await expect(dialog).toHaveCount(0);
  await page.getByRole("button", { name: /Choose this plan/ }).first().click();
  await page.getByRole("button", { name: "Continue to ABA PayWay" }).click();
  await expect(dialog.getByRole("alert")).toBeVisible();
  await page.getByLabel("ABA Account Holder Name").fill("Audit Host");
  await page.getByLabel("Last 3 digits of ABA account").fill("24");
  await page.getByRole("button", { name: "Continue to ABA PayWay" }).click();
  await expect(dialog.getByRole("alert")).toContainText("exactly 3 numbers");
  await page.getByLabel("Last 3 digits of ABA account").fill("247");
  await page.getByRole("button", { name: "Continue to ABA PayWay" }).click();
  await expect(dialog).toContainText("SUB-AUDIT-42");
  await expect(dialog).toContainText("Waiting for payment confirmation");
  await expect(dialog).not.toContainText("Subscription activated successfully.");
  const purchases = calls.filter(call => call.path.endsWith("/purchase"));
  expect(purchases).toHaveLength(1);
  expect(JSON.parse(purchases[0].body)).toEqual({ packageId: 2, payerName: "Audit Host", payerAccountLast3: "247" });
  for (let index = 0; index < 8; index++) { await page.keyboard.press("Tab"); expect(await dialog.evaluate(node => node.contains(document.activeElement))).toBe(true); }
  await mkdir(evidence, { recursive: true });
  await fits(page);
  await page.screenshot({ path: path.join(evidence, `subscription-checkout-pending-${info.project.name}.png`), fullPage: false });
});

test("event form preserves data, validates and creates once at the returned event ID", async ({ page }) => {
  const { created } = await installUxFixtures(page);
  await page.goto("/app/events/new");
  await page.locator('[name="title"]').fill("Sokha birthday");
  await page.getByRole("button", { name: "Birthday", exact: true }).click();
  await expect(page.locator('[name="title"]')).toHaveValue("Sokha birthday");
  await page.getByRole("button", { name: "Create event", exact: true }).click();
  await expect(page.locator('[name="hostName"]')).toBeFocused();
  await page.locator('[name="hostName"]').fill("Sokha");
  await page.locator('[name="eventDate"]').fill("2026-12-25");
  await page.locator('[name="eventTime"]').fill("17:30");
  await page.locator('[name="venueName"]').fill("Garden House");
  await page.locator('.event-preferences-disclosure summary').click();
  await page.getByLabel("Invitation language").selectOption("BOTH");
  await page.getByRole("button", { name: "Select Event Essential" }).click();
  await page.reload();
  await expect(page.locator('[name="title"]')).toHaveValue("Sokha birthday");
  await expect(page.getByRole("button", { name: "Select Event Essential" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Create event", exact: true }).click();
  await expect(page).toHaveURL(/\/app\/events\/103\/invitation\?mode=guided$/);
  expect(created).toHaveLength(1);
  expect(created[0]).toMatchObject({ title: "Sokha birthday", eventType: "BIRTHDAY", hostName: "Sokha", languageMode: "BOTH", templateId: 30 });
});

test("200% desktop zoom equivalent keeps form and checkout actions reachable", async ({ page }) => {
  await installUxFixtures(page);
  const session = await page.context().newCDPSession(page);
  await session.send("Emulation.setDeviceMetricsOverride", { width: 720, height: 500, deviceScaleFactor: 2, mobile: false });
  await page.goto("/app/events/new");
  await page.getByRole("button", { name: "Select Event Essential" }).waitFor();
  await fits(page, 720);
  await page.getByRole("button", { name: "Save draft" }).scrollIntoViewIfNeeded();
  await expect(page.getByRole("button", { name: "Save draft" })).toBeInViewport();
  await page.goto("/app/packages");
  await page.getByRole("button", { name: /Choose this plan/ }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Continue to ABA PayWay" }).scrollIntoViewIfNeeded();
  await expect(page.getByRole("button", { name: "Continue to ABA PayWay" })).toBeInViewport();
});

test("real local backend accepts a partial draft and preserves exact event navigation", async ({ page, request }, info) => {
  test.skip(!process.env.UX_LIVE_BACKEND, "Requires the explicitly configured disposable backend.");
  const backend = process.env.UX_LIVE_BACKEND;
  const response = await request.post(`${backend}/api/v1/auth/register`, { data: { fullName: "Local UX audit", email: `ux-${Date.now()}-${info.project.name}@example.test`, password: "LocalAuditPass123!" } });
  expect(response.ok()).toBe(true);
  const auth = await response.json();
  await page.addInitScript(auth => { sessionStorage.setItem("koupreng.auth", JSON.stringify(auth)); localStorage.setItem("koupreng.lang", "en"); }, auth);
  await page.route("**/api/**", async route => {
    const incoming = route.request();
    const url = new URL(incoming.url());
    const response = await route.fetch({ url: `${backend}${url.pathname}${url.search}`, headers: { ...incoming.headers(), origin: "http://localhost:5173" } });
    await route.fulfill({ response });
  });
  await page.goto("/app/events/new");
  await page.getByRole("button", { name: "Birthday", exact: true }).click();
  await page.locator('[name="title"]').fill("Real HTTP birthday draft");
  const saved = page.waitForResponse(response => response.url().endsWith("/api/v1/invitations") && response.request().method() === "POST");
  await page.getByRole("button", { name: "Save draft" }).click();
  const saveResponse = await saved;
  expect(saveResponse.status()).toBe(201);
  const event = (await saveResponse.json()).data;
  expect(event).toMatchObject({ title: "Real HTTP birthday draft", eventType: "BIRTHDAY", status: "DRAFT" });
  await expect(page).toHaveURL(new RegExp(`/app/events/${event.id}$`));
  await expect(page.getByRole("heading", { name: "Real HTTP birthday draft", exact: true }).first()).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Real HTTP birthday draft", exact: true }).first()).toBeVisible();
  const retry = await request.post(`${backend}/api/v1/invitations`, { headers: { Authorization: `Bearer ${auth.accessToken}` }, data: saveResponse.request().postDataJSON() });
  expect((await retry.json()).data.id).toBe(event.id);
  await mkdir(evidence, { recursive: true });
  await page.screenshot({ path: path.join(evidence, `real-http-draft-${info.project.name}.png`), fullPage: true });
});

test("Khmer checkout keeps payer labels, validation and pending status readable", async ({ page }, info) => {
  const { calls } = await installUxFixtures(page, "km");
  page.on("popup", popup => popup.close());
  await page.goto("/app/packages");
  await page.getByRole("button", { name: /ជ្រើសកញ្ចប់នេះ/ }).first().click();
  const dialog = page.getByRole("dialog");
  await page.getByRole("button", { name: /Continue to ABA PayWay/ }).click();
  await expect(dialog.getByRole("alert")).toBeVisible();
  await page.getByLabel(/ABA Account Holder Name/).fill("Audit Host");
  await page.getByLabel(/Last 3 digits/).fill("247");
  await mkdir(evidence, { recursive: true });
  await fits(page);
  await page.screenshot({ path: path.join(evidence, `subscription-checkout-km-${info.project.name}.png`), fullPage: false });
  await page.getByRole("button", { name: /Continue to ABA PayWay/ }).click();
  await expect(dialog).toContainText("SUB-AUDIT-42");
  await expect(dialog).toContainText("កំពុងរង់ចាំការបញ្ជាក់ការទូទាត់");
  expect(calls.filter(call => call.path.endsWith("/purchase"))).toHaveLength(1);
});

test("neutral catalog previews preserve their identity on public and cold host routes", async ({ page }) => {
  await installUxFixtures(page);
  for (const route of ["/templates/event-essential", "/templates/event-essential/demo", "/templates/browse/event-essential"]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { name: "You are invited", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /Open invitation|បើកសំបុត្រ/ })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Create event", exact: true })).toHaveAttribute("href", "/app/events/new");
  }
});
